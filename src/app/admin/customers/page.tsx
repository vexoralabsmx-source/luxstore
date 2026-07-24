'use client';

import React, { useState, useEffect } from 'react';
import { Users, Wallet, Ban, CheckCircle2, UserPlus, Search } from 'lucide-react';
import { adjustWalletBalance } from '@/services/walletService';

export interface CustomerData {
  id: string;
  full_name: string;
  email: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  total_spent: number;
  credits: number;
  orders_count: number;
  is_blocked: boolean;
  created_at: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Credits Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(100);
  const [creditType, setCreditType] = useState<'ADMIN_CREDIT' | 'ADMIN_DEBIT'>('ADMIN_CREDIT');
  const [creditReason, setCreditReason] = useState<string>('Abono manual de créditos');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    try {
      const stored = localStorage.getItem('lux_admin_customers');
      if (stored) {
        setCustomers(JSON.parse(stored));
      } else {
        // Cargar clientes a partir de órdenes de compra realizadas en la tienda
        const storedOrders = localStorage.getItem('lux_admin_orders');
        const list: CustomerData[] = [];

        if (storedOrders) {
          const orders: any[] = JSON.parse(storedOrders);
          orders.forEach((o, i) => {
            if (o.customer_email && !list.some((c) => c.email === o.customer_email)) {
              list.push({
                id: `usr_${i + 1}`,
                full_name: o.customer_name || o.customer_email.split('@')[0],
                email: o.customer_email,
                risk_level: 'LOW',
                total_spent: o.total || 0,
                credits: 0.00,
                orders_count: 1,
                is_blocked: false,
                created_at: o.created_at || new Date().toISOString().slice(0, 10),
              });
            }
          });
        }

        setCustomers(list);
        localStorage.setItem('lux_admin_customers', JSON.stringify(list));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveCustomers = (newList: CustomerData[]) => {
    setCustomers(newList);
    localStorage.setItem('lux_admin_customers', JSON.stringify(newList));
  };

  const handleAdjustCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    await adjustWalletBalance({
      userId: selectedCustomer.id,
      amount: creditAmount,
      type: creditType,
      description: creditReason,
    });

    const updated = customers.map((c) =>
      c.id === selectedCustomer.id
        ? {
            ...c,
            credits:
              creditType === 'ADMIN_CREDIT'
                ? c.credits + creditAmount
                : Math.max(0, c.credits - creditAmount),
          }
        : c
    );

    saveCustomers(updated);
    setNotification(`¡Créditos ajustados correctamente para ${selectedCustomer.email}!`);
    setSelectedCustomer(null);
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleBlockStatus = (id: string) => {
    const updated = customers.map((c) => (c.id === id ? { ...c, is_blocked: !c.is_blocked } : c));
    saveCustomers(updated);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#242424] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 font-sans">
            <Users className="w-8 h-8 text-[#C5A880]" /> Clientes & Evaluación de Riesgo
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Registro real de clientes, saldo de créditos y estado de bloqueo.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por correo o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050505] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#C5A880] focus:outline-none"
          />
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Customers Data Table */}
      <div className="bg-[#101010] border border-[#242424] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#050505] border-b border-[#242424] text-zinc-400 uppercase font-mono">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Nivel Riesgo</th>
                <th className="px-6 py-4">Total Gastado</th>
                <th className="px-6 py-4">Créditos Actuales</th>
                <th className="px-6 py-4">Estado Cuenta</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242424]">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#161616] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white font-sans">{c.full_name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{c.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                        c.risk_level === 'LOW'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {c.risk_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white">
                      ${c.total_spent.toFixed(2)} MXN
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-[#C5A880]">
                      ${c.credits.toFixed(2)} MXN
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {c.is_blocked ? (
                        <span className="text-rose-400 font-bold text-[11px] bg-rose-950/60 px-2 py-0.5 rounded">BLOQUEADO</span>
                      ) : (
                        <span className="text-emerald-400 font-bold text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded">ACTIVO</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="px-3 py-1.5 rounded-xl bg-[#1A1A1A] border border-[#242424] hover:border-[#C5A880] text-white font-semibold text-xs transition-colors flex items-center gap-1"
                        >
                          <Wallet className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>Ajustar Créditos</span>
                        </button>

                        <button
                          onClick={() => toggleBlockStatus(c.id)}
                          className={`p-2 rounded-xl border transition-colors ${
                            c.is_blocked
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          }`}
                          title={c.is_blocked ? 'Desbloquear Cliente' : 'Bloquear Cliente'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-mono">
                    No hay clientes registrados en el sistema aún. Los clientes aparecerán automáticamente cuando realicen compras o recargas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Credits Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D0D12] border border-[#C5A880]/30 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-sans">
                <Wallet className="w-4 h-4 text-[#C5A880]" /> Ajustar Créditos para {selectedCustomer.email}
              </h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAdjustCredits} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1">Tipo de Operación:</label>
                <select
                  value={creditType}
                  onChange={(e: any) => setCreditType(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-[#C5A880]"
                >
                  <option value="ADMIN_CREDIT">Añadir Créditos (ADMIN_CREDIT)</option>
                  <option value="ADMIN_DEBIT">Deducir Créditos (ADMIN_DEBIT)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Monto en MXN / Créditos:</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(parseFloat(e.target.value))}
                  className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Motivo (Audit Log):</label>
                <input
                  type="text"
                  required
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-[#C5A880]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 glow-gold-btn text-black font-bold text-xs rounded-xl"
                >
                  Confirmar Transacción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
