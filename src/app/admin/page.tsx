'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  Boxes,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    monthlyIncome: 0,
    pendingPayments: 0,
    deliveredOrders: 0,
    openTickets: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealStats();
  }, []);

  const fetchRealStats = async () => {
    setLoading(true);
    try {
      const supabase = createAdminClient();
      
      // Consultar pedidos reales de Supabase DB
      const { data: dbOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbOrders && dbOrders.length > 0) {
        setRecentOrders(dbOrders.slice(0, 5));

        const paid = dbOrders.filter((o) => o.status === 'DELIVERED' || o.status === 'PAID');
        const pending = dbOrders.filter((o) => o.status === 'PAYMENT_REVIEW' || o.status === 'PENDING_PAYMENT');

        const income = paid.reduce((acc, curr) => acc + (curr.total || 0), 0);

        setStats({
          monthlyIncome: income,
          pendingPayments: pending.length,
          deliveredOrders: paid.length,
          openTickets: 0,
        });
      } else {
        setStats({
          monthlyIncome: 0,
          pendingPayments: 0,
          deliveredOrders: 0,
          openTickets: 0,
        });
        setRecentOrders([]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1C1C1C] pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
            Dashboard General Real <span className="text-xs px-3 py-1 bg-[#C5A880]/10 text-[#C5A880] border border-[#C5A880]/30 rounded-full font-mono font-normal">Owner Admin</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Métricas calculadas en tiempo real a partir de la base de datos Supabase.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRealStats}
            className="px-3.5 py-2 rounded-xl bg-[#141414] border border-[#1C1C1C] text-zinc-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 text-[#C5A880]" />
            <span>Actualizar Datos</span>
          </button>

          <Link
            href="/admin/inventory"
            className="px-4 py-2.5 rounded-xl bg-[#141414] border border-[#1C1C1C] hover:border-[#C5A880] text-white text-xs font-bold transition-all flex items-center gap-2"
          >
            <Boxes className="w-4 h-4 text-[#C5A880]" />
            <span>Cargar Stock</span>
          </Link>

          <Link
            href="/admin/orders"
            className="px-4 py-2.5 rounded-xl bg-[#C5A880] text-black font-bold text-xs hover:bg-[#E8D8C8] transition-all flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Revisar Pagos</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (Métricas Reales) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-vip-card rounded-3xl p-6 space-y-2 border-[#1C1C1C]">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase">Ingresos Reales del Mes</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">
            ${stats.monthlyIncome.toFixed(2)} <span className="text-xs text-emerald-400 font-sans">MXN</span>
          </p>
          <p className="text-[11px] text-zinc-400 font-mono">Suma de compras confirmadas</p>
        </div>

        <div className="glass-vip-card rounded-3xl p-6 space-y-2 border-[#1C1C1C]">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase">Pagos en Revisión</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-amber-400 font-mono">{stats.pendingPayments}</p>
          <p className="text-[11px] text-zinc-400 font-mono">Transferencias SPEI pendientes</p>
        </div>

        <div className="glass-vip-card rounded-3xl p-6 space-y-2 border-[#1C1C1C]">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase">Pedidos Entregados</span>
            <ShoppingBag className="w-5 h-5 text-[#C5A880]" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats.deliveredOrders}</p>
          <p className="text-[11px] text-zinc-400 font-mono">Licencias y stock entregados</p>
        </div>

        <div className="glass-vip-card rounded-3xl p-6 space-y-2 border-[#1C1C1C]">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase">Tickets Abiertos</span>
            <MessageSquare className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats.openTickets}</p>
          <p className="text-[11px] text-zinc-400 font-mono">Soporte técnico activo</p>
        </div>

      </div>

      {/* Recent Orders List */}
      <div className="glass-vip-card rounded-3xl p-6 space-y-4 border-[#1C1C1C]">
        <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-4">
          <h3 className="text-base font-bold text-white font-serif">Últimos Pedidos en Tiempo Real</h3>
          <Link href="/admin/orders" className="text-xs text-[#C5A880] hover:underline font-mono">
            Ver Todos los Pedidos &rarr;
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="space-y-3 text-xs">
            {recentOrders.map((o) => (
              <div key={o.id} className="bg-[#050505] border border-[#1C1C1C] rounded-2xl p-4 flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold font-mono text-white block">{o.order_number}</span>
                  <span className="text-zinc-400 font-mono">{o.customer_email} • Método: {o.payment_method}</span>
                </div>
                <div className="text-right font-mono">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    o.status === 'DELIVERED' || o.status === 'PAID'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {o.status}
                  </span>
                  <span className="block text-white font-bold mt-1">${o.total?.toFixed(2)} MXN</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 font-mono py-4 text-center">
            No se han registrado compras reales en la base de datos de Supabase aún.
          </p>
        )}
      </div>

    </div>
  );
}
