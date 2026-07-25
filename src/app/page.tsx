'use client';

import React, { useState } from 'react';
import { HeroEnvelopeGrid } from '@/components/HeroEnvelopeGrid';
import { FeaturedCarousel3D } from '@/components/FeaturedCarousel3D';
import { PacksGrid } from '@/components/PacksGrid';
import { SocialGrowthSection } from '@/components/SocialGrowthSection';
import { WhyUsBentoGrid } from '@/components/WhyUsBentoGrid';
import { PaymentAndSupportSection } from '@/components/PaymentAndSupportSection';
import { LiveSalesToast } from '@/components/LiveSalesToast';
import { QuickViewModal } from '@/components/QuickViewModal';
import { InfiniteMarquee } from '@/components/InfiniteMarquee';
import { ReviewsSection } from '@/components/ReviewsSection';

export default function HomePage() {
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);

  const handleAddToCart = (product: any) => {
    try {
      const stored = localStorage.getItem('lux_cart');
      let cart = stored ? JSON.parse(stored) : [];
      const index = cart.findIndex((item: any) => item.id === product.id);
      if (index > -1) {
        cart[index].quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      localStorage.setItem('lux_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-0 pb-16 overflow-hidden bg-black min-h-screen text-white">
      
      {/* 1. HERO SECTION WITH 3D ENVELOPE CARD GALLERY */}
      <HeroEnvelopeGrid />

      {/* 2. INFINITE MARQUEE BRANDS */}
      <div className="py-6 bg-[#08080C] border-y border-zinc-800/60">
        <InfiniteMarquee />
      </div>

      {/* 3. DESTACADOS 3D INTERACTIVE CAROUSEL */}
      <FeaturedCarousel3D
        onQuickView={(p) => setQuickViewProduct(p)}
        onAddToCart={handleAddToCart}
      />

      {/* 4. PACKS & BUNDLES GRID ("VARIAS CUENTAS, UN SOLO PRECIO") */}
      <PacksGrid />

      {/* 5. IMPULSO SOCIAL (REDES SOCIALES) */}
      <SocialGrowthSection />

      {/* 6. POR QUÉ LUX STORE (BENTO FEATURE GRID & SPEED CHART) */}
      <WhyUsBentoGrid />

      {/* 7. RESEÑAS DE COMPRAS VERIFICADAS */}
      <ReviewsSection />

      {/* 8. PAYMENTS, DASHBOARD, SUPPORT & INSTANT DELIVERY CARDS */}
      <PaymentAndSupportSection />

      {/* FLOATING LIVE SALES TOAST NOTIFICATION */}
      <LiveSalesToast />

      {/* QUICK VIEW LATERAL DRAWER MODAL */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

    </div>
  );
}
