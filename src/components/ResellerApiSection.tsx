'use client';

import React from 'react';
import { Code, Wallet, Zap, Layers, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function ResellerApiSection() {
  const benefits = [
    {
      icon: Code,
      title: 'API REST completa',
      desc: 'Integra todo el catálogo en tu web, bot o Discord.',
    },
    {
      icon: Wallet,
      title: 'Precios de revendedor',
      desc: 'Compra al por mayor y pon tu propio margen.',
    },
    {
      icon: Zap,
      title: 'Entrega automática',
      desc: 'Cada pedido se entrega solo, al instante, 24/7.',
    },
    {
      icon: Layers,
      title: 'Stock en tiempo real',
      desc: 'Consulta stock y precios por endpoint.',
    },
  ];

  return (
    <section className="py-16 bg-[#040408] relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest text-[#C5A880] border border-[#C5A880]/30 bg-[#C5A880]/10 uppercase">
            PROGRAMA DE REVENDEDORES
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sans tracking-tight">
            Nuestro catálogo, <span className="gradient-text-gold">tu negocio</span>
          </h2>
          <p className="text-sm text-zinc-400 font-sans">
            Una sola API para stock, precios y entrega automática. Nosotros lo entregamos todo solo — tú te quedas el margen.
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-3xl bg-[#090912] border border-zinc-800 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-2xl">
          
          {/* Left Column - Benefits & CTAs */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* 2x2 Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {benefits.map((b, idx) => {
                const IconComp = b.icon;
                return (
                  <div key={idx} className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center flex-shrink-0 text-[#C5A880]">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-white font-sans">{b.title}</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans">{b.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-7 py-3 rounded-xl glow-gold-btn text-black font-bold text-xs flex items-center justify-center gap-2"
              >
                <span>Ver el programa</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/status"
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold text-xs hover:border-zinc-700 hover:text-white transition-all flex items-center justify-center"
              >
                Ver la API
              </Link>
            </div>

          </div>

          {/* Right Column - Dark macOS Code Terminal Mockup */}
          <div className="lg:col-span-6 rounded-2xl bg-[#0B0C14] border border-zinc-800/90 shadow-2xl overflow-hidden font-mono text-xs text-zinc-300">
            
            {/* Terminal Window Top Bar */}
            <div className="bg-[#121320] px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[11px] text-[#C5A880] font-semibold">luxstore · api</span>
            </div>

            {/* Code Terminal Content */}
            <div className="p-5 space-y-4 leading-relaxed font-mono">
              
              {/* Request */}
              <div>
                <p className="text-emerald-400 font-bold">
                  POST <span className="text-white">/v1/orders</span>
                </p>
                <p className="text-zinc-500">
                  Authorization: <span className="text-[#C5A880]">Bearer lux_live_••••</span>
                </p>
              </div>

              {/* JSON Payload */}
              <div className="bg-black/50 p-3 rounded-lg border border-white/5 text-zinc-300 space-y-0.5">
                <p className="text-zinc-500">{'{'}</p>
                <p className="pl-4">
                  <span className="text-cyan-400">&quot;product&quot;</span>: <span className="text-amber-300">&quot;spotify-premium-fa&quot;</span>,
                </p>
                <p className="pl-4">
                  <span className="text-cyan-400">&quot;quantity&quot;</span>: <span className="text-purple-400">1</span>
                </p>
                <p className="text-zinc-500">{'}'}</p>
              </div>

              {/* Response Header */}
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
                <span className="text-emerald-400 font-bold">200 OK</span>
                <span className="text-zinc-500">• 0.8s</span>
              </div>

              {/* JSON Response */}
              <div className="bg-black/50 p-3 rounded-lg border border-white/5 text-zinc-300 space-y-0.5">
                <p className="text-zinc-500">{'{'}</p>
                <p className="pl-4">
                  <span className="text-cyan-400">&quot;status&quot;</span>: <span className="text-amber-300">&quot;delivered&quot;</span>,
                </p>
                <p className="pl-4">
                  <span className="text-cyan-400">&quot;account&quot;</span>: <span className="text-amber-300">&quot;user@mail:••••••&quot;</span>,
                </p>
                <p className="pl-4">
                  <span className="text-cyan-400">&quot;cost&quot;</span>: <span className="text-emerald-400">0.90</span>,
                </p>
                <p className="pl-4">
                  <span className="text-cyan-400">&quot;balance&quot;</span>: <span className="text-emerald-400">48.20</span>
                </p>
                <p className="text-zinc-500">{'}'}</p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
