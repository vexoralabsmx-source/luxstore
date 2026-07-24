import { createAdminClient } from '@/lib/supabase/admin';
import { Order, OrderStatus, PaymentMethod } from '@/types';
import { sendPaymentPendingEmail } from '@/services/emailService';
import { deliverOrder } from '@/services/deliveryService';

/**
 * Genera un número de pedido único con prefijo LX-2026-xxxxxx
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `LX-${year}-${randomDigits}`;
}

/**
 * Genera un monto con centavos únicos para transferencias SPEI (ej. $150.17 MXN)
 */
export function calculateUniqueCentsAmount(baseAmount: number): number {
  const randomCents = Math.floor(1 + Math.random() * 99) / 100;
  return Math.floor(baseAmount) + randomCents;
}

export interface CreateOrderParams {
  userId?: string;
  customerEmail: string;
  paymentMethod: PaymentMethod;
  items: {
    productId: string;
    variantId?: string;
    productName: string;
    variantName?: string;
    unitPrice: number;
    quantity: number;
  }[];
  subtotal: number;
  discountAmount: number;
  total: number;
  customerNotes?: string;
  prePurchaseAnswers?: Record<string, string>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Crea una orden y activa el envío de correos por Resend según el método de pago
 */
export async function createOrder(params: CreateOrderParams): Promise<{ success: boolean; order?: Order; orderNumber?: string; message?: string }> {
  const orderNumber = generateOrderNumber();
  let finalTotal = params.total;
  let uniqueCentsAmount: number | undefined = undefined;

  // Si es transferencia SPEI, generar centavos únicos
  if (params.paymentMethod === 'spei') {
    uniqueCentsAmount = calculateUniqueCentsAmount(params.total);
    finalTotal = uniqueCentsAmount;
  }

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const initialStatus: OrderStatus = params.paymentMethod === 'credits' ? 'PAID' : 'PENDING_PAYMENT';

  let createdOrderRecord: any = null;

  try {
    const supabase = createAdminClient();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: params.userId || null,
        customer_email: params.customerEmail,
        payment_method: params.paymentMethod,
        subtotal: params.subtotal,
        discount_amount: params.discountAmount,
        total: finalTotal,
        unique_cents_amount: uniqueCentsAmount || null,
        status: initialStatus,
        customer_notes: params.customerNotes || null,
        pre_purchase_answers: params.prePurchaseAnswers || {},
        ip_address: params.ipAddress || null,
        user_agent: params.userAgent || null,
        expires_at: expiresAt,
      })
      .select('*')
      .single();

    if (orderError) {
      console.warn('Advertencia al insertar orden en Supabase:', orderError.message || JSON.stringify(orderError));
    } else {
      createdOrderRecord = order;
      // Insertar items de la orden en Supabase
      const orderItemsToInsert = params.items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId || null,
        product_name: item.productName,
        variant_name: item.variantName || null,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        total_price: item.unitPrice * item.quantity,
      }));
      await supabase.from('order_items').insert(orderItemsToInsert);
    }
  } catch (dbErr) {
    console.warn('Error conectando a Supabase DB para orden:', dbErr);
  }

  // Guardar la orden en lux_admin_orders y lux_order_{orderNumber} para persistencia completa
  try {
    const localOrderObj = {
      id: createdOrderRecord?.id || `ord_${orderNumber}`,
      order_number: orderNumber,
      customer_email: params.customerEmail,
      payment_method: params.paymentMethod,
      total: finalTotal,
      subtotal: params.subtotal,
      discount_amount: params.discountAmount,
      status: initialStatus,
      created_at: new Date().toISOString(),
      items: params.items.map((it) => ({
        name: it.productName,
        product_name: it.productName,
        variant_name: it.variantName,
        unit_price: it.unitPrice,
        quantity: it.quantity,
        total_price: it.unitPrice * it.quantity,
      })),
      deliveries: [],
    };

    localStorage.setItem(`lux_order_${orderNumber}`, JSON.stringify(localOrderObj));

    const storedAdminOrders = localStorage.getItem('lux_admin_orders');
    const adminOrders: any[] = storedAdminOrders ? JSON.parse(storedAdminOrders) : [];
    localStorage.setItem('lux_admin_orders', JSON.stringify([localOrderObj, ...adminOrders]));
  } catch (err) {
    console.error('Error guardando orden local:', err);
  }

  // 1. SIEMPRE enviar correo de instrucciones SPEI por Resend al generar pedido SPEI
  if (params.paymentMethod === 'spei') {
    console.log(`Disparando correo Resend de pago pendiente SPEI para ${params.customerEmail}...`);
    await sendPaymentPendingEmail({
      toEmail: params.customerEmail,
      orderNumber,
      paymentMethod: params.paymentMethod,
      totalAmount: finalTotal,
    });
  }

  // 2. Si se pagó con créditos, procesar entrega de stock y correo de entrega por Resend
  if (params.paymentMethod === 'credits') {
    console.log(`Disparando entrega automática de stock por créditos para orden ${orderNumber}...`);
    await deliverOrder(orderNumber);
  }

  return {
    success: true,
    order: createdOrderRecord,
    orderNumber,
  };
}

/**
 * Consulta el estado de una orden por su número
 */
export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  try {
    const supabase = createAdminClient();
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        deliveries:deliveries(*)
      `)
      .eq('order_number', orderNumber)
      .single();

    if (error || !order) return null;
    return order as Order;
  } catch (e) {
    console.error('Error al consultar orden:', e);
    return null;
  }
}
