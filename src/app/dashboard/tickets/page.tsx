'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Send, Clock, CheckCircle2, AlertCircle, ShieldCheck, User, Crown } from 'lucide-react';

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
        sender_name: 'Soporte Lux Store',
        message: 'Hola. He verificado tu garantía. En unos momentos te asignaremos una unidad de reemplazo.',
        created_at: '2026-07-22 14:45',
      },
    ],
  },
];

export default function CustomerTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('Garantía / Reemplazo');
  const [newOrderNumber, setNewOrderNumber] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const loadAndSyncTickets = () => {
      try {
        const stored = localStorage.getItem('lux_tickets');
        if (stored) {
          const parsed = JSON.parse(stored);
          setTickets(parsed);
          setSelectedTicket((prev) => {
            if (!prev && parsed.length > 0) return parsed[0];
            if (prev) {
              const updatedMatch = parsed.find((t: any) => t.id === prev.id);
              return updatedMatch || prev;
            }
            return null;
          });
        } else {
          setTickets(INITIAL_DEMO_TICKETS);
          setSelectedTicket(INITIAL_DEMO_TICKETS[0]);
          localStorage.setItem('lux_tickets', JSON.stringify(INITIAL_DEMO_TICKETS));
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadAndSyncTickets();

    // Auto-Polling en segundo plano cada 3.5 segundos para reflejar respuestas del administrador al instante
    const interval = setInterval(loadAndSyncTickets, 3500);
    window.addEventListener('storage', loadAndSyncTickets);
    window.addEventListener('tickets-updated', loadAndSyncTickets);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadAndSyncTickets);
      window.removeEventListener('tickets-updated', loadAndSyncTickets);
    };
  }, []);

  const saveTickets = (updated: Ticket[]) => {
    setTickets(updated);
    localStorage.setItem('lux_tickets', JSON.stringify(updated));
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newMessageText) return;

    const newTicket: Ticket = {
      id: `t_${Date.now()}`,
      ticket_number: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: newSubject,
      order_number: newOrderNumber || 'N/A',
      category: newCategory,
      status: 'OPEN',
      priority: 'MEDIUM',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      messages: [
        {
          id: `m_${Date.now()}`,
          sender_type: 'customer',
          sender_name: 'Cliente VIP',
          message: newMessageText,
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
        },
      ],
    };

    const updated = [newTicket, ...tickets];
    saveTickets(updated);
    setSelectedTicket(newTicket);
    setNewSubject('');
    setNewOrderNumber('');
    setNewMessageText('');
    setShowCreateModal(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText || !selectedTicket) return;

    const newMsg: TicketMessage = {
      id: `m_${Date.now()}`,
      sender_type: 'customer',
      sender_name: 'Cliente VIP',
      message: replyText,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    const updatedTickets = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: 'OPEN' as const,
          messages: [...t.messages, newMsg],
        };
      }
      return t;
    });

    saveTickets(updatedTickets);
    setSelectedTicket({
      ...selectedTicket,
      status: 'OPEN',
      messages: [...selectedTicket.messages, newMsg],
    });
    setReplyText('');
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1C1C1C] pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-[#C5A880]" /> Tickets de Soporte & Garantías
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono flex items-center gap-2">
            <span>Atención prioritaria Concierge Lux Store. Reporta problemas o solicita atención.</span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Sincronizado en tiempo real
            </span>
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#C5A880] text-black font-bold text-xs hover:bg-[#E8D8C8] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Abrir Nuevo Ticket</span>
        </button>
      </div>

      {/* Ticket Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Tickets List */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-mono uppercase text-zinc-400 tracking-wider">Mis Tickets ({tickets.length}):</h2>
          
          {tickets.length === 0 ? (
            <div className="glass-vip-card rounded-2xl p-8 text-center text-xs text-zinc-500 font-mono">
              No tienes tickets de soporte creados.
            </div>
          ) : (
            tickets.map((ticket) => {
              const isSelected = selectedTicket?.id === ticket.id;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`glass-vip-card rounded-2xl p-4 cursor-pointer transition-all ${
                    isSelected ? 'border-[#C5A880] bg-[#141414]' : 'border-[#1C1C1C]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-[#C5A880]">{ticket.ticket_number}</span>
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
                    <span>{ticket.category}</span>
                    <span>{ticket.created_at}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Active Chat Thread */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="glass-vip-card rounded-3xl p-6 space-y-6 flex flex-col h-[520px] justify-between">
              
              {/* Thread Header */}
              <div className="border-b border-[#1C1C1C] pb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#C5A880] font-bold">{selectedTicket.ticket_number}</span>
                    <span className="text-zinc-500 text-xs">• Orden: {selectedTicket.order_number}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-white mt-0.5">{selectedTicket.subject}</h3>
                </div>

                <span className="px-3 py-1 rounded-full bg-[#050505] border border-[#1C1C1C] text-xs font-mono text-[#E8D8C8]">
                  {selectedTicket.status}
                </span>
              </div>

              {/* Messages Container */}
              <div className="flex-grow overflow-y-auto space-y-4 pr-1">
                {selectedTicket.messages.map((msg) => {
                  const isSupport = msg.sender_type === 'support';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isSupport ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 mb-1">
                        {isSupport ? <Crown className="w-3 h-3 text-[#C5A880]" /> : <User className="w-3 h-3 text-zinc-300" />}
                        <span>{msg.sender_name}</span>
                        <span>• {msg.created_at}</span>
                      </div>

                      <div className={`p-4 rounded-2xl max-w-md text-xs leading-relaxed ${
                        isSupport
                          ? 'bg-[#050505] border border-[#C5A880]/40 text-white'
                          : 'bg-[#18181B] text-zinc-200 border border-[#1C1C1C]'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="flex gap-3 pt-3 border-t border-[#1C1C1C]">
                <input
                  type="text"
                  required
                  placeholder="Escribe tu mensaje o respuesta..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-grow bg-[#050505] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#C5A880] text-black font-bold text-xs hover:bg-[#E8D8C8] transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </form>

            </div>
          ) : (
            <div className="glass-vip-card rounded-3xl p-16 text-center text-xs text-zinc-500 font-mono">
              Selecciona un ticket para ver la conversación.
            </div>
          )}
        </div>

      </div>

      {/* Modal for Creating New Ticket */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-vip-card rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-white border-b border-[#1C1C1C] pb-3">Abrir Nuevo Ticket de Soporte</h3>
            
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Asunto / Motivo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Problema con acceso Spotify"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Categoría</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl px-3 py-2.5 text-xs text-zinc-300"
                  >
                    <option value="Garantía / Reemplazo">Garantía / Reemplazo</option>
                    <option value="Problema de Pago">Problema de Pago</option>
                    <option value="Duda General">Duda General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">N° de Orden (Opcional)</label>
                  <input
                    type="text"
                    placeholder="LX-2026-XXXX"
                    value={newOrderNumber}
                    onChange={(e) => setNewOrderNumber(e.target.value)}
                    className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Mensaje Explicativo *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe lo sucedido en detalle..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-[#141414] text-zinc-400 text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A880] text-black font-bold text-xs rounded-xl hover:bg-[#E8D8C8]"
                >
                  Crear Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
