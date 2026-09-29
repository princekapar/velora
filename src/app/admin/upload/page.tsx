'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Monitor,
  Sparkles,
  Layers,
  FileImage,
  ArrowRight,
  Link as LinkIcon,
  X,
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Category } from '@/types';

export default function AdminUploadPage() {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [inputMode, setInputMode] = useState<'file' | 'url'>('file');
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  // Single Upload States
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singlePreview, setSinglePreview] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingSingle, setUploadingSingle] = useState(false);
  const [singleUploadedData, setSingleUploadedData] = useState<any | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [deviceType, setDeviceType] = useState<'desktop' | 'phone' | 'both'>('desktop');
  const [resolution, setResolution] = useState('4K');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [singleSuccess, setSingleSuccess] = useState(false);
  const [singleError, setSingleError] = useState('');

  // Bulk Upload States
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkProgress, setBulkProgress] = useState<{ total: number; uploaded: number; processing: boolean }>({
    total: 0,
    uploaded: 0,
    processing: false,
  });
  const [bulkUploadedItems, setBulkUploadedItems] = useState<any[]>([]);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) {
            setCategory(data[0].name);
            setBulkCategory(data[0].name);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Inspect image dimensions and orientation
  const inspectImage = (src: string, name?: string) => {
    const img = new window.Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const ratio = w / h;
      const orientation = ratio > 1.1 ? 'landscape' : ratio < 0.9 ? 'portrait' : 'square';
      const dev = ratio <= 0.6 ? 'phone' : ratio >= 1.5 ? 'desktop' : 'both';
      const res =
        Math.max(w, h) >= 7000 ? '8K' : Math.max(w, h) >= 3400 ? '4K' : Math.max(w, h) >= 2200 ? '2K' : 'HD';

      if (name) {
        const cleanTitle = name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]+/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
        setTitle(cleanTitle);
      }

      setDeviceType(dev);
      setResolution(res);

      setSingleUploadedData({
        width: w,
        height: h,
        aspectRatio: Number(ratio.toFixed(3)),
        orientation,
      });
    };
    img.src = src;
  };

  // Handle Single File Selection
  const handleSingleFileSelect = (file: File) => {
    setSingleFile(file);
    setSingleSuccess(false);
    setSingleError('');

    const objectUrl = URL.createObjectURL(file);
    setSinglePreview(objectUrl);
    inspectImage(objectUrl, file.name);
  };

  // Handle Image URL input
  const handleUrlLoad = () => {
    if (!imageUrlInput.trim()) return;
    setSingleFile(null);
    setSinglePreview(imageUrlInput.trim());
    setSingleSuccess(false);
    setSingleError('');
    inspectImage(imageUrlInput.trim(), 'Curated Wallpaper');
  };

  // Submit Single Upload
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singlePreview) {
      setSingleError('Please select a file or provide an image URL');
      return;
    }

    setUploadingSingle(true);
    setSingleError('');

    try {
      let finalImageUrl = singlePreview;
      let finalPublicId = `velora/uploads/wallpaper_${Date.now()}`;
      let finalWidth = singleUploadedData?.width || 3840;
      let finalHeight = singleUploadedData?.height || 2160;
      let finalRatio = singleUploadedData?.aspectRatio || (finalWidth / finalHeight);
      let finalOrientation = singleUploadedData?.orientation || 'landscape';
      let finalFileSize = singleFile ? singleFile.size : 2500000;

      // If local file was selected, upload via /api/upload
      if (singleFile) {
        const formData = new FormData();
        formData.append('file', singleFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadJson.error || 'Failed to upload image asset');
        }

        finalImageUrl = uploadJson.data.imageUrl;
        finalPublicId = uploadJson.data.cloudinaryPublicId;
        finalWidth = uploadJson.data.width;
        finalHeight = uploadJson.data.height;
        finalRatio = uploadJson.data.aspectRatio;
        finalOrientation = uploadJson.data.orientation;
        finalFileSize = uploadJson.data.fileSize;
      }

      // Save metadata to database
      const saveRes = await fetch('/api/wallpapers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          imageUrl: finalImageUrl,
          cloudinaryPublicId: finalPublicId,
          thumbnailUrl: finalImageUrl,
          width: finalWidth,
          height: finalHeight,
          aspectRatio: finalRatio,
          orientation: finalOrientation,
          deviceType,
          resolution,
          category,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          featured,
          status,
          fileSize: finalFileSize,
        }),
      });

      if (!saveRes.ok) {
        const saveJson = await saveRes.json();
        throw new Error(saveJson.error || 'Failed to register wallpaper');
      }

      setSingleSuccess(true);
      setTimeout(() => {
        router.push('/admin/wallpapers');
      }, 1200);
    } catch (err: any) {
      setSingleError(err.message || 'Ingestion failed');
    } finally {
      setUploadingSingle(false);
    }
  };

  // Bulk Upload Handler
  const handleBulkSubmit = async () => {
    if (bulkFiles.length === 0) return;

    setBulkProgress({ total: bulkFiles.length, uploaded: 0, processing: true });
    setBulkSuccess(false);

    const formData = new FormData();
    bulkFiles.forEach((file) => formData.append('files', file));

    try {
      const res = await fetch('/api/upload/bulk', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk upload failed');

      const createdItems = [];
      for (const item of data.items) {
        const saveRes = await fetch('/api/wallpapers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: item.title,
            imageUrl: item.imageUrl,
            cloudinaryPublicId: item.cloudinaryPublicId,
            thumbnailUrl: item.thumbnailUrl,
            width: item.width,
            height: item.height,
            aspectRatio: item.aspectRatio,
            orientation: item.orientation,
            deviceType: item.deviceType,
            resolution: item.resolution,
            category: bulkCategory || 'Minimal',
            tags: ['bulk', 'collection'],
            featured: false,
            status: 'published',
            fileSize: item.fileSize,
          }),
        });

        if (saveRes.ok) {
          createdItems.push(item);
          setBulkProgress((prev) => ({ ...prev, uploaded: prev.uploaded + 1 }));
        }
      }

      setBulkUploadedItems(createdItems);
      setBulkSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Error processing bulk upload');
    } finally {
      setBulkProgress((prev) => ({ ...prev, processing: false }));
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <AdminHeader
        title="Ingestion & Upload Studio"
        subtitle="Automatic resolution detection, aspect ratio classification, Cloudinary CDN delivery, and Mongoose indexing."
      />

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-900 border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab('single')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'single'
              ? 'bg-orange-500 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Curated Single Ingest</span>
        </button>

        <button
          onClick={() => setActiveTab('bulk')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'bulk'
              ? 'bg-orange-500 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Bulk Ingestion (10 - 100 Files)</span>
        </button>
      </div>

      {activeTab === 'single' ? (
        /* Single Upload Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Input Selection (Dropzone or URL) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Input Mode Selector */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setInputMode('file')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                  inputMode === 'file'
                    ? 'bg-white/15 text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Local File Upload
              </button>
              <button
                type="button"
                onClick={() => setInputMode('url')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                  inputMode === 'url'
                    ? 'bg-white/15 text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Direct Image URL
              </button>
            </div>

            {inputMode === 'file' ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) {
                    handleSingleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[340px] relative overflow-hidden group ${
                  singlePreview
                    ? 'border-orange-500/50 bg-zinc-900/60'
                    : 'border-white/15 hover:border-orange-500/40 bg-zinc-900/30 hover:bg-zinc-900/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleSingleFileSelect(e.target.files[0]);
                  }}
                  className="hidden"
                />

                {singlePreview ? (
                  <div className="relative w-full h-full min-h-[280px]">
                    <Image
                      src={singlePreview}
                      alt="Preview"
                      fill
                      className="object-contain rounded-2xl"
                    />
                    <div className="absolute bottom-2 inset-x-2 p-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-[11px] text-zinc-300 flex items-center justify-between">
                      <span className="truncate max-w-[150px]">{singleFile?.name || 'Uploaded File'}</span>
                      <span className="text-orange-400 font-mono">
                        {singleFile ? `${(singleFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Ready'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">
                        Drop wallpaper file here
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        JPG, PNG, WEBP up to 30MB
                      </p>
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-zinc-300">
                      Browse Files
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-orange-400" />
                    <span>Remote Image URL</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/60"
                    />
                    <button
                      type="button"
                      onClick={handleUrlLoad}
                      className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold text-xs transition-colors shrink-0"
                    >
                      Load
                    </button>
                  </div>
                </div>

                {singlePreview && (
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black border border-white/10">
                    <Image
                      src={singlePreview}
                      alt="URL Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Auto-detected hardware inspector */}
            {singleUploadedData && (
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-mono tracking-wider text-orange-400 font-semibold block">
                  Hardware Inspector
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-zinc-500 block">Dimensions</span>
                    <span className="font-mono text-zinc-200">
                      {singleUploadedData.width} × {singleUploadedData.height}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-zinc-500 block">Orientation</span>
                    <span className="capitalize text-zinc-200 font-medium">
                      {singleUploadedData.orientation}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Metadata Form */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-6">
            <h3 className="text-base font-heading font-semibold text-zinc-100">
              Wallpaper Information & Cataloging
            </h3>

            {singleSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Uploaded to Cloudinary and cataloged successfully! Redirecting...</span>
              </div>
            )}

            {singleError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{singleError}</span>
              </div>
            )}

            <form onSubmit={handleSingleSubmit} className="space-y-4 text-xs">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dolomites Twilight Ridge"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/60"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief editorial background story..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/60"
                />
              </div>

              {/* Category & Device Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-orange-500/60"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">Target Device</label>
                  <select
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-orange-500/60"
                  >
                    <option value="desktop">Desktop / Ultrawide PC</option>
                    <option value="phone">Phone / Mobile OLED</option>
                    <option value="both">Universal / Both</option>
                  </select>
                </div>
              </div>

              {/* Resolution & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">Resolution Tier</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-orange-500/60"
                  >
                    <option value="8K">8K Master (7680 × 4320)</option>
                    <option value="5K">5K Display XDR (5120 × 2880)</option>
                    <option value="4K">4K Ultra HD (3840 × 2160)</option>
                    <option value="2K">2K Quad HD (2560 × 1440)</option>
                    <option value="HD">Full HD (1920 × 1080)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="dark, minimal, mountains, 4k"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/60"
                  />
                </div>
              </div>

              {/* Featured Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                <div>
                  <span className="font-semibold text-zinc-200 block">Feature on Homepage</span>
                  <span className="text-[11px] text-zinc-500">
                    Showcase prominently in the top exhibition gallery
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFeatured(!featured)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    featured ? 'bg-orange-500' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      featured ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <button
                type="submit"
                disabled={uploadingSingle || !singlePreview}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold text-xs sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 active:scale-98"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{uploadingSingle ? 'Ingesting to Cloudinary CDN...' : 'Publish to VELORA Catalog'}</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Bulk Upload Workspace */
        <div className="p-8 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h3 className="text-base font-heading font-semibold text-zinc-100">
                Bulk Wallpaper Pipeline
              </h3>
              <p className="text-xs text-zinc-400">
                Select batches of wallpapers. Dimensions and orientation are automatically classified.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-zinc-300"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    Assign to {c.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => bulkFileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-zinc-200 font-medium border border-white/10"
              >
                Select Files (Multi)
              </button>
              <input
                ref={bulkFileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    setBulkFiles(Array.from(e.target.files));
                  }
                }}
                className="hidden"
              />
            </div>
          </div>

          {/* Staged Files Preview */}
          {bulkFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{bulkFiles.length} images queued for processing</span>
                <button
                  onClick={() => setBulkFiles([])}
                  className="text-rose-400 hover:underline"
                >
                  Clear Queue
                </button>
              </div>

              {/* Progress Bar */}
              {bulkProgress.processing && (
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-orange-400">Uploading to Cloudinary & Indexing...</span>
                    <span>
                      {bulkProgress.uploaded} / {bulkProgress.total} completed
                    </span>
                  </div>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 transition-all duration-300"
                      style={{
                        width: `${Math.round((bulkProgress.uploaded / (bulkProgress.total || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Grid of staged thumbnails */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 max-h-60 overflow-y-auto p-2 border border-white/5 rounded-2xl bg-black/30">
                {bulkFiles.map((file, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-[11px] truncate flex items-center gap-2"
                  >
                    <FileImage className="w-4 h-4 text-orange-500 shrink-0" />
                    <span className="truncate text-zinc-300">{file.name}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleBulkSubmit}
                disabled={bulkProgress.processing}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold text-xs sm:text-sm transition-all"
              >
                {bulkProgress.processing
                  ? `Processing ${bulkProgress.uploaded}/${bulkProgress.total}...`
                  : `Ingest ${bulkFiles.length} Wallpapers to Cloudinary`}
              </button>
            </div>
          )}

          {bulkSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Bulk upload complete! {bulkUploadedItems.length} wallpapers created.</span>
              </span>
              <button
                onClick={() => router.push('/admin/wallpapers')}
                className="underline hover:text-emerald-300 font-semibold"
              >
                View in Repository →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
