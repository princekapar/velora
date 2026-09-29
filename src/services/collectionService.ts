import { connectToDatabase, isDatabaseConnected } from '@/lib/db';
import CollectionModel from '@/models/Collection';
import { Collection } from '@/types';
import { INITIAL_COLLECTIONS } from '@/lib/seedData';
import { getWallpapers } from './wallpaperService';

let memoryCollections: Collection[] = INITIAL_COLLECTIONS.map((c, i) => ({
  _id: `col_${i + 1}`,
  ...c,
  createdAt: new Date().toISOString(),
}));

export async function getCollections(includeDrafts: boolean = false): Promise<Collection[]> {
  const conn = await connectToDatabase();
  if (conn && isDatabaseConnected()) {
    try {
      let docs = await CollectionModel.find().sort({ order: 1, createdAt: -1 }).lean();
      if (!docs || docs.length === 0) {
        try {
          await CollectionModel.insertMany(INITIAL_COLLECTIONS);
          docs = await CollectionModel.find().sort({ order: 1, createdAt: -1 }).lean();
          console.log('[CollectionService] Auto-seeded initial collections into MongoDB Atlas');
        } catch (seedErr) {
          console.error('[CollectionService] Seeding initial collections failed:', seedErr);
        }
      }
      if (docs && docs.length > 0) {
        const filtered = includeDrafts ? docs : docs.filter((c: any) => c.status === 'published');
        return JSON.parse(JSON.stringify(filtered));
      }
    } catch (e) {
      console.error('[CollectionService] MongoDB query failed:', e);
    }
  }

  return memoryCollections
    .filter((c) => includeDrafts || c.status === 'published')
    .sort((a, b) => a.order - b.order);
}

export async function getCollectionBySlug(slug: string): Promise<(Collection & { wallpapersList?: any[] }) | null> {
  let collection: Collection | null = null;

  const conn = await connectToDatabase();
  if (conn && isDatabaseConnected()) {
    try {
      const doc = await CollectionModel.findOne({ slug }).lean();
      if (doc) collection = JSON.parse(JSON.stringify(doc));
    } catch (e) {
      console.error('[CollectionService] MongoDB getBySlug failed:', e);
    }
  }

  if (!collection) {
    collection = memoryCollections.find((c) => c.slug === slug) || null;
  }

  if (!collection) return null;

  // Fetch wallpapers for this collection
  const allWalls = await getWallpapers({ limit: 50 });
  const matchingWalls = allWalls.wallpapers.filter((w) => w.collectionSlug === slug);

  return {
    ...collection,
    wallpapersList: matchingWalls,
  };
}

export async function createCollection(data: Omit<Collection, '_id' | 'createdAt' | 'wallpaperCount'>): Promise<Collection> {
  const newCol: Collection = {
    _id: `col_${Date.now()}`,
    ...data,
    wallpaperCount: 0,
    createdAt: new Date().toISOString(),
  };

  const conn = await connectToDatabase();
  if (conn && isDatabaseConnected()) {
    try {
      const created = await CollectionModel.create(newCol);
      return JSON.parse(JSON.stringify(created));
    } catch (e) {
      console.error('[CollectionService] MongoDB create failed:', e);
    }
  }

  memoryCollections.push(newCol);
  return newCol;
}

export async function updateCollection(id: string, updates: Partial<Collection>): Promise<Collection | null> {
  const conn = await connectToDatabase();
  if (conn && isDatabaseConnected()) {
    try {
      const updated = await CollectionModel.findByIdAndUpdate(id, updates, { new: true }).lean();
      if (updated) return JSON.parse(JSON.stringify(updated));
    } catch (e) {
      console.error('[CollectionService] MongoDB update failed:', e);
    }
  }

  const idx = memoryCollections.findIndex((c) => c._id === id);
  if (idx !== -1) {
    memoryCollections[idx] = { ...memoryCollections[idx], ...updates };
    return memoryCollections[idx];
  }
  return null;
}

export async function deleteCollection(id: string): Promise<boolean> {
  const conn = await connectToDatabase();
  if (conn && isDatabaseConnected()) {
    try {
      await CollectionModel.findByIdAndDelete(id);
    } catch (e) {
      console.error('[CollectionService] MongoDB delete failed:', e);
    }
  }

  memoryCollections = memoryCollections.filter((c) => c._id !== id);
  return true;
}
