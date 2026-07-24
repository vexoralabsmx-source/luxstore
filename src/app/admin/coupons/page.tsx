'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit3, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { CouponData } from '@/services/couponService';
import { createAdminClient } from '@/lib/supabase/admin';

const INITIAL_COUPONS: CouponData[] = [
  {
    id: 'c1',
    code: 'LUX10',
    discount_type: 'percentage',
    discount_value: 10,
    min_purchase: 0,
    uses_count: 14,
    max_uses: 1000,
    is_active: true,
  },
  {
    id: 'c2',
    code: 'LUX20',
    discount_type: 'percentage',
    discount_value: 20,
    min_purchase: 100,
    uses_count: 5,
    max_uses: 1000,
    is_active: true,
  },
  {
    id: 'c3',
    code: 'BIENVENIDA',
    discount_type: 'fixed',
    discount_value: 50,
    min_purchase: 100,
    uses_count: 8,
    max_uses: 1000,
    is_active: true,
  },
];

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponData[]>(INITIAL_COUPONS);
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [value, setValue] = useState<number>(10);
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [minPurchase, setMinPurchase] = useState<number>(0);
  const [maxUses, setMaxUses] = useState<number>(1000);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lux_coupons');
      if (stored) {
        setCoupons(JSON.parse(stored));
      } else {
        localStorage.setItem('lux_coupons', JSON.stringify(INITIAL_COUPONS));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveCoupons = (newList: CouponData[]) => {
    setCoupons(newList);
    try {
      localStorage.setItem('lux_coupons', JSON.stringify(newList));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const newCoupon: CouponData = {
      id: `c_${Date.now()}`,
      code: code.trim().toUpperCase(),
      discount_type: type,
      discount_value: Number(value),
      min_purchase: Number(minPurchase),
      uses_count: 0,
      max_uses: Number(maxUses),
      is_active: true,
    };

    // 1. Guardar en Supabase si está disponible
    try {
      const supabase = createAdminClient();
      await supabase.from('coupons').insert({
        code: newCoupon.code,
        discount_type: newCoupon.discount_type,
        discount_value: newCoupon.discount_value,
        min_purchase: newCoupon.min_purchase,
        max_uses: newCoupon.max_uses,
        is_active: true,
      });
    } catch (e) {
      console.warn('Supabase not available for coupon insert, saved in local state:', e);
    }

    // 2. Guardar en estado persistente local
    const updated = [newCoupon, ...coupons.filter((c) => c.code !== newCoupon.code)];
    saveCoupons(updated);

    setNotification(`¡Cupón ${newCoupon.code} creado exitosamente y activo en la tienda!`);
    setCode('');
    setValue(10);
    setShowModal(false);

    setTimeout(() => setNotification(null), 4000);
  };

  const toggleStatus = (id: string) => {
    const updated = coupons.map((c) => (c.id === id ? { ...c, is_active: !c.is_active } : c));
    saveCoupons(updated);
  };

  const deleteCoupon = (id: string) => {
    const updated = coupons.filter((c) => c.id !== id);
    saveCoupons(updated);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#242424] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 font-sans">
            <Tag className="w-8 h-8 text-[#C5A880]" /> Cupones de Descuento
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Gestión y creación de cupones promocionales activos para clientes.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-xl glow-gold-btn text-black font-bold text-xs flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nuevo Cupón</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-[#101010] border border-[#242424] rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-[#050505] border-b border-[#242424] text-zinc-400 uppercase font-mono">
            <tr>
              <th className="px-6 py-4">Código</th>
              <th className="px-6 py-4">Tipo Descuento</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Compra Mínima</th>
              <th className="px-6 py-4">Usos</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242424]">
            {coupons.map((c) => (
              <tr key={c.id || c.code} className="hover:bg-[#161616] transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-[#C5A880] text-sm">{c.code}</td>
                <td className="px-6 py-4 font-mono uppercase">{c.discount_type}</td>
                <td className="px-6 py-4 font-mono font-bold text-white">
                  {c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value} MXN`}
                </td>
                <td className="px-6 py-4 font-mono text-zinc-400">
                  {c.min_purchase ? `$${c.min_purchase} MXN` : 'Sin mínimo'}
                </td>
                <td className="px-6 py-4 font-mono">{c.uses_count || 0} / {c.max_uses || 1000}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => c.id && toggleStatus(c.id)}
                    className={`px-3 py-1 rounded-full border text-[10px] font-mono font-bold transition-all ${
                      c.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                    }`}
                  >
                    {c.is_active ? 'ACTIVO' : 'INACTIVO'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => c.id && deleteCoupon(c.id)}
                    className="p-2 rounded-lg bg-zinc-900 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    title="Eliminar Cupón"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Crear Cupón */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D0D12] border border-[#C5A880]/30 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-base font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#C5A880]" />
              Crear Nuevo Cupón Promocional
            </h3>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Código del Cupón (sin espacios):</label>
                <input
                  type="text"
                  required
                  placeholder="EJ. LUX20 O OFERTA50"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white uppercase font-mono focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Tipo de Descuento:</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:border-[#C5A880]"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($ MXN)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Valor:</label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(parseFloat(e.target.value))}
                    className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Compra Mínima ($):</label>
                  <input
                    type="number"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(parseFloat(e.target.value))}
                    className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Límite Máximo Usos:</label>
                  <input
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(parseInt(e.target.value))}
                    className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-bold rounded-xl hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  className="px-6 py-2.5 glow-gold-btn text-black font-bold text-xs rounded-xl"
                >
                  Guardar Cupón
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
