'use client';

import React, { useState } from 'react';
import { Settings, ShieldCheck, CheckCircle2, Server, Cloud, Key, Check } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminSettingsPage() {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<any>(null);

  React.useEffect(() => {
    fetch('/api/admin/status')
      .then((r) => r.json())
      .then(setStatus)
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-8 max-w-4xl">
      <AdminHeader
        title="Settings & System Diagnostics"
        subtitle="Cloudinary CDN delivery channels, MongoDB state, and administrative security."
      />

      {/* Cloud & Database Diagnostic Status */}
      <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-6">
        <h3 className="font-heading font-semibold text-base text-zinc-100 flex items-center gap-2">
          <Server className="w-4 h-4 text-orange-500" />
          <span>Infrastructure Health & Services</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* MongoDB */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200">MongoDB Atlas</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border flex items-center gap-1 ${
                status?.database?.connected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
              }`}>
                <CheckCircle2 className="w-3 h-3" /> {status?.database?.connected ? 'Atlas Connected' : 'In-Memory Fallback'}
              </span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Active cluster: <span className="text-zinc-200 font-mono">{status?.database?.host || 'Connecting...'}</span>
            </p>
            <div className="pt-2 border-t border-white/5 font-mono text-[10px] text-zinc-500 flex justify-between">
              <span>Database: {status?.database?.dbName || 'velora'}</span>
              <span className="text-orange-400 font-semibold">{status?.database?.wallpaperCount ?? 0} Wallpapers • {status?.database?.categoryCount ?? 0} Categories</span>
            </div>
          </div>

          {/* Cloudinary */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200">Cloudinary CDN</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Automated WebP/AVIF format conversion, dynamic responsive transformations, and safe unlinking.
            </p>
            <div className="pt-2 border-t border-white/5 font-mono text-[10px] text-zinc-400">
              Cloud: <span className="text-orange-400 font-semibold">{status?.cloudinary?.cloudName || 'Configured via ENV'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Credentials */}
      <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-4">
        <h3 className="font-heading font-semibold text-base text-zinc-100 flex items-center gap-2">
          <Key className="w-4 h-4 text-orange-500" />
          <span>Security & Environment Variables</span>
        </h3>

        <p className="text-xs text-zinc-400">
          For production deployments, ensure all variables in <code className="text-orange-400">.env.example</code> are populated on your host (Vercel, AWS, etc.).
        </p>

        <div className="p-4 rounded-2xl bg-black/50 border border-white/5 font-mono text-[11px] text-zinc-300 space-y-1">
          <p className="text-zinc-500"># Required for Production</p>
          <p>MONGODB_URI=mongodb+srv://...</p>
          <p>CLOUDINARY_CLOUD_NAME=your_cloud_name</p>
          <p>CLOUDINARY_API_KEY=your_key</p>
          <p>CLOUDINARY_API_SECRET=••••••••••••••••</p>
          <p>JWT_SECRET=••••••••••••••••</p>
        </div>
      </div>
    </div>
  );
}
