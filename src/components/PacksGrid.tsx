'use client';

import React from 'react';
import { Sparkles, ArrowRight, Check, Tag } from 'lucide-react';
import { LUX_PACKS, LuxPack } from '@/data/luxPacks';
import Link from 'next/link';

export function PacksGrid() {
  const featuredPack = LUX_PACKS.find((p) => p.featured) || LUX_PACKS[0];
  const sidePack = LUX_PACKS.find((p) => p.id === 'pack-streaming');
  const bottomPacks = LUX_PACKS.filter((p) => !p.featured && p.id !== 'pack-streaming');

  return (
    <section className="py-16 bg-black relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="space-y-2 mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest text-blue-400 border border-blue-500/30 bg-blue-950/30 uppercase">
            <Tag className="w-3 h-3 text-blue-400" /># PACKS
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sans tracking-tight">
            Varias cuentas, <span className="text-blue-400">un solo precio</span>
          </h2>

          <p className="text-sm text-zinc-400 font-sans max-w-xl">
            Cuentas premium agrupadas, al instante y con garantía. Ahorra hasta un 98%.
          </p>
        </div>

        {/* Packs Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Main Featured Pack (Pack General) - Col 7 */}
          <div className="lg:col-span-7 relative group rounded-3xl bg-[#0B0A12] border border-[#C5A880]/30 p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl hover:border-[#C5A880]/60 transition-all duration-300">
            
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[#C5A880]/20 via-amber-600/10 to-transparent pointer-events-none" />

            {/* Top Badges */}
            <div className="flex justify-between items-center z-10 mb-6">
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#C5A880] to-[#8C7355] text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                <Sparkles className="w-3.5 h-3.5" />
                {featuredPack.badge}
              </span>

              <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg">
                {featuredPack.discountBadge}
              </span>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 space-y-4 my-auto">
              
              {/* Graphic Mockup of Card Envelope */}
              <div className="relative aspect-[16/9] max-w-md mx-auto my-4 rounded-2xl bg-gradient-to-b from-zinc-900 to-black border border-white/10 p-6 flex flex-col items-center justify-center text-center shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#C5A880]/20 via-transparent to-transparent pointer-events-none" />
                <span className="font-mono text-xs text-[#C5A880] tracking-widest font-bold uppercase mb-1">
                  LUX STORE POWERED
                </span>
                <h4 className="text-3xl font-black text-white font-sans tracking-widest uppercase gradient-text-gold">
                  PACK EVERYTHING
                </h4>
                <p className="text-[10px] text-zinc-400 font-mono mt-2">PREMIUM ACCESS 14 IN 1</p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white font-sans">{featuredPack.title}</h3>
                <p className="text-xs text-zinc-400 mt-1">{featuredPack.description}</p>
              </div>

              {/* Price & Action */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800/80">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white font-mono">
                      ${featuredPack.price.toFixed(0)} MXN
                    </span>
                    <span className="text-xs text-zinc-500 line-through font-mono">
                      ${featuredPack.originalPrice.toFixed(0)}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 block font-mono mt-0.5">
                    14 cuentas • ahorras ${(featuredPack.originalPrice - featuredPack.price).toFixed(0)} MXN
                  </span>
                </div>

                <Link
                  href="/catalog"
                  className="px-6 py-3 rounded-xl glow-gold-btn text-black font-bold text-xs flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                >
                  <span>Ver pack</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>

          </div>

          {/* Right Column - Col 5 (1 top pack + 3 bottom mini packs) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Top Side Pack (Pack Streaming) */}
            {sidePack && (
              <div className="relative rounded-2xl bg-[#090D16] border border-blue-500/30 p-5 flex flex-col justify-between hover:border-blue-500/60 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-white font-sans">{sidePack.title}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{sidePack.description}</p>
                  </div>
                  <span className="bg-blue-950/80 border border-blue-500/40 text-blue-400 font-mono text-xs font-extrabold px-2 py-0.5 rounded">
                    {sidePack.discountBadge}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/80">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-white font-mono">
                      ${sidePack.price.toFixed(0)} MXN
                    </span>
                    <span className="text-xs text-zinc-500 line-through font-mono">
                      ${sidePack.originalPrice.toFixed(0)}
                    </span>
                  </div>

                  <Link
                    href="/catalog"
                    className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center gap-1"
                  >
                    <span>Ver</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Bottom Row - 3 Mini Packs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {bottomPacks.map((pack) => (
                <div
                  key={pack.id}
                  className="relative rounded-xl bg-[#0A0A0F] border border-zinc-800 p-3.5 flex flex-col justify-between hover:border-zinc-700 transition-all duration-300"
                  style={{
                    borderColor: `${pack.accentColor}40`,
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded border"
                      style={{
                        backgroundColor: `${pack.accentColor}15`,
                        borderColor: `${pack.accentColor}40`,
                        color: pack.accentColor,
                      }}
                    >
                      {pack.discountBadge}
                    </span>
                  </div>

                  <div className="space-y-1 my-2">
                    <h5 className="text-xs font-bold text-white truncate font-sans">{pack.title}</h5>
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="text-sm font-black text-white">${pack.price.toFixed(0)}</span>
                      <span className="text-[10px] text-zinc-500 line-through">${pack.originalPrice.toFixed(0)}</span>
                    </div>
                  </div>

                  <Link
                    href="/catalog"
                    className="mt-2 text-[10px] font-bold text-zinc-400 hover:text-white flex items-center justify-between border-t border-white/5 pt-2"
                  >
                    <span>Explorar</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
