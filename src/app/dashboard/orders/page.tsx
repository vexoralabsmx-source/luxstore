'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createClient()
      .from('orders')
      .select('order_number, created_at, total, payment_method, status, items:order_items(id)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        setOrders(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-[#242424] pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-[#00E5FF]" /> Mis Pedidos
        </h1>
      </div>
      {loading ? <p className="text-zinc-400">Cargando…</p> : orders.length === 0 ? (
        <div className="bg-[#101010] border border-[#242424] rounded-2xl p-8 text-center text-zinc-400">
          No has realizado pedidos con esta cuenta.
        </div>
      ) : orders.map((order) => (
        <div key={order.order_number} className="bg-[#101010] border border-[#242424] rounded-2xl p-5 flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <strong className="font-mono text-white">{order.order_number}</strong>
              <span className="text-[10px] text-emerald-400">{order.status}</span>
            </div>
            <p className="text-xs text-zinc-400">
              {new Date(order.created_at).toLocaleString('es-MX')} · {order.payment_method.toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <strong className="text-white font-mono">${Number(order.total).toFixed(2)} MXN</strong>
              <p className="text-[11px] text-zinc-500">{order.items?.length || 0} producto(s)</p>
            </div>
            <Link href={`/order/${order.order_number}`} className="p-2.5 rounded-xl bg-[#1F1F1F]">
              <Eye className="w-4 h-4 text-[#00E5FF]" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
