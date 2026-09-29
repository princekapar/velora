import React from 'react';
import { Metadata } from 'next';
import { Monitor } from 'lucide-react';
import { getWallpapers } from '@/services/wallpaperService';
import WallpaperGrid from '@/components/wallpaper/WallpaperGrid';

export const metadata: Metadata = {
  title: 'Desktop Wallpapers — 4K, Ultrawide & Multi-Monitor',
  description: 'Wide format landscape wallpapers designed for clean desk setups, MacBook Pro displays, and PC gaming monitors.',
};

export default async function DesktopWallpapersPage() {
  const data = await getWallpapers({ device: 'desktop', limit: 40 });

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 uppercase tracking-widest font-heading mb-1">
          <Monitor className="w-3.5 h-3.5" />
          <span>Horizontal Workspaces</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-semibold text-zinc-100">
          Desktop & Ultrawide Wallpapers
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
          High-fidelity horizontal compositions tailored for clean desk setups and high-refresh monitors.
        </p>
      </div>

      <WallpaperGrid wallpapers={data.wallpapers} />
    </div>
  );
}
