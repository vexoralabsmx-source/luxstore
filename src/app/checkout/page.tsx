'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CreditCard, 
  Building2, 
  Wallet as WalletIcon, 
  Lock, 
  AlertCircle,
  ArrowRight,
  Copy,
  LifeBuoy
} from 'lucide-react';
import { PaymentMethod } from '@/types';
import { LUX_BANK_INFO } from '@/data/luxCatalog';
import { QuickSupportModal } from '@/components/QuickSupportModal';
import { createClient } from '@/lib/supabase/client';

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('clip');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const [coupon, setCoupon] = useState<{ code?: string; discountAmount: number }>({ discountAmount: 0 });
  const [userCredits, setUserCredits] = useState<number>(0.00); // Saldo real $0.00 MXN
  const [copiedCard, setCopiedCard] = useState(false);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('lux_cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }

      const storedCoupon = localStorage.getItem('lux_coupon');
      if (storedCoupon) {
        setCoupon(JSON.parse(storedCoupon));
      }

      const supabase = createClient();
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) return;
        setEmail(user.email || '');
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle();
        setUserCredits(Number(wallet?.balance || 0));
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.sale_price || item.base_price) * item.quantity,
    0
  );

  const discountAmount = coupon.discountAmount || 0;
  const total = Math.max(0, subtotal - discountAmount);

  const handleCopyCard = () => {
    navigator.clipboard.writeText(LUX_BANK_INFO.cardNumber.replace(/\s+/g, ''));
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2000);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido');
      return;
    }

    if (!acceptedTerms) {
      setErrorMsg('Debes aceptar los términos y condiciones para continuar');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMsg('Tu carrito se encuentra vacío');
      return;
    }

    if (paymentMethod === 'credits' && userCredits < total) {
      setErrorMsg(`Saldo en créditos insuficiente. Tu saldo actual es de $${userCredits.toFixed(2)} MXN. Por favor selecciona Clip o Transferencia SPEI.`);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        customerEmail: email,
        paymentMethod,
        items: cartItems.map((item) => ({
          productId: item.product_id || item.id,
          variantId: item.variant_id,
          quantity: Number(item.quantity) || 1,
        })),
        customerNotes,
        couponCode: coupon.code,
        }),
      });
      const res = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(res.error || 'No se pudo crear el pedido');

      const orderNumber = res.orderNumber;

      // Vaciar carrito
      localStorage.removeItem('lux_cart');
      localStorage.removeItem('lux_coupon');
      window.dispatchEvent(new Event('cart-updated'));

      // 2. Redireccionar según el método de pago seleccionado
      if (paymentMethod === 'clip') {
        try {
          const clipApiRes = await fetch('/api/payments/clip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderNumber }),
          });
          const clipData = await clipApiRes.json();
          if (clipData && clipData.url && !clipData.simulated) {
            window.location.href = clipData.url;
            return;
          }
        } catch (clipErr) {
          console.error('Error al generar pasarela Clip:', clipErr);
        }
        throw new Error('No se pudo abrir Clip. Revisa el token de Checkout.');
      } else if (paymentMethod === 'spei') {
        router.push(`/order/${orderNumber}?method=spei`);
      } else {
        router.push(`/order/${orderNumber}?method=credits`);
      }
    } catch (e: any) {
      console.error(e);
      setLoading(false);
      setErrorMsg(e?.message || 'Ocurrió un error al procesar el pago. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="border-b border-[#1C1C1C] pb-6">
        <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
          Checkout Seguro Lux Store <span className="text-xs px-3 py-1 bg-[#09090B] border border-[#1C1C1C] text-[#C5A880] rounded-full font-mono font-normal flex items-center gap-1"><Lock className="w-3 h-3" /> Cifrado 256-bit</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">Completa tu correo y selecciona tu método de pago preferido.</p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3 font-mono">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Section 1: Email */}
          <div className="glass-vip-card rounded-3xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#C5A880]/10 text-[#C5A880] font-mono text-xs flex items-center justify-center font-bold">1</span>
              Datos para Entrega Digital Automática
            </h2>
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C5A880]"
              />
              <p className="text-[11px] text-zinc-500 mt-1.5 font-mono">
                Aquí recibirás las credenciales y el acceso a tu bóveda digital.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Notas opcionales para el pedido
              </label>
              <textarea
                rows={2}
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Indicaciones especiales..."
                className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A880]"
              />
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="glass-vip-card rounded-3xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#C5A880]/10 text-[#C5A880] font-mono text-xs flex items-center justify-center font-bold">2</span>
              Selecciona Método de Pago
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Clip */}
              <button
                type="button"
                onClick={() => setPaymentMethod('clip')}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  paymentMethod === 'clip'
                    ? 'bg-[#141414] border-[#C5A880]'
                    : 'bg-[#050505] border-[#1C1C1C] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-5 h-5 text-[#C5A880]" />
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Inmediato</span>
                </div>
                <div className="text-xs font-bold text-white">Tarjeta Débito / Crédito (Clip)</div>
                <div className="text-[11px] text-zinc-400 mt-1">Visa, Mastercard, AMEX.</div>
              </button>

              {/* SPEI */}
              <button
                type="button"
                onClick={() => setPaymentMethod('spei')}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  paymentMethod === 'spei'
                    ? 'bg-[#141414] border-[#C5A880]'
                    : 'bg-[#050505] border-[#1C1C1C] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">BBVA</span>
                </div>
                <div className="text-xs font-bold text-white">Transferencia SPEI (BBVA)</div>
                <div className="text-[11px] text-zinc-400 mt-1">Depósito a tarjeta BBVA.</div>
              </button>

              {/* Internal Credits */}
              <button
                type="button"
                onClick={() => setPaymentMethod('credits')}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  paymentMethod === 'credits'
                    ? 'bg-[#141414] border-[#C5A880]'
                    : 'bg-[#050505] border-[#1C1C1C] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <WalletIcon className="w-5 h-5 text-[#C5A880]" />
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C5A880]/10 text-[#E8D8C8] border border-[#C5A880]/30 font-bold">
                    ${userCredits.toFixed(2)} MXN
                  </span>
                </div>
                <div className="text-xs font-bold text-white">Créditos Internos</div>
                <div className="text-[11px] text-zinc-400 mt-1">Paga con tu saldo de cuenta.</div>
              </button>

            </div>

            {/* Display SPEI BBVA Details */}
            {paymentMethod === 'spei' && (
              <div className="p-5 rounded-2xl bg-[#050505] border border-[#C5A880]/40 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-2">
                  <span className="text-[#C5A880] font-bold flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" /> Datos para Pago por Transferencia SPEI (BBVA)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCard}
                    className="text-[11px] text-zinc-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-[#141414] border border-[#1C1C1C]"
                  >
                    <Copy className="w-3 h-3 text-[#C5A880]" />
                    <span>{copiedCard ? '¡Copiado!' : 'Copiar Tarjeta'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Banco Destino:</span>
                    <span className="text-white font-bold">{LUX_BANK_INFO.bank}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Beneficiario:</span>
                    <span className="text-white font-bold">{LUX_BANK_INFO.holder}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Tarjeta BBVA:</span>
                    <span className="text-[#C5A880] font-bold">{LUX_BANK_INFO.cardNumber}</span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-vip-card rounded-3xl p-6 space-y-6">
            <h2 className="text-base font-bold text-white border-b border-[#1C1C1C] pb-4">
              Resumen Final del Pedido
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-[#1C1C1C]">
                  <div>
                    <div className="font-bold text-white">{item.name}</div>
                    {item.variant_name && <div className="text-[11px] text-[#C5A880]">{item.variant_name}</div>}
                    <div className="text-zinc-500 font-mono text-[11px] mt-1">
                      Cantidad: <span className="text-[#C5A880] font-bold">{Number(item.quantity) || 1} unidad(es)</span>
                    </div>
                  </div>
                  <div className="font-mono text-white font-bold">
                    ${((item.sale_price || item.base_price || 0) * (Number(item.quantity) || 1)).toFixed(2)} MXN
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 text-xs font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal:</span>
                <span className="text-white">${subtotal.toFixed(2)} MXN</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Descuento:</span>
                  <span>-${discountAmount.toFixed(2)} MXN</span>
                </div>
              )}
              <hr className="border-[#1C1C1C]" />
              <div className="flex justify-between text-base font-bold text-white">
                <span>Total a Pagar:</span>
                <span className="text-[#C5A880]">${total.toFixed(2)} MXN</span>
              </div>
            </div>

            <label className="flex items-start gap-2 text-xs text-zinc-400 cursor-pointer pt-2">
              <input
                type="checkbox"
                required
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 rounded bg-[#050505] border-[#1C1C1C] text-[#C5A880]"
              />
              <span>
                Acepto los <Link href="/terms" target="_blank" className="text-[#C5A880] underline">Términos y Condiciones</Link> y la <Link href="/refunds" target="_blank" className="text-[#C5A880] underline">Política de Reemplazos</Link>.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#C5A880] text-black font-bold text-xs hover:bg-[#E8D8C8] transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Generando Pedido...' : 'Confirmar y Pagar Pedido'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Support Option while paying */}
            <div className="pt-3 border-t border-[#1C1C1C] text-center">
              <button
                type="button"
                onClick={() => setShowSupportModal(true)}
                className="text-xs text-[#C5A880] hover:underline font-mono inline-flex items-center gap-1.5 font-bold"
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                <span>¿Dudas con tu pago o compra? Abrir Ticket VIP</span>
              </button>
            </div>
          </div>
        </div>

      </form>

      {/* QUICK SUPPORT MODAL */}
      <QuickSupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        customerEmail={email}
      />

    </div>
  );
}
