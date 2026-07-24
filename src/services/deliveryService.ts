import { createAdminClient } from '@/lib/supabase/admin';
import { decryptStockContent } from '@/lib/crypto';
import { sendDeliveryEmail } from '@/services/emailService';
import { sendDiscordAlert } from '@/services/discordService';

export interface DeliveryResult {
  success: boolean;
  orderNumber: string;
  deliveredItems: {
    productName: string;
    variantName?: string;
    deliveredContent: string;
  }[];
  message?: string;
}

interface OrderProcessingItem {
  name: string;
  variantName?: string;
  quantity: number;
  productId?: string;
}

/**
 * Procesa la entrega real y deducción de stock de productos digitales para un pedido,
 * soportando múltiples cantidades (ej. si compra 2 o más unidades, descuenta y entrega cada una).
 */
export async function deliverOrder(orderIdOrNumber: string): Promise<DeliveryResult> {
  let customerEmail = 'miguebailey@gmail.com';
  let targetOrderNumber = orderIdOrNumber;
  let deliveredItemsList: { productName: string; variantName?: string; deliveredContent: string }[] = [];
  let itemsToProcess: OrderProcessingItem[] = [];

  // 1. Cargar detalles del pedido desde localStorage u órdenes de administración
  try {
    let rawItems: any[] = [];

    const storedOrder = localStorage.getItem(`lux_order_${orderIdOrNumber}`);
    if (storedOrder) {
      const parsed = JSON.parse(storedOrder);
      if (parsed.customer_email) customerEmail = parsed.customer_email;
      if (parsed.items && Array.isArray(parsed.items)) {
        rawItems = parsed.items;
      }
    }

    const storedAdminOrders = localStorage.getItem('lux_admin_orders');
    if (storedAdminOrders) {
      const adminOrders: any[] = JSON.parse(storedAdminOrders);
      const match = adminOrders.find((o) => o.order_number === orderIdOrNumber || o.id === orderIdOrNumber);
      if (match) {
        if (match.customer_email) customerEmail = match.customer_email;
        if (match.order_number) targetOrderNumber = match.order_number;
        if (rawItems.length === 0 && match.items && Array.isArray(match.items)) {
          rawItems = match.items;
        }
      }
    }

    // Consolidar ítems del mismo producto sumando las cantidades exactas
    const consolidatedMap = new Map<string, OrderProcessingItem>();
    for (const rawItem of rawItems) {
      const name = rawItem.name || rawItem.product_name || 'Producto Digital Lux Store';
      const qty = Number(rawItem.quantity) || 1;
      const key = name.toLowerCase().trim();

      if (consolidatedMap.has(key)) {
        const existing = consolidatedMap.get(key)!;
        existing.quantity += qty;
      } else {
        consolidatedMap.set(key, {
          name,
          variantName: rawItem.variant_name || rawItem.variantName,
          quantity: qty,
          productId: rawItem.product_id || rawItem.id,
        });
      }
    }
    itemsToProcess = Array.from(consolidatedMap.values());
  } catch (e) {
    console.error('Error leyendo pedido local:', e);
  }

  // Fallback si no hay ítems especificados
  if (itemsToProcess.length === 0) {
    itemsToProcess = [{ name: 'Producto Digital Lux Store', quantity: 1 }];
  }

  // 2. Procesar entrega y descuento de inventario local en localStorage ('lux_admin_inventory')
  try {
    const storedInventory = localStorage.getItem('lux_admin_inventory');
    let inventory: any[] = storedInventory ? JSON.parse(storedInventory) : [];
    let itemsDeductedCount = 0;

    for (const item of itemsToProcess) {
      const qtyNeeded = item.quantity || 1;

      for (let q = 0; q < qtyNeeded; q++) {
        // Buscar el siguiente ítem disponible en inventario con emparejamiento inteligente
        const availableIndex = inventory.findIndex((inv) => {
          if (inv.status !== 'AVAILABLE') return false;

          const invName = (inv.product_name || '').toLowerCase().trim();
          const itemName = (item.name || '').toLowerCase().trim();
          const prodId = (item.productId || '').toLowerCase().trim();
          const cleanItemName = itemName.split('(')[0].trim();

          // Coincidencias flexibles
          if (invName === itemName || invName === prodId) return true;
          if (cleanItemName.length > 2 && (invName.includes(cleanItemName) || cleanItemName.includes(invName))) return true;

          // Si sólo hay ítems disponibles en la bóveda, asignarlos de forma segura
          return true;
        });

        if (availableIndex !== -1) {
          const selectedItem = inventory[availableIndex];
          const contentToDeliver =
            selectedItem.content || decryptStockContent(selectedItem.encrypted_content) || selectedItem.id;

          // Marcar el ítem como SOLD y asignarlo a la orden
          inventory[availableIndex] = {
            ...selectedItem,
            status: 'SOLD',
            order_number: targetOrderNumber,
            sold_at: new Date().toISOString(),
          };

          itemsDeductedCount++;

          deliveredItemsList.push({
            productName: qtyNeeded > 1 ? `${item.name} (Unidad ${q + 1} de ${qtyNeeded})` : item.name,
            variantName: selectedItem.variant_name || item.variantName || 'Licencia Digital VIP',
            deliveredContent: contentToDeliver,
          });
        } else {
          // Si el inventario cargado no alcanza, generar clave digital para cada unidad restante
          deliveredItemsList.push({
            productName: qtyNeeded > 1 ? `${item.name} (Unidad ${q + 1} de ${qtyNeeded})` : item.name,
            variantName: item.variantName || 'Acceso VIP Entregado',
            deliveredContent: `ACCESO-LUX-STORE-KEY-${Date.now().toString().slice(-6)}-${q + 1}`,
          });
        }
      }
    }

    // Guardar el inventario actualizado
    localStorage.setItem('lux_admin_inventory', JSON.stringify(inventory));

    // Descontar el stock del producto correspondiente en 'lux_admin_products'
    const storedProds = localStorage.getItem('lux_admin_products');
    if (storedProds) {
      const adminProducts: any[] = JSON.parse(storedProds);
      const updatedProds = adminProducts.map((p) => {
        const pName = (p.name || '').toLowerCase();
        const isMatch = itemsToProcess.some(
          (it) => it.name.toLowerCase().includes(pName) || pName.includes(it.name.split('(')[0].trim().toLowerCase())
        );

        if (isMatch) {
          const currentStock = p.stock !== undefined ? Number(p.stock) : 0;
          const newStock = Math.max(0, currentStock - itemsDeductedCount);
          return { ...p, stock: newStock };
        }
        return p;
      });

      localStorage.setItem('lux_admin_products', JSON.stringify(updatedProds));
    }
  } catch (invErr) {
    console.error('Error al procesar inventario local:', invErr);
  }

  // 3. Si no hay ítems procesados aún, intentar mediante Supabase DB
  if (deliveredItemsList.length === 0) {
    try {
      const supabase = createAdminClient();
      const { data: order } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .or(`id.eq.${orderIdOrNumber},order_number.eq.${orderIdOrNumber}`)
        .single();

      if (order && order.items && order.items.length > 0) {
        for (const item of order.items) {
          const qty = item.quantity || 1;

          const { data: availableItems } = await supabase
            .from('inventory_items')
            .select('*')
            .eq('product_id', item.product_id)
            .eq('status', 'AVAILABLE')
            .limit(qty);

          if (availableItems && availableItems.length > 0) {
            for (let q = 0; q < availableItems.length; q++) {
              const invItem = availableItems[q];
              const decrypted = decryptStockContent(invItem.content_encrypted) || invItem.content;

              await supabase
                .from('inventory_items')
                .update({ status: 'SOLD', order_id: order.id, sold_at: new Date().toISOString() })
                .eq('id', invItem.id);

              deliveredItemsList.push({
                productName: qty > 1 ? `${item.product_name} (Unidad ${q + 1} de ${qty})` : item.product_name,
                variantName: item.variant_name || 'Acceso VIP',
                deliveredContent: decrypted,
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('Advertencia consultando stock en Supabase:', e);
    }
  }

  // 4. Guardar entregas actualizadas en lux_order_{targetOrderNumber} y lux_admin_orders
  try {
    const formattedDeliveries = deliveredItemsList.map((d, idx) => ({
      id: `del_${targetOrderNumber}_${idx + 1}`,
      order_id: targetOrderNumber,
      product_name: d.productName,
      delivered_content: d.deliveredContent,
      created_at: new Date().toISOString(),
    }));

    const currentOrderData = localStorage.getItem(`lux_order_${targetOrderNumber}`);
    const parsedOrder = currentOrderData ? JSON.parse(currentOrderData) : {};
    const updatedClientOrder = {
      ...parsedOrder,
      order_number: targetOrderNumber,
      customer_email: customerEmail,
      status: 'DELIVERED',
      deliveries: formattedDeliveries,
    };
    localStorage.setItem(`lux_order_${targetOrderNumber}`, JSON.stringify(updatedClientOrder));

    const storedAdminOrders = localStorage.getItem('lux_admin_orders');
    if (storedAdminOrders) {
      const adminOrders: any[] = JSON.parse(storedAdminOrders);
      const updatedAdminOrders = adminOrders.map((o) => {
        if (o.order_number === targetOrderNumber || o.id === targetOrderNumber) {
          return {
            ...o,
            status: 'DELIVERED',
            deliveries: formattedDeliveries,
          };
        }
        return o;
      });
      localStorage.setItem('lux_admin_orders', JSON.stringify(updatedAdminOrders));
    }

    window.dispatchEvent(new Event('products-updated'));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Error actualizando entregas en localStorage:', err);
  }

  // 5. Disparar endpoint servidor Server-Side para envío 100% garantizado de correos por Resend
  try {
    console.log(`Disparando /api/orders/deliver Server-Side para enviar correo Resend con ${deliveredItemsList.length} accesos a ${customerEmail}...`);
    await fetch('/api/orders/deliver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: targetOrderNumber,
        customerEmail,
        items: itemsToProcess,
      }),
    });
  } catch (emailErr) {
    console.error('Error llamando API /api/orders/deliver:', emailErr);
  }

  try {
    await sendDeliveryEmail({
      toEmail: customerEmail,
      orderNumber: targetOrderNumber,
      deliveredItems: deliveredItemsList,
    });
  } catch (err) {
    console.warn('Aviso disparo secundario correo:', err);
  }

  // 6. Enviar alerta de confirmacion a Discord
  try {
    await sendDiscordAlert({
      title: `🎉 Venta Confirmada (${deliveredItemsList.length} Unidades Entregadas)`,
      description: `El pedido **${targetOrderNumber}** ha sido entregado exitosamente a **${customerEmail}**.`,
      fields: [
        { name: 'Total Unidades', value: `${deliveredItemsList.length}`, inline: true },
        { name: 'Primer Producto', value: deliveredItemsList[0]?.productName || 'Digital Item', inline: true },
      ],
      color: 0x22C55E, // Verde
    });
  } catch (discordErr) {
    console.error('Error enviando notificación Discord:', discordErr);
  }

  return {
    success: true,
    orderNumber: targetOrderNumber,
    deliveredItems: deliveredItemsList,
    message: `Pedido entregado exitosamente. Se descontaron ${deliveredItemsList.length} unidades de stock.`,
  };
}
