import { Resend } from 'resend';

const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL;
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL;

function getResend() {
  if (!process.env.RESEND_API_KEY || !SENDER_EMAIL) {
    throw new Error('Faltan RESEND_API_KEY o RESEND_FROM_EMAIL');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

function getSenderEmail(): string {
  if (!SENDER_EMAIL) throw new Error('Falta RESEND_FROM_EMAIL');
  return SENDER_EMAIL;
}

export interface SendDeliveryEmailParams {
  toEmail: string;
  orderNumber: string;
  deliveredItems: {
    productName: string;
    variantName?: string;
    deliveredContent: string;
  }[];
}

export interface SendPaymentPendingParams {
  toEmail: string;
  orderNumber: string;
  paymentMethod: string;
  totalAmount: number;
}

export interface SendAdminSPEINotifyParams {
  orderNumber: string;
  customerEmail: string;
  totalAmount: number;
  paymentReference: string;
}

/**
 * Plantilla de correo HTML estético en diseño Luxury Matte VIP (Oro Mate & Grafito)
 */
function buildEmailWrapper(contentHtml: string, title: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://luxstore.com';
  const logoUrl = 'https://res.cloudinary.com/dakjhsfne/image/upload/v1784914608/lux_hmytor.jpg';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="background-color: #050505; color: #F4F1EA; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 32px 16px; -webkit-font-smoothing: antialiased;">
      
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #0C0C0C; border: 1px solid #1C1C1C; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
        
        <!-- Header con Logo Oficial Lux Store -->
        <tr>
          <td style="padding: 32px 32px 24px 32px; text-align: center; border-bottom: 1px solid #1C1C1C; background-color: #080808;">
            <div style="margin-bottom: 12px;">
              <img src="${logoUrl}" alt="Lux Store Logo" style="width: 56px; height: 56px; border-radius: 14px; border: 1px solid rgba(197, 168, 128, 0.6); display: inline-block; object-fit: cover;" />
            </div>
            <div style="display: inline-block; padding: 4px 14px; border-radius: 100px; background-color: #050505; border: 1px solid rgba(197, 168, 128, 0.4); margin-bottom: 8px;">
              <span style="color: #C5A880; font-size: 11px; font-family: monospace; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">LUX STORE OFFICIAL</span>
            </div>
            <h1 style="color: #F4F1EA; font-family: Georgia, serif; font-size: 20px; font-weight: bold; margin: 6px 0 0 0;">
              CONFIRMACIÓN DE PEDIDO DIGITAL
            </h1>
          </td>
        </tr>

        <!-- Main Body -->
        <tr>
          <td style="padding: 32px;">
            ${contentHtml}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 24px 32px; text-align: center; border-top: 1px solid #1C1C1C; background-color: #080808;">
            <p style="color: #C5A880; font-size: 11px; font-family: monospace; margin: 0 0 8px 0; font-weight: bold;">
              PAGOS BBVA: Miguel Ángel Dorantes Hernández (4152 3146 1191 9765)
            </p>
            <p style="color: #71717A; font-size: 11px; margin: 0; line-height: 1.5;">
              © 2026 Lux Store. Licencias originales & entrega instantánea.<br />
              <a href="${appUrl}/dashboard/orders" style="color: #C5A880; text-decoration: underline; font-weight: bold;">Ver mi Cuenta en Lux Store</a>
            </p>
          </td>
        </tr>

      </table>

    </body>
    </html>
  `;
}

/**
 * Envía correo de notificación AL ADMINISTRADOR cuando un cliente notifica un pago SPEI
 */
export async function sendAdminSPEINotifyEmail(params: SendAdminSPEINotifyParams): Promise<boolean> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const innerContent = `
      <div style="margin-bottom: 24px;">
        <span style="color: #F59E0B; font-size: 12px; font-family: monospace; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
          🔔 NUEVO PAGO SPEI RECIBIDO - REVISIÓN REQUERIDA
        </span>
        <h2 style="color: #F4F1EA; font-family: Georgia, serif; font-size: 20px; margin: 8px 0 4px 0;">
          El cliente notificó transferencia bancaria BBVA
        </h2>
        <p style="color: #A1A1AA; font-size: 13px; margin: 0;">
          Orden N°: <strong style="color: #C5A880; font-family: monospace;">${params.orderNumber}</strong>
        </p>
      </div>

      <div style="background-color: #050505; border: 1px solid #1C1C1C; border-radius: 12px; padding: 20px; margin-bottom: 24px; font-family: monospace; font-size: 13px;">
        <p style="color: #71717A; margin: 0 0 6px 0;">CLIENTE:</p>
        <p style="color: #F4F1EA; font-weight: bold; margin: 0 0 12px 0;">${params.customerEmail}</p>

        <p style="color: #71717A; margin: 0 0 6px 0;">MONTO REPORTADO:</p>
        <p style="color: #22C55E; font-size: 20px; font-weight: bold; margin: 0 0 12px 0;">$${params.totalAmount.toFixed(2)} MXN</p>

        <p style="color: #71717A; margin: 0 0 6px 0;">FOLIO / REFERENCIA SPEI REPORTADO:</p>
        <div style="background-color: #09090B; border: 1px solid #1C1C1C; border-radius: 8px; padding: 12px; color: #C5A880; font-weight: bold; word-break: break-all;">
          ${params.paymentReference}
        </div>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${appUrl}/admin/orders" 
           style="display: inline-block; background-color: #C5A880; color: #050505; font-weight: bold; font-size: 13px; padding: 14px 32px; border-radius: 10px; text-decoration: none;">
          Aprobar Pago y Entregar Stock en 1-Clic
        </a>
      </div>
    `;

    const htmlBody = buildEmailWrapper(innerContent, `ALERTA SPEI: Comprobante Recibido ${params.orderNumber}`);

    if (!ADMIN_EMAIL) throw new Error('Falta ADMIN_NOTIFICATION_EMAIL');
    const result = await getResend().emails.send({
      from: getSenderEmail(),
      to: [ADMIN_EMAIL],
      subject: `🔔 Alerta SPEI: Nuevo Comprobante para Pedido ${params.orderNumber} ($${params.totalAmount.toFixed(2)} MXN)`,
      html: htmlBody,
    });

    if (result.error) throw new Error(result.error.message);
    return true;
  } catch (error) {
    console.error('Error al enviar notificación a admin:', error);
    return false;
  }
}

/**
 * Envía correo transaccional de entrega e ítems descifrados en diseño Matte VIP
 */
export async function sendDeliveryEmail(params: SendDeliveryEmailParams): Promise<boolean> {
  try {
    const itemsHtml = params.deliveredItems
      .map(
        (item) => `
        <div style="background-color: #050505; border: 1px solid #1C1C1C; border-left: 3px solid #C5A880; border-radius: 12px; padding: 18px; margin-bottom: 16px;">
          <h4 style="color: #F4F1EA; margin: 0 0 6px 0; font-size: 15px; font-weight: bold;">${item.productName}</h4>
          ${item.variantName ? `<p style="color: #C5A880; font-family: monospace; margin: 0 0 10px 0; font-size: 11px; font-weight: bold;">Modalidad: ${item.variantName}</p>` : ''}
          <div style="background-color: #0A0A0A; border: 1px solid #1C1C1C; border-radius: 8px; padding: 14px; font-family: 'Courier New', Courier, monospace; font-size: 14px; font-weight: bold; color: #E8D8C8; word-break: break-all; text-align: center; letter-spacing: 1px;">
            ${item.deliveredContent}
          </div>
        </div>
      `
      )
      .join('');

    const innerContent = `
      <div style="margin-bottom: 24px;">
        <span style="color: #22C55E; font-size: 12px; font-family: monospace; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
          • Pago Confirmado & Entregado
        </span>
        <h2 style="color: #F4F1EA; font-family: Georgia, serif; font-size: 22px; margin: 8px 0 4px 0;">
          Tus Accesos Están Listos (${params.deliveredItems.length} Entregas)
        </h2>
        <p style="color: #A1A1AA; font-size: 13px; margin: 0;">
          Orden N°: <strong style="color: #C5A880; font-family: monospace;">${params.orderNumber}</strong>
        </p>
      </div>

      <p style="color: #D4D4D8; font-size: 13px; line-height: 1.6; margin-bottom: 24px;">
        Tu pedido ha sido procesado exitosamente. A continuación se muestran los datos de acceso asignados a tu compra:
      </p>

      ${itemsHtml}

      <div style="text-align: center; margin-top: 32px; margin-bottom: 16px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order/${params.orderNumber}" 
           style="display: inline-block; background-color: #C5A880; color: #050505; font-weight: bold; font-size: 13px; padding: 14px 32px; border-radius: 10px; text-decoration: none; letter-spacing: 0.5px;">
          Ver en tu Bóveda Digital Privada
        </a>
      </div>
    `;

    const htmlBody = buildEmailWrapper(innerContent, `Entrega Pedido ${params.orderNumber} — Lux Store`);

    // Intentar enviar al cliente y al administrador
    const toRecipients = Array.from(new Set([params.toEmail, ADMIN_EMAIL].filter(Boolean))) as string[];
    let sent = 0;

    for (const recipient of toRecipients) {
      try {
        const res = await getResend().emails.send({
          from: getSenderEmail(),
          to: [recipient],
          subject: `Entrega de tu Pedido ${params.orderNumber} — Lux Store (${params.deliveredItems.length} Accesos)`,
          html: htmlBody,
        });
        if (res.error) throw new Error(res.error.message);
        sent++;
      } catch (e) {
        console.warn(`Aviso al enviar a ${recipient} vía Resend:`, e);
      }
    }

    return sent > 0;
  } catch (error) {
    console.error('Error al enviar correo Resend:', error);
    return false;
  }
}

/**
 * Envía correo transaccional para pagos pendientes SPEI
 */
export async function sendPaymentPendingEmail(params: SendPaymentPendingParams): Promise<boolean> {
  try {
    const innerContent = `
      <div style="margin-bottom: 24px;">
        <span style="color: #F59E0B; font-size: 12px; font-family: monospace; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
          • Pago Registrado — En Espera de Verificación
        </span>
        <h2 style="color: #F4F1EA; font-family: Georgia, serif; font-size: 20px; margin: 8px 0 4px 0;">
          Instrucciones para completar tu pedido
        </h2>
        <p style="color: #A1A1AA; font-size: 13px; margin: 0;">
          Orden N°: <strong style="color: #C5A880; font-family: monospace;">${params.orderNumber}</strong>
        </p>
      </div>

      <div style="background-color: #050505; border: 1px solid #1C1C1C; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="color: #A1A1AA; font-size: 12px; font-family: monospace; margin: 0 0 6px 0;">Monto Total a Transferir:</p>
        <p style="color: #F4F1EA; font-family: monospace; font-size: 24px; font-weight: bold; margin: 0 0 16px 0;">
          $${params.totalAmount.toFixed(2)} MXN
        </p>

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 12px; font-family: monospace; color: #D4D4D8;">
          <tr>
            <td style="padding: 4px 0; color: #71717A;">BANCO DESTINO:</td>
            <td style="padding: 4px 0; text-align: right; color: #F4F1EA; font-weight: bold;">BBVA</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #71717A;">BENEFICIARIO:</td>
            <td style="padding: 4px 0; text-align: right; color: #F4F1EA; font-weight: bold;">Miguel Ángel Dorantes Hernández</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #71717A;">TARJETA BBVA:</td>
            <td style="padding: 4px 0; text-align: right; color: #C5A880; font-weight: bold;">4152 3146 1191 9765</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order/${params.orderNumber}" 
           style="display: inline-block; background-color: #C5A880; color: #050505; font-weight: bold; font-size: 13px; padding: 12px 28px; border-radius: 10px; text-decoration: none;">
          Ver Estado del Pedido en Tiempo Real
        </a>
      </div>
    `;

    const htmlBody = buildEmailWrapper(innerContent, `Instrucciones de Pago ${params.orderNumber} — Lux Store`);

    const recipients = Array.from(new Set([params.toEmail, ADMIN_EMAIL].filter(Boolean))) as string[];
    let sent = 0;

    for (const recipient of recipients) {
      try {
        const result = await getResend().emails.send({
          from: getSenderEmail(),
          to: [recipient],
          subject: `Instrucciones de Pago para tu Pedido ${params.orderNumber} — Lux Store`,
          html: htmlBody,
        });
        if (result.error) throw new Error(result.error.message);
        sent++;
      } catch (e) {
        console.warn(`Aviso enviando instrucciones a ${recipient}:`, e);
      }
    }

    return sent > 0;
  } catch (error) {
    console.error('Error al enviar correo de pago pendiente:', error);
    return false;
  }
}
