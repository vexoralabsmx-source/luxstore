'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const prepareSession = async () => {
      const code = new URLSearchParams(window.location.search).get('code');

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error && active) {
          setErrorMsg('El enlace es inválido o ya venció. Solicita uno nuevo.');
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (active) {
        setHasRecoverySession(Boolean(session));
        setCheckingSession(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY' || session) {
        setHasRecoverySession(Boolean(session));
        setCheckingSession(false);
      }
    });

    prepareSession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password.length < 8) {
      setErrorMsg('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    setSuccessMsg('Tu contraseña fue actualizada. Ya puedes iniciar sesión.');
    setPassword('');
    setConfirmPassword('');
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-[#101010] border border-[#242424] rounded-3xl p-8 space-y-6 shadow-glow">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#050505] border border-[#C5A880]/50 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6 text-[#C5A880]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Crear nueva contraseña
          </h1>
          <p className="text-xs text-zinc-400">
            Usa una contraseña nueva y exclusiva para Lux Store
          </p>
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

        {checkingSession ? (
          <p className="text-center text-xs text-zinc-400">
            Verificando el enlace…
          </p>
        ) : hasRecoverySession && !successMsg ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1 font-mono uppercase">
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-[#050505] border border-[#242424] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1 font-mono uppercase">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full bg-[#050505] border border-[#242424] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#C5A880] text-black font-bold text-sm hover:bg-[#E8D8C8] transition-colors disabled:opacity-60"
            >
              {loading ? 'Actualizando…' : 'Guardar nueva contraseña'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-3">
            <p className="text-xs text-zinc-400">
              Este enlace no contiene una sesión válida o ya expiró.
            </p>
            <Link
              href="/forgot-password"
              className="inline-block text-sm text-[#C5A880] font-semibold hover:underline"
            >
              Solicitar otro enlace
            </Link>
          </div>
        )}

        {successMsg && (
          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-[#C5A880] font-semibold hover:underline"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
