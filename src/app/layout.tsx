import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/navigation/Footer';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'VELORA — Designed for Your Screen',
    template: '%s | VELORA',
  },
  description: 'Curated 4K, 8K, and OLED wallpapers for desktop and mobile displays. Designed with extreme attention to typography, resolution, and aesthetic fidelity.',
  keywords: ['wallpapers', '4k wallpapers', 'amoled wallpapers', 'phone wallpapers', 'desktop wallpapers', 'curated backgrounds'],
  authors: [{ name: 'VELORA Studio' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'VELORA — Designed for Your Screen',
    description: 'Curated 4K, 8K, and OLED wallpapers for desktop and mobile displays.',
    type: 'website',
    locale: 'en_US',
    siteName: 'VELORA',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'VELORA Wallpaper Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VELORA — Designed for Your Screen',
    description: 'Curated 4K, 8K, and OLED wallpapers for desktop and mobile displays.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

import PublicLayoutWrapper from '@/components/layout/PublicLayoutWrapper';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} dark`}>
      <body className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-orange-500/30 selection:text-orange-200">
        <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
      </body>
    </html>
  );
}
