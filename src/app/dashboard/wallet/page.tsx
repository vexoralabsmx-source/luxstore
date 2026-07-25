'use client';

import { useCallback, useEffect, useState } from 'react';
import { CreditCard, LoaderCircle, Wallet } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function CustomerWalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(200);
  const [topupLoading, setTopupLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadWallet = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
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
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const topupId = searchParams.get('clip_topup');
    if (!topupId || searchParams.get('status') === 'error') {
      if (searchParams.get('status') === 'error') {
        setError('El pago no se completó. Tu saldo no fue modificado.');
      }
      return;
    }

    setTopupLoading(true);
    fetch('/api/wallet/topups/clip', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topupId }),
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok && response.status !== 202) {
          throw new Error(payload.error || 'No se pudo confirmar la recarga');
        }
        if (payload.status === 'completed') {
          setMessage('Recarga confirmada. Tu saldo ya está disponible.');
          await loadWallet();
        } else {
          setMessage('Clip sigue procesando el pago. El saldo se abonará automáticamente.');
        }
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setTopupLoading(false));
  }, [loadWallet]);

  const startTopup = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setTopupLoading(true);
    try {
      const response = await fetch('/api/wallet/topups/clip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'No se pudo iniciar la recarga');
      window.location.assign(payload.url);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo iniciar la recarga');
      setTopupLoading(false);
    }
  };

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
      <form
        onSubmit={startTopup}
        className="space-y-5 rounded-3xl border border-[#242424] bg-[#101010] p-6"
      >
        <div>
          <h2 className="flex items-center gap-2 font-bold text-white">
            <CreditCard className="h-5 w-5 text-[#C5A880]" />
            Recargar con Clip
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-400">
            Paga con tarjeta en el checkout seguro de Clip. Los créditos se
            acreditan únicamente después de validar el pago con Clip.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[100, 200, 500, 1000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset)}
              aria-pressed={amount === preset}
              className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                amount === preset
                  ? 'border-[#C5A880] bg-[#C5A880]/15 text-[#E8D8C8]'
                  : 'border-[#2A2A2A] text-zinc-400 hover:border-zinc-600'
              }`}
            >
              ${preset}
            </button>
          ))}
        </div>
        <div>
          <label htmlFor="topup-amount" className="mb-2 block text-sm font-medium text-zinc-300">
            Otro monto
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
            <input
              id="topup-amount"
              type="number"
              inputMode="decimal"
              min={10}
              max={10000}
              step="0.01"
              required
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
              className="min-h-12 w-full rounded-xl border border-[#2A2A2A] bg-black pl-8 pr-16 text-base text-white outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500">MXN</span>
          </div>
          <p className="mt-2 text-xs text-zinc-500">De $10 a $10,000 MXN por recarga.</p>
        </div>
        {message && <p role="status" className="text-sm text-emerald-300">{message}</p>}
        {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
        <button
          type="submit"
          disabled={topupLoading || amount < 10 || amount > 10000}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#C5A880] px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-[#E8D8C8] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {topupLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {topupLoading ? 'Procesando…' : `Recargar $${Number(amount || 0).toFixed(2)} con Clip`}
        </button>
      </form>
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
