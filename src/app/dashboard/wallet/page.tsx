'use client';

import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function CustomerWalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', user.id)
        .maybeSingle();
      if (wallet) {
        setBalance(Number(wallet.balance));
        const { data } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('wallet_id', wallet.id)
          .order('created_at', { ascending: false });
        setTransactions(data || []);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-[#242424] pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Wallet className="w-6 h-6 text-[#C5A880]" /> Mis Créditos
        </h1>
      </div>
      <div className="bg-[#101010] border border-[#C5A880]/30 rounded-3xl p-8">
        <p className="text-xs text-[#C5A880] uppercase">Saldo real disponible</p>
        <p className="text-4xl font-black text-white font-mono mt-2">
          ${balance.toFixed(2)} <span className="text-sm text-[#C5A880]">MXN</span>
        </p>
      </div>
      <div className="bg-[#101010] border border-[#242424] rounded-3xl p-6 space-y-3">
        <h2 className="font-bold text-white">Movimientos</h2>
        {loading ? <p className="text-zinc-400">Cargando…</p> : transactions.length === 0 ? (
          <p className="text-sm text-zinc-500">No hay movimientos en tu monedero.</p>
        ) : transactions.map((transaction) => (
          <div key={transaction.id} className="flex justify-between border-t border-[#242424] py-3 text-sm">
            <div>
              <p className="text-white">{transaction.description}</p>
              <p className="text-xs text-zinc-500">{new Date(transaction.created_at).toLocaleString('es-MX')}</p>
            </div>
            <strong className={Number(transaction.amount) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {Number(transaction.amount) >= 0 ? '+' : ''}${Number(transaction.amount).toFixed(2)}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}
