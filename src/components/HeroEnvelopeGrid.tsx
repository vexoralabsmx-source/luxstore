'use client';

import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Star } from 'lucide-react';
import Link from 'next/link';

interface ProductEnvelope {
  name: string;
  price: string;
  color: string;
  glow: string;
  badge?: string;
  imageLogo?: string;
}

const HERO_CARDS: ProductEnvelope[] = [
  { name: 'Disney+ [LIFETIME]', price: '$49 MXN', color: '#C5A880', glow: 'rgba(197, 168, 128, 0.4)' },
  { name: 'Filmora [LIFETIME]', price: '$69 MXN', color: '#00C4CC', glow: 'rgba(0, 196, 204, 0.4)' },
  { name: 'Youtube Prem. [LIFETIME]', price: '$89 MXN', color: '#E8D8C8', glow: 'rgba(232, 216, 200, 0.4)', badge: 'TOP' },
  { name: 'DAZN [LIFETIME]', price: '$59 MXN', color: '#E2E8F0', glow: 'rgba(255, 255, 255, 0.3)' },
  { name: 'Cyberghost VPN [LIFETIME]', price: '$59 MXN', color: '#C5A880', glow: 'rgba(197, 168, 128, 0.4)' },
  { name: 'Steam [LIFETIME]', price: '$39 MXN', color: '#6366F1', glow: 'rgba(99, 102, 241, 0.4)' },
  { name: 'Movistar+ [ES] [LIFETIME]', price: '$79 MXN', color: '#06B6D4', glow: 'rgba(6, 182, 212, 0.4)' },
  { name: 'Duolingo [LIFETIME]', price: '$49 MXN', color: '#22C55E', glow: 'rgba(34, 197, 94, 0.4)' },
  { name: 'Deezer [LIFETIME]', price: '$59 MXN', color: '#C5A880', glow: 'rgba(197, 168, 128, 0.4)' },
];

export function HeroEnvelopeGrid() {
  return (
    <div className="relative pt-10 pb-20 overflow-hidden bg-grid-dots">
      {/* Glow background circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="text-xs font-semibold text-zinc-300 font-mono">
                +616.790 productos digitales entregados al instante
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1] font-sans">
              Tu marketplace premium de{' '}
              <span className="gradient-text-gold block sm:inline">productos digitales.</span>
            </h1>

            {/* Description */}
            <p className="text-base text-zinc-400 font-sans leading-relaxed max-w-xl">
              Descubre, revende y gestiona productos digitales de alta demanda desde una plataforma rápida, moderna y segura, con entrega instantánea en cada pedido.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link
                href="/catalog"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl glow-gold-btn text-black font-bold text-sm flex items-center justify-center gap-2 group"
              >
                <span>Ver productos</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white font-semibold text-sm hover:border-[#C5A880] hover:bg-zinc-900 transition-all flex items-center justify-center gap-2"
              >
                <span>Empezar a revender</span>
              </Link>
            </div>

            {/* Social Proof metrics */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-zinc-800/80 text-xs text-zinc-400 font-sans">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[#C5A880] fill-[#C5A880]" />
                <span className="font-semibold text-zinc-200">4,9/5</span>
                <span>de 29.596 reseñas</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#C5A880]" />
                <span>Entrega media 0,8s</span>
              </div>

              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Pago seguro</span>
              </div>
            </div>

          </div>

          {/* Right 3D Tilted Envelope Gallery */}
          <div className="lg:col-span-6 relative perspective-1000 flex justify-center items-center">
            
            {/* Ambient Back Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#C5A880]/20 via-amber-600/10 to-cyan-500/10 rounded-3xl blur-2xl transform -rotate-6 scale-95" />

            {/* Grid Container tilted */}
            <div className="grid grid-cols-3 gap-3.5 transform rotate-6 skew-y-3 hover:rotate-0 transition-transform duration-700 max-w-lg w-full">
              {HERO_CARDS.map((card, idx) => (
                <div
                  key={idx}
                  className="relative group bg-[#0D0D14] border border-zinc-800/80 rounded-2xl p-3 shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  style={{
                    boxShadow: `0 10px 25px -10px ${card.glow}`,
                  }}
                >
                  {/* Card envelope visual mockup */}
                  <div className="relative aspect-[4/5] rounded-xl bg-gradient-to-b from-zinc-900 to-black p-2 flex flex-col justify-between overflow-hidden border border-white/5">
                    
                    {/* Top logo/badge */}
                    <div className="flex justify-between items-start z-10">
                      <span className="text-[9px] font-mono text-[#C5A880] uppercase tracking-wider font-semibold">
                        Lux Store
                      </span>
                      {card.badge && (
                        <span className="text-[8px] font-bold bg-[#C5A880] text-black px-1.5 py-0.5 rounded">
                          {card.badge}
                        </span>
                      )}
                    </div>

                    {/* Center metallic envelope insert mockup */}
                    <div className="relative my-auto flex flex-col items-center justify-center text-center">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner mb-1"
                        style={{
                          borderColor: `${card.color}80`,
                          backgroundColor: `${card.color}15`,
                        }}
                      >
                        <span className="font-mono text-xs font-black" style={{ color: card.color }}>
                          {card.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Bottom label */}
                    <div className="z-10 pt-1 border-t border-white/5 flex justify-between items-end">
                      <span className="text-[9px] font-medium text-zinc-300 truncate max-w-[70%]">
                        {card.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] font-bold text-[#C5A880] font-mono">
                        {card.price}
                      </span>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

