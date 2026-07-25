import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _request: Request,
  context: { params: Promise<{ order_number: string }> }
) {
  const { order_number: orderNumber } = await context.params;
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  const admin = createAdminClient();
  const { data: order, error } = await admin
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('order_number', orderNumber)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  }

  const isOwner = Boolean(user && order.user_id === user.id);
  let deliveries: unknown[] = [];
  if (isOwner) {
    const { data } = await admin.from('deliveries').select('*').eq('order_id', order.id);
    deliveries = data || [];
  }

  return NextResponse.json({
    order: {
      id: order.id,
      order_number: order.order_number,
      payment_method: order.payment_method,
      payment_reference: order.payment_reference,
      subtotal: order.subtotal,
      discount_amount: order.discount_amount,
      total: order.total,
      currency: order.currency,
      status: order.status,
      created_at: order.created_at,
      items: order.items || [],
      deliveries,
    },
    canViewDelivery: isOwner,
  });
}
