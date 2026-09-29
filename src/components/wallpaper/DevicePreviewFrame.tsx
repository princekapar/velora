'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Monitor, Smartphone, Maximize2 } from 'lucide-react';
import { OrientationType, DeviceType } from '@/types';

interface DevicePreviewFrameProps {
  imageUrl: string;
  orientation?: OrientationType;
  deviceType?: DeviceType;
  title: string;
}

export default function DevicePreviewFrame({
  imageUrl,
  orientation = 'landscape',
  deviceType = 'desktop',
  title,
}: DevicePreviewFrameProps) {
  const initialMode = orientation === 'portrait' || deviceType === 'phone' ? 'phone' : 'laptop';
  const [deviceMode, setDeviceMode] = useState<'laptop' | 'phone'>(initialMode);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-4">
      {/* Device Mode Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-xs">
        <button
          onClick={() => setDeviceMode('laptop')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            deviceMode === 'laptop'
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>MacBook Pro Display</span>
        </button>

        <button
          onClick={() => setDeviceMode('phone')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            deviceMode === 'phone'
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>iPhone Display</span>
        </button>
      </div>

      {/* Frame Container */}
      <div className="w-full flex items-center justify-center p-4">
        {deviceMode === 'laptop' ? (
          /* Laptop Screen Mockup */
          <div className="w-full max-w-3xl flex flex-col items-center">
            {/* Screen Lid */}
            <div className="relative w-full aspect-[16/10] bg-zinc-900 rounded-t-2xl p-2.5 sm:p-3.5 border-t border-x border-zinc-700 shadow-2xl overflow-hidden ring-1 ring-black">
              {/* Webcam Dot */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-zinc-800 rounded-full border border-zinc-700 z-20" />

              {/* Wallpaper Canvas */}
              <div className="relative w-full h-full rounded-lg overflow-hidden bg-black">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  sizes="1000px"
                  className="object-cover"
                />

                {/* macOS Mock Menu Bar */}
                <div className="absolute top-0 inset-x-0 h-6 bg-black/40 backdrop-blur-md flex items-center justify-between px-3 text-[10px] text-zinc-300">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-white">VELORA</span>
                    <span>File</span>
                    <span>Edit</span>
                    <span>View</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span>9:41 AM</span>
                  </div>
                </div>

                {/* macOS Mock Dock */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-10 px-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center gap-2 shadow-2xl">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'].map((col, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 rounded-lg shadow-sm"
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Laptop Aluminum Base */}
            <div className="w-[104%] h-3.5 bg-gradient-to-b from-zinc-700 to-zinc-900 rounded-b-xl border-b border-zinc-800 shadow-xl relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-zinc-600 rounded-b-md" />
            </div>
          </div>
        ) : (
          /* Phone Screen Mockup */
          <div className="relative w-[280px] sm:w-[320px] aspect-[9/19.5] bg-zinc-950 rounded-[44px] p-3 border-4 border-zinc-800 shadow-2xl ring-1 ring-zinc-700/50">
            {/* Screen Glass */}
            <div className="relative w-full h-full rounded-[36px] overflow-hidden bg-black">
              <Image
                src={imageUrl}
                alt={title}
                fill
                sizes="500px"
                className="object-cover"
              />

              {/* Dynamic Island */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full border border-zinc-900 z-30 flex items-center justify-between px-2 text-[9px] text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-zinc-300">VELORA</span>
              </div>

              {/* iOS Mock Status Bar */}
              <div className="absolute top-3 inset-x-6 flex items-center justify-between text-[11px] font-semibold text-white drop-shadow">
                <span>9:41</span>
                <div className="flex items-center gap-1 text-[9px]">5G 100%</div>
              </div>

              {/* iOS Mock Lockscreen Clock */}
              <div className="absolute top-16 inset-x-0 text-center space-y-1 drop-shadow-lg text-white">
                <p className="text-xs uppercase tracking-widest text-zinc-200 font-medium">Tuesday, September 29</p>
                <p className="text-5xl font-heading font-light tracking-tight">09:41</p>
              </div>

              {/* iOS Home Indicator Bar */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/70 rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
