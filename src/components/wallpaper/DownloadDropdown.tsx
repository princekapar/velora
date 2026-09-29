'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, Check, Smartphone, Monitor, Sparkles } from 'lucide-react';
import { Wallpaper } from '@/types';
import { getDownloadUrl } from '@/lib/cloudinaryClient';

interface DownloadDropdownProps {
  wallpaper: Wallpaper;
}

export default function DownloadDropdown({ wallpaper }: DownloadDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadingPreset, setDownloadingPreset] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const isPortrait = wallpaper.orientation === 'portrait';
  const isLandscape = wallpaper.orientation === 'landscape';

  interface DownloadOption {
    id: string;
    label: string;
    resolution: string;
    icon: any;
    preset: 'original' | 'iphone' | 'android' | 'desktop-4k' | 'desktop-2k' | 'desktop-fhd';
  }

  // Construct context-aware options based on actual orientation and device suitability
  const options: DownloadOption[] = [];

  // Master / Original is always available
  options.push({
    id: 'original',
    label: `Original Master (${wallpaper.resolution || 'UHD'})`,
    resolution: `${wallpaper.width} × ${wallpaper.height}`,
    icon: Sparkles,
    preset: 'original' as const,
  });

  if (isLandscape || wallpaper.deviceType === 'desktop' || wallpaper.deviceType === 'both') {
    options.push({
      id: 'desktop-4k',
      label: '4K Ultra HD Desktop',
      resolution: '3840 × 2160',
      icon: Monitor,
      preset: 'desktop-4k' as const,
    });
    options.push({
      id: 'desktop-2k',
      label: '2K QHD Display',
      resolution: '2560 × 1440',
      icon: Monitor,
      preset: 'desktop-2k' as const,
    });
    options.push({
      id: 'desktop-fhd',
      label: 'Full HD Desktop',
      resolution: '1920 × 1080',
      icon: Monitor,
      preset: 'desktop-fhd' as const,
    });
  }

  if (isPortrait || wallpaper.deviceType === 'phone' || wallpaper.deviceType === 'both') {
    options.push({
      id: 'iphone',
      label: 'iPhone Pro Display',
      resolution: '1170 × 2532',
      icon: Smartphone,
      preset: 'iphone' as const,
    });
    options.push({
      id: 'android',
      label: 'Android OLED Display',
      resolution: '1080 × 2400',
      icon: Smartphone,
      preset: 'android' as const,
    });
  }

  const handleDownload = async (opt: (typeof options)[0]) => {
    try {
      setDownloadingPreset(opt.id);
      fetch(`/api/wallpapers/${wallpaper.slug}/download`, { method: 'POST' }).catch(() => {});

      const targetUrl = getDownloadUrl(wallpaper.imageUrl, opt.preset);
      const res = await fetch(targetUrl);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${wallpaper.slug}-${opt.id}.${wallpaper.format || 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (err) {
      window.open(wallpaper.imageUrl, '_blank');
    } finally {
      setTimeout(() => {
        setDownloadingPreset(null);
        setIsOpen(false);
      }, 1000);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Primary Download Button & Dropdown Trigger */}
      <div className="inline-flex rounded-xl shadow-lg shadow-orange-500/10">
        <button
          onClick={() => handleDownload(options[0])}
          className="flex items-center gap-2 px-5 py-3 rounded-l-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold text-sm transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>
            {downloadingPreset === options[0].id ? 'Downloading...' : `Download ${wallpaper.resolution || 'Original'}`}
          </span>
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-3 rounded-r-xl bg-orange-600 hover:bg-orange-500 text-zinc-950 border-l border-orange-400/40 transition-all"
          title="Choose resolution format"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-zinc-900/95 border border-white/10 shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-white/5 mb-1">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
              Select Display Resolution
            </span>
          </div>

          <div className="space-y-1">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isCurrentDownloading = downloadingPreset === opt.id;

              return (
                <button
                  key={opt.id}
                  onClick={() => handleDownload(opt)}
                  disabled={Boolean(downloadingPreset)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.07] text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-white/5 text-zinc-400 group-hover:text-orange-400 group-hover:bg-orange-500/10 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-200 group-hover:text-orange-300">
                        {opt.label}
                      </p>
                      <p className="text-[11px] font-mono text-zinc-500">
                        {opt.resolution}
                      </p>
                    </div>
                  </div>

                  {isCurrentDownloading && (
                    <span className="text-xs text-orange-400 animate-pulse font-medium">Downloading</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
