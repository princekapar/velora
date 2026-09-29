import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getCategories } from '@/services/categoryService';
import { ArrowRight, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Categories & Genres — Curated Wallpaper Archives',
  description: 'Explore wallpapers categorized by style: Dark & AMOLED, Minimal, Nature, Cyberpunk, Space, and Architecture.',
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 uppercase tracking-widest font-heading mb-1">
          <Layers className="w-3.5 h-3.5" />
          <span>Taxonomy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-semibold text-zinc-100">
          All Categories
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
          Curated thematic aesthetics ranging from Scandinavian alpine mist to neon Tokyo streets.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            href={`/category/${cat.slug}`}
            className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-orange-500/50 transition-all duration-300 flex flex-col aspect-[16/10]"
          >
            <Image
              src={cat.coverImage}
              alt={cat.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-60 group-hover:opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

            <div className="relative z-10 p-6 flex-1 flex flex-col justify-end space-y-1">
              <h3 className="text-xl font-heading font-semibold text-zinc-100 group-hover:text-orange-300 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-zinc-300 line-clamp-2">
                {cat.description}
              </p>
              <div className="pt-2 flex items-center gap-1 text-xs text-orange-400 font-medium group-hover:translate-x-1 transition-transform">
                <span>View Collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
