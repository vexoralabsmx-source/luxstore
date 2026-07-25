'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Copy, Eye, EyeOff, KeyRound, PackageX } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function CustomerProductsPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('deliveries')
      .select('id, delivered_content, created_at, item:order_items(product_name, variant_name), order:orders(order_number)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        setDeliveries(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-[#242424] pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <KeyRound className="w-6 h-6 text-[#00E5FF]" /> Mis Productos Digitales
        </h1>
        <p className="text-xs text-zinc-400 mt-1">Solo se muestran productos entregados a tu usuario.</p>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-400">Cargando productos…</p>
      ) : deliveries.length === 0 ? (
        <div className="bg-[#101010] border border-[#242424] rounded-3xl p-10 text-center">
          <PackageX className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-white font-bold">Aún no tienes productos entregados</p>
          <Link href="/catalog" className="text-xs text-[#00E5FF] underline">Explorar catálogo</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="bg-[#101010] border border-[#242424] rounded-3xl p-6 space-y-4">
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white">{delivery.item?.product_name || 'Producto digital'}</h3>
                  <p className="text-xs text-[#00E5FF]">{delivery.item?.variant_name}</p>
                </div>
                <Link href={`/order/${delivery.order?.order_number}`} className="text-xs text-zinc-400 underline">
                  {delivery.order?.order_number}
                </Link>
              </div>
              <div className="bg-[#050505] border border-[#242424] rounded-xl p-4 flex items-center justify-between gap-3">
                <code className="text-white break-all">
                  {revealed[delivery.id] ? delivery.delivered_content : '••••••••••••••••••••'}
                </code>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRevealed((value) => ({ ...value, [delivery.id]: !value[delivery.id] }))}
                    aria-label="Mostrar u ocultar"
                  >
                    {revealed[delivery.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(delivery.delivered_content)} aria-label="Copiar">
                    <Copy className="w-4 h-4 text-[#00E5FF]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
