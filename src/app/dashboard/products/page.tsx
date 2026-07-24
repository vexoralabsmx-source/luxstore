'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  KeyRound, 
  Eye, 
  EyeOff, 
  Copy, 
  ShieldCheck, 
  MessageSquare, 
  Zap, 
  Clock, 
  Download 
} from 'lucide-react';

const DEMO_PURCHASED_PRODUCTS = [
  {
    id: 'del_1',
    order_number: 'LX-2026-881923',
    product_name: 'Spotify Premium 1 Año',
    variant_name: '12 Meses (Invitación / Código)',
    delivered_content: 'SPOTIFY-PREMIUM-KEY-LX2026-99A8-77B3',
    warranty_days: 365,
    purchase_date: '2026-07-20',
    expires_at: '2027-07-20',
  },
  {
    id: 'del_2',
    order_number: 'LX-2026-119234',
    product_name: 'Licencia Windows 11 Pro Retail',
    variant_name: 'Licencia 1 PC OEM / Retail',
    delivered_content: 'W11PRO-X892-7A12-9901-LUXKEY',
    warranty_days: 365,
    purchase_date: '2026-07-15',
    expires_at: '2027-07-15',
  },
];

export default function CustomerProductsPage() {
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
      <div className="border-b border-[#242424] pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <KeyRound className="w-6 h-6 text-[#00E5FF]" /> Mis Productos Digitales
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Consulta y revela tus accesos, claves y membresías en cualquier momento.
        </p>
      </div>

      <div className="space-y-4">
        {DEMO_PURCHASED_PRODUCTS.map((prod) => {
          const isRevealed = revealedIds[prod.id] || false;

          return (
            <div key={prod.id} className="bg-[#101010] border border-[#242424] rounded-3xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#242424] pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">{prod.product_name}</h3>
                  <span className="text-xs text-[#00E5FF] font-mono">{prod.variant_name}</span>
                </div>
                <div className="text-right text-xs text-zinc-400 font-mono">
                  Orden: <Link href={`/order/${prod.order_number}`} className="text-white underline">{prod.order_number}</Link>
                </div>
              </div>

              {/* Secret box */}
              <div className="bg-[#050505] border border-[#242424] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-mono uppercase">Contenido del producto:</span>
                  <button
                    onClick={() => toggleReveal(prod.id)}
                    className="text-zinc-400 hover:text-white flex items-center gap-1 bg-[#101010] border border-[#242424] px-3 py-1 rounded-lg"
                  >
                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isRevealed ? 'Ocultar datos' : 'Mostrar datos'}</span>
                  </button>
                </div>

                <div className="bg-[#101010] border border-[#242424] rounded-xl p-3.5 font-mono text-sm font-bold text-white flex items-center justify-between gap-4 overflow-x-auto">
                  <span>{isRevealed ? prod.delivered_content : '••••••••••••••••••••••••••••••••'}</span>
                  <button
                    onClick={() => handleCopy(prod.delivered_content, prod.id)}
                    className="p-2 bg-[#1A1A1A] rounded-lg text-zinc-300 hover:text-white flex-shrink-0"
                    title="Copiar contenido"
                  >
                    <Copy className="w-4 h-4 text-[#00E5FF]" />
                  </button>
                </div>

                {copiedId === prod.id && (
                  <p className="text-xs text-emerald-400 font-mono">¡Contenido copiado al portapapeles!</p>
                )}
              </div>

              {/* Warranty footer */}
              <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 pt-2">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" /> Garantía de reemplazo activa ({prod.warranty_days} Días)
                </span>
                <Link
                  href={`/dashboard/tickets?order=${prod.order_number}`}
                  className="text-[#00E5FF] hover:underline flex items-center gap-1 font-semibold"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Abrir Ticket por fallo
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
