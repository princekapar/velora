'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Sparkles, Check, X, Eye } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Collection } from '@/types';

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [featured, setFeatured] = useState(true);
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [order, setOrder] = useState(1);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/collections?all=true');
      const data = await res.json();
      if (Array.isArray(data)) setCollections(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const openCreateModal = () => {
    setEditingCollection(null);
    setName('');
    setSlug('');
    setDescription('');
    setCoverImage('https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop');
    setFeatured(true);
    setStatus('published');
    setOrder(collections.length + 1);
    setModalOpen(true);
  };

  const openEditModal = (col: Collection) => {
    setEditingCollection(col);
    setName(col.name);
    setSlug(col.slug);
    setDescription(col.description || '');
    setCoverImage(col.coverImage);
    setFeatured(col.featured);
    setStatus(col.status);
    setOrder(col.order || 1);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        coverImage,
        featured,
        status,
        order: Number(order),
      };

      if (editingCollection) {
        const res = await fetch(`/api/collections/${editingCollection._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fetchCollections();
          setModalOpen(false);
        }
      } else {
        const res = await fetch('/api/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fetchCollections();
          setModalOpen(false);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    try {
      const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCollections((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-zinc-100">
            Curated Collections
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Group thematic releases into volumes for prominent homepage and catalogue exhibition.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold text-xs tracking-tight transition-all active:scale-95 shadow-md shadow-orange-500/10 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection Volume</span>
        </button>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map((col) => (
          <div
            key={col._id}
            className="group relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 p-6 space-y-4 flex flex-col justify-between"
          >
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-zinc-800">
              <Image
                src={col.coverImage}
                alt={col.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-black/60 backdrop-blur-md text-orange-400 border border-orange-500/30">
                  Vol. {col.order || 1}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono capitalize border ${
                    col.status === 'published'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {col.status}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-heading font-semibold text-xl text-zinc-100">
                {col.name}
              </h3>
              <p className="text-xs text-zinc-400 line-clamp-2">
                {col.description}
              </p>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-mono text-[11px]">
                slug: /{col.slug}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(col)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-zinc-100 transition-colors"
                  title="Edit collection"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(col._id)}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                  title="Delete collection"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-heading font-semibold text-lg text-zinc-100">
                {editingCollection ? 'Edit Collection Volume' : 'New Curated Collection'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Collection Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midnight Obsidian"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCollection) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-orange-500/60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Slug</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-orange-500/60 font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Cover Image URL</label>
                <input
                  type="text"
                  required
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-orange-500/60 font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-orange-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-orange-500/60"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">Volume Number / Order</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-orange-500/60"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-zinc-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold"
                >
                  {editingCollection ? 'Save Volume' : 'Publish Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
