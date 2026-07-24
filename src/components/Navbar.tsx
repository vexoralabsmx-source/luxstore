'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  Crown, 
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const updateCartCount = () => {
      try {
        const stored = localStorage.getItem('lux_cart');
        if (stored) {
          const items = JSON.parse(stored);
          const count = items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
          setCartCount(count);
        } else {
          setCartCount(0);
        }
      } catch (e) {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cart-updated', updateCartCount);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Catálogo General', href: '/catalog' },
    { name: 'Garantías', href: '/faq#garantia' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contacto', href: '/contact' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#050505]/95 backdrop-blur-xl border-b border-[#1C1C1C] py-3 shadow-subtle' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo - Clean LUX STORE */}
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="https://res.cloudinary.com/dakjhsfne/image/upload/v1784914608/lux_hmytor.jpg" 
              alt="Lux Store Logo" 
              className="w-9 h-9 rounded-xl object-cover border border-[#C5A880]/50 group-hover:scale-105 transition-transform" 
            />
            <span className="font-serif text-xl tracking-wider text-white font-bold">
              LUX <span className="text-[#C5A880] font-sans font-extrabold text-lg">STORE</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0C0C0C] border border-[#1C1C1C] rounded-full px-5 py-1.5 backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    isActive 
                      ? 'text-black bg-[#C5A880] font-bold' 
                      : 'text-zinc-300 hover:text-white hover:bg-[#141414]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            
            {/* Cart Button */}
            <Link 
              href="/cart"
              className="relative p-2.5 rounded-xl bg-[#0C0C0C] border border-[#1C1C1C] text-zinc-300 hover:text-white hover:border-[#C5A880] transition-all group"
              aria-label="Ver Carrito"
            >
              <ShoppingBag className="w-4 h-4 text-[#C5A880] group-hover:scale-105 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#C5A880] text-black font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-mono">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account / Dashboard Button */}
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-black bg-[#C5A880] hover:bg-[#E8D8C8] rounded-xl transition-all"
            >
              <User className="w-4 h-4 text-black" />
              <span>Mi Cuenta</span>
            </Link>

            {/* Admin Access Icon */}
            <Link
              href="/admin"
              className="hidden lg:flex items-center justify-center p-2.5 rounded-xl bg-[#0C0C0C] border border-[#1C1C1C] text-zinc-400 hover:text-[#C5A880] hover:border-[#C5A880]/40 transition-all"
              title="Panel Administrativo Owner"
            >
              <Lock className="w-4 h-4" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-[#0C0C0C] border border-[#1C1C1C] text-zinc-300"
              aria-label="Abrir Menú"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-[#C5A880]" /> : <Menu className="w-5 h-5 text-[#C5A880]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#050505] border-b border-[#1C1C1C] px-4 pt-4 pb-6 mt-3"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:text-white hover:bg-[#141414] rounded-xl transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-[#1C1C1C] my-2" />
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-black bg-[#C5A880] rounded-xl"
              >
                <User className="w-4 h-4" />
                <span>Mi Cuenta</span>
              </Link>
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white bg-[#0C0C0C] border border-[#1C1C1C] rounded-xl mt-1"
              >
                <Lock className="w-4 h-4 text-[#C5A880]" />
                <span>Panel Admin Owner</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
