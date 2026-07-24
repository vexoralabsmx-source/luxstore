'use client';

import React from 'react';
import { TrendingUp, Layers, Zap, Shield, Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function SocialGrowthSection() {
  const platforms = [
    { name: 'Instagram', color: 'from-pink-500 to-purple-600' },
    { name: 'TikTok', color: 'from-cyan-400 to-black' },
    { name: 'YouTube', color: 'from-red-600 to-red-700' },
    { name: 'Twitch', color: 'from-purple-600 to-indigo-600' },
    { name: 'Kick', color: 'from-emerald-500 to-green-600' },
  ];

  const features = [
    {
      icon: Layers,
      title: '9 plataformas',
      desc: 'IG, TikTok, YouTube, Twitch, Kick, Maps, Trustpilot y más.',
    },
    {
      icon: Zap,
      title: 'Entrega Inmediata',
      desc: 'Empieza a los minutos de pagar, 24/7.',
    },
    {
      icon: Shield,
      title: '100% seguro',
      desc: 'Sin contraseña, sin riesgo para tu cuenta.',
    },
    {
      icon: Heart,
      title: 'Garantía de recarga',
      desc: 'Rellenamos gratis si baja.',
    },
  ];

  const chartHeights = [20, 35, 30, 48, 42, 60, 55, 80, 95];

  return (
    <section className="py-16 bg-[#06060A] relative overflow-hidden">
      
      {/* Background Dots */}
      <div className="absolute inset-0 bg-grid-dots opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest text-[#C5A880] border border-[#C5A880]/30 bg-[#C5A880]/10 uppercase">
            IMPULSO SOCIAL
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sans tracking-tight">
            Cada red social, <span className="gradient-text-gold">en piloto automático</span>
          </h2>
          <p className="text-sm text-zinc-400 font-sans">
            Seguidores, likes, vistas y reseñas en 9 plataformas, entregados en minutos y con garantía de recarga.
          </p>
        </div>

        {/* Main Section Card */}
        <div className="rounded-3xl bg-[#0A0A12] border border-zinc-800/80 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-2xl">
          
          {/* Left Visual Mockup */}
          <div className="lg:col-span-6 bg-[#0F0F1A] border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
            
            {/* Top Bar with Platform Icons */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                {platforms.map((p, idx) => (
                  <div
                    key={idx}
                    className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${p.color} flex items-center justify-center text-white text-[10px] font-extrabold shadow-md`}
                  >
                    {p.name.substring(0, 2)}
                  </div>
                ))}
              </div>

              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#C5A880] bg-[#C5A880]/10 px-2 py-1 rounded-md border border-[#C5A880]/30">
                <TrendingUp className="w-3 h-3 text-[#C5A880]" />
                Crecimiento
              </span>
            </div>

            {/* Mockup Title */}
            <div className="mb-6 space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono font-bold">
                IMPULSA TUS REDES
              </span>
              <h4 className="text-xl font-extrabold text-white font-sans">Seguidores reales</h4>
            </div>

            {/* Growth Bar Chart Animation */}
            <div className="h-32 flex items-end justify-between gap-2 pt-4 border-t border-zinc-800/50">
              {chartHeights.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-[#8C7355] via-[#C5A880] to-[#E8D8C8] group-hover:brightness-125 transition-all duration-500"
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>

          </div>

          {/* Right Features & CTA */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* 2x2 Feature Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feat, idx) => {
                const IconComp = feat.icon;
                return (
                  <div key={idx} className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#C5A880]/10 border border-[#C5A880]/30 flex items-center justify-center flex-shrink-0 text-[#C5A880]">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-white font-sans">{feat.title}</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <Link
                href="/catalog?cat=redes-sociales"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl glow-gold-btn text-black font-bold text-sm shadow-xl"
              >
                <span>Impulsar mis redes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
