import React from 'react';
import Link from 'next/link';
import { Crown, ShieldCheck, Lock, Headphones, Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#030303] border-t border-[#1C1C1C] pt-16 pb-12 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Badges */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-[#1C1C1C]">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#0C0C0C] border border-[#1C1C1C]">
            <Zap className="w-5 h-5 text-[#C5A880] flex-shrink-0" />
            <div>
              <h4 className="text-white text-xs font-bold font-serif">Entrega Digital</h4>
              <p className="text-[11px] text-zinc-400">Asignación 24/7 en tu cuenta.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#0C0C0C] border border-[#1C1C1C]">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <h4 className="text-white text-xs font-bold font-serif">Garantía Directa</h4>
              <p className="text-[11px] text-zinc-400">Atención y remplazo rápido.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#0C0C0C] border border-[#1C1C1C]">
            <Lock className="w-5 h-5 text-[#C5A880] flex-shrink-0" />
            <div>
              <h4 className="text-white text-xs font-bold font-serif">Cifrado AES-256</h4>
              <p className="text-[11px] text-zinc-400">Seguridad de grado bancario.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#0C0C0C] border border-[#1C1C1C]">
            <Headphones className="w-5 h-5 text-[#C5A880] flex-shrink-0" />
            <div>
              <h4 className="text-white text-xs font-bold font-serif">Soporte Directo</h4>
              <p className="text-[11px] text-zinc-400">WhatsApp y tickets de ayuda.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-12">
          
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <img 
                src="https://res.cloudinary.com/dakjhsfne/image/upload/v1784914608/lux_hmytor.jpg" 
                alt="Lux Store Logo" 
                className="w-8 h-8 rounded-xl object-cover border border-[#C5A880]/50" 
              />
              <span className="font-serif text-lg tracking-wider text-white font-bold">
                LUX <span className="text-[#C5A880] font-sans font-extrabold text-base">STORE</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Plataformas, videojuegos y servicios digitales a precios accesibles con entrega cifrada y soporte directo.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h5 className="text-[#C5A880] font-bold text-xs uppercase tracking-wider font-mono mb-4">Navegación</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/catalog" className="hover:text-white transition-colors">Catálogo General</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Carrito</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Mi Cuenta</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h5 className="text-[#C5A880] font-bold text-xs uppercase tracking-wider font-mono mb-4">Soporte</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/faq" className="hover:text-white transition-colors">Preguntas Frecuentes</Link></li>
              <li><Link href="/dashboard/tickets" className="hover:text-white transition-colors">Tickets de Ayuda</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contacto</Link></li>
              <li><Link href="/refunds" className="hover:text-white transition-colors">Garantía y Reemplazos</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="text-[#C5A880] font-bold text-xs uppercase tracking-wider font-mono mb-4">Legal</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/terms" className="hover:text-white transition-colors">Términos del Servicio</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
              <li><Link href="/refunds" className="hover:text-white transition-colors">Política de Reembolsos</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#1C1C1C] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500 font-mono">
          <p>© 2026 Lux Store. Todos los derechos reservados.</p>
          <div className="flex items-center gap-3 text-zinc-400">
            <span>Métodos:</span>
            <span className="px-2 py-0.5 bg-[#0C0C0C] border border-[#1C1C1C] rounded text-white font-mono text-[10px]">Clip</span>
            <span className="px-2 py-0.5 bg-[#0C0C0C] border border-[#1C1C1C] rounded text-white font-mono text-[10px]">SPEI BBVA</span>
            <span className="px-2 py-0.5 bg-[#0C0C0C] border border-[#1C1C1C] rounded text-white font-mono text-[10px]">Cripto</span>
            <span className="px-2 py-0.5 bg-[#0C0C0C] border border-[#1C1C1C] rounded text-white font-mono text-[10px]">Créditos</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
