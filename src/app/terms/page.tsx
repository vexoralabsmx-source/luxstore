import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-[#242424] pb-6">
        <h1 className="text-3xl font-extrabold text-white">Términos y Condiciones del Servicio</h1>
        <p className="text-xs text-zinc-400 font-mono mt-1">Última actualización: 2026</p>
      </div>

      <div className="bg-[#101010] border border-[#242424] rounded-3xl p-8 space-y-6 text-sm text-zinc-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white text-emerald-400">1. Aceptación de Términos</h2>
          <p>
            Al ingresar y realizar compras en Lux Store, aceptas estar sujeto a los presentes Términos y Condiciones. Si no estás de acuerdo con alguno de ellos, debes abstenerte de utilizar la plataforma.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white text-emerald-400">2. Productos Digitales y Licencias</h2>
          <p>
            Lux Store distribuye códigos digitales, licencias originales, cuentas de acceso y gift cards. Todos los productos digitales entregados son verificados de forma automatizada antes de su asignación al cliente.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white text-emerald-400">3. Proceso de Entrega</h2>
          <p>
            La entrega de productos digitales ocurre de manera automática a través del panel privado de usuario en Lux Store tan pronto como el pago sea verificado por el backend (vía Clip, SPEI, Crypto o Créditos).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white text-emerald-400">4. Prohibición de Uso Fraudulento</h2>
          <p>
            Cualquier intento de contracargo injustificado, uso de información falsa o explotación de fallos del sistema resultará en el bloqueo permanente de la cuenta y revocación del acceso a los productos adquiridos.
          </p>
        </section>
      </div>
    </div>
  );
}
