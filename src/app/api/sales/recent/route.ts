import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'edge';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: orders, error } = await supabase
      .from('orders')
      .select(
        'delivered_at, items:order_items(product_name, quantity, product:products(name, images:product_images(image_url, sort_order)))'
      )
      .eq('status', 'DELIVERED')
      .not('delivered_at', 'is', null)
      .order('delivered_at', { ascending: false })
      .limit(8);

    if (error) throw error;

    const sales = (orders || []).flatMap((order) =>
      (order.items || []).map((item) => {
        const product = Array.isArray(item.product) ? item.product[0] : item.product;
        const images = [...(product?.images || [])].sort(
          (a, b) => Number(a.sort_order) - Number(b.sort_order)
        );
        return {
          product: product?.name || item.product_name,
          quantity: Number(item.quantity || 1),
          image: images[0]?.image_url || '',
          deliveredAt: order.delivered_at,
        };
      })
    );

    return NextResponse.json({ sales });
  } catch (error) {
    console.error('Error cargando ventas recientes:', error);
    return NextResponse.json({ sales: [] });
  }
}
