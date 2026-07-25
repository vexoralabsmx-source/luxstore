'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  Tag, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { validateCoupon } from '@/services/couponService';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponState, setCouponState] = useState<{
    applied: boolean;
    code?: string;
    discountAmount: number;
    message?: string;
    isError?: boolean;
  }>({ applied: false, discountAmount: 0 });
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    loadCart();
    window.addEventListener('cart-updated', loadCart);
    return () => window.removeEventListener('cart-updated', loadCart);
  }, []);

  const loadCart = () => {
    try {
      const stored = localStorage.getItem('lux_cart');
      if (stored) {
        const parsed: any[] = JSON.parse(stored);
        setCartItems(parsed.map((item) => ({ ...item, quantity: Math.max(1, Number(item.quantity) || 1) })));
      } else {
        setCartItems([]);
      }
    } catch (e) {
      setCartItems([]);
    }
  };

  const updateQuantity = (index: number, newQty: number) => {
    const updated = [...cartItems];
    const max = Math.max(1, Number(updated[index].stock) || 1);
    updated[index].quantity = Math.max(1, Math.min(max, newQty));
    setCartItems(updated);
    localStorage.setItem('lux_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const removeItem = (index: number) => {
    const updated = cartItems.filter((_, i) => i !== index);
    setCartItems(updated);
    localStorage.setItem('lux_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('lux_cart');
    window.dispatchEvent(new Event('cart-updated'));
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.sale_price || item.base_price) * item.quantity,
    0
  );

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);

    const res = await validateCoupon(couponCode, subtotal);
    setValidatingCoupon(false);

    if (res.valid) {
      setCouponState({
        applied: true,
        code: res.code,
        discountAmount: res.discount_amount || 0,
        message: res.message,
        isError: false,
      });
    } else {
      setCouponState({
        applied: false,
        discountAmount: 0,
        message: res.message,
        isError: true,
      });
    }
  };

  const finalTotal = Math.max(0, subtotal - couponState.discountAmount);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-[#101010] border border-[#242424] flex items-center justify-center mx-auto text-zinc-500">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Tu carrito está vacío</h1>
        <p className="text-sm text-zinc-400 max-w-sm mx-auto">
          Explora nuestro catálogo digital y añade tus licencias o cuentas favoritas.
        </p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] text-black font-bold text-sm hover:shadow-glow transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explorar Productos</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex items-center justify-between border-b border-[#242424] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Carrito de Compras</h1>
          <p className="text-sm text-zinc-400 mt-1">Revisa tus productos antes de realizar el checkout seguro.</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Vaciar Carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item, index) => (
            <div
              key={index}
              className="bg-[#101010] border border-[#242424] rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              {/* Product Info */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-16 h-16 rounded-xl bg-[#0A0A0A] border border-[#242424] overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{item.name}</h3>
                  {item.variant_name && (
                    <span className="inline-block text-xs text-[#00E5FF] font-mono mt-0.5">
                      Variante: {item.variant_name}
                    </span>
                  )}
                  <div className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Zap className="w-3 h-3" /> Entrega Inmediata
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Price */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#242424]">
                
                <div className="flex items-center gap-2 bg-[#050505] border border-[#242424] rounded-xl px-2 py-1.5 font-mono text-xs">
                  <button
                    onClick={() => updateQuantity(index, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="p-1 text-zinc-300 disabled:opacity-30"
                    aria-label="Reducir cantidad"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[#C5A880] font-bold min-w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(index, item.quantity + 1)}
                    disabled={item.quantity >= Math.max(1, Number(item.stock) || 1)}
                    className="p-1 text-zinc-300 disabled:opacity-30"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Price */}
                <div className="text-right">
                  <div className="text-base font-extrabold text-white font-mono">
                    ${((item.sale_price || item.base_price) * item.quantity).toFixed(2)} <span className="text-xs text-[#00E5FF]">MXN</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    ${item.sale_price || item.base_price} c/u
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(index)}
                  className="p-2 text-zinc-500 hover:text-rose-400 transition-colors"
                  title="Eliminar artículo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

              </div>
            </div>
          ))}

          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white pt-2"
          >
            <ArrowLeft className="w-4 h-4 text-[#00E5FF]" />
            <span>Seguir comprando en el catálogo</span>
          </Link>
        </div>

        {/* Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-[#101010] border border-[#242424] rounded-3xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-[#242424] pb-4">
              Resumen del Pedido
            </h2>

            {/* Coupon input */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                Cupón de Descuento
              </label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Tag className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ej. LUX10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#050505] border border-[#242424] rounded-xl pl-9 pr-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="px-4 py-2 bg-[#1A1A1A] border border-[#242424] hover:border-[#00E5FF] text-white text-xs font-semibold rounded-xl transition-all"
                >
                  {validatingCoupon ? '...' : 'Aplicar'}
                </button>
              </div>

              {couponState.message && (
                <div className={`text-xs p-2.5 rounded-xl border flex items-center gap-2 mt-2 ${
                  couponState.isError 
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  {couponState.isError ? <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
                  <span>{couponState.message}</span>
                </div>
              )}
            </div>

            {/* Breakdown */}
            <div className="space-y-3 pt-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal:</span>
                <span className="font-mono text-white">${subtotal.toFixed(2)} MXN</span>
              </div>

              {couponState.applied && (
                <div className="flex justify-between text-emerald-400">
                  <span>Descuento ({couponState.code}):</span>
                  <span className="font-mono">-${couponState.discountAmount.toFixed(2)} MXN</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-400">
                <span>Comisión de Entrega:</span>
                <span className="text-emerald-400 text-xs font-mono">GRATIS $0.00</span>
              </div>

              <hr className="border-[#242424]" />

              <div className="flex justify-between text-lg font-extrabold text-white">
                <span>Total a Pagar:</span>
                <span className="font-mono text-[#00E5FF]">${finalTotal.toFixed(2)} MXN</span>
              </div>
            </div>

            <button
              onClick={() => {
                // Guardar info de cupón temporalmente para checkout
                if (couponState.applied) {
                  localStorage.setItem('lux_coupon', JSON.stringify(couponState));
                }
                router.push('/checkout');
              }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] text-black font-bold text-sm hover:shadow-glow transition-all flex items-center justify-center gap-2"
            >
              <span>Proceder al Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-zinc-500 text-center flex items-center justify-center gap-1 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Checkout protegido con cifrado SSL & Turnstile</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
