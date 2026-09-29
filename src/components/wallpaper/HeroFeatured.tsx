'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Download, Monitor, Smartphone, Sparkles, Layers } from 'lucide-react';
import { Wallpaper } from '@/types';
import DevicePreviewFrame from './DevicePreviewFrame';

interface HeroFeaturedProps {
  wallpaper: Wallpaper;
}

export default function HeroFeatured({ wallpaper }: HeroFeaturedProps) {
  const [showMockup, setShowMockup] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setDownloading(true);
      fetch(`/api/wallpapers/${wallpaper.slug}/download`, { method: 'POST' }).catch(() => {});

      const response = await fetch(wallpaper.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${wallpaper.slug}-velora-${wallpaper.resolution}.${wallpaper.format || 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      window.open(wallpaper.imageUrl, '_blank');
    } finally {
      setTimeout(() => setDownloading(false), 1200);
    }
  };

  return (
    <section className="relative pt-24 pb-12 sm:pt-28 sm:pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Subtle Brand Tagline Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Selection • Issue 04</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-semibold tracking-tight text-zinc-100 max-w-2xl">
              Make your screen <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-300 to-orange-200">
                worth looking at.
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Display Mockup Switcher Toggle */}
            <button
              onClick={() => setShowMockup(!showMockup)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                showMockup
                  ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showMockup ? 'Display Mockup Active' : 'Preview on Screen'}</span>
            </button>

            <Link
              href="/collections"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-medium border border-white/10 transition-all group"
            >
              <span>Explore Collections</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-orange-400" />
            </Link>
          </div>
        </div>

        {/* Cinematic Featured Artwork Canvas */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.12] bg-zinc-950 shadow-2xl group">
          {showMockup ? (
            <div className="p-4 sm:p-8 bg-zinc-900/90 flex items-center justify-center min-h-[480px]">
              <DevicePreviewFrame
                imageUrl={wallpaper.imageUrl}
                orientation={wallpaper.orientation}
                deviceType={wallpaper.deviceType}
                title={wallpaper.title}
              />
            </div>
          ) : (
            <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full min-h-[380px] sm:min-h-[500px]">
              <Image
                src={wallpaper.imageUrl}
                alt={wallpaper.title}
                fill
                priority
                sizes="100vw"
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
              />

              {/* Minimal Vignettes */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent hidden sm:block" />

              {/* Editorial Artwork Metadata Bar */}
              <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  {/* Subtle Subtitle */}
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                    <span className="uppercase tracking-widest text-orange-400 font-semibold">{wallpaper.category}</span>
                    <span>/</span>
                    <span className="text-zinc-300">{wallpaper.resolution} Ultra HD</span>
                    <span>/</span>
                    <span className="capitalize">{wallpaper.deviceType}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold text-zinc-50 drop-shadow-md">
                    {wallpaper.title}
                  </h2>

                  {wallpaper.description && (
                    <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 drop-shadow">
                      {wallpaper.description}
                    </p>
                  )}
                </div>

                {/* Right Action Tools */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-xs sm:text-sm font-semibold tracking-tight transition-all active:scale-95 shadow-lg shadow-orange-500/20"
                  >
                    <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
                    <span>{downloading ? 'Downloading...' : 'Download Master (4K)'}</span>
                  </button>

                  <Link
                    href={`/wallpaper/${wallpaper.slug}`}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 backdrop-blur-md text-zinc-200 text-xs sm:text-sm font-medium border border-white/15 transition-all"
                  >
                    <span>Full Details</span>
                    <ArrowRight className="w-4 h-4 text-orange-400" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
