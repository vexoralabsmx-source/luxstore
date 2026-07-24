export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { deliverOrder } from '@/services/deliveryService';
import { getClipPaymentStatus } from '@/lib/clip';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    let body: any = {};

    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
    }

    console.log('Webhook Clip recibido:', body);

    const orderNumber = body?.metadata?.order_number || body?.order_number;
    const paymentRequestId = body?.payment_request_id || body?.id;

    if (!orderNumber && !paymentRequestId) {
      return NextResponse.json({ error: 'Identificador de pedido faltante en payload' }, { status: 400 });
    }

    // 1. Verificación del estado real en la API oficial de Clip (Cero Confianza)
    if (paymentRequestId) {
      const clipVerification = await getClipPaymentStatus(paymentRequestId);

      if (clipVerification && !clipVerification.isPaid) {
        console.warn(`Webhook ignorado: El estado del pago ${paymentRequestId} es ${clipVerification.status}`);
        return NextResponse.json({ status: 'ignored', reason: 'Pago no aprobado en API de Clip' });
      }
    }

    // 2. Ejecutar entrega automática e idempotente
    const targetOrderNumber = orderNumber || paymentRequestId;
    const deliveryResult = await deliverOrder(targetOrderNumber);

    if (deliveryResult.success) {
      return NextResponse.json({
        status: 'success',
        order_number: deliveryResult.orderNumber,
        message: deliveryResult.message,
      });
    } else {
      return NextResponse.json({
        status: 'processing_manual',
        order_number: deliveryResult.orderNumber,
        message: deliveryResult.message,
      }, { status: 200 }); // Responder 200 a Clip para evitar reintentos infinitos si fue falta de stock
    }
  } catch (error) {
    console.error('Error procesando Webhook Clip:', error);
    return NextResponse.json({ error: 'Error interno en webhook' }, { status: 500 });
  }
}
