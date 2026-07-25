'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, User, ArrowRight, AlertCircle, Crown } from 'lucide-react';

function getRegistrationErrorMessage(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof error.message === 'string'
        ? error.message
        : '';

  if (!message || message === '{}') {
    return 'No se pudo crear la cuenta. Verifica la configuración de acceso o intenta más tarde.';
  }

  if (message.toLowerCase().includes('already registered')) {
    return 'Este correo ya está registrado. Intenta recuperar tu contraseña.';
  }

  return message;
}

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formattedEmail = email.trim().toLowerCase();

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: formattedEmail,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setErrorMsg(getRegistrationErrorMessage(error));
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    } catch (err: unknown) {
      setErrorMsg(getRegistrationErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="glass-vip-card rounded-3xl p-8 space-y-6 border-[#1C1C1C]">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#050505] border border-[#C5A880]/50 flex items-center justify-center mx-auto text-[#C5A880]">
            <Crown className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white tracking-tight">Crear Cuenta</h1>
          <p className="text-xs text-zinc-400">Recibe tus compras y gestiona tu monedero de créditos</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-mono uppercase">Nombre Completo</label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nombre Completo"
                className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#C5A880] transition-colors"
              />
            </div>
          </div>

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
                className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#C5A880] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-mono uppercase">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#C5A880] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#C5A880] text-black font-bold text-xs hover:bg-[#E8D8C8] transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Creando cuenta...' : 'Registrarme Gratis'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#1C1C1C] text-center text-xs text-zinc-400 font-mono">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-[#C5A880] font-semibold hover:underline">
            Inicia sesión aquí
          </Link>
        </div>

      </div>
    </div>
  );
}
