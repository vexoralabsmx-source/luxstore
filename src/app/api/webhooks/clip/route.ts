import { NextResponse } from 'next/server';
import { deliverOrder } from '@/services/deliveryService';
import { getClipPaymentStatus } from '@/lib/clip';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const paymentRequestId = String(body?.payment_request_id || '');
    const webhookStatus = String(body?.resource_status || '').toUpperCase();

    if (!paymentRequestId) {
      return NextResponse.json({ error: 'Falta payment_request_id' }, { status: 400 });
    }

    if (webhookStatus && webhookStatus !== 'COMPLETED') {
      return NextResponse.json({ status: 'ignored', resource_status: webhookStatus });
    }

    const verification = await getClipPaymentStatus(paymentRequestId);
    if (!verification.isPaid) {
      return NextResponse.json({ status: 'ignored', reason: verification.status });
    }

    const supabase = createAdminClient();
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, order_number, status')
      .eq('payment_reference', paymentRequestId)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ error: 'Pedido no conciliado' }, { status: 404 });
    }

    if (order.status === 'DELIVERED') {
      return NextResponse.json({ status: 'already_delivered' });
    }

    const now = new Date().toISOString();
    await Promise.all([
      supabase
        .from('orders')
        .update({ status: 'PAID', paid_at: now, updated_at: now })
        .eq('id', order.id),
      supabase
        .from('payments')
        .update({
          status: 'COMPLETED',
          raw_response: body,
          updated_at: now,
          txid: body?.transaction_id || null,
        })
        .eq('transaction_id', paymentRequestId),
    ]);

    const delivery = await deliverOrder(order.id);
    return NextResponse.json(
      {
        status: delivery.success ? 'success' : 'requires_attention',
        order_number: order.order_number,
        message: delivery.message,
      },
      { status: delivery.success ? 200 : 409 }
    );
  } catch (error) {
    console.error('Error procesando webhook Clip:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
