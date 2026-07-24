'use client';

import React from 'react';

export function InfiniteMarquee() {
  const items = [
    'PASARELA CLIP OFICIAL',
    'TRANSFERENCIA SPEI BBVA',
    'USDT TRC20 / POLYGON',
    'BITCOIN DIRECCIÓN DIRECTA',
    'MONEDERO DE CRÉDITOS LUX',
    'ENTREGAS 100% AUTOMÁTICAS',
    'CIFRADO AES-256-GCM',
    'GARANTÍA TOTAL DE REEMPLAZO',
  ];

  return (
    <div className="w-full bg-[#080808] border-y border-[#D4AF37]/25 py-4 overflow-hidden shadow-goldGlow">
      <div className="flex w-max animate-marquee space-x-12">
        {items.concat(items).map((item, index) => (
          <div key={index} className="flex items-center gap-3 text-xs font-mono font-bold tracking-widest text-[#FFF5C0] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            <span>{item}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
