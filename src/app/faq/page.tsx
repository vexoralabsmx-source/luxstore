import React from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronRight, MessageSquare } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      q: '¿Cómo funciona la entrega automática?',
      a: 'Tan pronto como tu pago es procesado y confirmado por nuestro backend (ya sea Clip, SPEI, Crypto o Créditos), el sistema asigna una unidad de inventario disponible y la revela en tu pantalla e historial de cuenta.',
    },
    {
      q: '¿Qué hago si mi código o cuenta presenta algún fallo?',
      a: 'Ingresa a tu panel de usuario en la sección "Mis Tickets" o "Mis Productos" y presiona el botón "Solicitar Soporte". Nuestro equipo revisará el caso y aprobará un reemplazo si estás dentro del periodo de garantía.',
    },
    {
      q: '¿Cómo funcionan los pagos por SPEI?',
      a: 'Al seleccionar SPEI en el checkout, el sistema te proporciona los datos bancarios (CLABE, Banco) y un monto con centavos únicos (ej. $250.14 MXN). Al realizar la transferencia por esa cantidad exacta o subir tu comprobante, la orden pasa a revisión y se entrega rápidamente.',
    },
    {
      q: '¿Qué son los Créditos Lux Store?',
      a: 'Es nuestro monedero interno. 1 peso mexicano equivale a 1 crédito. Puedes recargar tu saldo o recibir créditos por reembolsos para realizar compras instantáneas con 0 segundos de espera en checkout.',
    },
    {
      q: '¿Puedo comprar sin registrarme?',
      a: 'Requerimos un correo electrónico básico durante el checkout para crear o vincular tu área privada de usuario donde podrás consultar tus accesos en cualquier momento de forma segura.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-[#242424] pb-6 text-center">
        <h1 className="text-3xl font-extrabold text-white">Centro de Ayuda & Preguntas Frecuentes</h1>
        <p className="text-sm text-zinc-400 mt-2">Respuestas rápidas sobre entregas, garantias y pagos en Lux Store</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-[#101010] border border-[#242424] rounded-2xl p-6 space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#00E5FF]" />
              {faq.q}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed pl-6">
              {faq.a}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-[#0A0A0A] border border-[#242424] rounded-2xl p-8 text-center space-y-4">
        <h3 className="text-lg font-bold text-white">¿Tienes otra pregunta?</h3>
        <p className="text-xs text-zinc-400">Nuestro equipo de soporte está disponible a través del sistema de tickets.</p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00E5FF] text-black font-bold text-xs hover:shadow-glow transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Contactar a Soporte</span>
        </Link>
      </div>
    </div>
  );
}
