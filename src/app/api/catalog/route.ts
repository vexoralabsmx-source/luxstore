import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'edge';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const [
      { data: products, error },
      { data: stock },
      { data: soldItems, error: salesError },
      { data: reviews, error: reviewsError },
    ] = await Promise.all([
      supabase
        .from('products')
        .select('*, category:categories(name, slug), images:product_images(image_url, sort_order), variants:product_variants(id, name, price, sale_price, is_active)')
        .eq('status', 'active')
        .order('created_at', { ascending: false }),
      supabase
        .from('inventory_items')
        .select('product_id, variant_id')
        .eq('status', 'AVAILABLE'),
      supabase
        .from('order_items')
        .select('product_id, quantity, order:orders!inner(status)')
        .eq('order.status', 'DELIVERED'),
      supabase
        .from('product_reviews')
        .select('product_id, rating')
        .eq('is_published', true),
    ]);
    if (error) throw error;
    if (salesError) throw salesError;
    if (reviewsError && reviewsError.code !== '42P01') throw reviewsError;

    const counts = new Map<string, number>();
    for (const item of stock || []) {
      counts.set(item.product_id, (counts.get(item.product_id) || 0) + 1);
    }

    const sales = new Map<string, number>();
    for (const item of soldItems || []) {
      sales.set(item.product_id, (sales.get(item.product_id) || 0) + Number(item.quantity || 0));
    }

    const ratings = new Map<string, number[]>();
    for (const review of reviews || []) {
      const values = ratings.get(review.product_id) || [];
      values.push(Number(review.rating));
      ratings.set(review.product_id, values);
    }

    return NextResponse.json({
      products: (products || []).map((product) => {
        const productRatings = ratings.get(product.id) || [];
        const average = productRatings.length
          ? productRatings.reduce((sum, value) => sum + value, 0) / productRatings.length
          : null;

        return {
          ...product,
          category_name: product.category?.name || 'Digital',
          category_slug: product.category?.slug,
          stock: counts.get(product.id) || 0,
          sales: sales.get(product.id) || 0,
          rating: average === null ? null : Number(average.toFixed(1)),
          review_count: productRatings.length,
          image_url: product.images?.sort(
            (a: any, b: any) => a.sort_order - b.sort_order
          )?.[0]?.image_url,
        };
      }),
    });
  } catch (error) {
    console.error('Error cargando catálogo:', error);
    return NextResponse.json({ error: 'No se pudo cargar el catálogo' }, { status: 500 });
  }
}
