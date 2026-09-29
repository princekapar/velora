'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Heart, Check, Copy } from 'lucide-react';
import { Wallpaper } from '@/types';

interface ClientActionsProps {
  wallpaper: Wallpaper;
}

export default function WallpaperDetailClientActions({ wallpaper }: ClientActionsProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [copied, setCopied] = useState(false);

  // Increment view count on mount
  useEffect(() => {
    fetch(`/api/wallpapers/${wallpaper.slug}/view`, { method: 'POST' }).catch(() => {});
  }, [wallpaper.slug]);

  // Check initial favorite state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('velora_favorites');
      if (saved) {
        const arr = JSON.parse(saved);
        setIsFavorited(arr.includes(wallpaper._id));
      }
    } catch (e) {}
  }, [wallpaper._id]);

  const toggleFavorite = () => {
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

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${wallpaper.title} — VELORA Wallpaper`,
          text: `Check out ${wallpaper.title} on VELORA`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs text-zinc-300 border border-white/10 transition-colors"
        title="Share wallpaper link"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400">Link Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </>
        )}
      </button>

      <button
        onClick={toggleFavorite}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
          isFavorited
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
        }`}
      >
        <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
        <span>{isFavorited ? 'Saved' : 'Save'}</span>
      </button>
    </div>
  );
}
