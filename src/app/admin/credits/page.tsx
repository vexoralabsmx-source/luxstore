'use client';

import React from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const DEMO_CREDITS_ADMIN: any[] = [];

export default function AdminCreditsPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-[#242424] pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Wallet className="w-8 h-8 text-[#00E5FF]" /> Auditoría Global de Créditos Internos
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Registro inmutable de recargas, deducciones y compras con créditos.</p>
      </div>

      <div className="bg-[#101010] border border-[#242424] rounded-3xl overflow-hidden">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-[#050505] border-b border-[#242424] text-zinc-400 uppercase font-mono">
            <tr>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Tipo Movimiento</th>
              <th className="px-6 py-4">Monto</th>
              <th className="px-6 py-4">Descripción / Motivo</th>
              <th className="px-6 py-4">Ejecutado Por</th>
              <th className="px-6 py-4">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242424]">
            {DEMO_CREDITS_ADMIN.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <tr key={tx.id} className="hover:bg-[#161616] transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{tx.user}</td>
                  <td className="px-6 py-4 font-mono font-bold text-[#00E5FF]">{tx.type}</td>
                  <td className={`px-6 py-4 font-mono font-extrabold text-sm ${isPositive ? 'text-emerald-400' : 'text-zinc-300'}`}>
                    {isPositive ? '+' : ''}${tx.amount.toFixed(2)} MXN
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{tx.description}</td>
                  <td className="px-6 py-4 text-zinc-400">{tx.performed_by}</td>
                  <td className="px-6 py-4 font-mono text-zinc-500">{tx.created_at}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
