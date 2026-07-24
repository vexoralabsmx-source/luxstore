'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  KeyRound, 
  Wallet, 
  MessageSquare, 
  Shield, 
  Settings, 
  LogOut,
  Zap
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Resumen', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Mis Pedidos', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Mis Productos Digitales', href: '/dashboard/products', icon: KeyRound },
    { name: 'Mis Créditos', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Soporte y Tickets', href: '/dashboard/tickets', icon: MessageSquare },
    { name: 'Seguridad y Perfil', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Customer Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-[#101010] border border-[#242424] rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-[#242424] pb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#7C3AED] p-[1px]">
                <div className="w-full h-full bg-[#0A0A0A] rounded-[15px] flex items-center justify-center font-bold text-white text-sm font-mono">
                  LX
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Área de Cliente</h3>
                <p className="text-[11px] text-zinc-400 font-mono">Cuenta Personal</p>
              </div>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#1F1F1F] text-white border border-[#242424] text-[#00E5FF]'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#00E5FF]' : 'text-zinc-500'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-[#242424]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9 space-y-6">
          {children}
        </main>

      </div>
    </div>
  );
}
