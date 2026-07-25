import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

const reviewSchema = z.object({
  orderItemId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(800).default(''),
});

function relation<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] || null : value || null;
}

async function getEligiblePurchases() {
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: orders, error: ordersError } = await admin
    .from('orders')
    .select(
      'id, order_number, delivered_at, items:order_items(id, product_id, product_name, variant_name)'
    )
    .eq('user_id', user.id)
    .eq('status', 'DELIVERED')
    .order('delivered_at', { ascending: false });

  if (ordersError) {
    return NextResponse.json({ error: 'No se pudieron cargar tus compras' }, { status: 500 });
  }

  const { data: reviews, error: reviewsError } = await admin
    .from('product_reviews')
    .select('order_item_id')
    .eq('user_id', user.id);

  if (reviewsError && reviewsError.code !== '42P01') {
    return NextResponse.json({ error: 'No se pudieron comprobar tus reseñas' }, { status: 500 });
  }

  const reviewed = new Set((reviews || []).map((review) => review.order_item_id));
  const purchases = (orders || []).flatMap((order) =>
    (order.items || []).map((item) => ({
      orderItemId: item.id,
      productId: item.product_id,
      productName: item.product_name,
      variantName: item.variant_name,
      orderNumber: order.order_number,
      deliveredAt: order.delivered_at,
      reviewed: reviewed.has(item.id),
    }))
  );

  return NextResponse.json({ purchases });
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get('eligible') === 'true') {
    return getEligiblePurchases();
  }

  const requestedLimit = Number(request.nextUrl.searchParams.get('limit') || 12);
  const requestedOffset = Number(request.nextUrl.searchParams.get('offset') || 0);
  const limit = Math.max(1, Math.min(48, Number.isFinite(requestedLimit) ? requestedLimit : 12));
  const offset = Math.max(0, Number.isFinite(requestedOffset) ? requestedOffset : 0);
  const productId = request.nextUrl.searchParams.get('productId');

  if (productId && !z.string().uuid().safeParse(productId).success) {
    return NextResponse.json({ error: 'Producto no válido' }, { status: 400 });
  }

  const admin = createAdminClient();
  let reviewsQuery = admin
    .from('product_reviews')
    .select(
      'id, product_id, rating, comment, created_at, product:products(name, slug)',
      { count: 'exact' }
    )
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  let ratingsQuery = admin
    .from('product_reviews')
    .select('rating')
    .eq('is_published', true);

  if (productId) {
    reviewsQuery = reviewsQuery.eq('product_id', productId);
    ratingsQuery = ratingsQuery.eq('product_id', productId);
  }

  const [
    { data: reviews, error: reviewsError, count },
    { data: ratings, error: ratingsError },
  ] = await Promise.all([reviewsQuery, ratingsQuery]);

  if (reviewsError || ratingsError) {
    const tableMissing = reviewsError?.code === '42P01' || ratingsError?.code === '42P01';
    if (tableMissing) {
      return NextResponse.json({
        reviews: [],
        summary: { average: 0, total: 0, distribution: [0, 0, 0, 0, 0] },
        setupRequired: true,
      });
    }
    return NextResponse.json({ error: 'No se pudieron cargar las reseñas' }, { status: 500 });
  }

  const ratingValues = (ratings || []).map((item) => Number(item.rating));
  const distribution = [1, 2, 3, 4, 5].map(
    (rating) => ratingValues.filter((value) => value === rating).length
  );
  const average = ratingValues.length
    ? ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length
    : 0;

  return NextResponse.json({
    reviews: (reviews || []).map((review) => {
      const product = relation(review.product);
      return {
        id: review.id,
        product_id: review.product_id,
        product_name: product?.name || 'Producto digital',
        product_slug: product?.slug || '',
        rating: Number(review.rating),
        comment: review.comment,
        customer_name: 'Anónimo',
        verified_purchase: true,
        created_at: review.created_at,
      };
    }),
    summary: {
      average: Number(average.toFixed(1)),
      total: count || 0,
      distribution,
    },
  });
}

export async function POST(request: NextRequest) {
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesión para publicar una reseña' }, { status: 401 });
  }

  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Selecciona una calificación de 1 a 5 estrellas' },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data: orderItem, error: itemError } = await admin
    .from('order_items')
    .select('id, product_id, order_id, order:orders(id, user_id, status)')
    .eq('id', parsed.data.orderItemId)
    .maybeSingle();

  const order = relation(orderItem?.order);
  if (
    itemError ||
    !orderItem ||
    !order ||
    order.user_id !== user.id ||
    order.status !== 'DELIVERED'
  ) {
    return NextResponse.json(
      { error: 'Solo puedes reseñar productos que compraste y ya fueron entregados' },
      { status: 403 }
    );
  }

  const { data: review, error } = await admin
    .from('product_reviews')
    .insert({
      user_id: user.id,
      order_id: orderItem.order_id,
      order_item_id: orderItem.id,
      product_id: orderItem.product_id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      is_published: true,
    })
    .select('id')
    .single();

  if (error?.code === '23505') {
    return NextResponse.json({ error: 'Ya publicaste una reseña para esta compra' }, { status: 409 });
  }
  if (error || !review) {
    return NextResponse.json({ error: 'No se pudo publicar la reseña' }, { status: 500 });
  }

  return NextResponse.json({ id: review.id, message: 'Gracias por compartir tu experiencia' });
}
