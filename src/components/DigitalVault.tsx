'use client';

import React, { useState } from 'react';
import { Lock, Unlock, Eye, EyeOff, Copy, ShieldCheck, CheckCircle2, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface VaultItem {
  id: string;
  orderNumber: string;
  productName: string;
  variantName?: string;
  deliveredContent: string;
  purchaseDate: string;
  warrantyDays: number;
}

export function DigitalVault({ items }: { items: VaultItem[] }) {
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="glass-vip-card rounded-3xl p-6 border-[#D4AF37]/30 shadow-goldGlow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFF5C0] via-[#D4AF37] to-[#AA771C] p-[1px]">
            <div className="w-full h-full bg-[#080808] rounded-[15px] flex items-center justify-center text-black">
              <Lock className="w-6 h-6 text-[#D4AF37]" />
            </div>
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-white">Mi Bóveda Digital VIP</h2>
            <p className="text-xs text-zinc-400">Tus accesos y productos digitales protegidos con cifrado AES-256-GCM.</p>
          </div>
        </div>

        <span className="px-3.5 py-1 rounded-full bg-[#030303] border border-[#D4AF37]/40 text-xs font-mono font-bold text-[#FFF5C0]">
          {items.length} Accesos Almacenados
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const isRevealed = revealedIds[item.id] || false;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-vip-card rounded-3xl p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#27272A] pb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">{item.productName}</h3>
                  {item.variantName && (
                    <span className="text-xs text-[#D4AF37] font-mono font-bold">{item.variantName}</span>
                  )}
                </div>

                <div className="text-right text-xs text-zinc-400 font-mono">
                  Orden: <span className="text-white font-bold">{item.orderNumber}</span>
                </div>
              </div>

              {/* Encrypted Vault Safe Container */}
              <div className="bg-[#030303] border border-[#D4AF37]/30 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-mono uppercase font-bold flex items-center gap-1.5">
                    {isRevealed ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-[#D4AF37]" />}
                    Contenido de la Bóveda:
                  </span>
                  
                  <button
                    onClick={() => toggleReveal(item.id)}
                    className="text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 bg-[#09090B] border border-[#D4AF37]/30 px-3.5 py-1.5 rounded-xl transition-colors font-mono"
                  >
                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />}
                    <span>{isRevealed ? 'Ocultar Secretos' : 'Revelar Datos VIP'}</span>
                  </button>
                </div>

                <div className="bg-[#080808] border border-[#27272A] rounded-xl p-4 font-mono text-sm sm:text-base font-bold text-[#FFF5C0] flex items-center justify-between gap-4 overflow-x-auto">
                  <span>
                    {isRevealed ? item.deliveredContent : '••••••••••••••••••••••••••••••••'}
                  </span>

                  <button
                    onClick={() => handleCopy(item.deliveredContent, item.id)}
                    className="p-2.5 rounded-xl bg-[#18181B] text-zinc-300 hover:text-white hover:border-[#D4AF37] border border-transparent transition-all flex-shrink-0"
                    title="Copiar al Portapapeles"
                  >
                    <Copy className="w-4 h-4 text-[#D4AF37]" />
                  </button>
                </div>

                {copiedId === item.id && (
                  <p className="text-xs text-emerald-400 font-mono">¡Contenido copiado al portapapeles con éxito!</p>
                )}
              </div>

              {/* Warranty Bar */}
              <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 pt-1 font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" /> Cobertura activa: {item.warrantyDays} Días de Garantía
                </span>
                <span className="text-zinc-500">Fecha de compra: {item.purchaseDate}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
