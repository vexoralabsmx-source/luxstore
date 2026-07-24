/**
 * Verifica la validez del token de Cloudflare Turnstile contra la API oficial
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<{ success: boolean; errorCodes?: string[] }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // Si no hay llave secreta configurada o es de prueba, validar de forma segura en desarrollo
  if (!secretKey || secretKey.startsWith('1x0000')) {
    return { success: true };
  }

  if (!token) {
    return { success: false, errorCodes: ['missing-input-response'] };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return {
      success: data.success === true,
      errorCodes: data['error-codes'],
    };
  } catch (error) {
    console.error('Error al verificar Cloudflare Turnstile:', error);
    // En caso de fallo de red en la llamada de Turnstile, denegar por seguridad
    return { success: false, errorCodes: ['api-connection-error'] };
  }
}
