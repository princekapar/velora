import React from 'react';
import WallpaperCard from './WallpaperCard';
import { Wallpaper } from '@/types';
import { Sparkles } from 'lucide-react';

interface WallpaperGridProps {
  wallpapers: Wallpaper[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function WallpaperGrid({
  wallpapers,
  loading = false,
  emptyMessage = 'No wallpapers found matching your filters.',
}: WallpaperGridProps) {
  if (loading) {
    return (
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`rounded-xl bg-zinc-900/60 border border-white/5 animate-pulse break-inside-avoid mb-6 ${
              i % 2 === 0 ? 'aspect-[16/10]' : 'aspect-[9/16]'
            }`}
          />
        ))}
      </div>
    );
  }

  if (wallpapers.length === 0) {
    return (
      <div className="py-20 text-center border border-white/[0.06] rounded-2xl bg-zinc-900/30 p-8 space-y-3">
        <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-zinc-200 font-heading">Empty Collection</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
      {wallpapers.map((wallpaper, idx) => (
        <WallpaperCard
          key={wallpaper._id}
          wallpaper={wallpaper}
          priority={idx < 4}
        />
      ))}
    </div>
  );
}
