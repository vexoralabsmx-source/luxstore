'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, ShoppingCart, Star, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { LUX_PRODUCTS, LuxProduct } from '@/data/luxCatalog';

interface FeaturedCarousel3DProps {
  onQuickView: (product: LuxProduct) => void;
  onAddToCart: (product: LuxProduct) => void;
}

export function FeaturedCarousel3D({ onQuickView, onAddToCart }: FeaturedCarousel3DProps) {
  // Use first 8 products for carousel
  const carouselProducts = LUX_PRODUCTS.slice(0, 8);
  const [activeIndex, setActiveIndex] = useState(0);

  if (carouselProducts.length === 0) {
    return null;
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? carouselProducts.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === carouselProducts.length - 1 ? 0 : prev + 1));
  };

  const activeProduct = carouselProducts[activeIndex];

  return (
    <section className="relative py-16 bg-[#050508] overflow-hidden">
      
      {/* Background Dots & Glow */}
      <div className="absolute inset-0 bg-grid-dots opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#C5A880]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest text-[#C5A880] border border-[#C5A880]/30 bg-[#C5A880]/10 uppercase">
              DESTACADOS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sans tracking-tight">
              Los mejores productos digitales, listos al instante
            </h2>
            <p className="text-sm text-zinc-400 font-sans max-w-xl">
              Productos destacados en un carrusel interactivo — desliza, pulsa una tarjeta lateral o usa las flechas para explorar.
            </p>
          </div>

          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-200 hover:border-[#C5A880] hover:text-white transition-all self-start md:self-auto"
          >
            <span>Ver todos los productos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3D Carousel Stage */}
        <div className="relative min-h-[480px] flex items-center justify-center my-8">
          
          {/* Nav Arrow Left */}
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-8 z-30 w-11 h-11 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-white flex items-center justify-center hover:bg-[#C5A880] hover:text-black hover:border-[#C5A880] transition-all shadow-xl backdrop-blur-md"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Cards Stack */}
          <div className="relative w-full max-w-4xl flex items-center justify-center h-[420px]">
            {carouselProducts.map((product, idx) => {
              const distance = idx - activeIndex;
              const isCenter = idx === activeIndex;
              const isLeft = distance === -1 || (activeIndex === 0 && idx === carouselProducts.length - 1);
              const isRight = distance === 1 || (activeIndex === carouselProducts.length - 1 && idx === 0);

              // Don't render far off cards for performance/visual cleanliness
              if (!isCenter && !isLeft && !isRight) return null;

              return (
                <div
                  key={product.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`absolute transition-all duration-500 ease-out cursor-pointer ${
                    isCenter
                      ? 'z-20 scale-100 opacity-100 translate-x-0 glow-card-active'
                      : isLeft
                      ? 'z-10 scale-85 opacity-50 -translate-x-48 sm:-translate-x-64 -rotate-6 blur-[1px]'
                      : 'z-10 scale-85 opacity-50 translate-x-48 sm:translate-x-64 rotate-6 blur-[1px]'
                  } w-[300px] sm:w-[340px] bg-[#0A0A10] rounded-2xl border border-zinc-800 p-4 shadow-2xl flex flex-col justify-between`}
                >
                  
                  {/* Card Media Header */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/60 border border-white/5 mb-3 group">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Envelope Overlay Simulation */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 pointer-events-none" />

                    {/* Stock & Rating Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                      <span className="inline-flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        En stock
                      </span>

                      {product.rating > 0 && (
                        <span className="inline-flex items-center gap-1 bg-black/70 text-amber-400 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {product.rating}
                        </span>
                      )}
                    </div>

                    {/* Quick View Button overlay on center card */}
                    {isCenter && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickView(product);
                        }}
                        className="absolute inset-0 m-auto w-32 h-9 rounded-xl bg-black/80 border border-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Vista rápida</span>
                      </button>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] uppercase font-mono font-bold tracking-wider text-[#C5A880]">
                      <span>{product.category_name}</span>
                      <span className="inline-flex items-center gap-0.5 text-cyan-400">
                        <Zap className="w-3 h-3" />
                        Instantáneo
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white truncate font-sans">
                      {product.name}
                    </h3>

                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-white font-mono">
                        ${product.sale_price.toFixed(0)} MXN
                      </span>
                      {product.base_price > product.sale_price && (
                        <span className="text-xs text-zinc-500 line-through font-mono">
                          ${product.base_price.toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions for center card */}
                  {isCenter && (
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-800/80">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickView(product);
                        }}
                        className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-bold hover:bg-zinc-800 transition-colors"
                      >
                        Ver producto
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product);
                        }}
                        className="px-3 py-2 rounded-xl glow-gold-btn text-black text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Añadir</span>
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Nav Arrow Right */}
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-8 z-30 w-11 h-11 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-white flex items-center justify-center hover:bg-[#C5A880] hover:text-black hover:border-[#C5A880] transition-all shadow-xl backdrop-blur-md"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

        </div>

        {/* Carousel Pagination & Indicator */}
        <div className="flex flex-col items-center gap-4 mt-6">
          <div className="font-mono text-xs text-zinc-400">
            <span className="text-white font-bold">{String(activeIndex + 1).padStart(2, '0')}</span> / {String(carouselProducts.length).padStart(2, '0')} • <span className="text-[#C5A880] font-semibold">{activeProduct?.name}</span>
          </div>

          <div className="flex items-center gap-2">
            {carouselProducts.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex ? 'w-8 bg-[#C5A880]' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
                aria-label={`Ir al slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
