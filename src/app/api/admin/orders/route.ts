import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin';
import { deliverOrder } from '@/services/deliveryService';

export const runtime = 'edge';

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

  const { data: order, error: orderError } = await context.admin
    .from('orders')
    .select('id, status, payment_method')
    .eq('order_number', parsed.data.orderNumber)
    .maybeSingle();
  if (orderError) {
    return NextResponse.json({ error: 'No se pudo consultar el pedido' }, { status: 500 });
  }
  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });

  const canApproveSpei =
    order.payment_method === 'spei'
    && ['PENDING_PAYMENT', 'PAYMENT_REVIEW'].includes(order.status);

  if (canApproveSpei) {
    const now = new Date().toISOString();
    const { data: approvedOrder, error: approvalError } = await context.admin
      .from('orders')
      .update({ status: 'PAID', paid_at: now, updated_at: now })
      .eq('id', order.id)
      .in('status', ['PENDING_PAYMENT', 'PAYMENT_REVIEW'])
      .select('id')
      .maybeSingle();

    if (approvalError) {
      return NextResponse.json({ error: 'No se pudo aprobar el pago SPEI' }, { status: 500 });
    }
    if (!approvedOrder) {
      return NextResponse.json(
        { error: 'El estado del pedido cambió. Actualiza la lista e inténtalo nuevamente.' },
        { status: 409 }
      );
    }
  } else if (!['PAID', 'PROCESSING'].includes(order.status)) {
    return NextResponse.json(
      {
        error:
          order.payment_method === 'spei'
            ? `El pedido SPEI está en estado ${order.status} y no puede aprobarse`
            : 'Solo los pagos SPEI pueden aprobarse manualmente',
      },
      { status: 409 }
    );
  }

  const result = await deliverOrder(order.id);
  return NextResponse.json(result, { status: result.success ? 200 : 409 });
}
