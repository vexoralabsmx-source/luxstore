'use client';

export const runtime = 'edge';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import type { Order } from '@/types';
import { LUX_BANK_INFO } from '@/data/luxCatalog';

export default function OrderStatusPage() {
  const { order_number: orderNumber } = useParams<{ order_number: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [canViewDelivery, setCanViewDelivery] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [txid, setTxid] = useState('');
  const [busy, setBusy] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const loadOrder = useCallback(async () => {
    const response = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`, {
      cache: 'no-store',
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || 'Pedido no encontrado');
      setOrder(null);
    } else {
      setOrder(payload.order);
      setCanViewDelivery(payload.canViewDelivery);
      setError('');
    }
    setLoading(false);
  }, [orderNumber]);

  useEffect(() => {
    loadOrder();
    const timer = window.setInterval(loadOrder, 5000);
    return () => window.clearInterval(timer);
  }, [loadOrder]);

  const openClip = async () => {
    setBusy(true);
    setError('');
    const response = await fetch('/api/payments/clip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber }),
    });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok || !payload.url) {
      setError(payload.error || 'No se pudo abrir Clip');
      return;
    }
    window.location.href = payload.url;
  };

  const notifySpei = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const response = await fetch('/api/payments/notify-spei', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber, paymentReference: txid }),
    });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(payload.error || 'No se pudo registrar la referencia');
      return;
    }
    setTxid('');
    await loadOrder();
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-zinc-400">Cargando pedido…</div>;
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h1 className="text-xl font-bold text-white">{error || 'Pedido no encontrado'}</h1>
        <Link href="/catalog" className="text-[#C5A880] underline">Volver al catálogo</Link>
      </div>
    );
  }

  const delivered = order.status === 'DELIVERED';

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="glass-vip-card rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-zinc-500 font-mono">PEDIDO</p>
            <h1 className="text-2xl font-bold text-white font-mono">{order.order_number}</h1>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold font-mono border ${
            delivered
              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
              : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
          }`}>
            {order.status}
          </span>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-[#050505] border border-[#1C1C1C] rounded-xl p-4">
            <span className="text-zinc-500 block">Método</span>
            <strong className="text-white uppercase">{order.payment_method}</strong>
          </div>
          <div className="bg-[#050505] border border-[#1C1C1C] rounded-xl p-4">
            <span className="text-zinc-500 block">Total</span>
            <strong className="text-[#C5A880]">${Number(order.total).toFixed(2)} MXN</strong>
          </div>
          <div className="bg-[#050505] border border-[#1C1C1C] rounded-xl p-4">
            <span className="text-zinc-500 block">Fecha</span>
            <strong className="text-white">{new Date(order.created_at).toLocaleString('es-MX')}</strong>
          </div>
        </div>
      </div>

      <div className="glass-vip-card rounded-3xl p-6 space-y-3">
        <h2 className="font-bold text-white">Productos</h2>
        {order.items?.map((item) => (
          <div key={item.id} className="flex justify-between gap-4 border-b border-[#1C1C1C] py-3 text-sm">
            <div>
              <strong className="text-white">{item.product_name}</strong>
              {item.variant_name && <p className="text-xs text-[#C5A880]">{item.variant_name}</p>}
              <p className="text-xs text-zinc-500">Cantidad: {item.quantity}</p>
            </div>
            <span className="text-white font-mono">${Number(item.total_price).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {order.payment_method === 'clip' && order.status === 'PENDING_PAYMENT' && (
        <button
          onClick={openClip}
          disabled={busy}
          className="w-full py-3.5 rounded-xl bg-[#C5A880] text-black font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <CreditCard className="w-4 h-4" />
          {busy ? 'Abriendo Clip…' : 'Pagar de forma segura con Clip'}
        </button>
      )}

      {order.payment_method === 'spei' && order.status === 'PENDING_PAYMENT' && (
        <form onSubmit={notifySpei} className="glass-vip-card rounded-3xl p-6 space-y-4">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#C5A880]" /> Pago por SPEI
          </h2>
          <p className="text-xs text-zinc-400">
            Transfiere ${Number(order.total).toFixed(2)} MXN a {LUX_BANK_INFO.bank}, tarjeta {LUX_BANK_INFO.cardNumber}.
          </p>
          <input
            required
            value={txid}
            onChange={(event) => setTxid(event.target.value)}
            placeholder="Folio o referencia de la transferencia"
            className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl px-4 py-3 text-sm text-white"
          />
          <button disabled={busy} className="px-5 py-3 rounded-xl bg-[#C5A880] text-black font-bold text-xs">
            {busy ? 'Enviando…' : 'Notificar transferencia'}
          </button>
        </form>
      )}

      {delivered && !canViewDelivery && (
        <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-200 text-sm">
          Inicia sesión con la cuenta que realizó la compra para revelar el contenido. También se envió al correo del pedido.
        </div>
      )}

      {canViewDelivery && Boolean(order.deliveries?.length) && (
        <div className="glass-vip-card rounded-3xl p-6 space-y-4">
          <h2 className="text-white font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Entrega digital
          </h2>
          {order.deliveries?.map((delivery) => (
            <div key={delivery.id} className="bg-[#050505] border border-[#1C1C1C] rounded-xl p-4">
              <div className="flex items-center justify-between gap-3">
                <code className="text-sm text-white break-all">
                  {revealed[delivery.id] ? delivery.delivered_content : '••••••••••••••••••••'}
                </code>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRevealed((value) => ({ ...value, [delivery.id]: !value[delivery.id] }))}
                    className="p-2 rounded-lg bg-zinc-900 text-zinc-300"
                    aria-label="Mostrar u ocultar contenido"
                  >
                    {revealed[delivery.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(delivery.delivered_content)}
                    className="p-2 rounded-lg bg-zinc-900 text-zinc-300"
                    aria-label="Copiar contenido"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-rose-400">{error}</p>}
      <button onClick={loadOrder} className="text-xs text-zinc-400 flex items-center gap-2">
        <RefreshCw className="w-3.5 h-3.5" /> Actualizar estado
      </button>
    </div>
  );
}
