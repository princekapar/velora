import React from 'react';
import { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
import { getWallpapers } from '@/services/wallpaperService';
import WallpaperGrid from '@/components/wallpaper/WallpaperGrid';

export const metadata: Metadata = {
  title: '4K & 8K Ultra HD Wallpapers — Native Resolution Master',
  description: 'Uncompressed 3840×2160, 5120×2880, and 7680×4320 wallpapers for Retina and 4K displays.',
};

export default async function FourKWallpapersPage() {
  const data = await getWallpapers({ limit: 40 });
  const fourKOnly = data.wallpapers.filter(
    (w) => w.resolution === '4K' || w.resolution === '5K' || w.resolution === '8K'
  );

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 uppercase tracking-widest font-heading mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ultra-High Density</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-semibold text-zinc-100">
          4K & 8K Ultra HD Gallery
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
          Zero artifacting. Uncompressed pixel density tailored for Apple Pro Display XDR and 4K panels.
        </p>
      </div>

      <WallpaperGrid wallpapers={fourKOnly} />
    </div>
  );
}
