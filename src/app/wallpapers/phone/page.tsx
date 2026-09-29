import React from 'react';
import { Metadata } from 'next';
import { Smartphone } from 'lucide-react';
import { getWallpapers } from '@/services/wallpaperService';
import WallpaperGrid from '@/components/wallpaper/WallpaperGrid';

export const metadata: Metadata = {
  title: 'Phone Wallpapers — OLED & Lock Screen Ready',
  description: 'Vertical wallpapers designed specifically for iPhone and Android displays. OLED blacks, minimal clutter, and clock-safe compositions.',
};

export default async function PhoneWallpapersPage() {
  const data = await getWallpapers({ device: 'phone', limit: 40 });

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 uppercase tracking-widest font-heading mb-1">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile Displays</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-semibold text-zinc-100">
          Phone & OLED Wallpapers
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
          Engineered for portrait screens, bezel-less edge displays, and AMOLED true blacks.
        </p>
      </div>

      <WallpaperGrid wallpapers={data.wallpapers} />
    </div>
  );
}
