import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  withTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function BrandLogo({ className = '', withTagline = false, size = 'md' }: BrandLogoProps) {
  const sizeClasses = {
    sm: { glyph: 'h-4.5 w-auto', text: 'text-base' },
    md: { glyph: 'h-6 w-auto', text: 'text-lg sm:text-xl' },
    lg: { glyph: 'h-8 w-auto', text: 'text-2xl' },
  };

  const current = sizeClasses[size];

  return (
    <Link href="/" className={`inline-flex items-center gap-2 group select-none ${className}`}>
      {/* Brand Mark */}
      <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shrink-0">
        <Image
          src="/logo.png"
          alt="VELORA"
          width={946}
          height={698}
          className={`${current.glyph} object-contain drop-shadow-[0_0_14px_rgba(249,115,22,0.25)]`}
          priority
        />
      </div>

      <div className="flex flex-col">
        <div className="flex items-baseline tracking-[-0.04em]">
          <span className={`font-semibold tracking-[0.08em] uppercase text-zinc-100 ${current.text} font-heading`}>
            VELORA
          </span>
        </div>
        {withTagline && (
          <span className="text-[10px] tracking-[0.2em] text-zinc-400 uppercase -mt-0.5 font-medium">
            Designed for Your Screen
          </span>
        )}
      </div>
    </Link>
  );
}
