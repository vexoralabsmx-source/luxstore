'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, CreditCard, ShieldCheck, Zap, KeyRound, CheckCircle2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ScrollStoryteller() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: '01',
      title: 'Elige tu Producto VIP',
      description: 'Explora nuestro catálogo privado con licencias originales, cuentas premium y gift cards listas para asignación.',
      icon: ShoppingBag,
      mockupText: 'Catálogo Lux Store: Spotify Premium, Windows 11 Pro, Xbox Game Pass',
      badge: 'Selección 1-Clic',
    },
    {
      number: '02',
      title: 'Checkout Seguro e Inmediato',
      description: 'Ingresa tu correo y elige tu método preferido: Clip, SPEI con centavos únicos, Criptomonedas (USDT/BTC) o Créditos Internos.',
      icon: CreditCard,
      mockupText: 'Checkout Cifrado 256-bit: Pagar $349.00 MXN',
      badge: 'Pago Verificado',
    },
    {
      number: '03',
      title: 'Validación Cero Confianza',
      description: 'El backend procesa la confirmación en tiempo real directamente con la pasarela oficial sin depender del navegador.',
      icon: ShieldCheck,
      mockupText: 'Verificación Backend: Confirmación Aprobada por Clip API',
      badge: 'Bóveda Cifrada',
    },
    {
      number: '04',
      title: 'Entrega en tu Bóveda Digital',
      description: 'Tu código o cuenta se descifra y revela automáticamente en tu pantalla, en tu panel de cliente y en tu correo.',
      icon: KeyRound,
      mockupText: 'SPOTIFY-PREMIUM-KEY-LX2026-99A8-77B3 • Revelado Seguro',
      badge: 'Acceso Desbloqueado',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-[#D4AF37] font-mono font-bold">
          Experiencia de Compra Interactiva
        </h2>
        <h3 className="font-serif text-3xl sm:text-5xl font-extrabold text-white">
          El Camino a tu Acceso Digital
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400">
          Descubre cómo funciona la entrega automatizada en 4 pasos sin fricción.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Interactive Timeline Steps */}
        <div className="lg:col-span-6 space-y-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === idx;

            return (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`glass-vip-card rounded-3xl p-6 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-[#D4AF37] bg-[#121215] shadow-goldGlow' 
                    : 'border-[#27272A] opacity-60 hover:opacity-100'
                }`}
                data-cursor="SELECCIONAR"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${
                    isSelected ? 'bg-gradient-to-r from-[#FFF5C0] to-[#D4AF37] text-black shadow-goldGlow' : 'bg-[#030303] text-zinc-500 border border-[#27272A]'
                  }`}>
                    {step.number}
                  </div>
                  <div>
                    <h4 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                      {step.title}
                      {isSelected && <Zap className="w-4 h-4 text-[#D4AF37]" />}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Dynamic Live Device Mockup Display */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative max-w-sm w-full bg-[#080808] border border-[#D4AF37]/40 rounded-[36px] p-6 shadow-goldGlowIntense overflow-hidden min-h-[420px] flex flex-col justify-between">
            
            {/* Top Bar Mockup Header */}
            <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold tracking-wider">
                Lux Store Live Process
              </span>
            </div>

            {/* Dynamic Animated Scene Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="py-8 space-y-6 text-center"
              >
                <div className="w-16 h-16 rounded-3xl bg-[#030303] border border-[#D4AF37]/50 flex items-center justify-center mx-auto text-[#D4AF37] shadow-goldGlow">
                  {React.createElement(steps[activeStep].icon, { className: 'w-8 h-8' })}
                </div>

                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#FFF5C0] border border-[#D4AF37]/30 text-[10px] font-mono font-bold uppercase">
                    {steps[activeStep].badge}
                  </span>
                  <h4 className="text-base font-serif font-bold text-white">
                    {steps[activeStep].title}
                  </h4>
                </div>

                <div className="bg-[#030303] border border-[#27272A] rounded-2xl p-4 font-mono text-xs text-[#00E5FF] break-all leading-relaxed">
                  {steps[activeStep].mockupText}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Bottom Status Bar */}
            <div className="pt-4 border-t border-[#27272A] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Servidores Operacionales
              </span>
              <span>Paso {activeStep + 1} de 4</span>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
}
