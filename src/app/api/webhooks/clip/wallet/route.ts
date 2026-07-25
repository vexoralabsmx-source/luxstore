import { NextResponse } from 'next/server';
import { reconcileClipWalletTopup } from '@/services/walletTopupService';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const paymentRequestId = String(body?.payment_request_id || body?.id || '');
    const resourceStatus = String(body?.resource_status || '').toUpperCase();

    if (!paymentRequestId) {
      return NextResponse.json({ error: 'Falta payment_request_id' }, { status: 400 });
    }

    if (resourceStatus && resourceStatus !== 'COMPLETED') {
      return NextResponse.json({ status: 'ignored', resourceStatus });
    }

    const result = await reconcileClipWalletTopup(
      paymentRequestId,
      body?.transaction_id ? String(body.transaction_id) : null,
      body
    );

    return NextResponse.json({
      status: result.completed ? 'completed' : 'ignored',
      credited: result.credited,
      clipStatus: result.status,
    });
  } catch (error) {
    console.error('Error procesando webhook de recarga Clip:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
