'use client';

import React, { useState } from 'react';
import { FolderTree, Plus, Edit3, Trash2 } from 'lucide-react';

const DEMO_CATEGORIES_ADMIN = [
  { id: 'c1', name: 'Streaming & Entretenimiento', slug: 'streaming', count: 12, is_active: true },
  { id: 'c2', name: 'Licencias de Software', slug: 'software-licenses', count: 24, is_active: true },
  { id: 'c3', name: 'Gaming & Gift Cards', slug: 'gaming', count: 18, is_active: true },
  { id: 'c4', name: 'Herramientas Developer & IA', slug: 'developer-ai', count: 8, is_active: true },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(DEMO_CATEGORIES_ADMIN);
  const [showModal, setShowModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;
    setCategories([
      ...categories,
      {
        id: `cat_${Date.now()}`,
        name: catName,
        slug: catSlug || catName.toLowerCase().replace(/\s+/g, '-'),
        count: 0,
        is_active: true,
      },
    ]);
    setCatName('');
    setCatSlug('');
    setShowModal(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#242424] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <FolderTree className="w-8 h-8 text-[#00E5FF]" /> Gestión de Categorías
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Organización y jerarquía de productos del catálogo.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] text-black font-bold text-xs hover:shadow-glow transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      <div className="bg-[#101010] border border-[#242424] rounded-3xl overflow-hidden">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-[#050505] border-b border-[#242424] text-zinc-400 uppercase font-mono">
            <tr>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Productos Vinculados</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242424]">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-[#161616] transition-colors">
                <td className="px-6 py-4 font-bold text-white text-sm">{c.name}</td>
                <td className="px-6 py-4 font-mono text-[#00E5FF]">/{c.slug}</td>
                <td className="px-6 py-4 font-mono text-zinc-300">{c.count} productos</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                    ACTIVA
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 rounded-xl bg-[#1A1A1A] text-zinc-300 hover:text-white">
                      <Edit3 className="w-4 h-4 text-[#00E5FF]" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101010] border border-[#242424] rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-[#242424] pb-3">Nueva Categoría</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Nombre:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cuentas Streaming"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full bg-[#050505] border border-[#242424] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Slug:</label>
                <input
                  type="text"
                  placeholder="ej. cuentas-streaming"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  className="w-full bg-[#050505] border border-[#242424] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-[#1A1A1A] text-zinc-400 text-xs rounded-xl">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] text-black font-bold text-xs rounded-xl">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
