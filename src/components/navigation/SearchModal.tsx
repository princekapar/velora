'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, X, Monitor, Smartphone, ArrowRight, Sparkles } from 'lucide-react';
import { Wallpaper, Category } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      fetchSuggestions('');
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const fetchSuggestions = async (q: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.wallpapers || []);
      setCategories(data.categories || []);
      if (data.suggestions) setSuggestions(data.suggestions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    fetchSuggestions(val);
  };

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md transition-opacity">
      <div
        className="w-full max-w-2xl bg-zinc-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by title, tag, category (e.g. 'AMOLED', 'Minimal', 'Tokyo')..."
            value={query}
            onChange={handleSearchChange}
            className="flex-1 bg-transparent text-zinc-100 placeholder:text-zinc-500 text-sm sm:text-base outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                fetchSuggestions('');
              }}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[11px] font-mono text-zinc-500 border border-white/10 px-1.5 py-0.5 rounded">
            ESC
          </span>
        </div>

        {/* Quick Tag Pills */}
        {!query && suggestions.length > 0 && (
          <div className="px-4 py-2.5 bg-black/30 border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            <span className="text-zinc-500 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-orange-500" /> Popular:
            </span>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setQuery(s);
                  fetchSuggestions(s);
                }}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors text-[11px]"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="py-8 text-center text-xs text-zinc-500">Searching library...</div>
          )}

          {!loading && results.length === 0 && query && (
            <div className="py-12 text-center space-y-2">
              <p className="text-zinc-400 text-sm">No wallpapers found for &quot;{query}&quot;</p>
              <p className="text-zinc-600 text-xs">Try searching for &quot;Nature&quot;, &quot;Minimal&quot;, or &quot;4K&quot;</p>
            </div>
          )}

          {/* Categories matches */}
          {categories.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mb-2">Categories</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.slice(0, 3).map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleSelect(`/category/${cat.slug}`)}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-left group transition-colors"
                  >
                    <span className="text-xs font-medium text-zinc-200 group-hover:text-orange-400">{cat.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Wallpapers Matches */}
          {results.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mb-2">
                {query ? 'Matching Wallpapers' : 'Curated Highlights'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {results.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => handleSelect(`/wallpaper/${item.slug}`)}
                    className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all text-left group"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                      <Image
                        src={item.thumbnailUrl || item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="60px"
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-zinc-200 truncate group-hover:text-orange-400">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
                        <span>{item.category}</span>
                        <span>•</span>
                        <span className="text-orange-500/90 font-mono">{item.resolution}</span>
                        <span>•</span>
                        <span className="capitalize flex items-center gap-1">
                          {item.deviceType === 'phone' ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                          {item.deviceType}
                        </span>
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-black/40 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Press Enter to select</span>
          <button
            onClick={() => handleSelect(`/wallpapers?search=${encodeURIComponent(query)}`)}
            className="hover:text-orange-400 text-zinc-400 flex items-center gap-1 transition-colors"
          >
            View all results <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
