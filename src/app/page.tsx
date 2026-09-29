'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Monitor,
  Smartphone,
  Sparkles,
  SlidersHorizontal,
  Download,
  Heart,
  Layers,
  ChevronRight,
  Maximize2,
  Check,
  X,
  Compass,
  ArrowUpRight,
  Shield,
  Eye,
  Flame,
  Zap,
  Moon,
  Tv,
} from 'lucide-react';
import { Wallpaper, Category, Collection, FilterState } from '@/types';
import DevicePreviewFrame from '@/components/wallpaper/DevicePreviewFrame';
import WallpaperGrid from '@/components/wallpaper/WallpaperGrid';

export default function HomePage() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  // Active showcase index for cinematic hero filmstrip
  const [heroIndex, setHeroIndex] = useState(0);
  const [showMockup, setShowMockup] = useState(false);

  // Active viewing mode: 'all' | 'desktop' | 'phone' | 'collections'
  const [activeTab, setActiveTab] = useState<'all' | 'desktop' | 'phone' | 'collections'>('all');

  // Filter drawer toggle - only shown on-demand
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    device: 'all',
    resolution: 'all',
    orientation: 'all',
    category: 'all',
    sort: 'featured',
    search: '',
  });

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ limit: '60' });

        if (activeTab === 'desktop') params.set('device', 'desktop');
        if (activeTab === 'phone') params.set('device', 'phone');

        if (filters.resolution !== 'all') params.set('resolution', filters.resolution);
        if (filters.orientation !== 'all') params.set('orientation', filters.orientation);
        if (filters.category !== 'all') params.set('category', filters.category);
        if (filters.sort) params.set('sort', filters.sort);
        if (filters.search) params.set('search', filters.search);

        const [wallRes, catRes, colRes] = await Promise.all([
          fetch(`/api/wallpapers?${params.toString()}`).then((r) => r.json()),
          fetch('/api/categories').then((r) => r.json()),
          fetch('/api/collections').then((r) => r.json()),
        ]);

        if (wallRes.wallpapers) setWallpapers(wallRes.wallpapers);
        if (Array.isArray(catRes)) setCategories(catRes);
        if (Array.isArray(colRes)) setCollections(colRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, filters]);

  const featuredWallpapers = wallpapers.filter((w) => w.featured).slice(0, 5);
  const activeHero = featuredWallpapers[heroIndex] || wallpapers[0];

  // Specific curated subsets for dedicated editorial sections
  const amoledPicks = wallpapers.filter((w) => w.category === 'Dark & AMOLED' || w.tags?.includes('amoled')).slice(0, 4);
  const fourKPicks = wallpapers.filter((w) => w.resolution === '4K' || w.resolution === '8K').slice(0, 3);
  const phonePicks = wallpapers.filter((w) => w.deviceType === 'phone' || w.orientation === 'portrait').slice(0, 4);

  const handleQuickDownload = async (w: Wallpaper, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setDownloadingId(w._id);
      fetch(`/api/wallpapers/${w.slug}/download`, { method: 'POST' }).catch(() => {});

      const res = await fetch(w.imageUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${w.slug}-velora.${w.format || 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      window.open(w.imageUrl, '_blank');
    } finally {
      setTimeout(() => setDownloadingId(null), 1200);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribedEmail.trim()) return;
    setSubscribeSuccess(true);
    setSubscribedEmail('');
    setTimeout(() => setSubscribeSuccess(false), 4000);
  };

  const hasActiveFilters =
    filters.resolution !== 'all' ||
    filters.category !== 'all' ||
    filters.orientation !== 'all' ||
    filters.sort !== 'featured';

  return (
    <div className="space-y-28 sm:space-y-40 pb-32">
      {/* 1. CINEMATIC ATELIER CENTERPIECE HERO */}
      <section className="relative pt-28 sm:pt-36 overflow-hidden">
        {/* Ambient Backlight Glow */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[85vw] max-w-5xl h-[400px] bg-gradient-to-b from-orange-500/10 via-zinc-800/10 to-transparent blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
          {/* Atelier Masthead */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 text-[11px] font-mono tracking-[0.25em] uppercase text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span>Velora Digital Atelier • Edition IV</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-normal tracking-tight text-zinc-100 leading-[1.05]">
                Curated light for{' '}
                <span className="font-light italic text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-zinc-400 to-orange-200/80">
                  every display.
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-zinc-400 max-w-lg font-light leading-relaxed">
                Studio-graded digital canvases designed for 4K Retina, ultrawide workspaces, and AMOLED mobile screens.
              </p>
            </div>

            {/* Masthead Markers */}
            <div className="hidden lg:flex items-center gap-6 border-l border-white/10 pl-6 text-xs text-zinc-400">
              <div>
                <span className="block font-mono text-zinc-200 font-semibold text-sm">4K — 8K</span>
                <span className="text-[11px] text-zinc-500">Lossless Master</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="block font-mono text-zinc-200 font-semibold text-sm">OLED</span>
                <span className="text-[11px] text-zinc-500">True Black Canvas</span>
              </div>
            </div>
          </div>

          {/* Large Cinematic Hero Canvas */}
          {activeHero && (
            <div className="space-y-4">
              <div className="relative rounded-3xl overflow-hidden border border-white/[0.10] bg-zinc-950 shadow-2xl group transition-all duration-700">
                {showMockup ? (
                  <div className="p-6 sm:p-12 bg-zinc-900/80 flex items-center justify-center min-h-[500px]">
                    <DevicePreviewFrame
                      imageUrl={activeHero.imageUrl}
                      orientation={activeHero.orientation}
                      deviceType={activeHero.deviceType}
                      title={activeHero.title}
                    />
                  </div>
                ) : (
                  <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full min-h-[380px] sm:min-h-[520px]">
                    <Image
                      src={activeHero.imageUrl}
                      alt={activeHero.title}
                      fill
                      priority
                      sizes="100vw"
                      className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.015]"
                    />

                    {/* Gradient Vignettes */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/70 via-transparent to-transparent hidden sm:block" />

                    {/* Floating Metadata & Actions */}
                    <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                      <div className="space-y-2 max-w-xl">
                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                          <span className="uppercase tracking-widest text-orange-400 font-semibold">
                            {activeHero.category}
                          </span>
                          <span>/</span>
                          <span>{activeHero.resolution} Ultra HD</span>
                          <span>/</span>
                          <span className="capitalize">{activeHero.deviceType}</span>
                        </div>

                        <h2 className="text-2xl sm:text-4xl font-heading font-semibold text-zinc-50 drop-shadow-md">
                          {activeHero.title}
                        </h2>

                        {activeHero.description && (
                          <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 drop-shadow font-light">
                            {activeHero.description}
                          </p>
                        )}
                      </div>

                      {/* Hero Buttons */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleQuickDownload(activeHero, e)}
                          disabled={downloadingId === activeHero._id}
                          className="flex items-center gap-2 px-5 py-3 rounded-full bg-orange-500 hover:bg-orange-400 text-zinc-950 text-xs sm:text-sm font-semibold tracking-tight transition-all active:scale-95 shadow-xl shadow-orange-500/20"
                        >
                          <Download className="w-4 h-4" />
                          <span>{downloadingId === activeHero._id ? 'Downloading...' : 'Download Master (4K)'}</span>
                        </button>

                        <Link
                          href={`/wallpaper/${activeHero.slug}`}
                          className="flex items-center gap-1.5 px-4 py-3 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md text-zinc-200 text-xs sm:text-sm font-medium border border-white/15 transition-all"
                        >
                          <span>Specifications</span>
                          <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Top Controls Overlay on Hero */}
                <div className="absolute top-4 sm:top-6 inset-x-4 sm:inset-x-8 flex items-center justify-between pointer-events-none">
                  {/* Active Indicator */}
                  <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-300 pointer-events-auto">
                    Curated Spotlight {heroIndex + 1} of {featuredWallpapers.length}
                  </div>

                  {/* Display Mockup Switcher Toggle */}
                  <button
                    onClick={() => setShowMockup(!showMockup)}
                    className={`pointer-events-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all ${
                      showMockup
                        ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                        : 'bg-black/60 border-white/10 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-orange-400" />
                    <span>{showMockup ? 'Full View' : 'Device Bezel'}</span>
                  </button>
                </div>
              </div>

              {/* Interactive Artwork Switcher Filmstrip */}
              {featuredWallpapers.length > 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  {featuredWallpapers.map((wall, i) => (
                    <button
                      key={wall._id}
                      onClick={() => {
                        setHeroIndex(i);
                        setShowMockup(false);
                      }}
                      className={`relative rounded-xl overflow-hidden p-2.5 text-left border transition-all flex items-center gap-3 ${
                        heroIndex === i
                          ? 'bg-white/10 border-orange-500/50 shadow-md ring-1 ring-orange-500/30'
                          : 'bg-zinc-900/40 border-white/5 hover:bg-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                        <Image
                          src={wall.thumbnailUrl || wall.imageUrl}
                          alt={wall.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono text-zinc-500 block truncate">
                          0{i + 1} • {wall.category}
                        </span>
                        <p className={`text-xs font-medium truncate ${heroIndex === i ? 'text-orange-300' : 'text-zinc-300'}`}>
                          {wall.title}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 2. NEW SECTION: DUAL-DISPLAY SETUP HARMONY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-14 rounded-3xl bg-zinc-900/40 border border-white/[0.08] relative overflow-hidden">
          <div className="max-w-2xl space-y-3 mb-10">
            <span className="text-xs font-mono text-orange-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5" />
              <span>Workspace Architecture</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-medium text-zinc-100">
              Calibrated for Dual Displays
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
              Synchronize your visual environment. Pair an ultrawide desktop backdrop with an identical color-graded companion for your phone lock screen.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Desktop Left Mockup */}
            <div className="lg:col-span-8 relative aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 group">
              <Image
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2400&auto=format&fit=crop"
                alt="Desktop Master"
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-mono text-orange-400 uppercase font-semibold">Primary Display (16:9)</span>
                  <p className="font-heading font-semibold text-zinc-100 text-sm">Dolomites Twilight Ridge</p>
                </div>
                <span className="px-2.5 py-1 rounded-full font-mono text-[10px] bg-white/10 text-zinc-300">
                  3840 × 2160
                </span>
              </div>
            </div>

            {/* Mobile Right Mockup Companion */}
            <div className="lg:col-span-4 relative aspect-[9/16] max-w-xs mx-auto lg:max-w-none w-full rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 group">
              <Image
                src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop"
                alt="Mobile Companion"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-mono text-orange-400 uppercase font-semibold">Lock Screen Companion</span>
                  <p className="font-heading font-semibold text-zinc-100 text-sm">Neon Rain in Shinjuku</p>
                </div>
                <span className="px-2.5 py-1 rounded-full font-mono text-[10px] bg-white/10 text-zinc-300">
                  1170 × 2532
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NEW SECTION: THEMATIC EDITORIAL VOLUMES (MONOGRAPHS) */}
      {collections.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="space-y-1">
              <span className="text-xs font-mono text-orange-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Thematic Volumes</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-medium text-zinc-100">
                Editorial Monographs
              </h2>
            </div>
            <Link
              href="/collections"
              className="text-xs text-zinc-400 hover:text-orange-400 flex items-center gap-1 font-medium transition-colors"
            >
              <span>Examine all volumes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {collections.slice(0, 4).map((col) => (
              <Link
                key={col._id}
                href={`/collection/${col.slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-zinc-900 border border-white/10 hover:border-orange-500/50 transition-all duration-300 flex flex-col justify-end p-4"
              >
                <Image
                  src={col.coverImage}
                  alt={col.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                <div className="relative z-10">
                  <p className="text-xs sm:text-sm font-semibold text-zinc-100 group-hover:text-orange-300 transition-colors font-heading truncate">
                    {col.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. THE EXHIBITION CATALOGUE — MINIMALIST CURATION SWITCHER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-orange-400 font-semibold font-mono">
              The Archive
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-medium text-zinc-100">
              Browse by Display Format
            </h2>
          </div>

          {/* Clean Segmented Option Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 rounded-full bg-zinc-900 border border-white/10 text-xs">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 rounded-full transition-all font-medium ${
                  activeTab === 'all'
                    ? 'bg-white/15 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All Curations
              </button>

              <button
                onClick={() => setActiveTab('desktop')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all font-medium ${
                  activeTab === 'desktop'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop & PC</span>
              </button>

              <button
                onClick={() => setActiveTab('phone')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all font-medium ${
                  activeTab === 'phone'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone OLED</span>
              </button>

              <button
                onClick={() => setActiveTab('collections')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all font-medium ${
                  activeTab === 'collections'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Volumes</span>
              </button>
            </div>

            {/* Filter Toggle Button */}
            {activeTab !== 'collections' && (
              <button
                onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  filterDrawerOpen || hasActiveFilters
                    ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                    : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Refine</span>
                {hasActiveFilters && (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* REVEALABLE FILTERS SUITE */}
        {filterDrawerOpen && activeTab !== 'collections' && (
          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-white/10 space-y-6 animate-in slide-in-from-top-2 duration-300 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold font-mono">
                Exhibition Parameters
              </span>
              {hasActiveFilters && (
                <button
                  onClick={() =>
                    setFilters({
                      device: 'all',
                      resolution: 'all',
                      orientation: 'all',
                      category: 'all',
                      sort: 'featured',
                      search: '',
                    })
                  }
                  className="text-xs text-orange-400 hover:underline"
                >
                  Reset all filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Resolution */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-zinc-500 uppercase">Resolution Master</span>
                <div className="flex flex-wrap gap-1.5">
                  {['all', '8K', '5K', '4K', '2K'].map((res) => (
                    <button
                      key={res}
                      onClick={() => setFilters((prev) => ({ ...prev, resolution: res }))}
                      className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                        filters.resolution === res
                          ? 'bg-orange-500 text-zinc-950 font-semibold'
                          : 'bg-white/5 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {res === 'all' ? 'Any' : res}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genre / Category */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-zinc-500 uppercase">Genre Curation</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, category: 'all' }))}
                    className={`px-3 py-1 rounded-full text-xs transition-all ${
                      filters.category === 'all'
                        ? 'bg-orange-500 text-zinc-950 font-semibold'
                        : 'bg-white/5 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    All Genres
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => setFilters((prev) => ({ ...prev, category: c.name }))}
                      className={`px-3 py-1 rounded-full text-xs transition-all ${
                        filters.category.toLowerCase() === c.name.toLowerCase()
                          ? 'bg-orange-500 text-zinc-950 font-semibold'
                          : 'bg-white/5 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sorting Order */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-zinc-500 uppercase">Order</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'featured', label: 'Curated First' },
                    { id: 'newest', label: 'Recent Releases' },
                    { id: 'popular', label: 'Most Viewed' },
                    { id: 'downloads', label: 'Top Downloaded' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setFilters((prev) => ({ ...prev, sort: s.id as any }))}
                      className={`px-3 py-1 rounded-full text-xs transition-all ${
                        filters.sort === s.id
                          ? 'bg-orange-500 text-zinc-950 font-semibold'
                          : 'bg-white/5 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE DISPLAY BASED ON ACTIVE SELECTION */}
        {activeTab === 'collections' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {collections.map((col) => (
              <Link
                key={col._id}
                href={`/collection/${col.slug}`}
                className="group relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-orange-500/50 transition-all duration-500 aspect-[16/10] flex flex-col justify-end p-8"
              >
                <Image
                  src={col.coverImage}
                  alt={col.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                <div className="relative z-10 space-y-2 max-w-md">
                  <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-semibold">
                    Volume {col.order || 1}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-zinc-100 group-hover:text-orange-300 transition-colors">
                    {col.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 font-light line-clamp-2">
                    {col.description}
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-xs text-orange-400 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Examine Volume</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div>
            <WallpaperGrid
              wallpapers={wallpapers}
              loading={loading}
              emptyMessage="No artworks match the selected criteria."
            />
          </div>
        )}
      </section>

      {/* 5. NEW SECTION: AMOLED NOIR — PITCH-BLACK LAB */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-14 bg-black border border-white/[0.08] relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-2">
              <span className="text-xs font-mono text-orange-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5" />
                <span>0.000 Nit Pure Black</span>
              </span>
              <h3 className="text-3xl sm:text-4xl font-heading font-medium text-zinc-100">
                AMOLED Noir Atelier
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-lg font-light">
                Every pixel turned completely off. Zero light bleed, maximum battery conservation on OLED mobile displays, and soothing low-light contrast.
              </p>
            </div>

            <Link
              href="/category/dark-amoled"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
            >
              <span>Explore complete noir archive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {amoledPicks.map((w) => (
              <Link
                key={w._id}
                href={`/wallpaper/${w.slug}`}
                className="group relative rounded-2xl overflow-hidden bg-zinc-950 border border-white/[0.06] hover:border-orange-500/40 transition-all duration-300 flex flex-col p-3 space-y-3"
              >
                <div className={`relative w-full rounded-xl overflow-hidden bg-black ${w.orientation === 'portrait' ? 'aspect-[9/16]' : 'aspect-[16/10]'}`}>
                  <Image
                    src={w.thumbnailUrl || w.imageUrl}
                    alt={w.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-mono bg-black/80 text-orange-400 border border-white/10">
                    OLED Ready
                  </div>
                </div>

                <div className="px-1 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-medium text-zinc-200 group-hover:text-orange-300 transition-colors truncate max-w-[150px]">
                      {w.title}
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-500">{w.resolution} UHD</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-orange-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. NEW SECTION: RESOLUTION MASTERCLASS (4K & 8K RETINA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono text-orange-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Pixel Density Standards</span>
            </span>
            <h3 className="text-3xl sm:text-4xl font-heading font-medium text-zinc-100">
              Uncompressed Resolution Master
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
              Standard wallpaper websites crush images through heavy lossy compression, leaving color banding in twilight skies and blurred detail on Apple Studio Displays. VELORA preserves source file fidelity, wide color gamuts (Display P3), and razor-sharp textures.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-medium">8K Ultra Master</span>
                <span className="font-mono text-orange-400">7680 × 4320 px</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-medium">5K Apple Retina Display</span>
                <span className="font-mono text-orange-400">5120 × 2880 px</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-medium">4K Ultra HD PC</span>
                <span className="font-mono text-orange-400">3840 × 2160 px</span>
              </div>
            </div>

            <Link
              href="/wallpapers/4k"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-medium text-zinc-200 transition-colors"
            >
              <span>Browse 4K/8K Exhibition</span>
              <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
            </Link>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fourKPicks.slice(0, 2).map((w, i) => (
              <Link
                key={w._id}
                href={`/wallpaper/${w.slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-zinc-900 border border-white/10"
              >
                <Image
                  src={w.imageUrl}
                  alt={w.title}
                  fill
                  sizes="400px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-xs">
                  <span className="text-[10px] font-mono text-orange-400 font-semibold">{w.resolution} • {w.width} × {w.height}</span>
                  <p className="font-heading font-semibold text-zinc-100">{w.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. NEW SECTION: GENRE TAXONOMY & ARCHIVES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="space-y-1">
            <span className="text-xs font-mono text-orange-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>Taxonomy Archives</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-medium text-zinc-100">
              Explore by Artistic Genre
            </h2>
          </div>
          <Link
            href="/categories"
            className="text-xs text-zinc-400 hover:text-orange-400 flex items-center gap-1 font-medium transition-colors"
          >
            <span>View all genres</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat._id}
              href={`/category/${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-zinc-900 border border-white/10 hover:border-orange-500/50 transition-all duration-300 flex flex-col justify-end p-4"
            >
              <Image
                src={cat.coverImage}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 50vw, 16vw"
                className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              <div className="relative z-10">
                <p className="text-xs sm:text-sm font-semibold text-zinc-100 group-hover:text-orange-300 transition-colors font-heading truncate">
                  {cat.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. ATELIER MANIFESTO & PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-16 bg-gradient-to-b from-zinc-900/60 to-zinc-950 border border-white/[0.08] space-y-12 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-mono text-orange-400 uppercase tracking-widest font-semibold">
              The Velora Ethos
            </span>
            <h3 className="text-3xl sm:text-5xl font-heading font-normal tracking-tight text-zinc-100 leading-tight">
              Screens are the windows we gaze through thousands of hours a year.
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
              They deserve more than stock photos, watermark templates, or algorithmic clutter. We treat digital displays as architectural light.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <span className="font-mono text-xs text-orange-400 font-semibold block">01 / INTEGRITY</span>
              <h4 className="font-heading font-semibold text-base text-zinc-200">Lossless Master Source</h4>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Raw dynamic range without compression artifacts. Every wallpaper is preserved at its highest capture resolution.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <span className="font-mono text-xs text-orange-400 font-semibold block">02 / COLOR HARMONY</span>
              <h4 className="font-heading font-semibold text-base text-zinc-200">Color Calibrated</h4>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Tailored for wide color gamuts and OLED contrast ratios. No oversaturated gimmicks; balanced for prolonged focus.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <span className="font-mono text-xs text-orange-400 font-semibold block">03 / COMPOSITION</span>
              <h4 className="font-heading font-semibold text-base text-zinc-200">Distraction-Free</h4>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Calculated negative space for desktop application icons and phone lockscreen clock clearance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. DISPATCH / CURATION FEED SUBSCRIPTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 bg-zinc-900/40 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2 max-w-md">
            <span className="text-xs font-mono text-orange-400 uppercase tracking-widest font-semibold">
              The Bi-Weekly Dispatch
            </span>
            <h3 className="text-2xl font-heading font-semibold text-zinc-100">
              Receive new curated editions
            </h3>
            <p className="text-xs text-zinc-400 font-light">
              Bi-weekly drops of hand-selected 4K landscapes, OLED minimal pieces, and thematic monograph series.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex-1 max-w-md space-y-2">
            <div className="flex gap-2">
              <input
                type="email"
                required
                placeholder="your.email@display.art"
                value={subscribedEmail}
                onChange={(e) => setSubscribedEmail(e.target.value)}
                className="flex-1 bg-black/50 border border-white/10 rounded-full px-4 py-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/60"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold text-xs transition-colors shrink-0"
              >
                Join Dispatch
              </button>
            </div>
            {subscribeSuccess && (
              <p className="text-xs text-emerald-400 flex items-center gap-1 pl-2">
                <Check className="w-3.5 h-3.5" /> Welcome to the Velora dispatch.
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
