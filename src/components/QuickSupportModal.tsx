'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2, ShieldCheck, LifeBuoy } from 'lucide-react';

interface QuickSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber?: string;
  customerEmail?: string;
}

export function QuickSupportModal({
  isOpen,
  onClose,
  orderNumber,
  customerEmail,
}: QuickSupportModalProps) {
  const [subject, setSubject] = useState(orderNumber ? `Duda con mi Pago (Orden ${orderNumber})` : 'Duda sobre el Checkout');
  const [email, setEmail] = useState(customerEmail || '');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);

    try {
      const newTicket = {
        id: `t_${Date.now()}`,
        ticket_number: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
        subject: subject || 'Duda con Pago en Checkout',
        order_number: orderNumber || 'N/A',
        category: 'Problema de Pago',
        status: 'OPEN' as const,
        priority: 'HIGH' as const,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
        messages: [
          {
            id: `m_${Date.now()}`,
            sender_type: 'customer' as const,
            sender_name: email ? email.split('@')[0] : 'Cliente VIP',
            message: message.trim(),
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
          },
        ],
      };

      const stored = localStorage.getItem('lux_tickets');
      const tickets = stored ? JSON.parse(stored) : [];
      const updated = [newTicket, ...tickets];

      localStorage.setItem('lux_tickets', JSON.stringify(updated));
      window.dispatchEvent(new Event('tickets-updated'));
      window.dispatchEvent(new Event('storage'));

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setMessage('');
        setIsSubmitting(false);
        onClose();
      }, 2500);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0C0C12] border border-[#C5A880]/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C5A880]/10 border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-white">Soporte VIP en Tiempo Real</h3>
              <p className="text-[11px] text-zinc-400 font-mono">Atención prioritaria durante tu pago</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-bold text-white text-base font-serif">¡Ticket Abierto Exitosamente!</h4>
            <p className="text-xs text-zinc-300 max-w-xs mx-auto font-mono">
              Un miembro de soporte de Lux Store responderá tu ticket en minutos. Las respuestas se actualizarán automáticamente en pantalla.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            {orderNumber && (
              <div className="p-3 bg-[#050505] border border-zinc-800 rounded-xl text-zinc-300 flex items-center justify-between">
                <span>VINCULADO A ORDEN:</span>
                <span className="text-[#C5A880] font-bold">{orderNumber}</span>
              </div>
            )}

            <div>
              <label className="block text-zinc-400 uppercase mb-1">Tu Correo Electrónico:</label>
              <input
                type="email"
                required
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:border-[#C5A880] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-400 uppercase mb-1">Asunto de la Consulta:</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:border-[#C5A880] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-400 uppercase mb-1">Escribe tu duda o mensaje de pago *:</label>
              <textarea
                rows={3}
                required
                placeholder="Ej. Tengo una duda sobre mi transferencia BBVA..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:border-[#C5A880] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-bold rounded-xl"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 glow-gold-btn text-black font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Enviando...' : 'Enviar Ticket VIP'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
