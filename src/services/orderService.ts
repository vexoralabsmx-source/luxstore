import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendPaymentPendingEmail } from '@/services/emailService';
import { deliverOrder } from '@/services/deliveryService';
import type { Order, PaymentMethod } from '@/types';

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = crypto.randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase();
  return `LX-${year}-${random}`;
}

type RequestedItem = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export interface CreateOrderParams {
  userId?: string;
  customerEmail: string;
  paymentMethod: PaymentMethod;
  items: RequestedItem[];
  customerNotes?: string;
  couponCode?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function createOrder(params: CreateOrderParams): Promise<{
  order: Order;
  emailSent?: boolean;
  deliveryMessage?: string;
}> {
  const supabase = createAdminClient();
  const normalizedItems = params.items.map((item) => ({
    ...item,
    quantity: Math.max(1, Math.min(20, Math.floor(Number(item.quantity)))),
  }));

  const productIds = [...new Set(normalizedItems.map((item) => item.productId))];
  const variantIds = [
    ...new Set(normalizedItems.map((item) => item.variantId).filter(Boolean) as string[]),
  ];

  const [{ data: products, error: productsError }, { data: variants, error: variantsError }] =
    await Promise.all([
      supabase
        .from('products')
        .select('id, name, base_price, sale_price, status')
        .in('id', productIds)
        .eq('status', 'active'),
      variantIds.length
        ? supabase
            .from('product_variants')
            .select('id, product_id, name, price, sale_price, is_active')
            .in('id', variantIds)
            .eq('is_active', true)
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (productsError || variantsError) throw new Error('No se pudo validar el catálogo');
  if (!products || products.length !== productIds.length) {
    throw new Error('Uno o más productos ya no están disponibles');
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const variantMap = new Map((variants || []).map((variant) => [variant.id, variant]));

  const orderItems = normalizedItems.map((requested) => {
    const product = productMap.get(requested.productId)!;
    const variant = requested.variantId ? variantMap.get(requested.variantId) : undefined;
    if (requested.variantId && (!variant || variant.product_id !== product.id)) {
      throw new Error(`La variante de ${product.name} no es válida`);
    }

    const unitPrice = Number(
      variant
        ? variant.sale_price ?? variant.price
        : product.sale_price ?? product.base_price
    );

    return {
      product_id: product.id,
      variant_id: variant?.id || null,
      product_name: product.name,
      variant_name: variant?.name || null,
      unit_price: unitPrice,
      quantity: requested.quantity,
      total_price: unitPrice * requested.quantity,
    };
  });

  for (const item of orderItems) {
    let stockQuery = supabase
      .from('inventory_items')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', item.product_id)
      .eq('status', 'AVAILABLE');
    stockQuery = item.variant_id
      ? stockQuery.eq('variant_id', item.variant_id)
      : stockQuery.is('variant_id', null);
    const { count, error } = await stockQuery;
    if (error) throw new Error('No se pudo comprobar el inventario');
    if ((count || 0) < item.quantity) {
      throw new Error(`Stock insuficiente para ${item.product_name}`);
    }
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);
  let discountAmount = 0;
  let coupon: any = null;
  if (params.couponCode) {
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', params.couponCode.trim().toUpperCase())
      .eq('is_active', true)
      .maybeSingle();
    const isUsable = data
      && (!data.expiration_date || new Date(data.expiration_date) >= new Date())
      && (Number(data.min_purchase) || 0) <= subtotal
      && (!(Number(data.max_uses) > 0) || Number(data.uses_count) < Number(data.max_uses));
    if (!isUsable) throw new Error('El cupón ya no es válido');
    coupon = data;
    const raw = data.discount_type === 'percentage'
      ? subtotal * Number(data.discount_value) / 100
      : Number(data.discount_value);
    discountAmount = Math.min(subtotal, raw);
  }
  const total = subtotal - discountAmount;
  const orderNumber = generateOrderNumber();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: params.userId || null,
      customer_email: params.customerEmail.trim().toLowerCase(),
      payment_method: params.paymentMethod,
      subtotal,
      discount_amount: discountAmount,
      total,
      status: 'PENDING_PAYMENT',
      customer_notes: params.customerNotes || null,
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
      expires_at: expiresAt,
    })
    .select('*')
    .single();

  if (orderError || !order) throw new Error(orderError?.message || 'No se pudo crear el pedido');

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) {
    await supabase.from('orders').delete().eq('id', order.id);
    throw new Error('No se pudieron guardar todos los productos del pedido');
  }

  if (coupon) {
    await supabase.from('coupon_redemptions').insert({
      coupon_id: coupon.id,
      user_id: params.userId || null,
      order_id: order.id,
      discount_applied: discountAmount,
    });
    await supabase
      .from('coupons')
      .update({ uses_count: Number(coupon.uses_count || 0) + 1 })
      .eq('id', coupon.id);
  }

  let emailSent: boolean | undefined;
  let deliveryMessage: string | undefined;

  if (params.paymentMethod === 'spei') {
    emailSent = await sendPaymentPendingEmail({
      toEmail: order.customer_email,
      orderNumber,
      paymentMethod: 'spei',
      totalAmount: total,
    });
  }

  if (params.paymentMethod === 'credits') {
    if (!params.userId) throw new Error('Debes iniciar sesión para pagar con créditos');
    const { error: chargeError } = await supabase.rpc('charge_wallet_for_order', {
      p_order_id: order.id,
    });
    if (chargeError) {
      await supabase.from('orders').update({ status: 'CANCELLED' }).eq('id', order.id);
      throw new Error(
        chargeError.message.includes('INSUFFICIENT_CREDITS')
          ? 'Saldo de créditos insuficiente'
          : 'No se pudo cobrar el monedero'
      );
    }
    const delivery = await deliverOrder(order.id);
    deliveryMessage = delivery.message;
  }

  return { order: order as Order, emailSent, deliveryMessage };
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*), deliveries:deliveries(*)')
    .eq('order_number', orderNumber)
    .maybeSingle();
  return error ? null : (data as Order | null);
}
