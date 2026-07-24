'use client';

import React from 'react';
import Link from 'next/link';
import { X, Star, ShieldCheck, Zap, ShoppingCart, CheckCircle2, Crown, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface QuickViewModalProps {
  product: any | null;
  onClose: () => void;
  onAddToCart: (product: any) => void;
}

export function QuickViewModal({ product, onClose, onAddToCart }: QuickViewModalProps) {
  if (!product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex justify-end">
        
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Slide-over Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="relative max-w-lg w-full h-full bg-[#080808] border-l border-[#D4AF37]/30 p-6 sm:p-8 space-y-6 overflow-y-auto z-10 shadow-goldGlowIntense"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFF5C0]">
                Vista Rápida VIP
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#121215] text-zinc-400 hover:text-white hover:border-[#D4AF37] border border-transparent transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Product Image */}
          <div className="relative h-56 w-full rounded-2xl overflow-hidden bg-[#030303] border border-[#27272A]">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent opacity-80" />
            <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/80 text-[10px] font-mono text-[#00E5FF] border border-[#27272A]">
              {product.category_name}
            </span>
          </div>

          {/* Title & Info */}
          <div>
            <div className="flex items-center gap-1 text-[#D4AF37] text-xs font-medium mb-1">
              <Star className="w-3.5 h-3.5 fill-[#D4AF37]" />
              <span>{product.rating} / 5.0</span>
              <span className="text-zinc-500 ml-1">({product.sales} ventas)</span>
            </div>

            <h2 className="font-serif text-2xl font-bold text-white">
              {product.name}
            </h2>

            <div className="flex items-center justify-between text-xs text-zinc-400 mt-2 font-mono">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Stock: {product.stock} unidades
              </span>
              <span className="flex items-center gap-1 text-[#00E5FF]">
                <Zap className="w-3.5 h-3.5" /> Entrega Automática
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-[#030303] border border-[#D4AF37]/30 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-500 line-through font-mono block">
                ${product.base_price} MXN
              </span>
              <span className="text-2xl font-extrabold text-white font-mono">
                ${product.sale_price} <span className="text-xs text-[#D4AF37]">MXN</span>
              </span>
            </div>

            <button
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFF5C0] via-[#D4AF37] to-[#AA771C] text-black font-bold text-xs hover:shadow-goldGlow transition-all flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Comprar Ahora</span>
            </button>
          </div>

          {/* Guarantee Badge */}
          <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-4 flex items-center gap-3 text-xs text-zinc-300">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
            <span>Garantía de reemplazo directa válida por 365 días en tu área de cliente.</span>
          </div>

          {/* Link to full details */}
          <div className="pt-2">
            <Link
              href={`/product/${product.slug}`}
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#121215] border border-[#27272A] hover:border-[#D4AF37] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Ver Página de Detalle Completa</span>
              <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
            </Link>
          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
