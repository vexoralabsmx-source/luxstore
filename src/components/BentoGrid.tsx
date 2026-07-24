'use client';

import React from 'react';
import { Zap, ShieldCheck, Lock, Wallet, Crown, RefreshCw, KeyRound } from 'lucide-react';

export function BentoGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-xs uppercase tracking-widest text-[#D4AF37] font-mono font-bold">Capacidades de la Plataforma</h2>
        <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">Arquitectura de Prestigio</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Bento Item 1: Large Featured */}
        <div className="md:col-span-8 glass-vip-card rounded-3xl p-8 flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 blur-3xl pointer-events-none rounded-full" />
          <div className="w-12 h-12 rounded-2xl bg-[#030303] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <Zap className="w-6 h-6" />
          </div>
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider">Cero Latencia</span>
            <h4 className="font-serif text-2xl font-bold text-white">Bóveda con Asignación Inmediata</h4>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-lg">
              Al procesar la transacción con la pasarela oficial, la base de datos PostgreSQL ejecuta una transacción de asignación atómica seleccionando un ítem disponible y entregándolo en pantalla en menos de 5 segundos.
            </p>
          </div>
        </div>

        {/* Bento Item 2 */}
        <div className="md:col-span-4 glass-vip-card rounded-3xl p-8 space-y-4 flex flex-col justify-between">
          <div className="w-12 h-12 rounded-2xl bg-[#030303] border border-[#D4AF37]/40 flex items-center justify-center text-[#FFF5C0]">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Seguridad AES-256</span>
            <h4 className="font-serif text-xl font-bold text-white">Cifrado en Reposo</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Las credenciales de inventario están protegidas mediante pgcrypto y cifrado simétrico en la base de datos.
            </p>
          </div>
        </div>

        {/* Bento Item 3 */}
        <div className="md:col-span-4 glass-vip-card rounded-3xl p-8 space-y-4 flex flex-col justify-between">
          <div className="w-12 h-12 rounded-2xl bg-[#030303] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider">1 MXN = 1 Crédito</span>
            <h4 className="font-serif text-xl font-bold text-white">Monedero Interno</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Saldo sin caducidad para pagos instantáneos de 0 segundos en checkout.
            </p>
          </div>
        </div>

        {/* Bento Item 4 */}
        <div className="md:col-span-8 glass-vip-card rounded-3xl p-8 flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-[#030303] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#FFF5C0] uppercase tracking-wider">Garantía VIP 365 Días</span>
            <h4 className="font-serif text-2xl font-bold text-white">Reemplazo en 1-Clic</h4>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-lg">
              Sistema de tickets Concierge integrado. Si cualquier clave o cuenta presenta inconvenientes, el administrador aprueba una nueva unidad disponible desde el panel con 1 clic.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
