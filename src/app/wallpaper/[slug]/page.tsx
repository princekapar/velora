import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Share2,
  Heart,
  Eye,
  Download as DownloadIcon,
  Monitor,
  Smartphone,
  Sparkles,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';
import { getWallpaperBySlug, getRelatedWallpapers } from '@/services/wallpaperService';
import DownloadDropdown from '@/components/wallpaper/DownloadDropdown';
import DevicePreviewFrame from '@/components/wallpaper/DevicePreviewFrame';
import WallpaperGrid from '@/components/wallpaper/WallpaperGrid';
import WallpaperDetailClientActions from './WallpaperDetailClientActions';

interface WallpaperDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: WallpaperDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const wallpaper = await getWallpaperBySlug(slug);

  if (!wallpaper) {
    return {
      title: 'Wallpaper Not Found',
    };
  }

  return {
    title: `${wallpaper.title} — ${wallpaper.resolution} Wallpaper`,
    description: wallpaper.description || `Download ${wallpaper.title} in high-resolution ${wallpaper.resolution} for ${wallpaper.deviceType}.`,
    openGraph: {
      title: `${wallpaper.title} — VELORA`,
      description: wallpaper.description || `Curated high-resolution wallpaper designed for your screen.`,
      images: [{ url: wallpaper.imageUrl, width: wallpaper.width, height: wallpaper.height }],
    },
  };
}

export default async function WallpaperDetailPage({ params }: WallpaperDetailPageProps) {
  const { slug } = await params;
  const wallpaper = await getWallpaperBySlug(slug);

  if (!wallpaper) {
    notFound();
  }

  const related = await getRelatedWallpapers(wallpaper, 4);

  const isPortrait = wallpaper.orientation === 'portrait';

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/wallpapers"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors py-2 px-3 rounded-full hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4 text-orange-500" />
          <span>Back to Exhibition</span>
        </Link>

        {/* Client share & favorite actions */}
        <WallpaperDetailClientActions wallpaper={wallpaper} />
      </div>

      {/* Main Wallpaper Preview Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Large Artwork Canvas with Device Frame Mockup Switcher */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/60 shadow-2xl p-4 sm:p-8 flex items-center justify-center min-h-[500px]">
            <DevicePreviewFrame
              imageUrl={wallpaper.imageUrl}
              orientation={wallpaper.orientation}
              deviceType={wallpaper.deviceType}
              title={wallpaper.title}
            />
          </div>

          {/* Color Palette Extraction Swatches */}
          {wallpaper.colorPalette && wallpaper.colorPalette.length > 0 && (
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">Color Harmony</span>
              <div className="flex items-center gap-2">
                {wallpaper.colorPalette.map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-md border border-white/20 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Editorial Metadata & Download Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-6 backdrop-blur-xl">
            {/* Title & Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href={`/category/${wallpaper.category.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-xs uppercase tracking-widest text-orange-400 font-semibold hover:underline"
                >
                  {wallpaper.category}
                </Link>
                <span className="text-zinc-600">•</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-white/10 text-zinc-300">
                  {wallpaper.resolution} UHD
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-zinc-100">
                {wallpaper.title}
              </h1>
            </div>

            {/* Description */}
            {wallpaper.description && (
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {wallpaper.description}
              </p>
            )}

            {/* Download Dropdown */}
            <div className="pt-2 border-t border-white/10">
              <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-3">
                Download Calibrated Artwork
              </p>
              <DownloadDropdown wallpaper={wallpaper} />
            </div>

            {/* Technical Specifications Specs Sheet */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                Display Specifications
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 space-y-0.5">
                  <span className="text-zinc-400 block text-[10px]">Native Dimensions</span>
                  <span className="font-mono text-zinc-200 font-medium">
                    {wallpaper.width} × {wallpaper.height}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 space-y-0.5">
                  <span className="text-zinc-400 block text-[10px]">Aspect Ratio</span>
                  <span className="font-mono text-zinc-200 font-medium">
                    {wallpaper.aspectRatio} : 1
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 space-y-0.5">
                  <span className="text-zinc-400 block text-[10px]">Device Category</span>
                  <span className="capitalize text-zinc-200 font-medium flex items-center gap-1">
                    {wallpaper.deviceType === 'phone' ? (
                      <Smartphone className="w-3.5 h-3.5 text-orange-400" />
                    ) : (
                      <Monitor className="w-3.5 h-3.5 text-orange-400" />
                    )}
                    {wallpaper.deviceType}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 space-y-0.5">
                  <span className="text-zinc-400 block text-[10px]">Format & Quality</span>
                  <span className="uppercase text-zinc-200 font-medium">
                    PNG (Lossless Master)
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {wallpaper.tags && wallpaper.tags.length > 0 && (
              <div className="pt-4 border-t border-white/10 space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">
                  Keywords
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {wallpaper.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/wallpapers?search=${encodeURIComponent(tag)}`}
                      className="px-2.5 py-1 rounded-md text-[11px] bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-orange-300 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Engagement Stats */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <DownloadIcon className="w-3.5 h-3.5 text-orange-500" />
                <span>{wallpaper.downloads.toLocaleString()} downloads</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-zinc-400" />
                <span>{wallpaper.views.toLocaleString()} views</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Wallpapers Section */}
      {related.length > 0 && (
        <section className="pt-12 border-t border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-orange-400 font-semibold font-heading">
                Similar Aesthetics
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-semibold text-zinc-100">
                More from {wallpaper.category}
              </h2>
            </div>
            <Link
              href={`/category/${wallpaper.category.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-xs text-zinc-400 hover:text-orange-400 transition-colors"
            >
              View all {wallpaper.category} →
            </Link>
          </div>

          <WallpaperGrid wallpapers={related} />
        </section>
      )}
    </div>
  );
}
