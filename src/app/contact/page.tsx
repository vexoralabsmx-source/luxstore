'use client';

import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div className="border-b border-[#242424] pb-6 text-center">
        <h1 className="text-3xl font-extrabold text-white">Contacto Directo</h1>
        <p className="text-sm text-zinc-400 mt-2">¿Necesitas asistencia antes o después de tu compra?</p>
      </div>

      <div className="bg-[#101010] border border-[#242424] rounded-3xl p-8 space-y-6">
        {sent ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Mensaje Recibido</h3>
            <p className="text-sm text-zinc-400">Te responderemos a la brevedad posible a tu correo electrónico.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1 font-mono uppercase">Tu Nombre</label>
              <input
                type="text"
                required
                placeholder="Juan Pérez"
                className="w-full bg-[#050505] border border-[#242424] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1 font-mono uppercase">Correo Electrónico</label>
              <input
                type="email"
                required
                placeholder="tu@correo.com"
                className="w-full bg-[#050505] border border-[#242424] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1 font-mono uppercase">Asunto / Mensaje</label>
              <textarea
                rows={4}
                required
                placeholder="Describe tu consulta o requerimiento..."
                className="w-full bg-[#050505] border border-[#242424] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] text-black font-bold text-sm hover:shadow-glow transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Mensaje</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
