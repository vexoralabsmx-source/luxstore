import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { decryptStockContent } from '@/lib/crypto';
import { sendDeliveryEmail } from '@/services/emailService';
import { sendDiscordAlert } from '@/services/discordService';

export interface DeliveryResult {
  success: boolean;
  orderNumber: string;
  deliveredItems: {
    productName: string;
    variantName?: string;
    deliveredContent: string;
  }[];
  message?: string;
}

type ClaimedInventory = {
  inventory_item_id: string;
  order_item_id: string;
  product_name: string;
  variant_name?: string;
  content_encrypted: string;
};

export async function deliverOrder(orderIdOrNumber: string): Promise<DeliveryResult> {
  const supabase = createAdminClient();
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, order_number, customer_email, user_id, status')
    .or(`id.eq.${orderIdOrNumber},order_number.eq.${orderIdOrNumber}`)
    .maybeSingle();

  if (orderError || !order) {
    return {
      success: false,
      orderNumber: orderIdOrNumber,
      deliveredItems: [],
      message: 'Pedido no encontrado.',
    };
  }

  const { data: existing } = await supabase
    .from('deliveries')
    .select('delivered_content, item:order_items(product_name, variant_name)')
    .eq('order_id', order.id);

  if (existing?.length) {
    const deliveredItems = existing.map((delivery: any) => ({
      productName: delivery.item?.product_name || 'Producto digital',
      variantName: delivery.item?.variant_name || undefined,
      deliveredContent: delivery.delivered_content,
    }));
    return {
      success: true,
      orderNumber: order.order_number,
      deliveredItems,
      message: 'El pedido ya había sido entregado.',
    };
  }

  if (!['PAID', 'PROCESSING'].includes(order.status)) {
    return {
      success: false,
      orderNumber: order.order_number,
      deliveredItems: [],
      message: 'El pedido todavía no tiene un pago confirmado.',
    };
  }

  const { data: claimed, error: claimError } = await supabase.rpc(
    'claim_inventory_for_order',
    { p_order_id: order.id }
  );

  if (claimError || !claimed?.length) {
    console.error('No se pudo asignar inventario:', claimError);
    return {
      success: false,
      orderNumber: order.order_number,
      deliveredItems: [],
      message: claimError?.message?.includes('INSUFFICIENT_STOCK')
        ? 'No hay stock real suficiente para entregar todas las unidades.'
        : 'No se pudo asignar el inventario del pedido.',
    };
  }

  const claimedItems = claimed as ClaimedInventory[];
  const deliveryRows = claimedItems.map((item) => ({
    order_id: order.id,
    order_item_id: item.order_item_id,
    inventory_item_id: item.inventory_item_id,
    customer_id: order.user_id,
    delivered_content: decryptStockContent(item.content_encrypted),
  }));

  const { error: deliveryError } = await supabase
    .from('deliveries')
    .upsert(deliveryRows, { onConflict: 'inventory_item_id', ignoreDuplicates: true });

  if (deliveryError) {
    console.error('No se pudieron registrar las entregas:', deliveryError);
    return {
      success: false,
      orderNumber: order.order_number,
      deliveredItems: [],
      message: 'El inventario quedó reservado, pero no se pudo registrar la entrega.',
    };
  }

  const now = new Date().toISOString();
  const { error: statusError } = await supabase
    .from('orders')
    .update({ status: 'DELIVERED', delivered_at: now, updated_at: now })
    .eq('id', order.id);

  if (statusError) {
    console.error('No se pudo cerrar el pedido:', statusError);
  }

  const deliveredItems = claimedItems.map((item) => ({
    productName: item.product_name,
    variantName: item.variant_name || undefined,
    deliveredContent: decryptStockContent(item.content_encrypted),
  }));

  const emailSent = await sendDeliveryEmail({
    toEmail: order.customer_email,
    orderNumber: order.order_number,
    deliveredItems,
  });

  await sendDiscordAlert({
    title: 'Venta confirmada',
    description: `Pedido ${order.order_number} entregado con ${deliveredItems.length} unidad(es).`,
    fields: [{ name: 'Cliente', value: order.customer_email }],
    color: 0x22c55e,
  }).catch((error) => console.warn('No se pudo enviar la alerta de Discord:', error));

  return {
    success: true,
    orderNumber: order.order_number,
    deliveredItems,
    message: emailSent
      ? 'Pedido entregado y correo enviado.'
      : 'Pedido entregado; revisa la configuración de correo.',
  };
}
