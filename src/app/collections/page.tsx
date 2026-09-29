import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getCollections } from '@/services/collectionService';
import { ArrowRight, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Curated Collections — Editorial Wallpaper Series',
  description: 'Themed volumes and visual narratives curated by the VELORA editorial team.',
};

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 uppercase tracking-widest font-heading mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Editions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-semibold text-zinc-100">
          Editorial Collections
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
          Carefully composed thematic volumes crafted to transform your workspace atmosphere.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {collections.map((col) => (
          <Link
            key={col._id}
            href={`/collection/${col.slug}`}
            className="group relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-orange-500/50 transition-all duration-300 flex flex-col aspect-[16/10]"
          >
            <Image
              src={col.coverImage}
              alt={col.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-60 group-hover:opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

            <div className="relative z-10 p-8 flex-1 flex flex-col justify-end space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-semibold">
                Vol. {col.order || 1}
              </span>
              <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-zinc-100 group-hover:text-orange-300 transition-colors">
                {col.name}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md line-clamp-2">
                {col.description}
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs text-orange-400 font-semibold group-hover:translate-x-1.5 transition-transform">
                <span>Explore Volume</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
