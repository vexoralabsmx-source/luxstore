'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Eye, 
  ShoppingCart, 
  Star, 
  CheckCircle2, 
  XCircle,
  PackageX,
  Zap,
  ShieldCheck,
  MessageCircle,
  AlertTriangle
} from 'lucide-react';
import { LUX_CATEGORIES, LUX_BANK_INFO, LUX_TERMS_AND_GUARANTEE } from '@/data/luxCatalog';
import { ProductCard3D } from '@/components/ProductCard3D';

export default function CatalogPage() {
  const [productsList, setProductsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();

    // Sincronización en tiempo real cuando el administrador crea, edita o elimina productos
    window.addEventListener('storage', loadProducts);
    window.addEventListener('products-updated', loadProducts);

    return () => {
      window.removeEventListener('storage', loadProducts);
      window.removeEventListener('products-updated', loadProducts);
    };
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/catalog', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setProductsList(payload.products || []);
    } catch (e) {
      console.error(e);
      setProductsList([]);
    }
  };

  const filteredProducts = useMemo(() => {
    return productsList.filter((product) => {
      const productName = product.name || '';
      const categoryName = product.category_name || product.category || '';
      const matchesSearch = productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category_slug === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      const priceA = a.sale_price || a.base_price || 0;
      const priceB = b.sale_price || b.base_price || 0;
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      return (b.sales || 0) - (a.sales || 0);
    });
  }, [productsList, searchQuery, selectedCategory, sortBy]);

  const handleAddToCart = (product: any) => {
    try {
      const stored = localStorage.getItem('lux_cart');
      let cart = stored ? JSON.parse(stored) : [];
      const index = cart.findIndex((item: any) => item.id === product.id);
      if (index > -1) {
        cart[index].quantity = Math.min(Number(product.stock) || 1, (Number(cart[index].quantity) || 1) + 1);
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      localStorage.setItem('lux_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
      setAddedProductId(product.id);
      setTimeout(() => setAddedProductId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header Banner */}
      <div className="border-b border-[#1C1C1C] pb-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-wide">
              Catálogo General Lux Store
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Plataformas, videojuegos y servicios digitales a precios accesibles.
            </p>
          </div>

          <a
            href={LUX_BANK_INFO.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#141414] border border-[#C5A880]/40 text-[#E8D8C8] text-xs font-bold hover:bg-[#1A1A1A] transition-all flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-[#C5A880]" />
            <span>Soporte / Pedidos Especiales WhatsApp</span>
          </a>
        </div>

        {/* Important Warning Notice */}
        <div className="p-4 rounded-xl bg-[#0F0F0F] border border-[#1C1C1C] text-xs text-zinc-300 flex items-start gap-3 font-mono">
          <AlertTriangle className="w-4 h-4 text-[#C5A880] flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white uppercase block mb-0.5">Información Importante</span>
            Pregunta por stock, método de entrega, región y tiempo estimado antes de realizar cualquier pago. Lux Store nunca solicitará NIP ni contraseñas bancarias.
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="glass-vip-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#C5A880] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar plataforma o servicio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050505] border border-[#1C1C1C] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A880]"
          />
        </div>

        {/* Category Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#050505] border border-[#1C1C1C] rounded-xl px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-[#C5A880]"
          >
            <option value="all">Todas las Categorías</option>
            {LUX_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-[#050505] border border-[#1C1C1C] rounded-xl px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-[#C5A880]"
          >
            <option value="popular">Más Solicitados</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
          </select>
        </div>

      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="glass-vip-card rounded-3xl p-16 text-center space-y-4">
          <PackageX className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-white">No hay productos en el catálogo aún</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Los productos creados desde el Panel de Administración aparecerán aquí al instante.
          </p>
          <a
            href={LUX_BANK_INFO.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C5A880] text-black text-xs font-bold rounded-xl"
          >
            Pedir por WhatsApp
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard3D
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                category_name: product.category_name || product.category || 'Digital',
                base_price: product.base_price || 0,
                sale_price: product.sale_price || product.base_price || 0,
                stock: product.stock || 0,
                delivery: product.delivery || 'Entrega Instantánea',
                image: product.image_url || product.image || '',
                logo: product.logo || '',
                brandColor: product.brandColor || '#C5A880',
                rating: product.rating,
                review_count: product.review_count || 0,
                sales: product.sales || 0,
              }}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      {/* Guarantee Rules */}
      <div className="glass-vip-card rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" /> Condiciones de Garantía Lux Store
        </h3>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
          {LUX_TERMS_AND_GUARANTEE.map((rule: string, idx: number) => (
            <li key={idx} className="flex items-start gap-2 bg-[#050505] p-3 rounded-xl border border-[#1C1C1C]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] mt-1.5 flex-shrink-0"></span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
