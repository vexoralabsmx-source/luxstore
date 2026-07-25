'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Image as ImageIcon,
  X,
  Save,
  Boxes,
  AlertTriangle,
  PackageX,
  Database
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [inventoryStockMap, setInventoryStockMap] = useState<Record<string, number>>({});
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State with Stock Field
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'Streaming',
    base_price: 199,
    sale_price: 149,
    stock: 10,
    warranty_days: 30,
    image_url: '',
    description: '',
  });

  useEffect(() => {
    loadProductsAndStock();
  }, []);

  const loadProductsAndStock = async () => {
    try {
      const response = await fetch('/api/admin/products', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setProducts(payload.products || []);
      const counts: Record<string, number> = {};
      payload.products?.forEach((product: any) => {
        counts[String(product.name).toLowerCase()] = Number(product.stock) || 0;
      });
      setInventoryStockMap(counts);
    } catch (e) {
      console.error(e);
    }
  };

  const getRealStockCount = (productName: string): number => {
    const key = productName.toLowerCase();
    if (inventoryStockMap[key] !== undefined) return inventoryStockMap[key];
    
    const matchKey = Object.keys(inventoryStockMap).find(
      (k) => k.includes(key) || key.includes(k)
    );
    return matchKey ? inventoryStockMap[matchKey] : 0;
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      category: 'Streaming',
      base_price: 299,
      sale_price: 199,
      stock: 10,
      warranty_days: 30,
      image_url: '',
      description: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      category: product.category,
      base_price: product.base_price,
      sale_price: product.sale_price,
      stock: product.stock !== undefined ? product.stock : 10,
      warranty_days: product.warranty_days,
      image_url: product.image_url || '',
      description: product.description || '',
    });
    setShowModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image_url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const generatedSlug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const response = await fetch('/api/admin/products', {
      method: editingProduct ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(editingProduct ? { id: editingProduct.id } : {}),
        name: formData.name,
        slug: generatedSlug,
        category: formData.category,
        base_price: Number(formData.base_price),
        sale_price: Number(formData.sale_price),
        warranty_days: Number(formData.warranty_days),
        image_url: formData.image_url,
        description: formData.description,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      alert(payload.error || 'No se pudo guardar el producto');
      return;
    }
    setShowModal(false);
    await loadProductsAndStock();
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm(
      '¿Deseas retirar este producto del catálogo? Ya no se venderá, pero sus pedidos anteriores se conservarán.'
    );
    if (!confirmed) return;

    setNotice(null);
    try {
      const response = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'No se pudo retirar el producto');

      setNotice({
        type: 'success',
        message:
          payload.message ||
          'Producto retirado del catálogo. El historial de compras se conservó.',
      });
      await loadProductsAndStock();
    } catch (error) {
      setNotice({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'No se pudo retirar el producto del catálogo.',
      });
    }
  };

  const handleClearAllProducts = () => {
    alert('Elimina cada producto de forma individual para evitar borrar inventario o pedidos por accidente.');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1C1C1C] pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
            <Package className="w-7 h-7 text-[#C5A880]" /> Catálogo de Productos & Stock
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Agrega tus productos personalizados, fotos, precios y especifica las unidades de stock disponibles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/inventory"
            className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-[#C5A880]/30 text-[#C5A880] hover:text-white text-xs font-bold transition-colors flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            <span>Bóveda de Cuentas</span>
          </Link>

          {products.length > 0 && (
            <button
              onClick={handleClearAllProducts}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 text-xs font-bold transition-colors"
            >
              Vaciar Todo
            </button>
          )}

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl glow-gold-btn text-black font-bold text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Producto</span>
          </button>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className={`rounded-2xl border px-4 py-3 text-xs font-medium ${
            notice.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
          }`}
        >
          {notice.message}
        </div>
      )}

      {/* Products Data Table */}
      <div className="glass-vip-card rounded-3xl overflow-hidden border-[#1C1C1C] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#050505] border-b border-[#1C1C1C] text-zinc-400 uppercase font-mono">
              <tr>
                <th className="px-6 py-4">Foto</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Precio Oferta</th>
                <th className="px-6 py-4">Stock Asignado</th>
                <th className="px-6 py-4">Garantía</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {products.length > 0 ? (
                products.map((p) => {
                  const vaultStock = getRealStockCount(p.name);
                  const manualStock = p.stock !== undefined ? Number(p.stock) : 0;
                  const totalStock = Math.max(vaultStock, manualStock);
                  const isOutOfStock = totalStock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-[#0E0E0E] transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-xl bg-[#050505] border border-[#1C1C1C] overflow-hidden flex items-center justify-center">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-zinc-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-white block text-sm font-sans">{p.name}</span>
                        <span className="text-[11px] text-zinc-500 font-mono">/{p.slug}</span>
                      </td>
                      <td className="px-6 py-4 text-zinc-300">{p.category}</td>
                      <td className="px-6 py-4 font-mono font-bold text-[#C5A880]">
                        ${p.sale_price} MXN <span className="text-zinc-500 line-through text-[10px]">${p.base_price}</span>
                      </td>
                      <td className="px-6 py-4 font-mono">
                        {isOutOfStock ? (
                          <span className="px-2.5 py-1 rounded-md bg-rose-950/60 border border-rose-500/40 text-rose-400 font-bold text-[10px] inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-400" /> 0 unidades (Sin Stock)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-bold text-[10px]">
                            {totalStock} unidades disponibles
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-300">
                        {p.warranty_days} Días
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                          isOutOfStock
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {isOutOfStock ? 'AGOTADO' : 'ACTIVO'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-2 rounded-xl bg-[#141414] border border-[#1C1C1C] text-zinc-300 hover:text-white"
                            title="Editar Producto / Stock / Fotos"
                          >
                            <Edit3 className="w-4 h-4 text-[#C5A880]" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 rounded-xl bg-[#141414] border border-[#1C1C1C] text-zinc-300 hover:text-rose-400"
                            title="Retirar del catálogo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-zinc-500 font-mono space-y-3">
                    <PackageX className="w-12 h-12 text-zinc-700 mx-auto" />
                    <p className="text-sm font-bold text-white">No hay productos en el catálogo aún</p>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      Haz clic en el botón superior <strong className="text-[#C5A880]">"Crear Nuevo Producto"</strong> para añadir tus productos y especificar unidades de stock.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL WITH STOCK FIELD */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C0C0C] border border-[#1C1C1C] rounded-3xl max-w-xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-4">
              <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#C5A880]" />
                {editingProduct ? 'Editar Producto & Stock' : 'Crear Nuevo Producto'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              
              <div>
                <label className="block text-zinc-400 uppercase mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej. Spotify Premium 1 Año"
                  className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#C5A880]"
                >
                  <option value="Streaming">Streaming</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Software">Software</option>
                  <option value="Productividad">Productividad</option>
                  <option value="Educación">Educación</option>
                  <option value="IA y Aprendizaje">IA y Aprendizaje</option>
                  <option value="Steam y Videojuegos">Steam y Videojuegos</option>
                </select>
              </div>

              {/* STOCK FIELD */}
              <div className="p-3.5 bg-[#050505] border border-[#C5A880]/40 rounded-2xl space-y-1.5">
                <label className="block text-[#C5A880] uppercase font-bold">Unidades de Stock Disponibles *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#0C0C0C] border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-[#C5A880]"
                />
                <span className="text-[10px] text-zinc-400 block">
                  Coloca el número de licencias/cuentas que tienes disponibles. Si indicas 0, la tienda mostrará "Agotado" y bloqueará compras.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Precio Normal (MXN)</label>
                  <input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Precio Oferta (MXN)</label>
                  <input
                    type="number"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              {/* PHOTO UPLOADER (Cloudinary / File / URL) */}
              <div className="space-y-2 pt-2 border-t border-[#1C1C1C]">
                <label className="block text-[#C5A880] uppercase font-bold">Imagen del Producto (Cloudinary / Archivo / URL)</label>
                
                {formData.image_url && (
                  <div className="w-24 h-24 rounded-2xl bg-[#050505] border border-[#C5A880]/50 overflow-hidden mb-2">
                    <img src={formData.image_url} alt="Vista previa" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Pega la URL de Cloudinary o enlace de imagen..."
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="flex-1 bg-[#050505] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C5A880]"
                  />
                  
                  <label className="px-4 py-2.5 bg-[#141414] border border-[#1C1C1C] text-zinc-300 hover:text-white rounded-xl cursor-pointer flex items-center justify-center gap-2 font-bold">
                    <Upload className="w-4 h-4 text-[#C5A880]" />
                    <span>Subir Foto</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">Días de Garantía</label>
                <input
                  type="number"
                  value={formData.warranty_days}
                  onChange={(e) => setFormData({ ...formData, warranty_days: parseInt(e.target.value) || 30 })}
                  className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1C1C1C]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-[#141414] text-zinc-400 text-xs font-bold rounded-xl border border-[#1C1C1C]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 glow-gold-btn text-black font-bold text-xs rounded-xl flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProduct ? 'Guardar Cambios' : 'Crear Producto con Stock'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
