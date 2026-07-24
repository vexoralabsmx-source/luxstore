'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Zap, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard/settings`,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      setSuccessMsg('Se ha enviado un enlace de recuperación a tu correo electrónico.');
      setLoading(false);
    } catch (e) {
      setErrorMsg('Error al procesar la solicitud. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-[#101010] border border-[#242424] rounded-3xl p-8 space-y-6 shadow-glow">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#7C3AED] p-[1px] mx-auto">
            <div className="w-full h-full bg-[#0A0A0A] rounded-[15px] flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#00E5FF]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Recuperar Contraseña</h1>
          <p className="text-xs text-zinc-400">Ingresa tu correo para recibir un enlace de restablecimiento</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-mono uppercase">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full bg-[#050505] border border-[#242424] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E5FF] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] text-black font-bold text-sm hover:shadow-glow transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Enviando enlace...' : 'Enviar Enlace de Recuperación'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#242424] text-center text-xs text-zinc-400">
          <Link href="/login" className="text-[#00E5FF] font-semibold hover:underline">
            Volver a inicio de sesión
          </Link>
        </div>

      </div>
    </div>
  );
}
