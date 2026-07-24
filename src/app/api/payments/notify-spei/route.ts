import { NextResponse } from 'next/server';
import { sendAdminSPEINotifyEmail } from '@/services/emailService';
import { sendDiscordAlert } from '@/services/discordService';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderNumber, customerEmail, totalAmount, paymentReference } = body;

    if (!orderNumber || !paymentReference) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    const email = customerEmail || 'cliente@ejemplo.com';
    const amount = parseFloat(totalAmount) || 0;

    // 1. Actualizar orden en la base de datos Supabase
    try {
      const supabase = createAdminClient();
      await supabase
        .from('orders')
        .update({
          status: 'PAYMENT_REVIEW',
          payment_reference: paymentReference,
        })
        .eq('order_number', orderNumber);
    } catch (dbErr) {
      console.warn('Advertencia actualizando orden en Supabase:', dbErr);
    }

    // 2. Enviar correo de notificación de alta prioridad al Administrador mikeangdhz@gmail.com
    await sendAdminSPEINotifyEmail({
      orderNumber,
      customerEmail: email,
      totalAmount: amount,
      paymentReference,
    });

    // 3. Enviar alerta inmediata al servidor de Discord
    await sendDiscordAlert({
      title: '🔔 ALERTA SPEI: Nuevo Comprobante Recibido',
      description: `El cliente **${email}** reportó un pago de **$${amount.toFixed(2)} MXN** para la orden **${orderNumber}**.`,
      fields: [
        { name: 'Folio / Referencia SPEI', value: `\`${paymentReference}\``, inline: true },
        { name: 'Monto', value: `$${amount.toFixed(2)} MXN`, inline: true },
        { name: 'Estado', value: 'En Revisión (SPEI)', inline: true },
      ],
      color: 0xF59E0B, // Ambar
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al notificar pago SPEI a admin:', error);
    return NextResponse.json({ error: 'Error interno al enviar notificación' }, { status: 500 });
  }
}
