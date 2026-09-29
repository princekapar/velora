import React from 'react';
import Link from 'next/link';
import BrandLogo from '../ui/BrandLogo';
import { Monitor, Smartphone, Sparkles, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-zinc-950/60 pt-16 pb-12 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/[0.06]">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <BrandLogo size="lg" withTagline={true} />
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              VELORA is a curated digital wallpaper platform engineered for modern displays. High-dynamic range, pristine resolution, and zero visual clutter.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Monitor className="w-3.5 h-3.5 text-zinc-400" /> 4K & Ultrawide PC
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-zinc-400" /> OLED Mobile
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-heading">
              Displays
            </p>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/wallpapers/desktop" className="hover:text-orange-400 transition-colors">
                  Desktop & PC (16:9 / 21:9)
                </Link>
              </li>
              <li>
                <Link href="/wallpapers/phone" className="hover:text-orange-400 transition-colors">
                  Phone (iPhone & Android)
                </Link>
              </li>
              <li>
                <Link href="/wallpapers/4k" className="hover:text-orange-400 transition-colors">
                  4K / 5K / 8K Master
                </Link>
              </li>
              <li>
                <Link href="/wallpapers?orientation=portrait" className="hover:text-orange-400 transition-colors">
                  Portrait Wallpapers
                </Link>
              </li>
            </ul>
          </div>

          {/* Curated Categories */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-heading">
              Curations
            </p>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/category/dark-amoled" className="hover:text-orange-400 transition-colors">
                  Dark & AMOLED
                </Link>
              </li>
              <li>
                <Link href="/category/minimal" className="hover:text-orange-400 transition-colors">
                  Minimal Workspaces
                </Link>
              </li>
              <li>
                <Link href="/category/nature" className="hover:text-orange-400 transition-colors">
                  Alpine & Nature
                </Link>
              </li>
              <li>
                <Link href="/category/cyberpunk" className="hover:text-orange-400 transition-colors">
                  Cyberpunk Neon
                </Link>
              </li>
              <li>
                <Link href="/category/space-cosmic" className="hover:text-orange-400 transition-colors">
                  Space & Cosmic
                </Link>
              </li>
            </ul>
          </div>

          {/* Collections & Admin */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-heading">
              Platform
            </p>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/collections" className="hover:text-orange-400 transition-colors">
                  Editorial Collections
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-orange-400 transition-colors">
                  Saved Wallpapers
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-orange-400 transition-colors flex items-center gap-1.5 text-zinc-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-500" /> Admin Studio
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} VELORA Platform. Curated digital backgrounds.</p>

        </div>
      </div>
    </footer>
  );
}
