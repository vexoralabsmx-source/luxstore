'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { LIVE_NOTIFICATIONS } from '@/data/luxPacks';

export function LiveSalesToast() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (closed) return;

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % LIVE_NOTIFICATIONS.length);
        setVisible(true);
      }, 500);
    }, 6500);

    return () => clearInterval(interval);
  }, [closed]);

  if (closed) return null;

  const currentNotif = LIVE_NOTIFICATIONS[currentIndex];

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 transition-all duration-500 transform ${
        visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'
      }`}
    >
      <div className="relative overflow-hidden bg-[#0A0E17]/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-3.5 shadow-2xl max-w-sm flex items-center gap-3.5 group hover:border-cyan-500/50 transition-all">
        {/* Animated accent line at bottom */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-cyan-500 to-pink-500 w-full animate-pulse" />

        {/* Thumbnail Icon */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700/60 flex-shrink-0 flex items-center justify-center">
          <img
            src={currentNotif.image}
            alt={currentNotif.product}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-[11px] text-zinc-400 font-medium truncate">
            {currentNotif.user} purchased
          </p>
          <h4 className="text-xs font-bold text-white truncate font-sans tracking-wide">
            {currentNotif.product}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              Verified
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">• {currentNotif.timeAgo}</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setClosed(true)}
          className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-white/5 transition-colors absolute top-2 right-2"
          aria-label="Cerrar notificación"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
