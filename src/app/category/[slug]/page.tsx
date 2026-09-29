import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategoryBySlug } from '@/services/categoryService';
import { getWallpapers } from '@/services/wallpaperService';
import WallpaperGrid from '@/components/wallpaper/WallpaperGrid';
import { ArrowLeft, Layers } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: 'Category Not Found' };
  }

  return {
    title: `${category.name} Wallpapers — Curated Selection`,
    description: category.description || `Browse ultra-high resolution wallpapers in the ${category.name} genre.`,
    openGraph: {
      title: `${category.name} — VELORA Wallpapers`,
      description: category.description,
      images: [{ url: category.coverImage }],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const wallpapersRes = await getWallpapers({ category: category.name, limit: 50 });

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Category Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden min-h-[260px] sm:min-h-[320px] flex items-end p-6 sm:p-12 border border-white/10 bg-zinc-900 shadow-2xl">
        <Image
          src={category.coverImage}
          alt={category.name}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-orange-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-orange-400 uppercase tracking-widest font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Curated Exhibition • {wallpapersRes.total} Pieces</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-semibold text-zinc-100">
            {category.name}
          </h1>

          {category.description && (
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Wallpapers in this category */}
      <div>
        <WallpaperGrid
          wallpapers={wallpapersRes.wallpapers}
          emptyMessage={`No wallpapers found under ${category.name} yet.`}
        />
      </div>
    </div>
  );
}
