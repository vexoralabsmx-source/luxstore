-- Reseñas verificadas: una reseña por producto comprado y entregado.
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL CHECK (char_length(trim(comment)) BETWEEN 12 AND 800),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, order_item_id)
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_public
  ON public.product_reviews (is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product
  ON public.product_reviews (product_id, is_published, created_at DESC);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reseñas publicadas visibles" ON public.product_reviews;
CREATE POLICY "Reseñas publicadas visibles"
ON public.product_reviews FOR SELECT
USING (is_published = TRUE OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios reseñan compras entregadas" ON public.product_reviews;
CREATE POLICY "Usuarios reseñan compras entregadas"
ON public.product_reviews FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.order_items oi ON oi.order_id = o.id
    WHERE o.id = order_id
      AND oi.id = order_item_id
      AND oi.product_id = product_id
      AND o.user_id = auth.uid()
      AND o.status = 'DELIVERED'
  )
);
