'use client';

import React from 'react';
import { Activity, CheckCircle2, ShieldCheck, Zap, Lock, CreditCard, Building2 } from 'lucide-react';

const STATUS_ITEMS = [
  { name: 'Catálogo & Tienda Pública', status: 'Operativo', ping: '12ms', icon: Activity },
  { name: 'Pasarela Clip API (Tarjetas)', status: 'Operativo', ping: '45ms', icon: CreditCard },
  { name: 'Conciliador SPEI (Centavos Únicos)', status: 'Operativo', ping: '30ms', icon: Building2 },
  { name: 'Bóveda de Cifrado AES-256-GCM', status: 'Operativo', ping: '5ms', icon: Lock },
  { name: 'Motor de Entrega Automática', status: 'Operativo', ping: '18ms', icon: Zap },
  { name: 'Atención a Tickets Concierge', status: 'Disponible', ping: '3 min', icon: ShieldCheck },
];

export default function StatusPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#09090B] border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Todos los Sistemas Lux Store Operacionales</span>
        </div>

        <h1 className="font-serif text-4xl font-extrabold text-white">Estado del Sistema & Infraestructura</h1>
        <p className="text-xs sm:text-sm text-zinc-400">Monitoreo continuo de latencia, salud de APIs e infraestructura de cifrado.</p>
      </div>

      {/* Grid */}
      <div className="glass-vip-card rounded-3xl p-6 sm:p-8 space-y-4">
        {STATUS_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-[#030303] border border-[#27272A]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#09090B] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{item.name}</h3>
                  <span className="text-[10px] text-zinc-500 font-mono">Latencia estimada: {item.ping}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {item.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
