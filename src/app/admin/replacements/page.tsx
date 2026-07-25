'use client';

import React from 'react';
import { RefreshCw, ShieldCheck, CheckCircle2 } from 'lucide-react';

const DEMO_REPLACEMENTS_ADMIN: any[] = [];

export default function AdminReplacementsPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-[#242424] pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#00E5FF]" /> Historial de Reemplazos & Garantías
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Registro de unidades asignadas como reemplazo bajo garantía.</p>
      </div>

      <div className="bg-[#101010] border border-[#242424] rounded-3xl overflow-hidden">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-[#050505] border-b border-[#242424] text-zinc-400 uppercase font-mono">
            <tr>
              <th className="px-6 py-4">Ticket / Orden</th>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">Motivo Reemplazo</th>
              <th className="px-6 py-4">Aprobado Por</th>
              <th className="px-6 py-4">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242424]">
            {DEMO_REPLACEMENTS_ADMIN.map((r) => (
              <tr key={r.id} className="hover:bg-[#161616] transition-colors">
                <td className="px-6 py-4 font-mono">
                  <span className="font-bold text-[#00E5FF] block">{r.ticket_number}</span>
                  <span className="text-zinc-500">{r.order_number}</span>
                </td>
                <td className="px-6 py-4 font-bold text-white">{r.product_name}</td>
                <td className="px-6 py-4 text-zinc-300">{r.reason}</td>
                <td className="px-6 py-4 text-zinc-300">{r.approved_by}</td>
                <td className="px-6 py-4 font-mono text-zinc-500">{r.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
