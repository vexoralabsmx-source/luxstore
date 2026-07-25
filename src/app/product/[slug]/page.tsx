'use client';

export const runtime = 'edge';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  ShoppingCart, 
  ArrowLeft,
  Star,
  MessageCircle,
  AlertCircle,
  Building2
} from 'lucide-react';
import { LUX_BANK_INFO, LUX_TERMS_AND_GUARANTEE } from '@/data/luxCatalog';
import { ReviewsSection } from '@/components/ReviewsSection';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<any>(null);
  const [selectedPrice, setSelectedPrice] = useState<any>({ label: 'Individual', price: 0 });
  const [selectedQty, setSelectedQty] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);

  React.useEffect(() => {
    fetch('/api/catalog', { cache: 'no-store' })
      .then((response) => response.json())
      .then((payload) => {
        const found = payload.products?.find((item: any) => item.slug === slug);
        if (!found) return;
        found.image = found.image_url || '';
        found.delivery = found.estimated_delivery_time || 'Entrega inmediata';
        found.rating = null;
        found.review_count = 0;
        found.prices = (found.variants || [])
          .filter((variant: any) => variant.is_active)
          .map((variant: any) => ({
            id: variant.id,
            label: variant.name,
            price: Number(variant.sale_price ?? variant.price),
          }));
        setProduct(found);
        setSelectedPrice(found.prices[0] || {
          label: 'Individual',
          price: Number(found.sale_price ?? found.base_price),
        });
        fetch(`/api/reviews?productId=${encodeURIComponent(found.id)}&limit=1`, {
          cache: 'no-store',
        })
          .then((response) => response.json())
          .then((reviewsPayload) => {
            setProduct((current: any) =>
              current?.id === found.id
                ? {
                    ...current,
                    rating: reviewsPayload.summary?.average || null,
                    review_count: reviewsPayload.summary?.total || 0,
                  }
                : current
            );
          })
          .catch(() => undefined);
      })
      .catch(console.error);
  }, [slug]);

  if (!product) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-zinc-400">Producto no encontrado.</div>;
  }

  const handleAddToCart = () => {
    try {
      const stored = localStorage.getItem('lux_cart');
      let cart = stored ? JSON.parse(stored) : [];
      const itemToSave = {
        id: `${product.id}_${selectedPrice.label.replace(/\s+/g, '_')}`,
        product_id: product.id,
        name: `${product.name} (${selectedPrice.label})`,
        slug: product.slug,
        base_price: product.base_price,
        sale_price: selectedPrice.price,
        variant_name: selectedPrice.label,
        variant_id: selectedPrice.id,
        image: product.image,
        logo: product.logo,
        brandColor: product.brandColor,
        quantity: selectedQty,
        stock: product.stock,
      };
      
      const index = cart.findIndex((item: any) => item.id === itemToSave.id);
      if (index > -1) {
        cart[index].quantity += selectedQty;
      } else {
        cart.push(itemToSave);
      }

      localStorage.setItem('lux_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Back button */}
      <Link 
        href="/catalog" 
        className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors font-mono"
      >
        <ArrowLeft className="w-4 h-4 text-[#C5A880]" />
        <span>Volver al Catálogo General</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Official Brand Logo Display */}
        <div className="lg:col-span-6 space-y-6">
          <div className="relative rounded-3xl bg-[#09090B] border border-[#1C1C1C] overflow-hidden p-8 flex items-center justify-center min-h-[360px]">
            <div 
              className="absolute inset-0 opacity-15"
              style={{ backgroundColor: product.brandColor || '#C5A880' }}
            />
            {product.logo ? (
              <img 
                src={product.logo} 
                alt={product.name}
                className="max-h-36 max-w-[240px] object-contain relative z-10 filter drop-shadow-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = product.image;
                }}
              />
            ) : (
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover relative z-10 rounded-2xl"
              />
            )}

            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-[#1C1C1C] text-xs font-mono text-[#E8D8C8]">
              {product.category_name}
            </div>
          </div>

          {/* Guarantees Box */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0C0C0C] border border-[#1C1C1C] rounded-2xl p-4 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Garantía Directa</h4>
                <p className="text-[11px] text-zinc-400 font-mono">Cobertura Lux Store</p>
              </div>
            </div>

            <div className="bg-[#0C0C0C] border border-[#1C1C1C] rounded-2xl p-4 flex items-center gap-3">
              <Zap className="w-5 h-5 text-[#C5A880] flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Modo de Entrega</h4>
                <p className="text-[11px] text-zinc-400 font-mono">{product.delivery}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Options & Actions */}
        <div className="lg:col-span-6 space-y-7">
          
          <div>
            <div className="flex items-center gap-2 text-xs text-[#C5A880] font-medium mb-2 font-mono">
              {product.review_count > 0 ? (
                <>
                  <Star className="w-4 h-4 fill-[#C5A880]" />
                  <span>{Number(product.rating).toFixed(1)} / 5.0</span>
                  <span className="text-zinc-500">
                    · {product.review_count}{' '}
                    {product.review_count === 1 ? 'reseña verificada' : 'reseñas verificadas'}
                  </span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4" />
                  <span>Este producto aún no tiene reseñas</span>
                </>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              {product.name}
            </h1>
          </div>

          {/* Tiers / Durations Selector */}
          {product.prices && product.prices.length > 0 && (
            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                Selecciona la Modalidad / Duración:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.prices.map((p: any, idx: number) => {
                  const isSelected = selectedPrice.label === p.label;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedPrice(p)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isSelected 
                          ? 'bg-[#141414] border-[#C5A880] text-white shadow-subtle' 
                          : 'bg-[#09090B] border-[#1C1C1C] text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{p.label}</div>
                      <div className="text-sm font-mono mt-1 font-bold text-[#C5A880]">
                        ${p.price} MXN
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {product.note && (
            <div className="p-4 rounded-2xl bg-[#09090B] border border-[#1C1C1C] text-xs text-amber-300/90 font-mono">
              * Nota del proveedor: {product.note}
            </div>
          )}

          {/* Pricing & CTA */}
          <div className="bg-[#0C0C0C] border border-[#1C1C1C] rounded-3xl p-6 space-y-6">
            <div className="flex items-baseline justify-between font-mono">
              <div>
                <span className="text-xs text-zinc-500 line-through mr-2">
                  ${product.base_price} MXN
                </span>
                <span className="text-3xl font-extrabold text-white">
                  ${selectedPrice.price} <span className="text-xs text-[#C5A880]">MXN</span>
                </span>
              </div>

              {(product.stock && product.stock > 0) ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {product.stock} Disponibles
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Agotado
                </span>
              )}
            </div>

            {/* Quantity Limit Badge */}
            {product.stock && product.stock > 0 && (
              <div className="flex items-center justify-between p-3 bg-[#050505] border border-[#1C1C1C] rounded-2xl font-mono text-xs">
                <span className="text-zinc-400 font-bold uppercase">Límite de Compra:</span>
                <span className="text-[#C5A880] font-bold px-3 py-1 bg-[#141414] border border-[#1C1C1C] rounded-xl">
                  Hasta {product.stock} unidad(es)
                </span>
              </div>
            )}

            {product.stock > 1 && (
              <label className="block text-xs text-zinc-400">
                Cantidad
                <input
                  type="number"
                  min={1}
                  max={product.stock}
                  value={selectedQty}
                  onChange={(event) =>
                    setSelectedQty(
                      Math.max(1, Math.min(product.stock, Number(event.target.value) || 1))
                    )
                  }
                  className="ml-3 w-20 bg-[#050505] border border-[#1C1C1C] rounded-lg px-3 py-2 text-white"
                />
              </label>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(product.stock && product.stock > 0) ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    className={`py-3.5 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-2 ${
                      isAdded
                        ? 'bg-emerald-500 text-black border-emerald-500'
                        : 'bg-[#141414] border-[#1C1C1C] text-white hover:border-[#C5A880]'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{isAdded ? '¡Agregado al Carrito!' : 'Agregar al Carrito'}</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="py-3.5 rounded-xl bg-[#C5A880] text-black font-bold text-xs hover:bg-[#E8D8C8] transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Comprar Ahora</span>
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="sm:col-span-2 py-3.5 rounded-xl bg-[#141414] text-zinc-600 border border-zinc-800 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-60 font-mono"
                >
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span>Producto Sin Stock / Agotado</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Guarantee Rules */}
      <div className="bg-[#0C0C0C] border border-[#1C1C1C] rounded-3xl p-8 space-y-4">
        <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" /> Reglas de Garantía del Producto
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
          {LUX_TERMS_AND_GUARANTEE.map((rule: string, idx: number) => (
            <li key={idx} className="flex items-start gap-2 bg-[#050505] p-3 rounded-xl border border-[#1C1C1C]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] mt-1.5 flex-shrink-0"></span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      <ReviewsSection
        productId={product.id}
        showAllLink={false}
        title={`Opiniones sobre ${product.name}`}
      />

    </div>
  );
}
