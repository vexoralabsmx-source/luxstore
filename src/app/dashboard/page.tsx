'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { KeyRound, ShoppingBag, Wallet, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function CustomerDashboardPage() {
  const [stats, setStats] = useState({ balance: 0, orders: 0, products: 0 });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const [wallet, orders, deliveries] = await Promise.all([
        supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle(),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('deliveries').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        balance: Number(wallet.data?.balance || 0),
        orders: orders.count || 0,
        products: deliveries.count || 0,
      });
    });
  }, []);

  const cards = [
    { label: 'Saldo en créditos', value: `$${stats.balance.toFixed(2)} MXN`, icon: Wallet },
    { label: 'Productos entregados', value: String(stats.products), icon: KeyRound },
    { label: 'Pedidos totales', value: String(stats.orders), icon: ShoppingBag },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-[#101010] border border-[#242424] rounded-3xl p-8 flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Tu cuenta Lux Store</h1>
          <p className="text-xs text-zinc-400 mt-1">Datos sincronizados con tus compras reales.</p>
        </div>
        <Link href="/catalog" className="px-5 py-2.5 rounded-xl bg-[#00E5FF] text-black font-bold text-xs flex items-center gap-2">
          <Zap className="w-4 h-4" /> Ir al catálogo
        </Link>
      </div>
      <div className="grid sm:grid-cols-3 gap-6">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-[#101010] border border-[#242424] rounded-2xl p-6">
            <div className="flex justify-between text-xs text-zinc-400"><span>{label}</span><Icon className="w-5 h-5 text-[#00E5FF]" /></div>
            <p className="text-3xl font-bold text-white font-mono mt-2">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
