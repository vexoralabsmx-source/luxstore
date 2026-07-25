import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClipPaymentRequest } from '@/lib/clip';
import { createAdminClient } from '@/lib/supabase/admin';

const schema = z.object({ orderNumber: z.string().min(8).max(40) });

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, order_number, total, currency, status, customer_email')
      .eq('order_number', parsed.data.orderNumber)
      .eq('payment_method', 'clip')
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ error: 'Pedido Clip no encontrado' }, { status: 404 });
    }
    if (order.status !== 'PENDING_PAYMENT') {
      return NextResponse.json({ error: 'El pedido ya no está pendiente de pago' }, { status: 409 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl?.startsWith('https://') && !appUrl?.startsWith('http://localhost')) {
      throw new Error('NEXT_PUBLIC_APP_URL debe ser una URL pública válida');
    }

    const clip = await createClipPaymentRequest({
      amount: Number(order.total),
      currency: order.currency || 'MXN',
      purchase_description: `Pedido ${order.order_number} - Lux Store`,
      redirection_url: {
        success: `${appUrl}/order/${order.order_number}?clip_status=success`,
        error: `${appUrl}/order/${order.order_number}?clip_status=error`,
        default: `${appUrl}/order/${order.order_number}`,
      },
      webhook_url: `${appUrl}/api/webhooks/clip`,
      metadata: {
        order_number: order.order_number,
        customer_email: order.customer_email,
      },
    });

    await Promise.all([
      supabase
        .from('orders')
        .update({ payment_reference: clip.payment_request_id })
        .eq('id', order.id),
      supabase.from('payments').insert({
        order_id: order.id,
        provider: 'clip',
        transaction_id: clip.payment_request_id,
        amount: order.total,
        currency: order.currency || 'MXN',
        status: clip.status,
      }),
    ]);

    return NextResponse.json({
      url: clip.url,
      payment_request_id: clip.payment_request_id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo iniciar Clip';
    console.error('Error iniciando Clip:', error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
