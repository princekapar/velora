'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Eye,
  TrendingUp,
  Smartphone,
  Monitor,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import { AdminStats } from '@/types';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Audience & CDN Analytics"
        subtitle="Bandwidth distribution, display resolution demand, and wallpaper acquisition trends."
      />

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Global Downloads</span>
            <Download className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-3xl font-heading font-semibold text-zinc-100">
            {stats?.totalDownloads.toLocaleString() || 0}
          </p>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.4% monthly velocity
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Total Artwork Views</span>
            <Eye className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-3xl font-heading font-semibold text-zinc-100">
            {stats?.totalViews.toLocaleString() || 0}
          </p>
          <span className="text-[11px] text-zinc-500">
            Average conversion rate: {((stats?.totalDownloads || 1) / (stats?.totalViews || 1) * 100).toFixed(1)}%
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>High-Density 4K/8K Share</span>
            <Sparkles className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-3xl font-heading font-semibold text-zinc-100">
            {Math.round(((stats?.fourKWallpapers || 1) / (stats?.totalWallpapers || 1)) * 100)}%
          </p>
          <span className="text-[11px] text-orange-400 font-mono">
            {stats?.fourKWallpapers} of {stats?.totalWallpapers} master pieces
          </span>
        </div>
      </div>

      {/* Breakdown by device */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-4">
          <h3 className="font-heading font-semibold text-base text-zinc-100">
            Device Preference Breakdown
          </h3>
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <Monitor className="w-4 h-4 text-orange-400" /> Desktop & PC Monitors
                </span>
                <span className="font-mono text-zinc-400">{stats?.desktopWallpapers} pieces</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{
                    width: `${Math.round(((stats?.desktopWallpapers || 1) / (stats?.totalWallpapers || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <Smartphone className="w-4 h-4 text-orange-400" /> Mobile & OLED Phones
                </span>
                <span className="font-mono text-zinc-400">{stats?.phoneWallpapers} pieces</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${Math.round(((stats?.phoneWallpapers || 1) / (stats?.totalWallpapers || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top downloaded list */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-4">
          <h3 className="font-heading font-semibold text-base text-zinc-100">
            Genre Engagement Leaderboard
          </h3>
          <div className="space-y-3 pt-1">
            {stats?.popularCategories.map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-orange-400 font-semibold w-4">#{i + 1}</span>
                  <span className="font-medium text-zinc-200">{c.name}</span>
                </div>
                <div className="flex items-center gap-4 font-mono text-[11px]">
                  <span className="text-zinc-500">{c.count} artworks</span>
                  <span className="text-orange-400 font-semibold">{c.downloads.toLocaleString()} dl</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
