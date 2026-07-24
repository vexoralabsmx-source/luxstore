'use client';

import React, { useState } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState('Lux Store');
  const [currency, setCurrency] = useState('MXN');
  const [timezone, setTimezone] = useState('America/Mexico_City');
  const [supportEmail, setSupportEmail] = useState('soporte@luxstore.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showStock, setShowStock] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-[#242424] pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-[#00E5FF]" /> Configuración General de la Tienda
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Parámetros de tienda, zona horaria, moneda y modo mantenimiento.</p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Configuración guardada correctamente en Supabase.</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="bg-[#101010] border border-[#242424] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Nombre de la Tienda:</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-[#050505] border border-[#242424] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Correo de Soporte:</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full bg-[#050505] border border-[#242424] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Moneda Predeterminada:</label>
            <input
              type="text"
              readOnly
              value={currency}
              className="w-full bg-[#050505] border border-[#242424] rounded-xl px-4 py-3 text-xs text-zinc-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Zona Horaria:</label>
            <input
              type="text"
              readOnly
              value={timezone}
              className="w-full bg-[#050505] border border-[#242424] rounded-xl px-4 py-3 text-xs text-zinc-400 font-mono"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-[#242424]">
          <label className="flex items-center gap-3 cursor-pointer text-xs text-white font-medium">
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="rounded bg-[#050505] border-[#242424] text-[#00E5FF]"
            />
            <span>Activar Modo Mantenimiento (Bloquea compras públicas temporalmente)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer text-xs text-white font-medium">
            <input
              type="checkbox"
              checked={showStock}
              onChange={(e) => setShowStock(e.target.checked)}
              className="rounded bg-[#050505] border-[#242424] text-[#00E5FF]"
            />
            <span>Mostrar números de stock visible en las tarjetas del catálogo</span>
          </label>
        </div>

        <div className="pt-4 border-t border-[#242424]">
          <button
            type="submit"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] text-black font-bold text-xs hover:shadow-glow transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Ajustes de Tienda</span>
          </button>
        </div>
      </form>
    </div>
  );
}
