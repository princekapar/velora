'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Search,
  User,
} from 'lucide-react';
import BrandLogo from '@/components/ui/BrandLogo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    // Skip auth check on login page
    if (pathname === '/admin/login') {
      setCheckingAuth(false);
      return;
    }

    // Verify session
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data?.authenticated) {
          setAdminUser(data.user);
        }
      })
      .catch(() => {
        router.push('/admin/login');
      })
      .finally(() => {
        setCheckingAuth(false);
      });
  }, [pathname, router]);

  // If on login page, render full screen without sidebar/header
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-zinc-950 text-zinc-100">{children}</div>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 font-mono tracking-wider uppercase">
            Verifying Studio Credentials...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row antialiased selection:bg-orange-500/30 selection:text-orange-200">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Mobile Top Navbar with Hamburger */}
      <div className="md:hidden sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrandLogo size="sm" />
          <span className="text-[10px] uppercase font-mono tracking-widest text-orange-400 font-semibold px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
            Studio
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-950">
            <BrandLogo size="sm" />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-zinc-950 p-4" onClick={() => setMobileMenuOpen(false)}>
            <AdminSidebar />
          </div>
        </div>
      )}

      {/* Main Studio Work Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Studio Utility Bar */}
        <header className="hidden md:flex h-14 border-b border-white/[0.08] bg-zinc-950/60 backdrop-blur-md px-6 sm:px-10 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
              <span>Studio Workspace</span>
            </span>
            <span className="text-zinc-600">/</span>
            <span className="font-mono text-zinc-500 capitalize">
              {pathname.replace('/admin', '').replace('/', '') || 'Overview'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* System Status */}
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Production Live</span>
            </div>

            {/* Live Gallery Link */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-orange-400 transition-colors py-1 px-2.5 rounded-full hover:bg-white/5"
            >
              <span>Exhibition Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {/* Profile Avatar Badge */}
            <div className="flex items-center gap-2 pl-3 border-l border-white/10 text-xs">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 flex items-center justify-center font-bold text-[11px]">
                A
              </div>
              <span className="font-medium text-zinc-200">
                {adminUser?.email || 'admin@velora.art'}
              </span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
