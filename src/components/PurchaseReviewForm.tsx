'use client';

import { useState } from 'react';
import { BadgeCheck, LoaderCircle, MessageSquareText, Star } from 'lucide-react';

type Purchase = {
  orderItemId: string;
  productName: string;
  variantName?: string | null;
};

export function PurchaseReviewForm({
  purchase,
  onPublished,
}: {
  purchase: Purchase;
  onPublished: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!rating) {
      setError('Selecciona una calificación.');
      return;
    }
    setLoading(true);
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderItemId: purchase.orderItemId,
        rating,
        comment,
      }),
    });
    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error || 'No se pudo publicar la reseña.');
      return;
    }

    onPublished();
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#C5A880]/35 bg-[#C5A880]/[0.08] px-4 py-2.5 text-xs font-bold text-[#E8D8C8] transition-colors hover:bg-[#C5A880]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880]"
      >
        <MessageSquareText className="h-4 w-4" />
        Añadir reseña
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mt-4 space-y-4 rounded-2xl border border-[#C5A880]/25 bg-[#070707] p-4"
    >
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
          <BadgeCheck className="h-4 w-4" />
          Tu opinión aparecerá como compra verificada
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          {purchase.productName}
          {purchase.variantName ? ` · ${purchase.variantName}` : ''}
        </p>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Tu nombre, correo y número de pedido siempre permanecen privados.
          La reseña se publica como Anónimo.
        </p>
      </div>

      <fieldset>
        <legend className="mb-2 text-xs font-semibold text-zinc-300">
          Calificación
        </legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880]"
              aria-label={`${value} ${value === 1 ? 'estrella' : 'estrellas'}`}
              aria-pressed={rating === value}
            >
              <Star
                className={`h-6 w-6 ${
                  value <= rating
                    ? 'fill-[#C5A880] text-[#C5A880]'
                    : 'text-zinc-600'
                }`}
              />
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor={`review-${purchase.orderItemId}`}
          className="mb-2 block text-xs font-semibold text-zinc-300"
        >
          ¿Cómo fue tu experiencia? <span className="text-zinc-500">(opcional)</span>
        </label>
        <textarea
          id={`review-${purchase.orderItemId}`}
          maxLength={800}
          rows={4}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Puedes publicar solo las estrellas o añadir un comentario."
          className="w-full resize-y rounded-xl border border-white/[0.1] bg-black px-4 py-3 text-base leading-6 text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
        />
        <p className="mt-1 text-right text-[11px] text-zinc-500">
          {comment.length}/800
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-rose-300">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError('');
          }}
          className="min-h-11 rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:bg-white/[0.05] hover:text-white"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#C5A880] px-5 py-2.5 text-xs font-bold text-black transition-colors hover:bg-[#E8D8C8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {loading ? 'Publicando…' : 'Publicar reseña'}
        </button>
      </div>
    </form>
  );
}
