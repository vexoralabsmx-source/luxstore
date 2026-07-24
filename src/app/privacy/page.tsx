import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-[#242424] pb-6">
        <h1 className="text-3xl font-extrabold text-white">Política de Privacidad</h1>
        <p className="text-xs text-zinc-400 font-mono mt-1">Protección de Datos en Lux Store</p>
      </div>

      <div className="bg-[#101010] border border-[#242424] rounded-3xl p-8 space-y-6 text-sm text-zinc-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Recopilación de Datos</h2>
          <p>
            En Lux Store recopilamos únicamente los datos necesarios para procesar tus compras y garantizar la entrega de productos digitales (correo electrónico, nombre, historial de pedidos y dirección IP por seguridad).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Uso de la Información</h2>
          <p>
            Tus datos se emplean exclusivamente para asignarte productos, verificar pagos, enviar notificaciones transaccionales vía Resend y brindar soporte en caso de reclamaciones de garantía.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Cifrado de Información Sensible</h2>
          <p>
            Los accesos, claves e información de inventario digital están cifrados con algoritmos AES-256-GCM. No almacenamos números ni información de tarjetas bancarias.
          </p>
        </section>
      </div>
    </div>
  );
}
