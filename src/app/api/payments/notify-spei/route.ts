import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendAdminSPEINotifyEmail } from '@/services/emailService';
import { sendDiscordAlert } from '@/services/discordService';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'edge';

const schema = z.object({
  orderNumber: z.string().min(8).max(40),
  paymentReference: z.string().trim().min(4).max(120),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Referencia inválida' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, order_number, customer_email, total, status, payment_method')
      .eq('order_number', parsed.data.orderNumber)
      .maybeSingle();

    if (error || !order || order.payment_method !== 'spei') {
      return NextResponse.json({ error: 'Pedido SPEI no encontrado' }, { status: 404 });
    }
    if (order.status !== 'PENDING_PAYMENT') {
      return NextResponse.json({ error: 'El pedido ya fue reportado o procesado' }, { status: 409 });
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'PAYMENT_REVIEW',
        payment_reference: parsed.data.paymentReference,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .eq('status', 'PENDING_PAYMENT');
    if (updateError) throw updateError;

    const emailSent = await sendAdminSPEINotifyEmail({
      orderNumber: order.order_number,
      customerEmail: order.customer_email,
      totalAmount: Number(order.total),
      paymentReference: parsed.data.paymentReference,
    });

    await sendDiscordAlert({
      title: 'Nuevo comprobante SPEI',
      description: `Pedido ${order.order_number} en revisión.`,
      fields: [
        { name: 'Referencia', value: parsed.data.paymentReference, inline: true },
        { name: 'Monto', value: `$${Number(order.total).toFixed(2)} MXN`, inline: true },
      ],
      color: 0xf59e0b,
    }).catch(() => undefined);

    return NextResponse.json({ success: true, emailSent });
  } catch (error) {
    console.error('Error notificando SPEI:', error);
    return NextResponse.json({ error: 'No se pudo registrar la transferencia' }, { status: 500 });
  }
}
