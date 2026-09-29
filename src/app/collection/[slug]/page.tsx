import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCollectionBySlug } from '@/services/collectionService';
import WallpaperGrid from '@/components/wallpaper/WallpaperGrid';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    return { title: 'Collection Not Found' };
  }

  return {
    title: `${collection.name} Collection — VELORA Edition`,
    description: collection.description,
    openGraph: {
      title: `${collection.name} — VELORA Editorial Collection`,
      description: collection.description,
      images: [{ url: collection.coverImage }],
    },
  };
}

export default async function CollectionDetailPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Editorial Collection Hero */}
      <div className="relative rounded-3xl overflow-hidden min-h-[300px] sm:min-h-[380px] flex items-end p-6 sm:p-12 border border-white/10 bg-zinc-900 shadow-2xl">
        <Image
          src={collection.coverImage}
          alt={collection.name}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

        <div className="relative z-10 space-y-3 max-w-2xl">
          <Link
            href="/collections"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-orange-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Collections</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-orange-400 uppercase tracking-widest font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Editorial Volume • Vol. {collection.order || 1}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-semibold text-zinc-100">
            {collection.name}
          </h1>

          {collection.description && (
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {collection.description}
            </p>
          )}
        </div>
      </div>

      {/* Wallpapers inside Collection */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h2 className="text-lg font-heading font-semibold text-zinc-200">
            Artworks in this Volume
          </h2>
          <span className="text-xs font-mono text-zinc-400">
            {collection.wallpapersList?.length || 0} wallpapers
          </span>
        </div>

        <WallpaperGrid
          wallpapers={collection.wallpapersList || []}
          emptyMessage="No wallpapers assigned to this collection yet."
        />
      </div>
    </div>
  );
}
