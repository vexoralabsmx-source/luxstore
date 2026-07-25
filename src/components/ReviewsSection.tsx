'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  MessageSquareText,
  Quote,
  Star,
} from 'lucide-react';
import type { ProductReview } from '@/types';

type ReviewsSummary = {
  average: number;
  total: number;
  distribution: number[];
};

type ReviewsSectionProps = {
  limit?: number;
  productId?: string;
  showAllLink?: boolean;
  title?: string;
};

function Stars({ rating, label }: { rating: number; label?: string }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={label || `${rating} de 5 estrellas`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          className={`h-4 w-4 ${
            star <= Math.round(rating)
              ? 'fill-[#C5A880] text-[#C5A880]'
              : 'fill-transparent text-zinc-700'
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewsSection({
  limit = 6,
  productId,
  showAllLink = true,
  title = 'Experiencias verificadas',
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [summary, setSummary] = useState<ReviewsSummary>({
    average: 0,
    total: 0,
    distribution: [0, 0, 0, 0, 0],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReviews = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: String(limit) });
      if (productId) params.set('productId', productId);
      const response = await fetch(`/api/reviews?${params}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'No se pudieron cargar');
      setReviews(payload.reviews || []);
      setSummary(
        payload.summary || {
          average: 0,
          total: 0,
          distribution: [0, 0, 0, 0, 0],
        }
      );
      setError('');
    } catch {
      setError('Las reseñas no están disponibles en este momento.');
    } finally {
      setLoading(false);
    }
  }, [limit, productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  return (
    <section
      id="reviews"
      className="relative overflow-hidden bg-[#050505] py-16 sm:py-24"
      aria-labelledby="reviews-title"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C5A880]/50 to-transparent" />
      <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-[#C5A880]/[0.06] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#C5A880]/25 bg-[#C5A880]/[0.07] px-3 py-1.5 text-xs font-semibold text-[#E8D8C8]">
              <BadgeCheck className="h-4 w-4" />
              Solo compras entregadas
            </div>
            <h2
              id="reviews-title"
              className="font-serif text-3xl font-bold text-white sm:text-4xl"
            >
              {title}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
              Opiniones publicadas por clientes después de recibir su producto.
              Todas son anónimas para proteger su identidad y ninguna valoración
              es importada o inventada.
            </p>
          </div>

          {summary.total > 0 && (
            <div className="flex min-w-[240px] items-center gap-5 rounded-2xl border border-[#C5A880]/25 bg-[#0C0C0C] p-5">
              <div>
                <div className="font-mono text-4xl font-bold tabular-nums text-white">
                  {summary.average.toFixed(1)}
                </div>
                <p className="mt-1 text-xs text-zinc-500">de 5 estrellas</p>
              </div>
              <div className="space-y-1.5">
                <Stars rating={summary.average} />
                <p className="text-xs text-zinc-400">
                  {summary.total.toLocaleString('es-MX')}{' '}
                  {summary.total === 1 ? 'reseña verificada' : 'reseñas verificadas'}
                </p>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Cargando reseñas">
            {Array.from({ length: Math.min(limit, 6) }).map((_, index) => (
              <div
                key={index}
                className="h-52 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]"
              />
            ))}
          </div>
        ) : error ? (
          <div
            role="status"
            className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-6 text-sm text-amber-100"
          >
            {error}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#C5A880]/25 bg-[#0A0A0A] px-6 py-12 text-center">
            <MessageSquareText className="mx-auto h-9 w-9 text-[#C5A880]" />
            <h3 className="mt-4 font-serif text-xl font-bold text-white">
              Las primeras opiniones están por llegar
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-400">
              Una reseña aparecerá aquí únicamente después de que una compra real
              haya sido entregada.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="group flex min-h-52 flex-col rounded-2xl border border-white/[0.08] bg-[#0B0B0B] p-5 transition-colors duration-200 hover:border-[#C5A880]/35"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{review.customer_name}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-emerald-300">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Compra verificada
                    </div>
                  </div>
                  <Quote className="h-5 w-5 text-[#C5A880]/45" aria-hidden="true" />
                </div>

                <div className="mt-5">
                  <Stars rating={review.rating} />
                  {review.comment ? (
                    <p className="mt-3 text-sm leading-6 text-zinc-300">
                      “{review.comment}”
                    </p>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-zinc-500">
                      Calificación sin comentario.
                    </p>
                  )}
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/[0.06] pt-4">
                  {review.product_slug ? (
                    <Link
                      href={`/product/${review.product_slug}`}
                      className="text-xs font-semibold text-[#E8D8C8] underline-offset-4 hover:underline"
                    >
                      {review.product_name}
                    </Link>
                  ) : (
                    <span className="text-xs font-semibold text-[#E8D8C8]">
                      {review.product_name}
                    </span>
                  )}
                  <time className="shrink-0 text-[11px] text-zinc-500">
                    {new Intl.DateTimeFormat('es-MX', {
                      month: 'short',
                      year: 'numeric',
                    }).format(new Date(review.created_at))}
                  </time>
                </div>
              </article>
            ))}
          </div>
        )}

        {showAllLink && reviews.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/reviews"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#C5A880]/35 bg-[#C5A880]/[0.08] px-5 py-3 text-sm font-bold text-[#E8D8C8] transition-colors hover:bg-[#C5A880]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880]"
            >
              Ver todas las reseñas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
