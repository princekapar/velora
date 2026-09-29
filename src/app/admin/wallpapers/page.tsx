'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Star,
  ExternalLink,
  Smartphone,
  Monitor,
  AlertTriangle,
  Check,
  X,
  UploadCloud,
  CheckCircle2,
  Eye,
  Layers,
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Wallpaper, Category } from '@/types';

export default function AdminWallpapersPage() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState('all');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Wallpaper | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit modal state
  const [editingWallpaper, setEditingWallpaper] = useState<Wallpaper | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDeviceType, setEditDeviceType] = useState<'desktop' | 'phone' | 'both'>('desktop');
  const [editResolution, setEditResolution] = useState('4K');
  const [editTags, setEditTags] = useState('');
  const [editFeatured, setEditFeatured] = useState(false);
  const [editStatus, setEditStatus] = useState<'published' | 'draft'>('published');
  const [savingEdit, setSavingEdit] = useState(false);

  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchWallpapers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: '100', status: 'all' });
      if (search) params.set('search', search);
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedDevice !== 'all') params.set('device', selectedDevice);

      const [wallRes, catRes] = await Promise.all([
        fetch(`/api/wallpapers?${params.toString()}`).then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
      ]);

      if (wallRes.wallpapers) setWallpapers(wallRes.wallpapers);
      if (Array.isArray(catRes)) setCategories(catRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallpapers();
  }, [selectedCategory, selectedDevice, search]);

  const handleToggleFeature = async (w: Wallpaper) => {
    try {
      const res = await fetch(`/api/wallpapers/${w._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !w.featured }),
      });
      if (res.ok) {
        setWallpapers((prev) =>
          prev.map((item) => (item._id === w._id ? { ...item, featured: !item.featured } : item))
        );
        showNotice(`Wallpaper ${!w.featured ? 'featured on homepage' : 'unfeatured'}`, 'success');
      }
    } catch (e) {
      showNotice('Failed to update featured status', 'error');
    }
  };

  const handleToggleStatus = async (w: Wallpaper) => {
    const nextStatus = w.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/wallpapers/${w._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setWallpapers((prev) =>
          prev.map((item) => (item._id === w._id ? { ...item, status: nextStatus } : item))
        );
        showNotice(`Status changed to ${nextStatus}`, 'success');
      }
    } catch (e) {
      showNotice('Failed to toggle status', 'error');
    }
  };

  const openEditModal = (w: Wallpaper) => {
    setEditingWallpaper(w);
    setEditTitle(w.title);
    setEditDescription(w.description || '');
    setEditCategory(w.category);
    setEditDeviceType(w.deviceType);
    setEditResolution(w.resolution);
    setEditTags(Array.isArray(w.tags) ? w.tags.join(', ') : '');
    setEditFeatured(w.featured);
    setEditStatus(w.status);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWallpaper) return;

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/wallpapers/${editingWallpaper._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          category: editCategory,
          deviceType: editDeviceType,
          resolution: editResolution,
          tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
          featured: editFeatured,
          status: editStatus,
        }),
      });

      if (res.ok) {
        setWallpapers((prev) =>
          prev.map((item) =>
            item._id === editingWallpaper._id
              ? {
                  ...item,
                  title: editTitle,
                  description: editDescription,
                  category: editCategory,
                  deviceType: editDeviceType,
                  resolution: editResolution,
                  tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
                  featured: editFeatured,
                  status: editStatus,
                }
              : item
          )
        );
        showNotice('Wallpaper metadata updated successfully!', 'success');
        setEditingWallpaper(null);
      } else {
        throw new Error('Update failed');
      }
    } catch (err: any) {
      showNotice(err.message || 'Failed to save changes', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/wallpapers/${deleteTarget._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok) {
        setWallpapers((prev) => prev.filter((item) => item._id !== deleteTarget._id));
        showNotice(
          `Wallpaper and Cloudinary asset deleted cleanly.`,
          'success'
        );
      } else {
        throw new Error(data.error || 'Failed to delete');
      }
    } catch (err: any) {
      showNotice(err.message || 'Deletion error', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const showNotice = (message: string, type: 'success' | 'error') => {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Wallpaper Repository"
        subtitle="Manage metadata, Cloudinary CDN assets, categories, and homepage exhibition status."
        actionText="Upload Artwork"
        actionHref="/admin/upload"
      />

      {/* Notice Banner */}
      {notice && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between animate-in fade-in duration-200 ${
            notice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
        >
          <span>{notice.message}</span>
          <button onClick={() => setNotice(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-white/10">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, tag, or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Device Filter */}
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="all">All Devices</option>
            <option value="desktop">Desktop</option>
            <option value="phone">Phone</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>

      {/* Wallpapers Table */}
      <div className="rounded-3xl bg-zinc-900/60 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-zinc-400 border-b border-white/10 bg-white/[0.02] uppercase tracking-wider font-mono text-[10px]">
                <th className="py-3.5 px-4">Artwork & Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Device</th>
                <th className="py-3.5 px-4">Resolution</th>
                <th className="py-3.5 px-4">Stats</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Featured</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {wallpapers.map((w) => (
                <tr key={w._id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Artwork & Title */}
                  <td className="py-3 px-4 flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
                      <Image
                        src={w.thumbnailUrl || w.imageUrl}
                        alt={w.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 max-w-[200px]">
                      <p className="font-semibold text-zinc-100 truncate">{w.title}</p>
                      <p className="text-[10px] font-mono text-zinc-400 truncate">
                        ID: {w.cloudinaryPublicId || w.slug}
                      </p>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 font-medium">{w.category}</td>

                  {/* Device */}
                  <td className="py-3 px-4 capitalize">
                    <span className="inline-flex items-center gap-1">
                      {w.deviceType === 'phone' ? (
                        <Smartphone className="w-3.5 h-3.5 text-orange-400" />
                      ) : (
                        <Monitor className="w-3.5 h-3.5 text-orange-400" />
                      )}
                      {w.deviceType}
                    </span>
                  </td>

                  {/* Dimensions & Resolution */}
                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      <span className="font-mono text-zinc-200">
                        {w.width} × {w.height}
                      </span>
                      <span className="block text-[10px] font-mono text-orange-400/90 font-semibold">
                        {w.resolution} • {w.format || 'webp'}
                      </span>
                    </div>
                  </td>

                  {/* Downloads & Views */}
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <span className="text-zinc-200">{w.downloads} dl</span>
                    <span className="text-zinc-500 block">{w.views} views</span>
                  </td>

                  {/* Status Toggle (Published / Draft) */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(w)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold border transition-all ${
                        w.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                      title="Click to toggle status"
                    >
                      {w.status}
                    </button>
                  </td>

                  {/* Featured Toggle */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleFeature(w)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        w.featured
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                          : 'text-zinc-600 hover:text-zinc-400'
                      }`}
                      title={w.featured ? 'Featured on homepage' : 'Mark as featured'}
                    >
                      <Star className={`w-4 h-4 ${w.featured ? 'fill-orange-400' : ''}`} />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/wallpaper/${w.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-zinc-100 transition-colors"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => openEditModal(w)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-orange-400 transition-colors"
                        title="Edit Wallpaper Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget(w)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                        title="Delete Wallpaper & Cloudinary Asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Wallpaper Modal */}
      {editingWallpaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-heading font-semibold text-lg text-zinc-100">
                  Edit Wallpaper Metadata
                </h3>
                <p className="text-xs text-zinc-400">
                  ID: {editingWallpaper.cloudinaryPublicId}
                </p>
              </div>
              <button
                onClick={() => setEditingWallpaper(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-orange-500/60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-orange-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
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
                    value={editDeviceType}
                    onChange={(e) => setEditDeviceType(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-orange-500/60"
                  >
                    <option value="desktop">Desktop / Ultrawide</option>
                    <option value="phone">Phone / Mobile</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">Resolution</label>
                  <select
                    value={editResolution}
                    onChange={(e) => setEditResolution(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-orange-500/60"
                  >
                    <option value="8K">8K Master</option>
                    <option value="5K">5K Display</option>
                    <option value="4K">4K Ultra HD</option>
                    <option value="2K">2K Quad HD</option>
                    <option value="HD">Full HD</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-orange-500/60"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Tags (comma separated)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-orange-500/60"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit_featured"
                  checked={editFeatured}
                  onChange={(e) => setEditFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="edit_featured" className="text-zinc-300 font-medium cursor-pointer">
                  Feature prominently on homepage
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingWallpaper(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-zinc-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold"
                >
                  {savingEdit ? 'Saving Changes...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-semibold text-base text-zinc-100">
                Delete Wallpaper & CDN File?
              </h3>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              This action will permanently delete <strong className="text-zinc-200">{deleteTarget.title}</strong> from the database and remove the associated asset from Cloudinary (public ID: <code className="text-orange-400">{deleteTarget.cloudinaryPublicId}</code>). This cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs text-zinc-300 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleting ? 'Deleting Asset...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
