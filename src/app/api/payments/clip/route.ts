import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClipPaymentRequest, getClipPaymentStatus } from '@/lib/clip';
import { createAdminClient } from '@/lib/supabase/admin';
import { deliverOrder } from '@/services/deliveryService';

export const runtime = 'edge';

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

export async function PUT(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, order_number, status, payment_reference')
      .eq('order_number', parsed.data.orderNumber)
      .eq('payment_method', 'clip')
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ error: 'Pedido Clip no encontrado' }, { status: 404 });
    }

    if (order.status === 'DELIVERED') {
      return NextResponse.json({ status: 'delivered', order_number: order.order_number });
    }

    if (!order.payment_reference) {
      return NextResponse.json(
        { error: 'El pedido todavía no tiene una referencia de Clip' },
        { status: 409 }
      );
    }

    const verification = await getClipPaymentStatus(order.payment_reference);
    if (!verification.isPaid) {
      return NextResponse.json(
        { status: 'processing', clip_status: verification.status },
        { status: 202 }
      );
    }

    const now = new Date().toISOString();
    await Promise.all([
      supabase
        .from('orders')
        .update({ status: 'PAID', paid_at: now, updated_at: now })
        .eq('id', order.id)
        .neq('status', 'DELIVERED'),
      supabase
        .from('payments')
        .update({ status: 'COMPLETED', updated_at: now })
        .eq('order_id', order.id)
        .eq('provider', 'clip'),
    ]);

    const delivery = await deliverOrder(order.id);
    return NextResponse.json(
      {
        status: delivery.success ? 'delivered' : 'requires_attention',
        order_number: order.order_number,
        message: delivery.message,
      },
      { status: delivery.success ? 200 : 409 }
    );
  } catch (error) {
    console.error('Error conciliando pago Clip:', error);
    return NextResponse.json(
      { error: 'No se pudo confirmar el pago con Clip. Reintentaremos automáticamente.' },
      { status: 502 }
    );
  }
}
