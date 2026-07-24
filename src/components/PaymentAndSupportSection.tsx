'use client';

import React from 'react';
import { ShieldCheck, Zap, MessageCircle, CreditCard, Layout } from 'lucide-react';

export function PaymentAndSupportSection() {
  const paymentIcons = [
    { name: 'Stripe', bg: 'bg-indigo-600', label: 'S' },
    { name: 'PayPal', bg: 'bg-blue-600', label: 'P' },
    { name: 'Cash App', bg: 'bg-emerald-600', label: '$' },
    { name: 'Bitcoin', bg: 'bg-amber-600', label: '₿' },
    { name: 'Ethereum', bg: 'bg-purple-600', label: 'Ξ' },
    { name: 'Litecoin', bg: 'bg-slate-600', label: 'Ł' },
  ];

  return (
    <section className="py-16 bg-[#040406] relative overflow-hidden">
      
      {/* Background Dots */}
      <div className="absolute inset-0 bg-grid-dots opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Top Row: Delivery & Support Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Delivery */}
          <div className="rounded-3xl bg-[#090B14] border border-[#C5A880]/20 p-7 space-y-6 shadow-xl relative overflow-hidden group">
            
            {/* Visual Header Mockup */}
            <div className="bg-[#05060A] border border-[#C5A880]/20 rounded-2xl p-4 space-y-3">
              
              <div className="flex items-center gap-3 bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Order delivered</h5>
                  <p className="text-[10px] text-zinc-400">License key attached</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#C5A880]/10 border border-[#C5A880]/30 p-2.5 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Delivered in 0.4s</h5>
                  <p className="text-[10px] text-zinc-400">Instant, every time</p>
                </div>
              </div>

            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#C5A880] uppercase">
                DELIVERY
              </span>
              <h3 className="text-2xl font-serif font-bold text-white">Instant delivery</h3>
              <p className="text-xs text-zinc-400">Orders land in seconds, day or night.</p>
            </div>

          </div>

          {/* Card 2: Support */}
          <div className="rounded-3xl bg-[#090B14] border border-[#C5A880]/20 p-7 space-y-6 shadow-xl relative overflow-hidden group">
            
            {/* Visual Header Mockup */}
            <div className="bg-[#05060A] border border-[#C5A880]/20 rounded-2xl p-6 min-h-[120px] flex flex-col justify-end space-y-3">
              <div className="self-end bg-[#C5A880]/10 border border-[#C5A880]/40 px-4 py-2 rounded-xl text-xs text-[#C5A880] font-mono">
                Ticket #4821 Answered
              </div>
              <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>REPLIES IN MINUTES</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#C5A880] uppercase">
                SUPPORT
              </span>
              <h3 className="text-2xl font-serif font-bold text-white">Real humans</h3>
              <p className="text-xs text-zinc-400">Tickets answered by people, not bots.</p>
            </div>

          </div>

        </div>

        {/* Bottom Row: Payments & Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Card (Payments - Col 5) */}
          <div className="lg:col-span-5 rounded-3xl bg-[#090B14] border border-[#C5A880]/20 p-7 space-y-6 shadow-xl">
            
            {/* Payment Gateways Grid */}
            <div className="bg-[#05060A] border border-[#C5A880]/20 rounded-2xl p-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {paymentIcons.map((pay, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-xl ${pay.bg} text-white font-extrabold text-sm flex items-center justify-center shadow-lg border border-white/10`}
                    title={pay.name}
                  >
                    {pay.label}
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">
                EVERY MAJOR PAYMENT METHOD
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#C5A880] uppercase">
                PAYMENTS
              </span>
              <h3 className="text-2xl font-serif font-bold text-white">Pay your way</h3>
              <p className="text-xs text-zinc-400">Cards, wallets and crypto, all secured.</p>
            </div>

          </div>

          {/* Right Card (Dashboard - Col 7) */}
          <div className="lg:col-span-7 rounded-3xl bg-[#090B14] border border-[#C5A880]/20 p-7 space-y-6 shadow-xl flex flex-col justify-between">
            
            {/* Dashboard Outline Preview */}
            <div className="bg-[#05060A] border border-[#C5A880]/20 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#C5A880]/20 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#C5A880]" />
                  <div className="w-24 h-2 rounded bg-zinc-800" />
                </div>
                <div className="flex gap-2">
                  <div className="w-16 h-2 rounded bg-zinc-800" />
                  <div className="w-16 h-2 rounded bg-zinc-800" />
                </div>
              </div>

              {/* Chart Line Representation */}
              <div className="h-16 flex items-center px-4 relative">
                <div className="w-full h-1 bg-gradient-to-r from-[#8C7355] via-[#C5A880] to-[#E8D8C8] rounded-full" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#C5A880] uppercase">
                DASHBOARD
              </span>
              <h3 className="text-2xl font-serif font-bold text-white">Everything in one place</h3>
              <p className="text-xs text-zinc-400">Orders, keys and invoices live in your customer panel.</p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
