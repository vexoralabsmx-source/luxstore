'use client';

import React, { useState } from 'react';
import { User, Lock, ShieldCheck, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export default function CustomerSettingsPage() {
  const [fullName, setFullName] = useState('Cliente Lux');
  const [email, setEmail] = useState('cliente@ejemplo.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Perfil y configuración de seguridad actualizados exitosamente.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#242424] pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-[#00E5FF]" /> Perfil y Seguridad
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Actualiza tus datos de contacto y contraseña de acceso.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="bg-[#101010] border border-[#242424] rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-bold text-white border-b border-[#242424] pb-3">Información Personal</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-mono uppercase">Nombre Completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#050505] border border-[#242424] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-mono uppercase">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#050505] border border-[#242424] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
            />
          </div>
        </div>

        <h3 className="text-base font-bold text-white border-b border-[#242424] pb-3 pt-4">Cambiar Contraseña</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-mono uppercase">Contraseña Actual</label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-[#050505] border border-[#242424] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-mono uppercase">Nueva Contraseña</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#050505] border border-[#242424] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#242424]">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] text-black font-bold text-xs hover:shadow-glow transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </form>
    </div>
  );
}
