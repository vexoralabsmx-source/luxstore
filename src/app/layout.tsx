import type { Metadata } from 'next';
import { Cinzel, Syne, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CustomCursor } from '@/components/CustomCursor';
import { CommandPalette } from '@/components/CommandPalette';
import { SmoothScrollProvider } from '@/components/SmoothScroll';

const cinzel = Cinzel({ 
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LUX STORE — Tienda Privada de Licencias & Productos Digitales',
  description: 'Adquisición directa de licencias originales, accesos a servicios de streaming y gift cards con verificación automática y entrega cifrada.',
  keywords: ['Lux Store', 'Licencias Originales', 'Windows 11 Pro', 'Spotify Premium', 'Game Pass Ultimate'],
  icons: {
    icon: 'https://res.cloudinary.com/dakjhsfne/image/upload/v1784914608/lux_hmytor.jpg',
    shortcut: 'https://res.cloudinary.com/dakjhsfne/image/upload/v1784914608/lux_hmytor.jpg',
    apple: 'https://res.cloudinary.com/dakjhsfne/image/upload/v1784914608/lux_hmytor.jpg',
  },
  openGraph: {
    title: 'LUX STORE — Distribución Privada de Productos Digitales',
    description: 'Licencias originales con garantía directa de reemplazo.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="es" 
      className={`${cinzel.variable} ${syne.variable} ${jakarta.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <body 
        className="bg-[#030303] text-[#F4F4F5] min-h-screen flex flex-col font-sans selection:bg-[#D4AF37]/30 selection:text-[#FFF5C0]"
        suppressHydrationWarning
      >
        <SmoothScrollProvider>
          <CustomCursor />
          <Navbar />
          <main className="flex-grow pt-24">
            {children}
          </main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
