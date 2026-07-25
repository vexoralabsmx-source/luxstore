'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Boxes, 
  Plus, 
  Search, 
  Lock, 
  Eye,
  EyeOff,
  Trash2,
  Package
} from 'lucide-react';

export default function AdminInventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  
  // Bulk paste modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [selectedProductSlug, setSelectedProductSlug] = useState('');
  const [customProductName, setCustomProductName] = useState('');
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadInventoryAndProducts();
    window.addEventListener('products-updated', loadInventoryAndProducts);
    return () => window.removeEventListener('products-updated', loadInventoryAndProducts);
  }, []);

  const loadInventoryAndProducts = async () => {
    try {
      const response = await fetch('/api/admin/inventory', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setItems(payload.items || []);
      setProductsList(payload.products || []);
      if (payload.products?.length > 0 && !selectedProductSlug) {
        setSelectedProductSlug(payload.products[0].id);
      }
    } catch (e) {
      console.error(e);
      setItems([]);
      setProductsList([]);
    }
  };

  const handleClearAllStock = () => {
    alert('Elimina únicamente unidades disponibles de forma individual para proteger el historial de ventas.');
  };

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n').filter((l) => l.trim().length > 0);
    const response = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: selectedProductSlug, lines: lines.map((line) => line.trim()) }),
    });
    const payload = await response.json();
    if (!response.ok) {
      alert(payload.error || 'No se pudo guardar el inventario');
      return;
    }
    setBulkText('');
    setShowAddModal(false);
    await loadInventoryAndProducts();
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1C1C1C] pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
            <Boxes className="w-7 h-7 text-[#C5A880]" /> Inventario Digital & Carga de Stock Cifrado
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Carga masiva por líneas, estado de stock y cifrado AES-256-GCM en reposo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-2"
          >
            <Package className="w-4 h-4 text-[#C5A880]" />
            <span>Ver Productos</span>
          </Link>

          {items.length > 0 && (
            <button
              onClick={handleClearAllStock}
              className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-xs hover:bg-rose-500/20 transition-all flex items-center gap-1.5 font-mono cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Vaciar Todo el Stock</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl glow-gold-btn text-black font-bold text-xs transition-all flex items-center gap-2 font-mono cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Stock (Pegado Masivo)</span>
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="glass-vip-card rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-[#1C1C1C]">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por producto o contenido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880] font-mono"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#050505] border border-[#1C1C1C] rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#C5A880] font-mono"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="AVAILABLE">AVAILABLE (Disponible)</option>
            <option value="RESERVED">RESERVED (Reservado)</option>
            <option value="SOLD">SOLD (Vendido)</option>
            <option value="REPLACED">REPLACED (Reemplazado)</option>
            <option value="DISABLED">DISABLED (Desactivado)</option>
          </select>
        </div>
      </div>

      {/* Stock Items Table */}
      <div className="glass-vip-card rounded-3xl overflow-hidden border-[#1C1C1C]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#050505] border-b border-[#1C1C1C] text-zinc-400 uppercase font-mono">
              <tr>
                <th className="px-6 py-4">Producto & Variante</th>
                <th className="px-6 py-4">Contenido Cifrado / Revelado</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Orden Asociada</th>
                <th className="px-6 py-4">Fecha Carga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const isRevealed = revealedIds[item.id] || false;
                  return (
                    <tr key={item.id} className="hover:bg-[#0E0E0E] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-sm">{item.product_name}</div>
                        <div className="text-[11px] text-[#C5A880] font-mono">{item.variant_name}</div>
                      </td>
                      <td className="px-6 py-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span>{isRevealed ? item.content : '••••••••••••••••••••••••'}</span>
                          <button
                            onClick={() => toggleReveal(item.id)}
                            className="p-1 text-zinc-500 hover:text-white"
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                          item.status === 'AVAILABLE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : item.status === 'SOLD'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-400">
                        {item.order_number || '—'}
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-500">
                        {item.created_at}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-xs text-zinc-500 font-mono">
                    No hay inventario cargado aún. Haz clic en <strong className="text-[#C5A880]">"Agregar Stock (Pegado Masivo)"</strong> para añadir tus credenciales reales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C0C0C] border border-[#1C1C1C] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
              <h3 className="text-base font-bold text-[#F4F1EA] font-serif flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#C5A880]" /> Carga Masiva de Stock Cifrado (AES-256)
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleBulkAdd} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-zinc-400 uppercase mb-1">Selecciona el Producto Destino:</label>
                {productsList.length > 0 ? (
                  <select
                    value={selectedProductSlug}
                    onChange={(e) => setSelectedProductSlug(e.target.value)}
                    className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#C5A880]"
                  >
                    {productsList.map((p) => (
                      <option key={p.id || p.slug} value={p.slug || p.id}>
                        {p.name} ({p.category_name || p.category || 'Digital'})
                      </option>
                    ))}
                    <option value="custom">+ Escribir Nombre Personalizado...</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Escribe el nombre del producto (ej. Netflix 4K)"
                    value={customProductName}
                    onChange={(e) => setCustomProductName(e.target.value)}
                    className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#C5A880]"
                  />
                )}

                {selectedProductSlug === 'custom' && (
                  <input
                    type="text"
                    required
                    placeholder="Escribe el nombre del producto (ej. Netflix 4K)"
                    value={customProductName}
                    onChange={(e) => setCustomProductName(e.target.value)}
                    className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl px-3 py-2.5 text-white mt-2 focus:outline-none focus:border-[#C5A880]"
                  />
                )}
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">
                  Pega una unidad por línea (Formato: correo|pass|perfil|pin o Clave Digital):
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder={`correo1@gmail.com|pass123|Perfil 1|PIN1234\ncorreo2@gmail.com|pass567|Perfil 2|PIN5678\nW11PRO-X892-7A12-9901-LUXKEY`}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl p-3 font-mono text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#141414] text-zinc-400 text-xs font-bold rounded-xl border border-[#1C1C1C]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 glow-gold-btn text-black font-bold text-xs rounded-xl"
                >
                  Cifrar y Guardar Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
