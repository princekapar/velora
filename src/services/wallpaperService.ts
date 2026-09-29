import { connectToDatabase, isDatabaseConnected } from '@/lib/db';
import WallpaperModel from '@/models/Wallpaper';
import { Wallpaper, WallpaperStatus, FilterState } from '@/types';
import { INITIAL_WALLPAPERS } from '@/lib/seedData';
import { deleteFromCloudinary } from '@/lib/cloudinary';

// In-memory store fallback
let memoryWallpapers: Wallpaper[] = [...INITIAL_WALLPAPERS];

export async function getWallpapers(filters?: Partial<FilterState> & { page?: number; limit?: number; status?: WallpaperStatus | 'all' }): Promise<{
  wallpapers: Wallpaper[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const page = filters?.page || 1;
  const limit = filters?.limit || 24;
  const skip = (page - 1) * limit;

  const conn = await connectToDatabase();

  if (conn && isDatabaseConnected()) {
    try {
      // Auto-seed initial wallpapers if MongoDB collection is empty
      const overallCount = await WallpaperModel.countDocuments();
      if (overallCount === 0) {
        try {
          const wallpapersToSeed = INITIAL_WALLPAPERS.map(({ _id, ...rest }) => rest);
          await WallpaperModel.insertMany(wallpapersToSeed);
          console.log('[WallpaperService] Auto-seeded initial wallpapers into MongoDB Atlas');
        } catch (seedErr) {
          console.error('[WallpaperService] Seeding initial wallpapers failed:', seedErr);
        }
      }

      const query: Record<string, any> = {};

      if (filters?.status && filters.status !== 'all') {
        query.status = filters.status;
      } else if (!filters?.status) {
        query.status = 'published';
      }

      if (filters?.device && filters.device !== 'all') {
        query.deviceType = { $in: [filters.device, 'both'] };
      }

      if (filters?.resolution && filters.resolution !== 'all') {
        query.resolution = filters.resolution;
      }

      if (filters?.orientation && filters.orientation !== 'all') {
        query.orientation = filters.orientation;
      }

      if (filters?.category && filters.category !== 'all') {
        query.category = { $regex: new RegExp(`^${filters.category}$`, 'i') };
      }

      if (filters?.search) {
        const regex = new RegExp(filters.search, 'i');
        query.$or = [
          { title: regex },
          { description: regex },
          { tags: { $in: [regex] } },
          { category: regex },
        ];
      }

      const sortMap: Record<string, any> = {
        newest: { createdAt: -1 },
        popular: { views: -1, downloads: -1 },
        downloads: { downloads: -1 },
        featured: { featured: -1, createdAt: -1 },
      };

      const sortOption = sortMap[filters?.sort || 'newest'] || { createdAt: -1 };

      const total = await WallpaperModel.countDocuments(query);
      const docs = await WallpaperModel.find(query).sort(sortOption).skip(skip).limit(limit).lean();

      return {
        wallpapers: JSON.parse(JSON.stringify(docs)),
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (err) {
      console.error('[WallpaperService] MongoDB query failed, falling back to memory store:', err);
    }
  }

  // Memory store filtering
  let result = memoryWallpapers.filter((w) => {
    if (filters?.status && filters.status !== 'all' && w.status !== filters.status) return false;
    if (!filters?.status && w.status !== 'published') return false;

    if (filters?.device && filters.device !== 'all') {
      if (w.deviceType !== filters.device && w.deviceType !== 'both') return false;
    }

    if (filters?.resolution && filters.resolution !== 'all') {
      if (w.resolution !== filters.resolution) return false;
    }

    if (filters?.orientation && filters.orientation !== 'all') {
      if (w.orientation !== filters.orientation) return false;
    }

    if (filters?.category && filters.category !== 'all') {
      if (w.category.toLowerCase() !== filters.category.toLowerCase()) return false;
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      const matchTitle = w.title.toLowerCase().includes(q);
      const matchDesc = w.description?.toLowerCase().includes(q) || false;
      const matchTags = w.tags.some((t) => t.toLowerCase().includes(q));
      const matchCat = w.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchTags && !matchCat) return false;
    }

    return true;
  });

  // Sorting
  if (filters?.sort === 'popular') {
    result.sort((a, b) => b.views + b.downloads - (a.views + a.downloads));
  } else if (filters?.sort === 'downloads') {
    result.sort((a, b) => b.downloads - a.downloads);
  } else if (filters?.sort === 'featured') {
    result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  } else {
    // Newest
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const total = result.length;
  const paginated = result.slice(skip, skip + limit);

  return {
    wallpapers: paginated,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getWallpaperBySlug(slug: string): Promise<Wallpaper | null> {
  const conn = await connectToDatabase();
  if (conn && isDatabaseConnected()) {
    try {
      const doc = await WallpaperModel.findOne({ slug }).lean();
      if (doc) return JSON.parse(JSON.stringify(doc));
    } catch (e) {
      console.error('[WallpaperService] MongoDB getBySlug error:', e);
    }
  }

  return memoryWallpapers.find((w) => w.slug === slug) || null;
}

export async function getWallpaperById(id: string): Promise<Wallpaper | null> {
  const conn = await connectToDatabase();
  if (conn && isDatabaseConnected()) {
    try {
      const doc = await WallpaperModel.findById(id).lean();
      if (doc) return JSON.parse(JSON.stringify(doc));
    } catch (e) {
      console.error('[WallpaperService] MongoDB getById error:', e);
    }
  }

  return memoryWallpapers.find((w) => w._id === id) || null;
}

export async function createWallpaper(data: Omit<Wallpaper, '_id' | 'createdAt' | 'updatedAt' | 'views' | 'downloads'>): Promise<Wallpaper> {
  const now = new Date().toISOString();
  const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const newWallpaper: Wallpaper = {
    _id: `wall_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    ...data,
    slug,
    views: 0,
    downloads: 0,
    createdAt: now,
    updatedAt: now,
  };

  const conn = await connectToDatabase();
  if (conn && isDatabaseConnected()) {
    try {
      const created = await WallpaperModel.create({
        ...data,
        slug,
      });
      return JSON.parse(JSON.stringify(created));
    } catch (e) {
      console.error('[WallpaperService] MongoDB create error:', e);
    }
  }

  memoryWallpapers.unshift(newWallpaper);
  return newWallpaper;
}

export async function updateWallpaper(id: string, updates: Partial<Wallpaper>): Promise<Wallpaper | null> {
  const conn = await connectToDatabase();
  if (conn && isDatabaseConnected()) {
    try {
      const updated = await WallpaperModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      ).lean();
      if (updated) return JSON.parse(JSON.stringify(updated));
    } catch (e) {
      console.error('[WallpaperService] MongoDB update error:', e);
    }
  }

  const idx = memoryWallpapers.findIndex((w) => w._id === id);
  if (idx !== -1) {
    memoryWallpapers[idx] = {
      ...memoryWallpapers[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return memoryWallpapers[idx];
  }

  return null;
}

export async function deleteWallpaper(id: string): Promise<{ success: boolean; cloudinaryDeleted: boolean }> {
  let wallpaper = await getWallpaperById(id);
  if (!wallpaper) {
    wallpaper = memoryWallpapers.find((w) => w._id === id) || null;
  }

  if (!wallpaper) {
    return { success: false, cloudinaryDeleted: false };
  }

  // Delete from Cloudinary
  let cloudinaryDeleted = false;
  if (wallpaper.cloudinaryPublicId) {
    cloudinaryDeleted = await deleteFromCloudinary(wallpaper.cloudinaryPublicId);
  }

  // Delete from Database
  const conn = await connectToDatabase();
  if (conn && isDatabaseConnected()) {
    try {
      await WallpaperModel.findByIdAndDelete(id);
    } catch (e) {
      console.error('[WallpaperService] MongoDB delete error:', e);
    }
  }

  memoryWallpapers = memoryWallpapers.filter((w) => w._id !== id);
  return { success: true, cloudinaryDeleted };
}

export async function incrementStats(slug: string, field: 'views' | 'downloads'): Promise<void> {
  const conn = await connectToDatabase();
  if (conn && isDatabaseConnected()) {
    try {
      await WallpaperModel.updateOne({ slug }, { $inc: { [field]: 1 } });
      return;
    } catch (e) {
      console.error('[WallpaperService] MongoDB inc error:', e);
    }
  }

  const item = memoryWallpapers.find((w) => w.slug === slug);
  if (item) {
    item[field] = (item[field] || 0) + 1;
  }
}

export async function getFeaturedWallpapers(limit: number = 8): Promise<Wallpaper[]> {
  const res = await getWallpapers({ sort: 'featured', limit });
  return res.wallpapers.filter((w) => w.featured).slice(0, limit);
}

export async function getRelatedWallpapers(wallpaper: Wallpaper, limit: number = 4): Promise<Wallpaper[]> {
  const res = await getWallpapers({ category: wallpaper.category, limit: limit + 1 });
  return res.wallpapers.filter((w) => w._id !== wallpaper._id).slice(0, limit);
}
