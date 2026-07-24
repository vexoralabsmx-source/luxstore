import { NextResponse } from 'next/server';
import { createClipPaymentRequest } from '@/lib/clip';
import { getOrderByNumber } from '@/services/orderService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderNumber, total: bodyTotal } = body;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const targetOrderNumber = orderNumber || `LX-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = await getOrderByNumber(targetOrderNumber);
    const amountToCharge = order ? order.total : (bodyTotal || 20.00);

    // Intentar generar la solicitud oficial en la API de Clip
    const clipResponse = await createClipPaymentRequest({
      amount: amountToCharge,
      currency: 'MXN',
      purchase_description: `Pedido ${targetOrderNumber} — Lux Store`,
      redirection_url: {
        success: `${appUrl}/order/${targetOrderNumber}?clip_status=success`,
        error: `${appUrl}/order/${targetOrderNumber}?clip_status=error`,
        default: `${appUrl}/order/${targetOrderNumber}`,
      },
      metadata: {
        order_number: targetOrderNumber,
      },
    });

    if (clipResponse && clipResponse.url) {
      return NextResponse.json({
        url: clipResponse.url,
        payment_request_id: clipResponse.payment_request_id,
        simulated: false,
      });
    }

    // Si las llaves de Clip son de prueba o la API sandbox no está activa, abrir el Modal de Pago Interactivo de Clip
    return NextResponse.json({
      show_modal: true,
      amount: amountToCharge,
      orderNumber: targetOrderNumber,
    });
  } catch (error: any) {
    console.error('Error en API de inicio Clip:', error);
    return NextResponse.json({
      show_modal: true,
      amount: 25.00,
      orderNumber: 'LX-2026-000001',
    });
  }
}
