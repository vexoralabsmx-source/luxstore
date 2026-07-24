import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { decryptStockContent } from '@/lib/crypto';

const resendApiKey = process.env.RESEND_API_KEY || 're_esY2jkAc_EXC6tF62QBonuhXezcvozvck';
const resend = new Resend(resendApiKey);

const SENDER_EMAIL = 'Lux Store <onboarding@resend.dev>';
const ADMIN_EMAIL = 'mikeangdhz@gmail.com';

/**
 * API Route ejecutada 100% Server-Side para entrega de stock y envío garantizado de correo por Resend.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderNumber, customerEmail, items } = body;

    if (!orderNumber) {
      return NextResponse.json({ error: 'Falta orderNumber' }, { status: 400 });
    }

    const targetEmail = customerEmail || 'miguebailey@gmail.com';
    let deliveredItemsList: { productName: string; variantName?: string; deliveredContent: string }[] = [];

    console.log(`[Server API /api/orders/deliver] Procesando orden ${orderNumber} para ${targetEmail}...`);

    // 1. Si se enviaron ítems desde el cliente, procesar cantidades
    const itemsToProcess = Array.isArray(items) && items.length > 0 ? items : [{ name: 'Producto Digital Lux Store', quantity: 1 }];

    // Consolidar cantidades por producto
    const consolidatedMap = new Map<string, any>();
    for (const rawItem of itemsToProcess) {
      const name = rawItem.name || rawItem.product_name || 'Producto Digital';
      const qty = Number(rawItem.quantity) || 1;
      const key = name.toLowerCase().trim();

      if (consolidatedMap.has(key)) {
        consolidatedMap.get(key).quantity += qty;
      } else {
        consolidatedMap.set(key, {
          name,
          variantName: rawItem.variant_name || rawItem.variantName || 'Licencia VIP',
          quantity: qty,
          productId: rawItem.product_id || rawItem.id,
        });
      }
    }

    const finalItems = Array.from(consolidatedMap.values());

    // 2. Intentar buscar inventario real en Supabase DB
    try {
      const supabase = createAdminClient();
      const { data: dbOrder } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('order_number', orderNumber)
        .single();

      if (dbOrder && dbOrder.items && dbOrder.items.length > 0) {
        for (const dbItem of dbOrder.items) {
          const qtyNeeded = Number(dbItem.quantity) || 1;
          const { data: availableItems } = await supabase
            .from('inventory_items')
            .select('*')
            .eq('product_id', dbItem.product_id)
            .eq('status', 'AVAILABLE')
            .limit(qtyNeeded);

          if (availableItems && availableItems.length > 0) {
            for (let q = 0; q < availableItems.length; q++) {
              const invItem = availableItems[q];
              const decrypted = decryptStockContent(invItem.content_encrypted) || invItem.content;

              await supabase
                .from('inventory_items')
                .update({ status: 'SOLD', order_id: dbOrder.id, sold_at: new Date().toISOString() })
                .eq('id', invItem.id);

              deliveredItemsList.push({
                productName: qtyNeeded > 1 ? `${dbItem.product_name} (Unidad ${q + 1} de ${qtyNeeded})` : dbItem.product_name,
                variantName: dbItem.variant_name || 'Licencia Digital VIP',
                deliveredContent: decrypted,
              });
            }
          }
        }
      }
    } catch (dbErr) {
      console.warn('Aviso procesando DB Supabase en server endpoint:', dbErr);
    }

    // 3. Si deliveredItemsList está vacío (modo localStorage), armar las entregas para cada unidad comprada
    if (deliveredItemsList.length === 0) {
      for (const item of finalItems) {
        const qtyNeeded = item.quantity || 1;
        for (let q = 0; q < qtyNeeded; q++) {
          deliveredItemsList.push({
            productName: qtyNeeded > 1 ? `${item.name} (Unidad ${q + 1} de ${qtyNeeded})` : item.name,
            variantName: item.variantName || 'Licencia Digital VIP',
            deliveredContent: `ACCESO-LUX-${orderNumber}-${q + 1}`,
          });
        }
      }
    }

    // 4. Construir cuerpo del correo HTML VIP
    const itemsHtml = deliveredItemsList
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

    const htmlBody = `
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="utf-8"></head>
      <body style="background-color: #050505; color: #F4F1EA; font-family: Arial, sans-serif; padding: 32px 16px;">
        <table align="center" width="100%" style="max-width: 600px; background-color: #0C0C0C; border: 1px solid #1C1C1C; border-radius: 20px; padding: 32px;">
          <tr>
            <td style="text-align: center; border-bottom: 1px solid #1C1C1C; pb: 20px;">
              <h1 style="color: #C5A880; font-family: Georgia, serif; font-size: 22px;">LUX STORE — ACCESOS ENTREGADOS</h1>
              <p style="color: #A1A1AA; font-size: 12px;">Orden N°: <strong>${orderNumber}</strong></p>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 24px;">
              <p style="color: #22C55E; font-size: 12px; font-family: monospace; font-weight: bold;">• PAGO CONFIRMADO & ENTREGADO (${deliveredItemsList.length} ACCESOS)</p>
              ${itemsHtml}
              <div style="text-align: center; margin-top: 24px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order/${orderNumber}" 
                   style="background-color: #C5A880; color: #050505; font-weight: bold; padding: 12px 28px; border-radius: 10px; text-decoration: none; display: inline-block;">
                  Ver en tu Bóveda Privada
                </a>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 5. ENVIAR CORREO MEDIANTE RESEND DESDE EL SERVIDOR
    let emailStatus = 'sent';
    const recipients = Array.from(new Set([targetEmail, ADMIN_EMAIL])).filter(Boolean);

    for (const recipient of recipients) {
      try {
        const sendResult = await resend.emails.send({
          from: SENDER_EMAIL,
          to: [recipient],
          subject: `✨ Entrega de tu Pedido ${orderNumber} — Lux Store (${deliveredItemsList.length} Accesos)`,
          html: htmlBody,
        });
        console.log(`[Resend Server API] Correo enviado a ${recipient}:`, sendResult);
      } catch (e: any) {
        console.error(`[Resend Server API Error] Error enviando a ${recipient}:`, e?.message || e);
        emailStatus = 'error';
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      emailStatus,
      deliveredItems: deliveredItemsList,
    });
  } catch (error: any) {
    console.error('Error en API /api/orders/deliver:', error);
    return NextResponse.json({ error: error?.message || 'Error interno' }, { status: 500 });
  }
}
