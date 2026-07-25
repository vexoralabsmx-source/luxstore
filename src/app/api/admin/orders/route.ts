import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin';
import { deliverOrder } from '@/services/deliveryService';

export async function GET() {
  const context = await requireAdmin();
  if (!context) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { data, error } = await context.admin
    .from('orders')
    .select('*, items:order_items(*)')
    .order('created_at', { ascending: false });
  return error
    ? NextResponse.json({ error: error.message }, { status: 500 })
    : NextResponse.json({ orders: data || [] });
}

export async function POST(request: Request) {
  const context = await requireAdmin();
  if (!context) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const parsed = z.object({ orderNumber: z.string().min(8).max(40) }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 });

  const { data: order } = await context.admin
    .from('orders')
    .select('id, status, payment_method')
    .eq('order_number', parsed.data.orderNumber)
    .maybeSingle();
  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });

  if (order.status === 'PAYMENT_REVIEW' && order.payment_method === 'spei') {
    const now = new Date().toISOString();
    await context.admin
      .from('orders')
      .update({ status: 'PAID', paid_at: now, updated_at: now })
      .eq('id', order.id);
  } else if (!['PAID', 'PROCESSING'].includes(order.status)) {
    return NextResponse.json({ error: 'El pago no está listo para aprobación manual' }, { status: 409 });
  }

  const result = await deliverOrder(order.id);
  return NextResponse.json(result, { status: result.success ? 200 : 409 });
}
