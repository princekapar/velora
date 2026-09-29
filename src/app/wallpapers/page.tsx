'use client';

import React, { useState, useEffect } from 'react';
import WallpaperGrid from '@/components/wallpaper/WallpaperGrid';
import FilterBar from '@/components/wallpaper/FilterBar';
import { Wallpaper, Category, FilterState } from '@/types';
import { Sparkles } from 'lucide-react';

export default function AllWallpapersPage() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<FilterState>({
    device: 'all',
    resolution: 'all',
    orientation: 'all',
    category: 'all',
    sort: 'newest',
    search: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.device !== 'all') params.set('device', filters.device);
        if (filters.resolution !== 'all') params.set('resolution', filters.resolution);
        if (filters.orientation !== 'all') params.set('orientation', filters.orientation);
        if (filters.category !== 'all') params.set('category', filters.category);
        if (filters.sort) params.set('sort', filters.sort);
        if (filters.search) params.set('search', filters.search);

        const [wallRes, catRes] = await Promise.all([
          fetch(`/api/wallpapers?${params.toString()}`).then((r) => r.json()),
          fetch('/api/categories').then((r) => r.json()),
        ]);

        if (wallRes.wallpapers) setWallpapers(wallRes.wallpapers);
        if (Array.isArray(catRes)) setCategories(catRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 uppercase tracking-widest font-heading mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Index</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-semibold text-zinc-100">
          The Full Archive
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
          Browse all studio-graded wallpapers across ultra-wide desktop monitors, laptops, and mobile screens.
        </p>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
        categories={categories}
        totalResults={wallpapers.length}
      />

      <WallpaperGrid
        wallpapers={wallpapers}
        loading={loading}
      />
    </div>
  );
}
