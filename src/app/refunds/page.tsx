import React from 'react';
import Link from 'next/link';
import { ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

export default function RefundsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-[#242424] pb-6">
        <h1 className="text-3xl font-extrabold text-white">Política de Garantía y Reemplazos</h1>
        <p className="text-xs text-zinc-400 font-mono mt-1">Cobertura directa Lux Store</p>
      </div>

      <div className="bg-[#101010] border border-[#242424] rounded-3xl p-8 space-y-6 text-sm text-zinc-300 leading-relaxed">
        <div className="p-4 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center gap-3 text-xs text-[#00E5FF]">
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          <span>Todos los productos cuentan con garantía de reemplazo dentro del periodo especificado en su tarjeta de detalles.</span>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Condiciones de Reemplazo</h2>
          <p>
            Si un código, licencia o cuenta no funciona al momento de la entrega o deja de funcionar durante su periodo de garantía, el cliente puede abrir un ticket desde su panel seleccionando el pedido afectado.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Proceso de Resolución</h2>
          <p>
            Una vez verificado el reporte por el equipo de soporte o de forma automatizada, se asignará una nueva unidad de reemplazo sin costo adicional o se abonará el valor de la compra en créditos internos.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Reembolsos en Créditos</h2>
          <p>
            Debido a la naturaleza de los productos digitales inmediatamente revelados, los reembolsos se procesan como saldo en créditos internos de Lux Store, los cuales nunca expiran y pueden utilizarse en cualquier producto de la tienda.
          </p>
        </section>
      </div>
    </div>
  );
}
