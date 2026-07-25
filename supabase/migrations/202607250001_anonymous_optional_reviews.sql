-- Las reseñas públicas nunca exponen la identidad y el comentario es opcional.
ALTER TABLE public.product_reviews
  DROP CONSTRAINT IF EXISTS product_reviews_comment_check;

ALTER TABLE public.product_reviews
  ADD CONSTRAINT product_reviews_comment_check
  CHECK (char_length(trim(comment)) <= 800);
