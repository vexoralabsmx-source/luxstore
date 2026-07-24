'use client';

import React, { useState, useRef } from 'react';
import { Crown, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export function MetallicCard3D() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -12;
    const rY = ((x - centerX) / centerX) * 12;

    setRotX(rX);
    setRotY(rY);
  };

  const handleMouseLeave = () => {
    setRotX(0);
    setRotY(0);
  };

  return (
    <div className="w-full flex justify-center py-4">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: 'preserve-3d',
          transform: `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
        }}
        className="relative w-full max-w-[420px] h-[240px] rounded-[20px] p-6 flex flex-col justify-between overflow-hidden bg-[#0F0F0F] border border-[#C5A880]/40 shadow-subtle cursor-pointer group transition-transform duration-200 ease-out"
        data-cursor="LUX MEMBER"
      >
        {/* Texture Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

        {/* Card Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#050505] border border-[#C5A880]/50 flex items-center justify-center">
              <Crown className="w-3.5 h-3.5 text-[#C5A880]" />
            </div>
            <span className="font-serif font-bold text-xs tracking-widest text-white uppercase">
              LUX <span className="text-[#C5A880]">STORE VIP</span>
            </span>
          </div>

          <span className="text-[9px] font-mono font-bold text-[#C5A880] border border-[#C5A880]/30 px-2 py-0.5 rounded uppercase flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" /> SPEI BBVA
          </span>
        </div>

        {/* Card Microchip */}
        <div className="relative z-10 my-1">
          <div className="w-10 h-8 rounded bg-[#B89778]/30 border border-[#C5A880]/50 p-1 flex flex-col justify-between">
            <div className="w-full h-1 bg-[#C5A880]/40 rounded-xs" />
            <div className="w-full h-1 bg-[#C5A880]/40 rounded-xs" />
          </div>
        </div>

        {/* Fake Placeholder Card Number for Public View */}
        <div className="relative z-10 font-mono text-base sm:text-lg font-bold tracking-[0.2em] text-[#E8D8C8]">
          1234 • 5678 • 9012 • 3456
        </div>

        {/* Card Footer: Placeholder Name & Notice */}
        <div className="relative z-10 flex items-end justify-between border-t border-[#1C1C1C] pt-2">
          <div>
            <span className="text-[8px] font-mono uppercase text-zinc-500 block">Titular de Cuenta</span>
            <span className="text-[11px] font-mono font-bold text-white uppercase">MIEMBRO LUX STORE VIP</span>
          </div>

          <div className="text-right">
            <span className="text-[8px] font-mono uppercase text-zinc-500 block">Datos Bancarios</span>
            <span className="text-[10px] font-mono font-bold text-[#C5A880] bg-[#C5A880]/10 px-2 py-0.5 rounded border border-[#C5A880]/30">
              DISPONIBLES AL COMPRAR
            </span>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
