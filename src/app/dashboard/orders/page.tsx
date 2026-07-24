'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Eye, Zap, CheckCircle2, Clock } from 'lucide-react';

const DEMO_CUSTOMER_ORDERS = [
  {
    order_number: 'LX-2026-881923',
    date: '2026-07-20',
    total: 349.00,
    payment_method: 'SPEI',
    status: 'DELIVERED',
    items_count: 1,
  },
  {
    order_number: 'LX-2026-119234',
    date: '2026-07-15',
    total: 199.00,
    payment_method: 'Credits',
    status: 'DELIVERED',
    items_count: 1,
  },
  {
    order_number: 'LX-2026-991204',
    date: '2026-07-10',
    total: 289.00,
    payment_method: 'Clip',
    status: 'PAID',
    items_count: 1,
  },
];

export default function CustomerOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-[#242424] pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-[#00E5FF]" /> Mis Pedidos
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Historial completo de tus transacciones y accesos directos de entrega.
        </p>
      </div>

      <div className="space-y-3">
        {DEMO_CUSTOMER_ORDERS.map((order) => (
          <div
            key={order.order_number}
            className="bg-[#101010] border border-[#242424] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="font-bold font-mono text-white text-base">{order.order_number}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Fecha: {order.date} • Método: <span className="uppercase text-[#00E5FF] font-mono">{order.payment_method}</span>
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#242424]">
              <div className="text-right">
                <div className="text-base font-extrabold text-white font-mono">${order.total.toFixed(2)} MXN</div>
                <div className="text-[11px] text-zinc-500">{order.items_count} producto(s)</div>
              </div>

              <Link
                href={`/order/${order.order_number}`}
                className="p-2.5 rounded-xl bg-[#1F1F1F] text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <Eye className="w-4 h-4 text-[#00E5FF]" />
                <span>Ver Entrega</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
