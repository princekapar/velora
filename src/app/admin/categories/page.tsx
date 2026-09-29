'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Check, X, Star, Layers } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Category } from '@/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [featured, setFeatured] = useState(false);
  const [order, setOrder] = useState(0);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setCoverImage('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop');
    setFeatured(false);
    setOrder(categories.length + 1);
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setCoverImage(cat.coverImage);
    setFeatured(cat.featured);
    setOrder(cat.order || 0);
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
        order: Number(order),
      };

      if (editingCategory) {
        // Update
        const res = await fetch(`/api/categories/${editingCategory._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fetchCategories();
          setModalOpen(false);
        }
      } else {
        // Create
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fetchCategories();
          setModalOpen(false);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c._id !== id));
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
            Category Taxonomy
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Organize the gallery into aesthetic genres, manage cover imagery, and set homepage featured genres.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold text-xs tracking-tight transition-all active:scale-95 shadow-md shadow-orange-500/10 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 p-5 space-y-4 flex flex-col justify-between"
          >
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-zinc-800">
              <Image
                src={cat.coverImage}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                {cat.featured && (
                  <span className="p-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    <Star className="w-3 h-3 fill-orange-400" />
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10">
                  Order #{cat.order}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-heading font-semibold text-base text-zinc-100">
                {cat.name}
              </h3>
              <p className="text-xs text-zinc-400 line-clamp-2">
                {cat.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-mono text-[11px]">
                slug: /{cat.slug}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-zinc-100 transition-colors"
                  title="Edit category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-heading font-semibold text-lg text-zinc-100">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
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
                <label className="text-zinc-300 font-medium">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Minimalist Desks"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-orange-500/60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Slug URL</label>
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
                  <label className="text-zinc-300 font-medium">Display Ordering</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-orange-500/60"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="featured_cat"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
                  />
                  <label htmlFor="featured_cat" className="text-zinc-300 font-medium cursor-pointer">
                    Feature on Homepage
                  </label>
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
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
