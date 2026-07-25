import 'server-only';

export interface ClipPaymentRequestParams {
  amount: number;
  currency?: string;
  purchase_description: string;
  redirection_url: {
    success: string;
    error: string;
    default: string;
  };
  metadata?: Record<string, string>;
  webhook_url: string;
}

export interface ClipPaymentResponse {
  payment_request_id: string;
  url: string;
  status: string;
  amount: number;
}

const BASE_URL = 'https://api.payclip.com/v2/checkout';

function getAuthToken(): string {
  const token = process.env.CLIP_AUTH_TOKEN;
  if (!token) throw new Error('Falta CLIP_AUTH_TOKEN');
  return token.startsWith('Basic ') || token.startsWith('Bearer ') ? token : `Basic ${token}`;
}

export async function createClipPaymentRequest(
  params: ClipPaymentRequestParams
): Promise<ClipPaymentResponse> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: getAuthToken(),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      amount: Number(params.amount.toFixed(2)),
      currency: params.currency || 'MXN',
      purchase_description: params.purchase_description,
      redirection_url: params.redirection_url,
      metadata: params.metadata || {},
      webhook_url: params.webhook_url,
    }),
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.payment_request_id || !payload.payment_request_url) {
    throw new Error(payload.message || payload.last_status_message || `Clip respondió ${response.status}`);
  }

  return {
    payment_request_id: payload.payment_request_id,
    url: payload.payment_request_url,
    status: payload.status || 'CHECKOUT_CREATED',
    amount: params.amount,
  };
}

export async function getClipPaymentStatus(
  paymentRequestId: string
): Promise<{ status: string; isPaid: boolean }> {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(paymentRequestId)}`, {
    headers: {
      Authorization: getAuthToken(),
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `Clip respondió ${response.status}`);

  const status = String(payload.status || payload.resource_status || 'UNKNOWN').toUpperCase();
  return {
    status,
    isPaid: status === 'COMPLETED' || status === 'CHECKOUT_COMPLETED',
  };
}
