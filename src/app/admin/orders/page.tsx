'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Eye, 
  Zap, 
  RefreshCw
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveringId, setDeliveringId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/orders', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setOrders(payload.orders || []);
    } catch (e) {
      console.error(e);
      setOrders([]);
    }
    setLoading(false);
  };

  const handleApproveAndDeliver = async (orderNumber: string) => {
    setDeliveringId(orderNumber);
    
    const response = await fetch('/api/admin/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber }),
    });
    const payload = await response.json();
    if (!response.ok) alert(payload.error || payload.message || 'No se pudo entregar');
    await fetchOrders();
    setDeliveringId(null);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1C1C1C] pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-[#C5A880]" /> Gestión de Pedidos & Aprobar Pagos
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Revisión de transferencias SPEI BBVA, comprobantes de clientes y entrega inmediata por Resend.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-[#141414] border border-[#1C1C1C] text-zinc-300 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-[#C5A880]" />
          <span>Actualizar Lista</span>
        </button>
      </div>

      {/* Orders Data Table */}
      <div className="glass-vip-card rounded-3xl overflow-hidden border-[#1C1C1C]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#050505] border-b border-[#1C1C1C] text-zinc-400 uppercase font-mono">
              <tr>
                <th className="px-6 py-4">Pedido / Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Método</th>
                <th className="px-6 py-4">Referencia SPEI</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {orders.length > 0 ? (
                orders.map((order, index) => {
                  const canApproveSpei =
                    order.payment_method === 'spei'
                    && ['PENDING_PAYMENT', 'PAYMENT_REVIEW'].includes(order.status);
                  const canRetryDelivery = ['PAID', 'PROCESSING'].includes(order.status);

                  return (
                  <tr key={`${order.order_number || order.id || index}`} className="hover:bg-[#0E0E0E] transition-colors">
                    <td className="px-6 py-4 font-mono">
                      <span className="font-bold text-white block">{order.order_number}</span>
                      <span className="text-[11px] text-zinc-500">{order.created_at?.substring(0, 16)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">{order.customer_email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#050505] border border-[#1C1C1C] text-white font-mono uppercase text-[11px]">
                        {order.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {order.payment_reference ? (
                        <span className="px-2 py-1 bg-[#09090B] border border-[#C5A880]/40 text-[#C5A880] rounded font-bold">
                          {order.payment_reference}
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white text-sm">
                      ${order.total?.toFixed(2)} MXN
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                        order.status === 'DELIVERED' || order.status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : order.status === 'PAYMENT_REVIEW'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/order/${order.order_number}`}
                          className="p-2 rounded-xl bg-[#141414] border border-[#1C1C1C] text-zinc-300 hover:text-white"
                          title="Ver Detalles del Pedido"
                        >
                          <Eye className="w-4 h-4 text-[#C5A880]" />
                        </Link>

                        {(canApproveSpei || canRetryDelivery) && (
                          <button
                            disabled={deliveringId === order.order_number}
                            onClick={() => handleApproveAndDeliver(order.order_number)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#C5A880] text-black font-bold text-xs hover:bg-[#E8D8C8] transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>
                              {deliveringId === order.order_number
                                ? 'Procesando...'
                                : canApproveSpei
                                  ? 'Aprobar SPEI & Entregar'
                                  : 'Reintentar entrega'}
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-xs text-zinc-500 font-mono">
                    No se han registrado pedidos pendientes de pago o comprobantes SPEI aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
