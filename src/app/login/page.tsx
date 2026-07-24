'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Crown } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formattedEmail = email.trim().toLowerCase();

    // Establecer cookies del navegador para middleware.ts
    if (formattedEmail === 'mikeangdhz@gmail.com' || formattedEmail.includes('admin')) {
      document.cookie = "lux_admin_session=true; path=/; max-age=86400; SameSite=Lax";
      document.cookie = "lux_user_session=true; path=/; max-age=86400; SameSite=Lax";
      
      localStorage.setItem('lux_admin_session', JSON.stringify({ 
        email: formattedEmail, 
        role: 'owner',
        name: 'Miguel Ángel Dorantes (Owner Admin)'
      }));
      
      // Asegurar saldo real $0.00 MXN
      if (!localStorage.getItem('lux_user_credits')) {
        localStorage.setItem('lux_user_credits', '0.00');
      }

      window.location.href = '/admin';
    } else {
      document.cookie = "lux_user_session=true; path=/; max-age=86400; SameSite=Lax";

      localStorage.setItem('lux_user_session', JSON.stringify({ 
        email: formattedEmail, 
        role: 'customer',
        name: 'Cliente VIP'
      }));

      if (!localStorage.getItem('lux_user_credits')) {
        localStorage.setItem('lux_user_credits', '0.00');
      }

      window.location.href = '/dashboard';
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
          <h1 className="font-serif text-2xl font-bold text-white tracking-tight">Iniciar Sesión</h1>
          <p className="text-xs text-zinc-400">Accede a tus productos, compras y soporte</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs text-zinc-400 font-mono uppercase">Contraseña</label>
              <Link href="/forgot-password" className="text-xs text-[#C5A880] hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#C5A880] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#C5A880] text-black font-bold text-xs hover:bg-[#E8D8C8] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'Iniciando sesión...' : 'Ingresar a mi Cuenta'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#1C1C1C] text-center text-xs text-zinc-400 font-mono">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="text-[#C5A880] font-semibold hover:underline">
            Regístrate aquí
          </Link>
        </div>

      </div>
    </div>
  );
}
