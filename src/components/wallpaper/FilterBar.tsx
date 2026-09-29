'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, X, Monitor, Smartphone, Check, Sparkles } from 'lucide-react';
import { FilterState, Category } from '@/types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  categories: Category[];
  totalResults?: number;
}

export default function FilterBar({
  filters,
  onFilterChange,
  categories,
  totalResults,
}: FilterBarProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const resolutions = ['all', '4K', '2K', '8K', 'HD'];
  const sorts = [
    { id: 'featured', label: 'Curated' },
    { id: 'newest', label: 'Newest' },
    { id: 'popular', label: 'Trending' },
    { id: 'downloads', label: 'Downloads' },
  ];

  return (
    <div className="mb-8 space-y-4">
      {/* Top Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        {/* Device Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-white/10 rounded-full">
          <button
            onClick={() => onFilterChange({ device: 'all' })}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              filters.device === 'all'
                ? 'bg-white/15 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Displays
          </button>
          <button
            onClick={() => onFilterChange({ device: 'desktop' })}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              filters.device === 'desktop'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => onFilterChange({ device: 'phone' })}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              filters.device === 'phone'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone</span>
          </button>
        </div>

        {/* Resolution Pills */}
        <div className="hidden md:flex items-center gap-1">
          <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mr-1.5">
            Resolution:
          </span>
          {resolutions.map((res) => (
            <button
              key={res}
              onClick={() => onFilterChange({ resolution: res })}
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all ${
                filters.resolution === res
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              {res === 'all' ? 'Any' : res}
            </button>
          ))}
        </div>

        {/* Sort Selector & Mobile Filter Button */}
        <div className="flex items-center gap-2">
          {/* Desktop Sort Dropdown / Pills */}
          <div className="hidden lg:flex items-center gap-1 bg-zinc-900 border border-white/10 p-1 rounded-full">
            {sorts.map((s) => (
              <button
                key={s.id}
                onClick={() => onFilterChange({ sort: s.id as any })}
                className={`px-2.5 py-0.5 rounded-full text-xs transition-all ${
                  filters.sort === s.id
                    ? 'bg-white/15 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-xs text-zinc-300"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
            <span>Filters</span>
          </button>

          {typeof totalResults === 'number' && (
            <span className="text-xs text-zinc-500 font-mono pl-1">
              ({totalResults})
            </span>
          )}
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => onFilterChange({ category: 'all' })}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs transition-all ${
            filters.category === 'all'
              ? 'bg-orange-500 text-zinc-950 font-semibold'
              : 'bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20'
          }`}
        >
          All Curations
        </button>
        {categories.map((cat) => {
          const active = filters.category.toLowerCase() === cat.name.toLowerCase();
          return (
            <button
              key={cat._id}
              onClick={() => onFilterChange({ category: active ? 'all' : cat.name })}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs transition-all ${
                active
                  ? 'bg-orange-500 text-zinc-950 font-semibold'
                  : 'bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Mobile Bottom-Sheet Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md">
          <div className="w-full bg-zinc-900 border-t border-white/10 rounded-t-3xl p-6 space-y-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-orange-500" />
                <h3 className="font-heading font-semibold text-zinc-100">Filter Wallpapers</h3>
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Device */}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Device Type</p>
              <div className="grid grid-cols-3 gap-2">
                {(['all', 'desktop', 'phone'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => onFilterChange({ device: d })}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border capitalize ${
                      filters.device === d
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                        : 'bg-white/5 border-white/5 text-zinc-400'
                    }`}
                  >
                    {d === 'all' ? 'All Displays' : d}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Resolution</p>
              <div className="grid grid-cols-4 gap-2">
                {resolutions.map((r) => (
                  <button
                    key={r}
                    onClick={() => onFilterChange({ resolution: r })}
                    className={`py-2 px-3 rounded-xl text-xs font-mono border ${
                      filters.resolution === r
                        ? 'bg-white/20 text-white border-white/40'
                        : 'bg-white/5 border-white/5 text-zinc-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Sort Order</p>
              <div className="grid grid-cols-2 gap-2">
                {sorts.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onFilterChange({ sort: s.id as any })}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border ${
                      filters.sort === s.id
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                        : 'bg-white/5 border-white/5 text-zinc-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 rounded-xl bg-orange-500 text-zinc-950 font-semibold text-sm hover:bg-orange-400 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
