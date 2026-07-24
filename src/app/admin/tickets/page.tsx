'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle2, RefreshCw, ShieldCheck, User, Crown, Clock } from 'lucide-react';

interface TicketMessage {
  id: string;
  sender_type: 'customer' | 'support';
  sender_name: string;
  message: string;
  created_at: string;
}

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  order_number?: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  created_at: string;
  messages: TicketMessage[];
}

const INITIAL_DEMO_TICKETS: Ticket[] = [
  {
    id: 't1',
    ticket_number: 'TCK-9901',
    subject: 'Solicitud de Garantía — Spotify Premium',
    order_number: 'LX-2026-881923',
    category: 'Garantía / Reemplazo',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    created_at: '2026-07-22 14:30',
    messages: [
      {
        id: 'm1',
        sender_type: 'customer',
        sender_name: 'Cliente VIP',
        message: 'Hola, buenas tardes. Al ingresar a la cuenta de Spotify indica contraseña incorrecta.',
        created_at: '2026-07-22 14:30',
      },
      {
        id: 'm2',
        sender_type: 'support',
        sender_name: 'Owner Admin',
        message: 'Hola. He verificado tu garantía. En unos momentos te asignaremos una unidad de reemplazo.',
        created_at: '2026-07-22 14:45',
      },
    ],
  },
];

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lux_tickets');
      if (stored) {
        const parsed = JSON.parse(stored);
        setTickets(parsed);
        if (parsed.length > 0) setSelectedTicket(parsed[0]);
      } else {
        setTickets(INITIAL_DEMO_TICKETS);
        setSelectedTicket(INITIAL_DEMO_TICKETS[0]);
        localStorage.setItem('lux_tickets', JSON.stringify(INITIAL_DEMO_TICKETS));
      }
    } catch (e) {
      setTickets(INITIAL_DEMO_TICKETS);
    }
  }, []);

  const saveTickets = (updated: Ticket[]) => {
    setTickets(updated);
    localStorage.setItem('lux_tickets', JSON.stringify(updated));
  };

  const handleAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText || !selectedTicket) return;

    const newMsg: TicketMessage = {
      id: `m_${Date.now()}`,
      sender_type: 'support',
      sender_name: 'Owner Admin',
      message: adminReplyText,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    const updatedTickets = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: 'IN_PROGRESS' as const,
          messages: [...t.messages, newMsg],
        };
      }
      return t;
    });

    saveTickets(updatedTickets);
    setSelectedTicket({
      ...selectedTicket,
      status: 'IN_PROGRESS',
      messages: [...selectedTicket.messages, newMsg],
    });
    setAdminReplyText('');
    setActionSuccess('Respuesta enviada al cliente exitosamente');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleStatusChange = (status: Ticket['status']) => {
    if (!selectedTicket) return;
    const updatedTickets = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return { ...t, status };
      }
      return t;
    });

    saveTickets(updatedTickets);
    setSelectedTicket({ ...selectedTicket, status });
    setActionSuccess(`Estado del ticket actualizado a: ${status}`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleApproveReplacement = () => {
    if (!selectedTicket) return;

    const replacementMsg: TicketMessage = {
      id: `m_${Date.now()}`,
      sender_type: 'support',
      sender_name: 'Owner Admin (Sistema de Garantías)',
      message: '✅ ¡REEMPLAZO APROBADO! Se ha liberado y asignado una nueva unidad de reemplazo a tu orden. Consulta el nuevo acceso en tu Bóveda Digital.',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    const updatedTickets = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: 'RESOLVED' as const,
          messages: [...t.messages, replacementMsg],
        };
      }
      return t;
    });

    saveTickets(updatedTickets);
    setSelectedTicket({
      ...selectedTicket,
      status: 'RESOLVED',
      messages: [...selectedTicket.messages, replacementMsg],
    });

    setActionSuccess('Reemplazo aprobado y unidad asignada al cliente.');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="border-b border-[#242424] pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-[#00E5FF]" /> Panel de Tickets de Soporte & Garantías
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Revisión de solicitudes de clientes, respuestas y aprobación de reemplazos.</p>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Tickets List */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-mono uppercase text-zinc-400 tracking-wider">Tickets de Clientes ({tickets.length}):</h2>
          
          {tickets.map((ticket) => {
            const isSelected = selectedTicket?.id === ticket.id;
            return (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`bg-[#101010] border rounded-2xl p-4 cursor-pointer transition-all ${
                  isSelected ? 'border-[#00E5FF] bg-[#161616]' : 'border-[#242424] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-[#00E5FF]">{ticket.ticket_number}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    ticket.status === 'OPEN' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    ticket.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {ticket.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-1">{ticket.subject}</h3>
                
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mt-2">
                  <span>Orden: {ticket.order_number}</span>
                  <span>{ticket.created_at}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Active Admin Reply Box */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="bg-[#101010] border border-[#242424] rounded-3xl p-6 space-y-6 flex flex-col h-[560px] justify-between">
              
              {/* Header & Controls */}
              <div className="border-b border-[#242424] pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs text-[#00E5FF] font-bold">{selectedTicket.ticket_number}</span>
                    <span className="text-zinc-500 text-xs font-mono ml-2">• Orden: {selectedTicket.order_number}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleApproveReplacement}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors flex items-center gap-1"
                      title="Asignar una nueva unidad de reemplazo al cliente"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Aprobar Reemplazo</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">{selectedTicket.subject}</h3>
                  
                  {/* Status Selector */}
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value as any)}
                    className="bg-[#050505] border border-[#242424] rounded-xl px-3 py-1 text-xs text-[#00E5FF] font-mono font-bold"
                  >
                    <option value="OPEN">ABIERTO</option>
                    <option value="IN_PROGRESS">EN PROGRESO</option>
                    <option value="RESOLVED">RESUELTO</option>
                    <option value="CLOSED">CERRADO</option>
                  </select>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-grow overflow-y-auto space-y-4 pr-1">
                {selectedTicket.messages.map((msg) => {
                  const isSupport = msg.sender_type === 'support';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isSupport ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 mb-1">
                        {isSupport ? <Crown className="w-3 h-3 text-[#00E5FF]" /> : <User className="w-3 h-3 text-zinc-300" />}
                        <span>{msg.sender_name}</span>
                        <span>• {msg.created_at}</span>
                      </div>

                      <div className={`p-4 rounded-2xl max-w-md text-xs leading-relaxed ${
                        isSupport
                          ? 'bg-[#1A1A1A] border border-[#00E5FF]/40 text-white'
                          : 'bg-[#050505] text-zinc-200 border border-[#242424]'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Admin Reply Form */}
              <form onSubmit={handleAdminReply} className="flex gap-3 pt-3 border-t border-[#242424]">
                <input
                  type="text"
                  required
                  placeholder="Escribe una respuesta como Administrador Owner..."
                  value={adminReplyText}
                  onChange={(e) => setAdminReplyText(e.target.value)}
                  className="flex-grow bg-[#050505] border border-[#242424] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] text-black font-bold text-xs hover:shadow-glow transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Responder</span>
                </button>
              </form>

            </div>
          ) : (
            <div className="bg-[#101010] border border-[#242424] rounded-3xl p-16 text-center text-xs text-zinc-500 font-mono">
              Selecciona un ticket para responder.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
