'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  KeyRound, 
  Wallet, 
  ShieldCheck, 
  ArrowRight, 
  Zap,
  Clock
} from 'lucide-react';

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#101010] via-[#161616] to-[#101010] border border-[#242424] rounded-3xl p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">¡Hola! Bienvenido a tu Panel Lux Store</h1>
          <p className="text-xs text-zinc-400 mt-1">Gestiona tus productos digitales, consulta tu saldo de créditos y abre tickets de garantía.</p>
        </div>
        <Link
          href="/catalog"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] text-black font-bold text-xs hover:shadow-glow transition-all flex items-center gap-2 flex-shrink-0"
        >
          <Zap className="w-4 h-4" />
          <span>Ir al Catálogo</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#101010] border border-[#242424] rounded-2xl p-6 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase">Saldo en Créditos</span>
            <Wallet className="w-5 h-5 text-[#00E5FF]" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">$500.00 <span className="text-xs text-[#00E5FF]">MXN</span></p>
          <p className="text-[11px] text-zinc-500">1 Crédito = $1.00 MXN sin expiración</p>
        </div>

        <div className="bg-[#101010] border border-[#242424] rounded-2xl p-6 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase">Productos Comprados</span>
            <KeyRound className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">3</p>
          <p className="text-[11px] text-emerald-400">3 Garantías de reemplazo activas</p>
        </div>

        <div className="bg-[#101010] border border-[#242424] rounded-2xl p-6 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase">Pedidos Totales</span>
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">3</p>
          <p className="text-[11px] text-zinc-500">Todos procesados exitosamente</p>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-[#101010] border border-[#242424] rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#242424] pb-4">
          <h3 className="text-base font-bold text-white">Últimas Compras Realizadas</h3>
          <Link href="/dashboard/orders" className="text-xs text-[#00E5FF] hover:underline flex items-center gap-1">
            Ver Todos los Pedidos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          <div className="bg-[#050505] border border-[#242424] rounded-2xl p-4 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold font-mono text-white block">LX-2026-881923</span>
              <span className="text-zinc-400">Spotify Premium 1 Año</span>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                ENTREGADO
              </span>
              <span className="block text-zinc-500 mt-1 font-mono">$349.00 MXN</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
