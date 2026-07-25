'use client';

import React, { useState } from 'react';
import { Zap, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminIntegrationsPage() {
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState('');
  const [pingResult, setPingResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loadingPing, setLoadingPing] = useState(false);

  const handleTestDiscord = async () => {
    setLoadingPing(true);
    setPingResult(null);

    const response = await fetch('/api/admin/integrations/discord', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl: discordWebhookUrl.trim() || undefined }),
    });
    const res = await response.json();

    if (res.success) {
      setPingResult({
        success: true,
        message: '¡Alerta de prueba enviada exitosamente a tu canal de Discord!',
      });
    } else if (res.status === 401) {
      setPingResult({
        success: false,
        message: 'El Webhook de Discord ingresado ha sido revocado o caducó (Error 401). Genera un nuevo Webhook en Discord: (Ajustes del Canal -> Integraciones -> Crear Webhook) y pégalo aquí.',
      });
    } else {
      setPingResult({
        success: false,
        message: 'No se pudo conectar con Discord. Verifica la URL del Webhook.',
      });
    }
    setLoadingPing(false);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="border-b border-[#1C1C1C] pb-6">
        <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
          <Zap className="w-8 h-8 text-[#C5A880]" /> Integraciones & Webhooks
        </h1>
        <p className="text-xs text-zinc-400 mt-1 font-mono">
          Conexión en tiempo real con Resend Email y servidor de Discord.
        </p>
      </div>

      {pingResult && (
        <div className={`p-4 rounded-2xl border text-xs font-mono flex items-center gap-3 ${
          pingResult.success
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        }`}>
          {pingResult.success ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{pingResult.message}</span>
        </div>
      )}

      {/* Discord Integration Card */}
      <div className="glass-vip-card rounded-3xl p-6 sm:p-8 space-y-6 border-[#1C1C1C]">
        <div className="flex items-center gap-3 border-b border-[#1C1C1C] pb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-serif">Notificaciones de Servidor Discord</h3>
            <p className="text-xs text-zinc-400">Recibe alertas instantáneas en tu servidor de Discord ante ventas y comprobantes SPEI.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Pega la URL de tu Webhook de Discord:</label>
            <input
              type="text"
              placeholder="https://discord.com/api/webhooks/..."
              value={discordWebhookUrl}
              onChange={(e) => setDiscordWebhookUrl(e.target.value)}
              className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C5A880]"
            />
            <p className="text-[11px] text-zinc-500 mt-1.5 font-mono">
              Instrucciones: En Discord, ve a tu Servidor &rarr; Ajustes del Canal &rarr; Integraciones &rarr; Crear Webhook.
            </p>
          </div>

          <button
            onClick={handleTestDiscord}
            disabled={loadingPing}
            className="px-4 py-2.5 rounded-xl bg-[#C5A880] text-black font-bold text-xs hover:bg-[#E8D8C8] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loadingPing ? 'Enviando Alerta a Discord...' : 'Probar Webhook en Discord'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
