'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Star, Zap, Eye, ShoppingCart, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ProductCard3DProps {
  product: {
    id: string;
    name: string;
    slug: string;
    category_name: string;
    base_price: number;
    sale_price: number;
    stock: number;
    delivery: string;
    image: string;
    logo?: string;
    brandColor?: string;
    rating: number | null;
    review_count?: number;
    sales: number;
  };
  onQuickView?: (product: any) => void;
  onAddToCart?: (product: any) => void;
}

export function ProductCard3D({ product, onQuickView, onAddToCart }: ProductCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -8;
    const rotY = ((x - centerX) / centerX) * 8;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      }}
      className="glass-vip-card rounded-2xl overflow-hidden flex flex-col justify-between relative group transition-transform duration-200 ease-out bg-[#0C0C0C] border border-[#1C1C1C]"
      data-cursor="VER DETALLES"
    >
      <div>
        {/* Clickable Image -> Direct to Product Detail */}
        <Link href={`/product/${product.slug}`} className="block relative h-44 w-full bg-[#050505] flex items-center justify-center p-8 overflow-hidden border-b border-[#1C1C1C]">
          <div 
            className="absolute inset-0 opacity-15"
            style={{ backgroundColor: product.brandColor || '#C5A880' }}
          />

          {product.logo ? (
            <img 
              src={product.logo} 
              alt={product.name}
              className="max-h-20 max-w-[160px] object-contain relative z-10 filter drop-shadow-md group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = product.image;
              }}
            />
          ) : (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover relative z-10"
            />
          )}

          <div className="absolute top-3 left-3 z-20">
            <span className="px-2.5 py-1 rounded-md bg-[#09090B]/90 text-[10px] font-mono text-[#E8D8C8] border border-[#1C1C1C]">
              {product.category_name}
            </span>
          </div>
        </Link>

        {/* Card Body */}
        <div className="p-5 space-y-2.5">
          <div className="flex min-h-5 flex-wrap items-center gap-2 text-xs">
            {product.review_count && product.rating !== null ? (
              <span className="inline-flex items-center gap-1 font-medium text-[#C5A880]">
                <Star className="h-3.5 w-3.5 fill-[#C5A880]" />
                {product.rating.toFixed(1)}
                <span className="text-zinc-500">
                  ({product.review_count}{' '}
                  {product.review_count === 1 ? 'reseña' : 'reseñas'})
                </span>
              </span>
            ) : (
              <span className="text-zinc-500">Sin reseñas aún</span>
            )}
            {product.sales > 0 && (
              <span className="font-mono text-zinc-500">
                · {product.sales} {product.sales === 1 ? 'venta' : 'ventas'}
              </span>
            )}
          </div>

          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="text-sm font-bold text-white line-clamp-1 hover:text-[#C5A880] transition-colors">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono pt-1">
            <span className="flex items-center gap-1 text-[11px] text-zinc-300">
              <Zap className="w-3.5 h-3.5 text-[#C5A880]" />
              {product.delivery}
            </span>

            {product.stock > 0 ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {product.stock} disponibles
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-500 font-bold text-[11px]">
                <XCircle className="w-3.5 h-3.5" />
                Agotado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Price and Direct Navigation Actions */}
      <div className="p-5 pt-0 border-t border-[#1C1C1C] flex items-center justify-between mt-auto pt-3 z-20">
        <div>
          <div className="text-[11px] text-zinc-500 line-through font-mono">
            ${product.base_price} MXN
          </div>
          <div className="text-lg font-bold text-white font-mono">
            ${product.sale_price} <span className="text-xs text-[#C5A880]">MXN</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Link to Product Details Page */}
          <Link
            href={`/product/${product.slug}`}
            className="px-3 py-2 rounded-lg bg-[#141414] text-zinc-300 hover:text-white border border-[#1C1C1C] hover:border-[#C5A880] transition-all text-xs font-bold flex items-center gap-1"
            title="Ver Detalles Completos"
          >
            <Eye className="w-4 h-4 text-[#C5A880]" />
            <span>Ver</span>
          </Link>

          {product.stock > 0 ? (
            <button
              onClick={() => onAddToCart && onAddToCart(product)}
              className="px-3.5 py-2 rounded-lg bg-[#C5A880] text-black hover:bg-[#E8D8C8] transition-all text-xs font-bold flex items-center gap-1 cursor-pointer shadow-md"
              title="Agregar al Carrito"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Comprar</span>
            </button>
          ) : (
            <button
              disabled
              className="px-3.5 py-2 rounded-lg bg-[#141414] text-zinc-600 border border-zinc-800 text-xs font-bold flex items-center gap-1 cursor-not-allowed opacity-60 font-mono"
              title="Sin Stock Disponible"
            >
              <XCircle className="w-4 h-4 text-rose-500" />
              <span>Agotado</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
