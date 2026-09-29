'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Smartphone, Monitor, ShieldCheck, Menu, X, Heart, Sparkles } from 'lucide-react';
import BrandLogo from '../ui/BrandLogo';
import SearchModal from './SearchModal';

export default function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [userDevice, setUserDevice] = useState<'desktop' | 'phone'>('desktop');

  // Client device detection
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    setUserDevice(isMobile ? 'phone' : 'desktop');

    // Update favorites count from localStorage
    const saved = localStorage.getItem('velora_favorites');
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        setFavoritesCount(Array.isArray(arr) ? arr.length : 0);
      } catch (e) {}
    }

    // Keyboard shortcut for Cmd+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for favorites update custom event
  useEffect(() => {
    const handleFavUpdate = () => {
      const saved = localStorage.getItem('velora_favorites');
      if (saved) {
        try {
          const arr = JSON.parse(saved);
          setFavoritesCount(Array.isArray(arr) ? arr.length : 0);
        } catch (e) {}
      }
    };
    window.addEventListener('velora_fav_changed', handleFavUpdate);
    return () => window.removeEventListener('velora_fav_changed', handleFavUpdate);
  }, []);

  const navLinks = [
    { name: 'Discover', href: '/wallpapers' },
    { name: 'Desktop', href: '/wallpapers/desktop', icon: Monitor },
    { name: 'Phone', href: '/wallpapers/phone', icon: Smartphone },
    { name: '4K Ultra', href: '/wallpapers/4k', badge: 'UHD' },
    { name: 'Collections', href: '/collections' },
    { name: 'Categories', href: '/categories' },
  ];

  const isActive = (href: string) => {
    if (href === '/wallpapers' && pathname === '/wallpapers') return true;
    if (href !== '/wallpapers' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/[0.07] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <BrandLogo size="md" />

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-4">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                      active
                        ? 'text-zinc-100 bg-white/10 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                    {link.badge && (
                      <span className="text-[10px] px-1 py-0.2 bg-orange-500/20 text-orange-300 rounded font-mono font-semibold">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Search Trigger Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-zinc-400 hover:text-zinc-200 text-xs transition-all group"
              title="Search wallpapers (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 group-hover:text-orange-400 transition-colors" />
              <span className="hidden sm:inline">Search gallery...</span>
              <kbd className="hidden sm:inline text-[10px] font-mono text-zinc-500 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                ⌘K
              </kbd>
            </button>

            {/* Favorites Counter */}
            <Link
              href="/favorites"
              className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-rose-400 transition-colors relative"
              title="Saved Wallpapers"
            >
              <Heart className="w-4 h-4" />
              {favoritesCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-zinc-950" />
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-zinc-950/95 backdrop-blur-2xl px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between ${
                      active
                        ? 'text-zinc-100 bg-white/10'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {link.icon && <link.icon className="w-4 h-4 text-zinc-400" />}
                      <span>{link.name}</span>
                    </div>
                    {link.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/20 text-orange-300 rounded font-mono font-semibold">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <Link
                href="/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-rose-400"
              >
                <Heart className="w-4 h-4" />
                <span>Favorites ({favoritesCount})</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Cmd+K Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
