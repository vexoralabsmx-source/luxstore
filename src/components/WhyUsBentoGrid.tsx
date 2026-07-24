'use client';

import React from 'react';
import { Zap, ShieldCheck, Award, RefreshCw, Headphones, Layout } from 'lucide-react';

export function WhyUsBentoGrid() {
  const trustFeatures = [
    {
      icon: ShieldCheck,
      title: 'Pago seguro',
      desc: 'Pagos cifrados y conformes con PCI. Nunca guardamos los datos de tu tarjeta.',
    },
    {
      icon: Award,
      title: 'Marketplace de confianza',
      desc: 'Cada producto está verificado y respaldado por garantía de reemplazo durante toda su vigencia.',
    },
    {
      icon: RefreshCw,
      title: 'Ideal para revendedores',
      desc: 'Precios por volumen, reposiciones rápidas y acceso a API pensados para revendedores.',
    },
    {
      icon: Headphones,
      title: 'Soporte humano',
      desc: 'Personas reales, respuestas rápidas, normalmente en minutos, no en días.',
    },
    {
      icon: Layout,
      title: 'Panel limpio',
      desc: 'Controla pedidos, saldo y favoritos en un centro de control elegante.',
    },
  ];

  const deliveryBars = [15, 25, 20, 40, 35, 55, 45, 75];

  return (
    <section className="py-16 bg-black relative overflow-hidden">
      
      {/* Background Dots */}
      <div className="absolute inset-0 bg-grid-dots opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest text-[#C5A880] border border-[#C5A880]/30 bg-[#C5A880]/10 uppercase">
            POR QUÉ LUX STORE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sans tracking-tight">
            Diseñado para sentirse premium, <span className="gradient-text-gold">de principio a fin</span>
          </h2>
          <p className="text-sm text-zinc-400 font-sans">
            Cada detalle, de la velocidad de entrega al soporte, está afinado para que comprar productos digitales sea fácil y fiable.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Large Card: Delivery Speed Chart */}
          <div className="lg:col-span-5 rounded-3xl bg-[#0F0B18] border border-[#C5A880]/20 p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            
            <div className="space-y-4 z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#C5A880]/10 border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880]">
                <Zap className="w-6 h-6" />
              </div>

              <h3 className="text-2xl font-extrabold text-white font-sans">
                Entrega ultrarrápida
              </h3>

              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                La automatización entrega la mayoría de pedidos en menos de un minuto, de día o de noche.
              </p>
            </div>

            {/* Delivery chart simulation */}
            <div className="mt-8 z-10">
              <div className="h-28 flex items-end justify-between gap-2">
                {deliveryBars.map((h, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-[#8C7355] to-[#C5A880] rounded-t-lg transition-all duration-300 group-hover:brightness-125" style={{ height: `${h}%` }} />
                ))}
                <span className="text-[10px] font-mono font-bold bg-[#C5A880]/20 border border-[#C5A880]/40 text-[#C5A880] px-2 py-1 rounded-md self-center ml-2">
                  ~38s
                </span>
              </div>
            </div>

          </div>

          {/* Right Panel: Trust List */}
          <div className="lg:col-span-7 rounded-3xl bg-[#090910] border border-zinc-800 p-8 shadow-2xl space-y-6">
            {trustFeatures.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="flex items-start gap-4 pb-4 border-b border-zinc-800/60 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-[#C5A880]">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white font-sans">{item.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
