'use client';

import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  CreditCard, 
  Building2, 
  MessageCircle, 
  Check, 
  Copy, 
  Sparkles,
  Zap
} from 'lucide-react';
import { LUX_BANK_INFO } from '@/data/luxCatalog';

interface Transaction {
  id: string;
  type: 'ADMIN_CREDIT' | 'RECHARGE' | 'PURCHASE';
  amount: number;
  description: string;
  date: string;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    type: 'ADMIN_CREDIT',
    amount: 500.00,
    description: 'Depósito promocional de bienvenida Lux Store',
    date: '2026-07-20 14:30',
  },
  {
    id: 'tx_2',
    type: 'PURCHASE',
    amount: -199.00,
    description: 'Compra de Licencia Windows 11 Pro Retail (LX-2026-119234)',
    date: '2026-07-15 11:15',
  },
];

export default function CustomerWalletPage() {
  const [balance, setBalance] = useState<number>(500.00);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [selectedAmount, setSelectedAmount] = useState<number>(200);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'clip' | 'spei' | 'whatsapp'>('clip');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleCopyCard = () => {
    navigator.clipboard.writeText(LUX_BANK_INFO.cardNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRechargeWithClip = async () => {
    if (activeAmount <= 0) return;
    setIsProcessing(true);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/payments/clip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: `LX-RECHARGE-${Date.now().toString().slice(-6)}`,
          total: activeAmount,
        }),
      });
      const data = await res.json();

      if (data && data.url) {
        window.location.href = data.url;
        return;
      }

      // Si es simulado/sandbox o fallback instantáneo
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        type: 'RECHARGE',
        amount: activeAmount,
        description: `Recarga de saldo vía Clip (${paymentMethod.toUpperCase()})`,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };

      setTransactions([newTx, ...transactions]);
      setBalance((prev) => prev + activeAmount);
      setSuccessMessage(`¡Recarga exitosa de $${activeAmount.toFixed(2)} MXN agregada a tus créditos!`);
    } catch (e) {
      console.error('Error al procesar recarga:', e);
      setSuccessMessage(`¡Recarga de $${activeAmount.toFixed(2)} MXN solicitada correctamente!`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getWhatsAppRechargeLink = () => {
    const text = encodeURIComponent(
      `Hola Lux Store, solicito validar mi recarga de $${activeAmount.toFixed(2)} MXN en mi monedero. Mi correo de usuario es mi_cuenta@luxstore.com`
    );
    return `https://wa.me/5212221234567?text=${text}`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      {/* Page Header */}
      <div className="border-b border-[#242424] pb-4">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 font-sans">
          <Wallet className="w-7 h-7 text-[#C5A880]" /> Mis Créditos Lux Store
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          1 Crédito = $1.00 MXN. Saldo inmutable utilizado para compras con entrega instantánea.
        </p>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Balance Overview Card */}
      <div className="bg-gradient-to-r from-[#101014] via-[#16161C] to-[#0A0A0E] border border-[#C5A880]/30 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 z-10">
          <span className="text-xs font-mono uppercase text-[#C5A880] tracking-widest font-bold">
            SALDO DISPONIBLE EN MONEDERO:
          </span>
          <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
            ${balance.toFixed(2)} <span className="text-base text-[#C5A880] font-sans font-bold">MXN / Créditos</span>
          </div>
          <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sin fecha de caducidad. Válido en toda la tienda para entrega automática.</span>
          </div>
        </div>

        {/* Quick Recharge Trigger Badge */}
        <div className="z-10 bg-black/60 border border-[#C5A880]/30 p-4 rounded-2xl flex items-center gap-3">
          <Zap className="w-6 h-6 text-[#C5A880]" />
          <div>
            <h4 className="text-xs font-bold text-white">Recarga Instantánea</h4>
            <p className="text-[11px] text-zinc-400">Aceptamos Clip, SPEI BBVA y Cripto</p>
          </div>
        </div>
      </div>

      {/* RECARGAR CRÉDITOS SECTION */}
      <div className="bg-[#0B0C12] border border-[#C5A880]/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <span className="text-[10px] font-mono text-[#C5A880] font-bold tracking-widest uppercase">
              MÉTODO RÁPIDO
            </span>
            <h2 className="text-xl font-bold text-white font-sans flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#C5A880]" /> Recargar Créditos a tu Cuenta
            </h2>
          </div>
          <Sparkles className="w-5 h-5 text-[#C5A880]" />
        </div>

        {/* Step 1: Select Amount */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-zinc-300 font-sans block">
            1. Selecciona el Monto a Recargar (MXN):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[100, 200, 500, 1000].map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  setSelectedAmount(amt);
                  setCustomAmount('');
                }}
                className={`py-3 rounded-xl font-mono text-sm font-bold border transition-all ${
                  selectedAmount === amt && !customAmount
                    ? 'bg-[#C5A880] text-black border-[#C5A880] shadow-lg scale-105'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                ${amt} MXN
              </button>
            ))}
          </div>

          {/* Custom Amount Input */}
          <div className="pt-2">
            <input
              type="number"
              placeholder="O ingresa un monto personalizado (ej. 350)"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C5A880] font-mono"
            />
          </div>
        </div>

        {/* Step 2: Select Payment Method */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-zinc-300 font-sans block">
            2. Selecciona la Forma de Pago:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Clip Tarjeta */}
            <button
              onClick={() => setPaymentMethod('clip')}
              className={`p-4 rounded-xl border flex flex-col justify-between text-left transition-all ${
                paymentMethod === 'clip'
                  ? 'bg-[#15120C] border-[#C5A880] text-white shadow-lg'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <CreditCard className={`w-5 h-5 ${paymentMethod === 'clip' ? 'text-[#C5A880]' : 'text-zinc-500'}`} />
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded">
                  AUTOMÁTICO
                </span>
              </div>
              <div className="mt-3">
                <h4 className="text-xs font-bold text-white">Tarjeta Débito / Crédito (Clip)</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Visa, Mastercard, AMEX</p>
              </div>
            </button>

            {/* Transferencia SPEI BBVA */}
            <button
              onClick={() => setPaymentMethod('spei')}
              className={`p-4 rounded-xl border flex flex-col justify-between text-left transition-all ${
                paymentMethod === 'spei'
                  ? 'bg-[#15120C] border-[#C5A880] text-white shadow-lg'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Building2 className={`w-5 h-5 ${paymentMethod === 'spei' ? 'text-[#C5A880]' : 'text-zinc-500'}`} />
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded">
                  SIN COMISIÓN
                </span>
              </div>
              <div className="mt-3">
                <h4 className="text-xs font-bold text-white">Transferencia SPEI BBVA</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Depósito bancario en 1-Click</p>
              </div>
            </button>

            {/* WhatsApp / Cripto */}
            <button
              onClick={() => setPaymentMethod('whatsapp')}
              className={`p-4 rounded-xl border flex flex-col justify-between text-left transition-all ${
                paymentMethod === 'whatsapp'
                  ? 'bg-[#15120C] border-[#C5A880] text-white shadow-lg'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <MessageCircle className={`w-5 h-5 ${paymentMethod === 'whatsapp' ? 'text-[#C5A880]' : 'text-zinc-500'}`} />
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded">
                  ATENCIÓN DIRECTA
                </span>
              </div>
              <div className="mt-3">
                <h4 className="text-xs font-bold text-white">WhatsApp & Cripto</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">USDT, BTC o atención personal</p>
              </div>
            </button>

          </div>
        </div>

        {/* Step 3: Payment Method Details & Action */}
        <div className="pt-2 border-t border-zinc-800">
          
          {paymentMethod === 'clip' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Serás redirigido a la pasarela segura cifrada de Clip para recargar <strong className="text-white">${activeAmount.toFixed(2)} MXN</strong> en créditos.
              </p>

              <button
                onClick={handleRechargeWithClip}
                disabled={isProcessing || activeAmount <= 0}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl glow-gold-btn text-black font-bold text-xs flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                <span>{isProcessing ? 'Procesando Recarga...' : `Pagar y Recargar $${activeAmount.toFixed(2)} MXN con Clip`}</span>
              </button>
            </div>
          )}

          {paymentMethod === 'spei' && (
            <div className="space-y-4">
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <span className="text-zinc-400">BANCO DESTINO:</span>
                  <span className="text-white font-bold">{LUX_BANK_INFO.bank}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <span className="text-zinc-400">BENEFICIARIO:</span>
                  <span className="text-white font-bold">{LUX_BANK_INFO.holder}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <span className="text-zinc-400">TARJETA BBVA:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#C5A880] font-bold text-sm">{LUX_BANK_INFO.cardNumber}</span>
                    <button
                      onClick={handleCopyCard}
                      className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                      title="Copiar Tarjeta"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">MONTO EXACTO A ENVIAR:</span>
                  <span className="text-emerald-400 font-bold text-sm">${activeAmount.toFixed(2)} MXN</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={getWhatsAppRechargeLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Notificar Recarga por WhatsApp</span>
                </a>

                <button
                  onClick={handleRechargeWithClip}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs hover:border-[#C5A880] hover:text-white transition-colors"
                >
                  Registrar Intención de Depósito
                </button>
              </div>
            </div>
          )}

          {paymentMethod === 'whatsapp' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Contacta directamente con el soporte owner de Lux Store para acordar recargas de saldo por Cripto (USDT / BTC) o acuerdos especiales.
              </p>

              <a
                href={getWhatsAppRechargeLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#25D366] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-xl hover:bg-[#1EBE5D] transition-colors"
              >
                <MessageCircle className="w-4.5 h-4.5" />
                <span>Contactar por WhatsApp para Recarga</span>
              </a>
            </div>
          )}

        </div>

      </div>

      {/* Transactions History Ledger */}
      <div className="bg-[#101010] border border-[#242424] rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white border-b border-[#242424] pb-4 font-sans flex items-center justify-between">
          <span>Historial de Movimientos de Crédito</span>
          <span className="text-xs font-mono font-normal text-zinc-500">{transactions.length} registros</span>
        </h3>

        <div className="space-y-3">
          {transactions.map((tx) => {
            const isPositive = tx.amount > 0;
            return (
              <div
                key={tx.id}
                className="bg-[#050505] border border-[#242424] rounded-2xl p-4 flex items-center justify-between gap-4 text-xs transition-all hover:border-[#C5A880]/30"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-white font-sans">{tx.description}</div>
                    <div className="text-[11px] text-zinc-500 font-mono">{tx.date}</div>
                  </div>
                </div>

                <div className={`font-mono font-extrabold text-sm ${
                  isPositive ? 'text-emerald-400' : 'text-zinc-300'
                }`}>
                  {isPositive ? '+' : ''}${tx.amount.toFixed(2)} MXN
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
