import 'server-only';
import { getClipPaymentStatus } from '@/lib/clip';
import { createAdminClient } from '@/lib/supabase/admin';

export async function reconcileClipWalletTopup(
  paymentRequestId: string,
  transactionId?: string | null,
  rawResponse: Record<string, unknown> = {}
) {
  const verification = await getClipPaymentStatus(paymentRequestId);
  if (!verification.isPaid) {
    return { completed: false, status: verification.status, credited: false };
  }

  const admin = createAdminClient();
  const { data: credited, error } = await admin.rpc('complete_clip_wallet_topup', {
    p_payment_request_id: paymentRequestId,
    p_clip_transaction_id: transactionId || null,
    p_raw_response: rawResponse,
  });

  if (error) throw error;

  return {
    completed: true,
    status: verification.status,
    credited: Boolean(credited),
  };
}
