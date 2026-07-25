import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'edge';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const [{ data: products, error }, { data: stock }] = await Promise.all([
      supabase
        .from('products')
        .select('*, category:categories(name, slug), images:product_images(image_url, sort_order), variants:product_variants(id, name, price, sale_price, is_active)')
        .eq('status', 'active')
        .order('created_at', { ascending: false }),
      supabase
        .from('inventory_items')
        .select('product_id, variant_id')
        .eq('status', 'AVAILABLE'),
    ]);
    if (error) throw error;

    const counts = new Map<string, number>();
    for (const item of stock || []) {
      counts.set(item.product_id, (counts.get(item.product_id) || 0) + 1);
    }

    return NextResponse.json({
      products: (products || []).map((product) => ({
        ...product,
        category_name: product.category?.name || 'Digital',
        category_slug: product.category?.slug,
        stock: counts.get(product.id) || 0,
        image_url: product.images?.sort(
          (a: any, b: any) => a.sort_order - b.sort_order
        )?.[0]?.image_url,
      })),
    });
  } catch (error) {
    console.error('Error cargando catálogo:', error);
    return NextResponse.json({ error: 'No se pudo cargar el catálogo' }, { status: 500 });
  }
}
