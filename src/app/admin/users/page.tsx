'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, UserCheck, Trash2, CheckCircle2 } from 'lucide-react';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'support';
  created_at: string;
}

const INITIAL_TEAM: AdminUser[] = [
  {
    id: 'u1',
    name: 'Miguel Ángel Dorantes',
    email: 'mikeangdhz@gmail.com',
    role: 'owner',
    created_at: '2026-07-01',
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_TEAM);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'owner' | 'admin' | 'support'>('support');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lux_admin_team');
      if (stored) {
        setUsers(JSON.parse(stored));
      } else {
        localStorage.setItem('lux_admin_team', JSON.stringify(INITIAL_TEAM));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveUsers = (newList: AdminUser[]) => {
    setUsers(newList);
    localStorage.setItem('lux_admin_team', JSON.stringify(newList));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;

    const newUser: AdminUser = {
      id: `u_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      created_at: new Date().toISOString().slice(0, 10),
    };

    const updated = [...users, newUser];
    saveUsers(updated);
    setName('');
    setEmail('');
    setShowModal(false);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('¿Deseas eliminar este usuario del equipo de administración?')) {
      const updated = users.filter((u) => u.id !== id);
      saveUsers(updated);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#242424] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 font-sans">
            <ShieldCheck className="w-8 h-8 text-[#C5A880]" /> Equipo Interno & Control de Roles
          </h1>
          <p className="text-sm text-zinc-400 mt-1 font-mono">
            Administración de acceso para miembros del equipo (Owner, Admin, Support).
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-xl glow-gold-btn text-black font-bold text-xs flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Miembro</span>
        </button>
      </div>

      <div className="bg-[#101010] border border-[#242424] rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-[#050505] border-b border-[#242424] text-zinc-400 uppercase font-mono">
            <tr>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Rol Asignado</th>
              <th className="px-6 py-4">Fecha Registro</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242424]">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#161616] transition-colors">
                <td className="px-6 py-4">
                  <span className="font-bold text-white block font-sans">{u.name}</span>
                  <span className="text-zinc-400 text-[11px] font-mono">{u.email}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                    u.role === 'owner' 
                      ? 'bg-[#C5A880]/10 text-[#C5A880] border border-[#C5A880]/30' 
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-zinc-500">{u.created_at}</td>
                <td className="px-6 py-4 text-right">
                  {u.role !== 'owner' && (
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-2 rounded-lg bg-zinc-900 text-zinc-500 hover:text-rose-400 transition-colors"
                      title="Eliminar del equipo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D0D12] border border-[#C5A880]/30 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-base font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2 font-sans">
              <UserCheck className="w-4 h-4 text-[#C5A880]" />
              Agregar Miembro al Equipo
            </h3>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1">Nombre Completo:</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Carlos Mendoza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Correo Electrónico:</label>
                <input
                  type="email"
                  required
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Rol Asignado:</label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:border-[#C5A880]"
                >
                  <option value="support">Soporte (Support)</option>
                  <option value="admin">Administrador (Admin)</option>
                  <option value="owner">Propietario (Owner)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 glow-gold-btn text-black font-bold text-xs rounded-xl"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
