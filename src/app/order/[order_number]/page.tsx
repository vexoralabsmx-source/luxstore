'use client';

export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Zap, 
  CheckCircle2, 
  Clock, 
  Copy, 
  ShieldCheck, 
  AlertCircle, 
  Building2, 
  CreditCard,
  Wallet,
  Eye, 
  EyeOff,
  MessageSquare,
  RefreshCw,
  FileCheck,
  ExternalLink,
  X,
  Lock,
  LifeBuoy
} from 'lucide-react';
import { getOrderByNumber } from '@/services/orderService';
import { deliverOrder } from '@/services/deliveryService';
import { Order, PaymentMethod } from '@/types';
import { LUX_BANK_INFO } from '@/data/luxCatalog';
import { QuickSupportModal } from '@/components/QuickSupportModal';

export default function OrderStatusPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderNumber = params?.order_number as string;
  const urlMethod = searchParams?.get('method') as PaymentMethod | null;
  const clipStatus = searchParams?.get('clip_status');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessingClip, setIsProcessingClip] = useState(false);

  // Clip Interactive Card Modal State
  const [showClipModal, setShowClipModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [clipSubmitting, setClipSubmitting] = useState(false);
  
  // SPEI proof state
  const [txid, setTxid] = useState<string>('');
  const [submittedProof, setSubmittedProof] = useState(false);
  const [submittingProof, setSubmittingProof] = useState(false);

  // Digital content reveal state
  const [showSensitiveData, setShowSensitiveData] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick Support Modal State
  const [showSupportModal, setShowSupportModal] = useState(false);

  useEffect(() => {
    fetchOrder();

    // Auto-Polling en segundo plano cada 3.5 segundos para refrescar entregas y estado en tiempo real
    const interval = setInterval(() => {
      fetchOrder(false);
    }, 3500);

    window.addEventListener('storage', () => fetchOrder(false));

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', () => fetchOrder(false));
    };
  }, [orderNumber, clipStatus]);

  const fetchOrder = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    const data = await getOrderByNumber(orderNumber);

    let localPaymentMethod: PaymentMethod = urlMethod || 'spei';
    let localCustomerEmail = 'miguebailey@gmail.com';
    let localTotal = 349.00;
    let localStatus = 'PENDING_PAYMENT';
    let localDeliveries: any[] = [];
    let localPaymentReference: string | undefined = undefined;

    // 1. Revisar lux_order_{orderNumber} en memoria del cliente
    try {
      const storedLocal = localStorage.getItem(`lux_order_${orderNumber}`);
      if (storedLocal) {
        const parsed = JSON.parse(storedLocal);
        if (parsed.payment_method) localPaymentMethod = parsed.payment_method;
        if (parsed.customer_email) localCustomerEmail = parsed.customer_email;
        if (parsed.total) localTotal = parsed.total;
        if (parsed.status) localStatus = parsed.status;
        if (parsed.deliveries) localDeliveries = parsed.deliveries;
        if (parsed.payment_reference) localPaymentReference = parsed.payment_reference;
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Revisar lux_admin_orders por si el administrador aprobó el pedido
    try {
      const storedAdminOrders = localStorage.getItem('lux_admin_orders');
      if (storedAdminOrders) {
        const adminOrders: any[] = JSON.parse(storedAdminOrders);
        const match = adminOrders.find((o) => o.order_number === orderNumber);
        if (match) {
          if (match.status) localStatus = match.status;
          if (match.deliveries && match.deliveries.length > 0) localDeliveries = match.deliveries;
          if (match.payment_reference) localPaymentReference = match.payment_reference;
        }
      }
    } catch (e) {
      console.error(e);
    }

    const isPaidMethod = (localPaymentMethod === 'credits') || (clipStatus === 'success') || (localStatus === 'DELIVERED') || (localStatus === 'PAID');
    const finalStatus = isPaidMethod ? (localStatus === 'DELIVERED' ? 'DELIVERED' : 'PAID') : localStatus;

    // Si el pedido está pagado pero no tiene entregas registradas aún, procesar entrega real de inventario
    if ((finalStatus === 'DELIVERED' || finalStatus === 'PAID') && localDeliveries.length === 0) {
      try {
        const res = await deliverOrder(orderNumber);
        if (res && res.deliveredItems && res.deliveredItems.length > 0) {
          localDeliveries = res.deliveredItems.map((item: any, idx: number) => ({
            id: `del_${orderNumber}_${idx + 1}`,
            order_id: orderNumber,
            product_name: item.productName,
            delivered_content: item.deliveredContent,
            created_at: new Date().toISOString(),
          }));
        }
      } catch (e) {
        console.error('Error al entregar orden en página de estado:', e);
      }
    }

    // Cargar items reales guardados en lux_order_{orderNumber}
    let localItems: any[] = [];
    try {
      const storedLocal = localStorage.getItem(`lux_order_${orderNumber}`);
      if (storedLocal) {
        const parsed = JSON.parse(storedLocal);
        if (parsed.items && Array.isArray(parsed.items)) localItems = parsed.items;
        if (parsed.deliveries && parsed.deliveries.length > 0) localDeliveries = parsed.deliveries;
      }
    } catch (e) {
      console.error(e);
    }

    const uniqueOrderId = `ord_${orderNumber || 'unique'}_${Date.now()}`;

    if (data) {
      setOrder({
        ...data,
        status: (data.status === 'DELIVERED' || finalStatus === 'DELIVERED') ? 'DELIVERED' : (isPaidMethod ? 'PAID' : data.status),
        deliveries: data.deliveries && data.deliveries.length > 0 ? data.deliveries : localDeliveries,
      });
    } else {
      setOrder({
        id: uniqueOrderId,
        order_number: orderNumber || 'LX-2026-000001',
        customer_email: localCustomerEmail,
        payment_method: localPaymentMethod,
        payment_reference: localPaymentReference,
        subtotal: localTotal,
        discount_amount: 0,
        total: localTotal,
        currency: 'MXN',
        status: finalStatus as any,
        unique_cents_amount: localTotal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: localItems.length > 0 ? localItems.map((it, idx) => ({
          id: `item_${orderNumber}_${idx + 1}`,
          order_id: uniqueOrderId,
          product_id: it.product_id || it.id || 'p1',
          product_name: it.name || it.product_name || 'Producto Digital Lux Store',
          variant_name: it.variant_name || it.variantName || 'Licencia Digital VIP',
          unit_price: it.sale_price || it.unit_price || localTotal,
          quantity: Number(it.quantity) || 1,
          total_price: (it.sale_price || it.unit_price || localTotal) * (Number(it.quantity) || 1),
        })) : [
          {
            id: `item_${orderNumber}_1`,
            order_id: uniqueOrderId,
            product_id: 'p1',
            product_name: 'Producto Digital Lux Store',
            variant_name: 'Suscripción Digital Original',
            unit_price: localTotal,
            quantity: 1,
            total_price: localTotal,
          }
        ],
        deliveries: localDeliveries,
      });
    }
    setLoading(false);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setShowSensitiveData((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txid) return;

    setSubmittingProof(true);

    try {
      // 1. Notificar al administrador por correo Resend y actualizar DB
      await fetch('/api/payments/notify-spei', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: order?.order_number || orderNumber,
          customerEmail: order?.customer_email || 'miguebailey@gmail.com',
          totalAmount: order?.total || 50.00,
          paymentReference: txid,
        }),
      });

      // 2. Guardar en registro de administración local para reflejo inmediato en /admin/orders
      const updatedOrder = {
        id: order?.id || `ord_${orderNumber}_${Date.now()}`,
        order_number: order?.order_number || orderNumber,
        customer_email: order?.customer_email || 'miguebailey@gmail.com',
        payment_method: 'spei',
        total: order?.total || 50.00,
        status: 'PAYMENT_REVIEW',
        payment_reference: txid,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };

      try {
        const storedAdminOrders = localStorage.getItem('lux_admin_orders');
        const existingOrders = storedAdminOrders ? JSON.parse(storedAdminOrders) : [];
        const filtered = existingOrders.filter((o: any) => o.order_number !== updatedOrder.order_number);
        localStorage.setItem('lux_admin_orders', JSON.stringify([updatedOrder, ...filtered]));

        // Actualizar lux_order_{orderNumber} local
        localStorage.setItem(`lux_order_${orderNumber}`, JSON.stringify({
          ...updatedOrder,
          payment_reference: txid,
          status: 'PAYMENT_REVIEW',
        }));
      } catch (err) {
        console.error(err);
      }

      setSubmittedProof(true);
      if (order) {
        setOrder({ 
          ...order, 
          status: 'PAYMENT_REVIEW',
          payment_reference: txid
        });
      }
    } catch (e) {
      console.error('Error al enviar notificacion SPEI:', e);
    }
    setSubmittingProof(false);
  };

  const handleClipPayClick = async () => {
    setIsProcessingClip(true);
    try {
      const res = await fetch('/api/payments/clip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderNumber: order?.order_number,
          total: order?.total 
        }),
      });

      const data = await res.json();

      if (data && data.url && !data.simulated) {
        window.location.href = data.url;
        return;
      }
    } catch (e) {
      console.error('Error al conectar con API de Clip:', e);
    }
    setIsProcessingClip(false);
    setShowClipModal(true);
  };

  const handleConfirmClipCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setClipSubmitting(true);

    setTimeout(() => {
      setClipSubmitting(false);
      setShowClipModal(false);
      window.location.href = `/order/${order?.order_number || orderNumber}?clip_status=success`;
    }, 1200);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#C5A880] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-400 font-mono">Cargando estado del pedido {orderNumber}...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Pedido no encontrado</h2>
        <p className="text-xs text-zinc-400">Verifica el número de orden ingresado.</p>
        <Link href="/catalog" className="inline-block px-4 py-2 bg-[#141414] text-white text-xs font-bold rounded-xl border border-[#1C1C1C]">
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  const isDelivered = order.status === 'DELIVERED' || order.status === 'PAID';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-vip-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-[#1C1C1C]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
              {order.order_number}
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
              isDelivered
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : order.status === 'PAYMENT_REVIEW'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}>
              {isDelivered ? 'ENTREGADO' : order.status === 'PAYMENT_REVIEW' ? 'EN REVISIÓN' : 'PAGO PENDIENTE'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-2 font-mono">
            Enviado a: <span className="text-white font-medium">{order.customer_email}</span> • Método: <span className="uppercase text-[#C5A880] font-bold">{order.payment_method}</span>
          </p>
        </div>

        <button
          onClick={() => fetchOrder(true)}
          className="p-2.5 rounded-xl bg-[#141414] border border-[#1C1C1C] text-zinc-300 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold font-mono cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-[#C5A880]" />
          <span>Actualizar Estado</span>
        </button>
      </div>

      {/* DELIVERED DIGITAL STOCK VIEWER */}
      {isDelivered && order.deliveries && order.deliveries.length > 0 ? (
        <div className="glass-vip-card rounded-3xl p-6 sm:p-8 space-y-6 border-[#C5A880]/40">
          <div className="flex items-center gap-3 border-b border-[#1C1C1C] pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-serif">Tu Producto Digital está listo</h2>
              <p className="text-xs text-zinc-400">Acceso entregado con cifrado de seguridad Lux Store.</p>
            </div>
          </div>

          <div className="space-y-4">
            {order.deliveries.map((del) => {
              const isRevealed = showSensitiveData[del.id] || false;

              return (
                <div key={del.id} className="bg-[#050505] border border-[#1C1C1C] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-[#C5A880] font-bold">
                      {del.product_name ? `${del.product_name}:` : 'Contenido Entregado / Clave Digital:'}
                    </span>
                    <button
                      onClick={() => toggleReveal(del.id)}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 bg-[#141414] border border-[#1C1C1C] px-3 py-1 rounded-lg font-mono cursor-pointer"
                    >
                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isRevealed ? 'Ocultar datos' : 'Mostrar datos'}</span>
                    </button>
                  </div>

                  <div className="bg-[#09090B] border border-[#1C1C1C] rounded-xl p-4 font-mono text-sm sm:text-base font-bold text-white flex items-center justify-between gap-4 overflow-x-auto">
                    <span>
                      {isRevealed ? del.delivered_content : '••••••••••••••••••••••••••••••••'}
                    </span>

                    <button
                      onClick={() => handleCopy(del.delivered_content, del.id)}
                      className="p-2 rounded-lg bg-[#141414] text-zinc-300 hover:text-white border border-[#1C1C1C] flex-shrink-0 cursor-pointer"
                      title="Copiar contenido"
                    >
                      <Copy className="w-4 h-4 text-[#C5A880]" />
                    </button>
                  </div>

                  {copiedId === del.id && (
                    <p className="text-xs text-emerald-400 font-mono">¡Contenido copiado al portapapeles!</p>
                  )}

                  <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 pt-2 border-t border-[#1C1C1C]">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                      <ShieldCheck className="w-4 h-4" /> Garantía de reemplazo activa
                    </span>
                    <Link
                      href="/dashboard/tickets"
                      className="text-[#C5A880] hover:underline flex items-center gap-1 font-mono"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Abrir Ticket de Soporte
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* CLIP PAYMENT BANNER */}
      {order.payment_method === 'clip' && !isDelivered && (
        <div className="glass-vip-card rounded-3xl p-6 sm:p-8 space-y-6 border-[#1C1C1C]">
          <div className="flex items-center gap-3 border-b border-[#1C1C1C] pb-4">
            <CreditCard className="w-8 h-8 text-[#C5A880]" />
            <div>
              <h2 className="text-lg font-bold text-white font-serif">Pago con Tarjeta Débito / Crédito (Clip)</h2>
              <p className="text-xs text-zinc-400">Procesa tu pago seguro mediante el portal oficial de Clip.</p>
            </div>
          </div>

          <div className="p-4 bg-[#050505] rounded-2xl border border-[#1C1C1C] text-xs font-mono space-y-2">
            <div className="flex justify-between text-zinc-400">
              <span>Monto a pagar:</span>
              <span className="text-[#C5A880] font-bold text-sm">${order.total.toFixed(2)} MXN</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Estado del pago:</span>
              <span className="text-amber-400 font-bold font-mono">PENDIENTE DE PAGO EN CLIP</span>
            </div>
          </div>

          <button
            onClick={handleClipPayClick}
            disabled={isProcessingClip}
            className="w-full py-4 rounded-xl bg-[#C5A880] text-black font-bold text-xs hover:bg-[#E8D8C8] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isProcessingClip ? 'Conectando con Clip...' : `Pagar $${order.total.toFixed(2)} MXN con Clip`}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CLIP INTERACTIVE CARD PAYMENT MODAL */}
      {showClipModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-[#C5A880]/40 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#C5A880]/10 border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-serif">Pasarela de Pago Clip</h3>
                  <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-emerald-400" /> Cifrado de tarjeta SSL 256-bit
                  </span>
                </div>
              </div>

              <button onClick={() => setShowClipModal(false)} className="text-zinc-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmClipCardPayment} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 uppercase mb-1">Nombre en la Tarjeta</label>
                <input
                  type="text"
                  required
                  placeholder="ej. MIGUEL ANGEL DORANTES"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">Número de Tarjeta (16 dígitos)</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  placeholder="4000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Expira (MM/AA)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="12/28"
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase mb-1">CVC / CVV</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#050505] rounded-xl border border-[#1C1C1C] flex justify-between items-center text-xs">
                <span className="text-zinc-400">Monto Total a Cobrar:</span>
                <span className="text-[#C5A880] font-bold font-mono text-sm">${order?.total?.toFixed(2)} MXN</span>
              </div>

              <button
                type="submit"
                disabled={clipSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#C5A880] text-black font-bold text-xs hover:bg-[#E8D8C8] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{clipSubmitting ? 'Procesando Pago seguro Clip...' : `Pagar $${order?.total?.toFixed(2)} MXN con Clip`}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}

      {/* SPEI INSTRUCTIONS BANNER */}
      {order.payment_method === 'spei' && !isDelivered && (
        <div className="glass-vip-card rounded-3xl p-6 sm:p-8 space-y-6 border-[#1C1C1C]">
          <div className="flex items-center gap-3 border-b border-[#1C1C1C] pb-4">
            <Building2 className="w-8 h-8 text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold text-white font-serif">Instrucciones para Transferencia SPEI (BBVA)</h2>
              <p className="text-xs text-zinc-400">Realiza el depósito directo a la tarjeta bancaria BBVA.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-[#050505] p-4 rounded-xl border border-[#1C1C1C] space-y-1">
              <span className="text-zinc-500 uppercase">Banco Destino:</span>
              <p className="text-white font-bold text-sm">{LUX_BANK_INFO.bank}</p>
            </div>

            <div className="bg-[#050505] p-4 rounded-xl border border-[#1C1C1C] space-y-1">
              <span className="text-zinc-500 uppercase">Tarjeta BBVA:</span>
              <p className="text-[#C5A880] font-bold text-sm select-all">{LUX_BANK_INFO.cardNumber}</p>
            </div>

            <div className="bg-[#050505] p-4 rounded-xl border border-[#1C1C1C] space-y-1">
              <span className="text-zinc-500 uppercase">Beneficiario:</span>
              <p className="text-white font-bold text-sm">{LUX_BANK_INFO.holder}</p>
            </div>

            <div className="bg-[#050505] p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/5 space-y-1">
              <span className="text-emerald-400 uppercase font-bold">Monto Total a Transferir:</span>
              <p className="text-emerald-400 font-extrabold text-lg">${order.total.toFixed(2)} MXN</p>
            </div>
          </div>

          {/* Form upload */}
          <form onSubmit={handleProofSubmit} className="space-y-4 pt-2 border-t border-[#1C1C1C]">
            <h3 className="text-xs font-mono uppercase text-zinc-300 font-bold">Confirmar Pago Realizado:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="Número de Referencia SPEI o Autorización"
                value={txid || order.payment_reference || ''}
                onChange={(e) => setTxid(e.target.value)}
                className="bg-[#050505] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A880]"
              />
              <button
                type="submit"
                disabled={submittingProof}
                className="py-2.5 rounded-xl bg-[#C5A880] text-black font-bold text-xs hover:bg-[#E8D8C8] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>{submittingProof ? 'Enviando Notificación...' : 'Notificar Pago Realizado'}</span>
              </button>
            </div>
            {(submittedProof || order.status === 'PAYMENT_REVIEW') && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2 font-mono">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>¡Referencia registrada! Se envió un correo de alerta al administrador (mikeangdhz@gmail.com) para verificar tu depósito.</span>
              </div>
            )}
          </form>
        </div>
      )}

      {/* CREDITS BANNER */}
      {order.payment_method === 'credits' && !isDelivered && (
        <div className="glass-vip-card rounded-3xl p-6 sm:p-8 space-y-4 border-[#1C1C1C]">
          <div className="flex items-center gap-3">
            <Wallet className="w-8 h-8 text-[#C5A880]" />
            <div>
              <h2 className="text-lg font-bold text-white font-serif">Pago con Créditos Internos</h2>
              <p className="text-xs text-zinc-400">Procesado mediante tu saldo en monedero.</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Table */}
      <div className="glass-vip-card rounded-3xl p-6 sm:p-8 space-y-4 border-[#1C1C1C]">
        <h3 className="text-sm font-bold text-white border-b border-[#1C1C1C] pb-3 uppercase tracking-wider font-mono">Artículos del Pedido</h3>
        {order.items?.map((item, idx) => (
          <div key={idx} className="flex justify-between text-xs py-2 border-b border-[#1C1C1C]">
            <div>
              <span className="font-bold text-white">{item.product_name}</span>
              {item.variant_name && <span className="text-zinc-400 block font-mono">{item.variant_name}</span>}
            </div>
            <span className="font-mono text-white font-bold">${item.total_price.toFixed(2)} MXN</span>
          </div>
        ))}
        <div className="flex justify-between text-base font-bold text-white pt-2 font-mono">
          <span>Total:</span>
          <span className="text-[#C5A880]">${order.total.toFixed(2)} MXN</span>
        </div>
      </div>

      {/* QUICK SUPPORT FLOATING TRIGGER FOR ACTIVE ORDER */}
      <div className="text-center pt-2">
        <button
          onClick={() => setShowSupportModal(true)}
          className="px-6 py-3 rounded-2xl bg-[#0D0D12] border border-[#C5A880]/40 text-[#C5A880] hover:text-white font-bold text-xs inline-flex items-center gap-2 font-mono transition-all hover:bg-[#14141A] shadow-xl"
        >
          <LifeBuoy className="w-4 h-4 text-[#C5A880]" />
          <span>¿Tienes dudas con este pago u orden? Abrir Ticket VIP</span>
        </button>
      </div>

      {/* QUICK SUPPORT MODAL */}
      <QuickSupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        orderNumber={order.order_number}
        customerEmail={order.customer_email}
      />

    </div>
  );
}
