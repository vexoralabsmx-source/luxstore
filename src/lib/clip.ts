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
}

export interface ClipPaymentResponse {
  payment_request_id: string;
  url: string;
  status: string;
  amount: number;
}

const CLIP_API_KEY = process.env.CLIP_API_KEY || '9f0ca8fe-6dc6-453c-ab2f-0b725d0c3954';
const CLIP_SECRET_KEY = process.env.CLIP_SECRET_KEY || '5527698f-722f-4abf-8184-06914f26d4a3';
const IS_SANDBOX = process.env.CLIP_SANDBOX_MODE === 'true';

const BASE_URL = IS_SANDBOX
  ? 'https://api-gw.sandbox.payclip.com'
  : 'https://api-gw.payclip.com';

/**
 * Genera el encabezado de autenticación Basic Auth oficial para Clip API
 */
function getAuthHeader(): string {
  const authString = Buffer.from(`${CLIP_API_KEY}:${CLIP_SECRET_KEY}`).toString('base64');
  return `Basic ${authString}`;
}

/**
 * Crea una solicitud de pago en Clip Checkout oficial
 */
export async function createClipPaymentRequest(params: ClipPaymentRequestParams): Promise<ClipPaymentResponse | null> {
  try {
    const payload = {
      amount: params.amount,
      currency: params.currency || 'MXN',
      purchase_description: params.purchase_description,
      redirection_url: params.redirection_url,
      metadata: params.metadata || {},
    };

    const res = await fetch(`${BASE_URL}/paymentrequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Error al solicitar checkout a Clip API:', res.status, errText);
      return null;
    }

    const data = await res.json();
    return {
      payment_request_id: data.payment_request_id || data.id,
      url: data.url || data.payment_url,
      status: data.status || 'PENDING',
      amount: data.amount,
    };
  } catch (error) {
    console.error('Excepción al conectar con la API Oficial de Clip:', error);
    return null;
  }
}

/**
 * Consulta el estado real de un pago en la API de Clip (Conciliación Backend)
 */
export async function getClipPaymentStatus(paymentRequestId: string): Promise<{ status: string; isPaid: boolean } | null> {
  try {
    const res = await fetch(`${BASE_URL}/paymentrequest/${paymentRequestId}`, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader(),
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const status = data.status?.toUpperCase() || 'UNKNOWN';
    const isPaid = status === 'PAID' || status === 'CHECKOUT_PAID' || status === 'APPROVED';

    return { status, isPaid };
  } catch (e) {
    console.error('Error al consultar estado de pago en Clip:', e);
    return null;
  }
}
