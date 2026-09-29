'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Download, Heart, Smartphone, Monitor, ArrowUpRight } from 'lucide-react';
import { Wallpaper } from '@/types';
import { getThumbnailUrl } from '@/lib/cloudinaryClient';
import { downloadWallpaperAsPng } from '@/lib/downloadHelper';

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  priority?: boolean;
}

export default function WallpaperCard({ wallpaper, priority = false }: WallpaperCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('velora_favorites');
      if (saved) {
        const arr = JSON.parse(saved);
        setIsFavorited(arr.includes(wallpaper._id));
      }
    } catch (e) {}
  }, [wallpaper._id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const saved = localStorage.getItem('velora_favorites');
      let arr: string[] = saved ? JSON.parse(saved) : [];

      if (arr.includes(wallpaper._id)) {
        arr = arr.filter((id) => id !== wallpaper._id);
        setIsFavorited(false);
      } else {
        arr.push(wallpaper._id);
        setIsFavorited(true);
      }

      localStorage.setItem('velora_favorites', JSON.stringify(arr));
      window.dispatchEvent(new Event('velora_fav_changed'));
    } catch (e) {}
  };

  const handleQuickDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setDownloading(true);
      fetch(`/api/wallpapers/${wallpaper.slug}/download`, { method: 'POST' }).catch(() => {});

      await downloadWallpaperAsPng(
        wallpaper.imageUrl,
        `${wallpaper.slug}-velora-${wallpaper.resolution}.png`
      );
    } catch (err) {
      window.open(wallpaper.imageUrl, '_blank');
    } finally {
      setTimeout(() => setDownloading(false), 1200);
    }
  };

  const isPortrait = wallpaper.orientation === 'portrait';

  return (
    <div className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-white/[0.08] hover:border-white/20 transition-all duration-500 break-inside-avoid mb-6">
      <Link href={`/wallpaper/${wallpaper.slug}`} className="block relative overflow-hidden">
        {/* Aspect Ratio Container */}
        <div
          className={`relative w-full overflow-hidden ${
            isPortrait ? 'aspect-[9/16]' : 'aspect-[16/10]'
          }`}
        >
          <Image
            src={wallpaper.thumbnailUrl || getThumbnailUrl(wallpaper.imageUrl, 800)}
            alt={wallpaper.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="object-cover img-zoom"
          />

          {/* Subtle Top & Bottom Gradient Vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30 opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wide bg-black/60 backdrop-blur-md text-orange-400 border border-orange-500/30">
              {wallpaper.resolution}
            </span>

            <div className="flex items-center gap-1.5 pointer-events-auto">
              {/* Device Icon */}
              <span className="p-1 rounded-full bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10 text-xs">
                {isPortrait ? (
                  <Smartphone className="w-3.5 h-3.5" />
                ) : (
                  <Monitor className="w-3.5 h-3.5" />
                )}
              </span>

              {/* Favorite Button */}
              <button
                onClick={toggleFavorite}
                className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                  isFavorited
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-black/60 text-zinc-300 hover:text-white border border-white/10 hover:bg-black/80'
                }`}
                title="Favorite"
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Bottom Info & Quick Actions */}
          <div className="absolute bottom-0 inset-x-0 p-4 flex flex-col justify-end">
            <div className="flex items-end justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium block truncate">
                  {wallpaper.category}
                </span>
                <h3 className="text-sm font-semibold text-zinc-100 font-heading truncate group-hover:text-orange-300 transition-colors">
                  {wallpaper.title}
                </h3>
              </div>

              {/* Quick Download Action Button */}
              <button
                onClick={handleQuickDownload}
                disabled={downloading}
                className="shrink-0 p-2 rounded-lg bg-white/10 hover:bg-orange-500 hover:text-zinc-950 text-zinc-200 backdrop-blur-md border border-white/15 transition-all active:scale-95 pointer-events-auto"
                title="Quick Download"
              >
                <Download className={`w-4 h-4 ${downloading ? 'animate-bounce text-orange-300' : ''}`} />
              </button>
            </div>

            {/* Subtle Dimensions Line */}
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-mono text-zinc-400">
                {wallpaper.width} × {wallpaper.height}
              </span>
              <span className="flex items-center gap-0.5 text-zinc-400 group-hover:text-orange-400 transition-colors">
                View <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
