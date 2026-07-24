'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Boxes, 
  ShoppingBag, 
  Users, 
  Wallet, 
  Tag, 
  MessageSquare, 
  RefreshCw, 
  CreditCard, 
  Zap, 
  ShieldCheck, 
  FileText, 
  Settings, 
  LogOut,
  Lock,
  ChevronRight,
  Crown
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      localStorage.removeItem('lux_admin_session');
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    window.location.href = '/login';
  };

  const navGroups = [
    {
      title: 'Principal',
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Pedidos y Pagos', href: '/admin/orders', icon: ShoppingBag },
        { name: 'Inventario Cifrado', href: '/admin/inventory', icon: Boxes },
        { name: 'Productos y Variantes', href: '/admin/products', icon: Package },
        { name: 'Categorías', href: '/admin/categories', icon: FolderTree },
      ],
    },
    {
      title: 'Clientes y Soporte',
      items: [
        { name: 'Clientes y Riesgo', href: '/admin/customers', icon: Users },
        { name: 'Soporte y Tickets', href: '/admin/tickets', icon: MessageSquare },
        { name: 'Reemplazos', href: '/admin/replacements', icon: RefreshCw },
        { name: 'Créditos Internos', href: '/admin/credits', icon: Wallet },
        { name: 'Cupones', href: '/admin/coupons', icon: Tag },
      ],
    },
    {
      title: 'Sistema y Ajustes',
      items: [
        { name: 'Métodos de Pago', href: '/admin/payments', icon: CreditCard },
        { name: 'Integraciones', href: '/admin/integrations', icon: Zap },
        { name: 'Equipo Interno', href: '/admin/users', icon: ShieldCheck },
        { name: 'Audit Logs', href: '/admin/logs', icon: FileText },
        { name: 'Ajustes Generales', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row">
      
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#080808] border-r border-[#1C1C1C] flex-shrink-0 flex flex-col justify-between p-4">
        <div className="space-y-6">
          
          {/* Brand Header */}
          <Link href="/admin" className="flex items-center gap-3 px-2 py-3">
            <div className="w-8 h-8 rounded-xl bg-[#0F0F0F] border border-[#C5A880]/50 flex items-center justify-center text-[#C5A880]">
              <Crown className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1 font-serif">
                LUX <span className="text-[#C5A880]">ADMIN</span>
              </span>
              <span className="text-[9px] text-zinc-500 font-mono uppercase">Panel Privado Owner</span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-6">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <h4 className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 px-3 font-semibold mb-1">
                  {group.title}
                </h4>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#141414] text-white border border-[#C5A880]/40'
                          : 'text-zinc-400 hover:text-white hover:bg-[#0F0F0F]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A880]' : 'text-zinc-500'}`} />
                        <span>{item.name}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#C5A880]" />}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Quick Links & Logout */}
        <div className="pt-4 border-t border-[#1C1C1C] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-[#0F0F0F] rounded-xl"
          >
            <Zap className="w-4 h-4 text-[#C5A880]" />
            <span>Ver Tienda Pública</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Panel</span>
          </button>
        </div>
      </aside>

      {/* Content Body */}
      <div className="flex-grow p-6 sm:p-10 max-w-7xl overflow-x-hidden">
        {children}
      </div>

    </div>
  );
}
