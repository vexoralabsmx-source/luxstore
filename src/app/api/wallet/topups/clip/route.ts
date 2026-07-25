import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClipPaymentRequest } from '@/lib/clip';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { reconcileClipWalletTopup } from '@/services/walletTopupService';

export const runtime = 'edge';

const createSchema = z.object({
  amount: z.number().finite().min(10).max(10000),
});

const reconcileSchema = z.object({
  topupId: z.string().uuid(),
});

function getAppUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl?.startsWith('https://') && !appUrl?.startsWith('http://localhost')) {
    throw new Error('NEXT_PUBLIC_APP_URL debe ser una URL pública válida');
  }
  return appUrl.replace(/\/$/, '');
}

async function authenticatedUser() {
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();
  return user;
}

export async function POST(request: Request) {
  const user = await authenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesión para recargar créditos' }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Ingresa un monto entre $10 y $10,000 MXN' },
      { status: 400 }
    );
  }

  const amount = Number(parsed.data.amount.toFixed(2));
  const admin = createAdminClient();
  const { data: topup, error: topupError } = await admin
    .from('wallet_topups')
    .insert({ user_id: user.id, amount, currency: 'MXN', status: 'PENDING' })
    .select('id')
    .single();

  if (topupError || !topup) {
    return NextResponse.json({ error: 'No se pudo iniciar la recarga' }, { status: 500 });
  }

  try {
    const appUrl = getAppUrl();
    const returnUrl = `${appUrl}/dashboard/wallet?clip_topup=${topup.id}`;
    const clip = await createClipPaymentRequest({
      amount,
      currency: 'MXN',
      purchase_description: `Recarga de créditos Lux Store`,
      redirection_url: {
        success: returnUrl,
        error: `${returnUrl}&status=error`,
        default: returnUrl,
      },
      webhook_url: `${appUrl}/api/webhooks/clip/wallet`,
      metadata: {
        wallet_topup_id: topup.id,
        user_id: user.id,
      },
    });

    const { error: updateError } = await admin
      .from('wallet_topups')
      .update({
        payment_request_id: clip.payment_request_id,
        clip_status: clip.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', topup.id)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ url: clip.url, topupId: topup.id });
  } catch (error) {
    await admin
      .from('wallet_topups')
      .update({ status: 'FAILED', updated_at: new Date().toISOString() })
      .eq('id', topup.id);
    console.error('Error iniciando recarga Clip:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No se pudo abrir Clip' },
      { status: 502 }
    );
  }
}

export async function PUT(request: Request) {
  const user = await authenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 });
  }

  const parsed = reconcileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Recarga inválida' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: topup, error } = await admin
    .from('wallet_topups')
    .select('id, status, payment_request_id')
    .eq('id', parsed.data.topupId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !topup) {
    return NextResponse.json({ error: 'Recarga no encontrada' }, { status: 404 });
  }
  if (topup.status === 'COMPLETED') {
    return NextResponse.json({ status: 'completed', credited: false });
  }
  if (!topup.payment_request_id) {
    return NextResponse.json({ error: 'La recarga no tiene referencia de Clip' }, { status: 409 });
  }

  try {
    const result = await reconcileClipWalletTopup(topup.payment_request_id);
    return NextResponse.json(
      {
        status: result.completed ? 'completed' : 'processing',
        clipStatus: result.status,
        credited: result.credited,
      },
      { status: result.completed ? 200 : 202 }
    );
  } catch (reconcileError) {
    console.error('Error conciliando recarga Clip:', reconcileError);
    return NextResponse.json(
      { error: 'No se pudo confirmar la recarga con Clip' },
      { status: 502 }
    );
  }
}
