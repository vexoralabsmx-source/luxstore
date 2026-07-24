'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [cursorText, setCursorText] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setMounted(true);

    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest('[data-cursor]');
      
      if (interactiveEl) {
        const text = interactiveEl.getAttribute('data-cursor') || '';
        setCursorText(text);
        setIsHovered(true);
      } else if (target.closest('button, a, input, select')) {
        setCursorText('');
        setIsHovered(true);
      } else {
        setIsHovered(false);
        setCursorText('');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  if (!mounted || isTouchDevice) return null;

  return (
    <>
      {/* Small dot follower */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-[#D4AF37] pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
          scale: isHovered ? 0 : 1,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 400, mass: 0.1 }}
      />

      {/* Main expanding ring cursor with metallic gold aura */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border border-[#D4AF37]/60 pointer-events-none z-[9998] flex items-center justify-center backdrop-blur-[2px]"
        animate={{
          x: mousePosition.x - (isHovered ? 30 : 15),
          y: mousePosition.y - (isHovered ? 30 : 15),
          width: isHovered ? (cursorText ? 70 : 50) : 30,
          height: isHovered ? (cursorText ? 70 : 50) : 30,
          backgroundColor: isHovered ? 'rgba(212, 175, 55, 0.12)' : 'rgba(212, 175, 55, 0.03)',
          borderColor: isHovered ? '#FFF5C0' : 'rgba(212, 175, 55, 0.4)',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.2 }}
      >
        {cursorText && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#FFF5C0] text-center px-1"
          >
            {cursorText}
          </motion.span>
        )}
      </motion.div>
    </>
  );
}
