'use client';

import React from 'react';
import Link from 'next/link';
import { UploadCloud, Sparkles } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  actionHref?: string;
}

export default function AdminHeader({
  title,
  subtitle,
  actionText,
  actionHref,
}: AdminHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-white/10 gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-zinc-100">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold text-xs tracking-tight transition-all active:scale-95 shadow-md shadow-orange-500/10 self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{actionText}</span>
        </Link>
      )}
    </header>
  );
}
