'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Building2, Coins, Save, CheckCircle2 } from 'lucide-react';
import { LUX_BANK_INFO } from '@/data/luxCatalog';

export default function AdminPaymentsPage() {
  const [bankName, setBankName] = useState(LUX_BANK_INFO.bank);
  const [cardNumber, setCardNumber] = useState(LUX_BANK_INFO.cardNumber);
  const [holder, setHolder] = useState(LUX_BANK_INFO.holder);
  const [usdtAddress, setUsdtAddress] = useState('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lux_payment_config');
      if (stored) {
        const config = JSON.parse(stored);
        if (config.bankName) setBankName(config.bankName);
        if (config.cardNumber) setCardNumber(config.cardNumber);
        if (config.holder) setHolder(config.holder);
        if (config.usdtAddress) setUsdtAddress(config.usdtAddress);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = { bankName, cardNumber, holder, usdtAddress };
      localStorage.setItem('lux_payment_config', JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="border-b border-[#242424] pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 font-sans">
          <CreditCard className="w-8 h-8 text-[#C5A880]" /> Configuración de Métodos de Pago
        </h1>
        <p className="text-sm text-zinc-400 mt-1 font-mono">
          Ajustes para pasarelas Clip, Cuentas Bancarias SPEI BBVA y Wallets de Criptomonedas.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>Configuración oficial de pasarelas de pago guardada exitosamente.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* SPEI Config */}
        <div className="bg-[#101010] border border-[#242424] rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#242424] pb-3 font-sans">
            <Building2 className="w-5 h-5 text-emerald-400" /> Datos Bancarios Oficiales para Transferencia SPEI
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="block uppercase text-zinc-400 mb-1">Banco Destino:</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-[#050505] border border-[#242424] rounded-xl px-4 py-2.5 text-white focus:border-[#C5A880] focus:outline-none"
              />
            </div>

            <div>
              <label className="block uppercase text-zinc-400 mb-1">Tarjeta BBVA / CLABE:</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full bg-[#050505] border border-[#242424] rounded-xl px-4 py-2.5 text-[#C5A880] font-bold focus:border-[#C5A880] focus:outline-none"
              />
            </div>

            <div>
              <label className="block uppercase text-zinc-400 mb-1">Nombre Beneficiario:</label>
              <input
                type="text"
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
                className="w-full bg-[#050505] border border-[#242424] rounded-xl px-4 py-2.5 text-white focus:border-[#C5A880] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Crypto Config */}
        <div className="bg-[#101010] border border-[#242424] rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#242424] pb-3 font-sans">
            <Coins className="w-5 h-5 text-[#C5A880]" /> Wallet Criptomonedas (USDT TRC20 / Polygon)
          </h3>

          <div className="text-xs font-mono">
            <label className="block uppercase text-zinc-400 mb-1">Dirección Wallet USDT TRC20:</label>
            <input
              type="text"
              value={usdtAddress}
              onChange={(e) => setUsdtAddress(e.target.value)}
              className="w-full bg-[#050505] border border-[#242424] rounded-xl px-4 py-2.5 text-[#C5A880] font-bold focus:border-[#C5A880] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3.5 rounded-xl glow-gold-btn text-black font-bold text-xs flex items-center gap-2 shadow-xl"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Configuración de Pagos</span>
        </button>
      </form>
    </div>
  );
}
