'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Command, Boxes, ShoppingBag, KeyRound, Wallet, Settings, Zap, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { title: 'Ver Catálogo VIP Completo', href: '/catalog', category: 'Navegación', icon: Search },
    { title: 'Mi Bóveda Digital', href: '/dashboard/products', category: 'Cliente VIP', icon: KeyRound },
    { title: 'Mis Créditos & Billetera', href: '/dashboard/wallet', category: 'Cliente VIP', icon: Wallet },
    { title: 'Panel Admin — Cargar Stock Cifrado', href: '/admin/inventory', category: 'Administración', icon: Boxes },
    { title: 'Panel Admin — Aprobar Pagos SPEI / Crypto', href: '/admin/orders', category: 'Administración', icon: ShoppingBag },
    { title: 'Panel Admin — Ajustes de Tienda', href: '/admin/settings', category: 'Administración', icon: Settings },
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(href);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#09090B] border border-[#D4AF37]/30 text-xs text-zinc-400 hover:text-white hover:border-[#D4AF37] transition-all"
        title="Abrir Command Palette (Ctrl + K)"
      >
        <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span className="text-[11px] font-mono">Buscar...</span>
        <kbd className="px-1.5 py-0.5 rounded bg-[#18181B] text-[10px] text-[#FFF5C0] font-mono border border-[#27272A]">
          Ctrl K
        </kbd>
      </button>

      {/* Modal Backdrop & Command Box */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-start justify-center pt-24 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="bg-[#09090B] border border-[#D4AF37]/40 rounded-3xl max-w-xl w-full shadow-goldGlowIntense overflow-hidden"
            >
              {/* Input Bar */}
              <div className="relative flex items-center border-b border-[#27272A] px-4 py-3.5">
                <Command className="w-5 h-5 text-[#D4AF37] mr-3" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Escribe para buscar productos, pedidos, atajos admin..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-zinc-500 font-sans"
                />
                <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                {filtered.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-500 font-mono">
                    No se encontraron comandos para &quot;{query}&quot;
                  </div>
                ) : (
                  filtered.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleSelect(item.href)}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[#18181B] text-left transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#030303] border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] group-hover:border-[#D4AF37]">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block group-hover:text-[#FFF5C0]">{item.title}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">{item.category}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-[#D4AF37] transition-colors" />
                      </button>
                    );
                  })
                )}
              </div>

              <div className="p-3 bg-[#030303] border-t border-[#27272A] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>Navega con las flechas o ratón</span>
                <span className="text-[#D4AF37]">ESC para cerrar</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
