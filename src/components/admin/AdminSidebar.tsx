'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Image as ImageIcon,
  UploadCloud,
  FolderTree,
  Sparkles,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import BrandLogo from '../ui/BrandLogo';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const menuItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Wallpapers', href: '/admin/wallpapers', icon: ImageIcon },
    { name: 'Upload Studio', href: '/admin/upload', icon: UploadCloud, badge: 'New' },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Collections', href: '/admin/collections', icon: Sparkles },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings & CDN', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/admin' && pathname === '/admin') return true;
    if (href !== '/admin' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <aside className="w-64 border-r border-white/10 bg-zinc-950/90 flex flex-col justify-between shrink-0 min-h-screen sticky top-0">
      {/* Top Header */}
      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <BrandLogo size="sm" />
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-widest text-orange-400 font-semibold pl-8">
            <ShieldCheck className="w-3 h-3" />
            <span>Admin Studio</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-orange-400' : 'text-zinc-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-orange-500/20 text-orange-300 rounded font-mono font-medium">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status & Logout */}
      <div className="p-6 space-y-4 border-t border-white/10">
        {/* System Health Badges */}
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 space-y-2 text-[11px]">
          <div className="flex items-center justify-between text-zinc-400">
            <span>Database</span>
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <CheckCircle2 className="w-3 h-3" /> Online
            </span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span>Cloudinary CDN</span>
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <CheckCircle2 className="w-3 h-3" /> Active
            </span>
          </div>
        </div>

        {/* Links & Logout */}
        <div className="space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <span>Live Gallery Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 text-xs text-zinc-400 hover:text-rose-400 px-3 py-2 rounded-lg hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
