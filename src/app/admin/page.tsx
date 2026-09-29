'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Image as ImageIcon,
  Smartphone,
  Monitor,
  Download,
  Eye,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  FolderTree,
  UploadCloud,
  CheckCircle,
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import { AdminStats } from '@/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 w-64 bg-zinc-900 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-zinc-900 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Wallpapers',
      value: stats?.totalWallpapers?.toLocaleString() || '0',
      icon: ImageIcon,
      sub: `${stats?.fourKWallpapers || 0} Ultra 4K/8K Master`,
      color: 'text-orange-400',
    },
    {
      label: 'Desktop Wallpapers',
      value: stats?.desktopWallpapers?.toLocaleString() || '0',
      icon: Monitor,
      sub: 'Horizontal & Ultrawide',
      color: 'text-blue-400',
    },
    {
      label: 'Phone Wallpapers',
      value: stats?.phoneWallpapers?.toLocaleString() || '0',
      icon: Smartphone,
      sub: 'OLED & Lock Screen',
      color: 'text-emerald-400',
    },
    {
      label: 'Total Downloads',
      value: stats?.totalDownloads?.toLocaleString() || '0',
      icon: Download,
      sub: `${stats?.totalViews?.toLocaleString() || 0} Total Impressions`,
      color: 'text-rose-400',
    },
  ];

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Curatorial Dashboard"
        subtitle="Real-time repository statistics, CDN distribution, and engagement metrics."
        actionText="Upload Artwork"
        actionHref="/admin/upload"
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-zinc-900/80 border border-white/10 hover:border-white/20 transition-all duration-300 space-y-3"
            >
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium uppercase tracking-wider">{kpi.label}</span>
                <div className="p-2 rounded-xl bg-white/5">
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-heading font-semibold text-zinc-100">
                  {kpi.value}
                </p>
                <p className="text-[11px] text-zinc-400 mt-1 font-mono">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics & Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Download & View Trends Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-orange-400 font-semibold font-heading">
                Weekly Trajectory
              </span>
              <h3 className="text-lg font-heading font-semibold text-zinc-100">
                Downloads & Impressions
              </h3>
            </div>
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> +24.8% this week
            </span>
          </div>

          {/* SVG Sparkline / Bar Chart */}
          <div className="h-56 w-full flex items-end justify-between gap-3 pt-8 pb-2 px-2 border-b border-white/5">
            {stats?.downloadTrends?.map((point, i) => {
              const maxVal = Math.max(...stats.downloadTrends.map((d) => d.views)) || 1000;
              const downloadHeight = Math.max(15, Math.round((point.downloads / maxVal) * 180));
              const viewHeight = Math.max(25, Math.round((point.views / maxVal) * 180));

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    {/* Views Bar */}
                    <div
                      style={{ height: `${viewHeight}px` }}
                      className="w-1/2 max-w-[20px] bg-zinc-700/60 group-hover:bg-zinc-600 rounded-t-sm transition-all"
                      title={`${point.day} Views: ${point.views}`}
                    />
                    {/* Downloads Bar */}
                    <div
                      style={{ height: `${downloadHeight}px` }}
                      className="w-1/2 max-w-[20px] bg-orange-500/80 group-hover:bg-orange-400 rounded-t-sm transition-all"
                      title={`${point.day} Downloads: ${point.downloads}`}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300">
                    {point.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-6 text-xs text-zinc-400">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-zinc-700 inline-block" />
              <span>Impressions</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-500 inline-block" />
              <span>Downloads</span>
            </span>
          </div>
        </div>

        {/* Right: Popular Categories Breakdown */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-heading font-semibold text-zinc-100">
              Popular Genres
            </h3>
            <Link
              href="/admin/categories"
              className="text-xs text-zinc-400 hover:text-orange-400 transition-colors"
            >
              Manage →
            </Link>
          </div>

          <div className="space-y-4">
            {stats?.popularCategories?.slice(0, 5).map((cat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-200 font-medium">{cat.name}</span>
                  <span className="font-mono text-zinc-400">{cat.downloads.toLocaleString()} dl</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(10, (cat.downloads / (stats.totalDownloads || 1)) * 100 * 2))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Uploads Table */}
      <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-heading font-semibold text-zinc-100">
              Recent Repository Uploads
            </h3>
            <p className="text-xs text-zinc-400">
              Recently ingested wallpapers delivered via Cloudinary CDN.
            </p>
          </div>
          <Link
            href="/admin/wallpapers"
            className="text-xs text-orange-400 hover:text-orange-300 font-medium"
          >
            View all wallpapers →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-zinc-400 border-b border-white/5 uppercase tracking-wider font-mono text-[10px]">
                <th className="py-3 px-3">Artwork</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Display Suitability</th>
                <th className="py-3 px-3">Resolution</th>
                <th className="py-3 px-3">Downloads</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {stats?.recentUploads?.map((w) => (
                <tr key={w._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                      <Image
                        src={w.thumbnailUrl || w.imageUrl}
                        alt={w.title}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-200">{w.title}</p>
                      <p className="text-[10px] font-mono text-zinc-500">
                        {w.width} × {w.height} • {w.format}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-zinc-300">{w.category}</td>
                  <td className="py-3 px-3 capitalize">
                    <span className="flex items-center gap-1">
                      {w.deviceType === 'phone' ? (
                        <Smartphone className="w-3.5 h-3.5 text-orange-400" />
                      ) : (
                        <Monitor className="w-3.5 h-3.5 text-orange-400" />
                      )}
                      {w.deviceType}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-white/10 text-orange-300">
                      {w.resolution}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">{w.downloads.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/wallpaper/${w.slug}`}
                      target="_blank"
                      className="p-1 rounded hover:bg-white/10 inline-block text-zinc-400 hover:text-zinc-100"
                      title="Preview public page"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
