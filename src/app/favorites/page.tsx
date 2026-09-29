'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { Wallpaper } from '@/types';
import WallpaperGrid from '@/components/wallpaper/WallpaperGrid';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const saved = localStorage.getItem('velora_favorites');
        const ids: string[] = saved ? JSON.parse(saved) : [];

        if (ids.length === 0) {
          setFavorites([]);
          setLoading(false);
          return;
        }

        // Fetch all wallpapers to match ids
        const res = await fetch('/api/wallpapers?limit=100');
        const data = await res.json();
        if (data.wallpapers) {
          const matched = data.wallpapers.filter((w: Wallpaper) => ids.includes(w._id));
          setFavorites(matched);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const clearAllFavorites = () => {
    localStorage.removeItem('velora_favorites');
    setFavorites([]);
    window.dispatchEvent(new Event('velora_fav_changed'));
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 uppercase tracking-widest font-heading mb-1">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span>Personal Gallery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-semibold text-zinc-100">
            Saved Wallpapers
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Your bookmarked artworks, saved locally on this browser.
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            onClick={clearAllFavorites}
            className="text-xs text-zinc-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 px-3 py-1.5 rounded-full transition-colors self-start sm:self-auto"
          >
            Clear All Saved ({favorites.length})
          </button>
        )}
      </div>

      <WallpaperGrid
        wallpapers={favorites}
        loading={loading}
        emptyMessage="You haven't saved any wallpapers yet. Tap the heart icon on any artwork to add it here."
      />
    </div>
  );
}
