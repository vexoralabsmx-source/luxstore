'use client';

import React, { useState, useEffect } from 'react';
import { FileText, ShieldCheck, Trash2, RefreshCw } from 'lucide-react';

export interface AuditLogItem {
  id: string;
  action: string;
  target: string;
  actor: string;
  ip: string;
  date: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    try {
      const stored = localStorage.getItem('lux_audit_logs');
      if (stored) {
        setLogs(JSON.parse(stored));
      } else {
        setLogs([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearLogs = () => {
    if (confirm('¿Deseas vaciar el historial de registros de auditoría?')) {
      setLogs([]);
      localStorage.removeItem('lux_audit_logs');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#242424] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 font-sans">
            <FileText className="w-8 h-8 text-[#C5A880]" /> Audit Logs & Registros de Seguridad
          </h1>
          <p className="text-sm text-zinc-400 mt-1 font-mono">
            Seguimiento inmutable de acciones administrativas y de entrega automática.
          </p>
        </div>

        {logs.length > 0 && (
          <button
            onClick={handleClearLogs}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpiar Registros</span>
          </button>
        )}
      </div>

      <div className="bg-[#101010] border border-[#242424] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#050505] border-b border-[#242424] text-zinc-400 uppercase font-mono">
              <tr>
                <th className="px-6 py-4">Acción Registrada</th>
                <th className="px-6 py-4">Recurso Afectado</th>
                <th className="px-6 py-4">Ejecutado Por</th>
                <th className="px-6 py-4">Dirección IP</th>
                <th className="px-6 py-4">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242424]">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#161616] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#C5A880]">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 font-mono text-white">
                      {log.target}
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-sans">
                      {log.actor}
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-400">
                      {log.ip}
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-500">
                      {log.date}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-mono">
                    No hay registros de auditoría almacenados aún. Las acciones de administración y entregas automáticas se registrarán aquí en tiempo real.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
