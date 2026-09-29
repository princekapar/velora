import { connectToDatabase, isDatabaseConnected } from '@/lib/db';
import CategoryModel from '@/models/Category';
import { Category } from '@/types';
import { INITIAL_CATEGORIES } from '@/lib/seedData';

let memoryCategories: Category[] = INITIAL_CATEGORIES.map((c, i) => ({
  _id: `cat_${i + 1}`,
  ...c,
  createdAt: new Date().toISOString(),
}));

export async function getCategories(): Promise<Category[]> {
  const conn = await connectToDatabase();
  if (conn && isDatabaseConnected()) {
    try {
      let docs = await CategoryModel.find().sort({ order: 1, name: 1 }).lean();

      if (!docs || docs.length === 0) {
        // Auto-seed initial categories into MongoDB
        try {
          await CategoryModel.insertMany(
            INITIAL_CATEGORIES.map((c) => ({
              ...c,
            }))
          );
          docs = await CategoryModel.find().sort({ order: 1, name: 1 }).lean();
        } catch (seedErr) {
          console.error('[CategoryService] Seeding initial categories into MongoDB failed:', seedErr);
        }
      } else {
        // Ensure Motivational is present if existing DB had older categories
        const hasMotivational = docs.some(
          (c: any) => c.name?.toLowerCase() === 'motivational' || c.slug === 'motivational'
        );
        if (!hasMotivational) {
          const motivationalSeed = INITIAL_CATEGORIES.find((c) => c.slug === 'motivational');
          if (motivationalSeed) {
            try {
              const created = await CategoryModel.create({
                ...motivationalSeed,
              });
              docs.push(created.toObject ? created.toObject() : created);
            } catch (err) {
              console.error('[CategoryService] Auto-inserting Motivational into MongoDB failed:', err);
            }
          }
        }
      }

      if (docs && docs.length > 0) {
        return JSON.parse(JSON.stringify(docs)).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      }
    } catch (e) {
      console.error('[CategoryService] MongoDB query failed:', e);
    }
  }

  return [...memoryCategories].sort((a, b) => a.order - b.order);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const conn = await connectToDatabase();
  if (conn && isDatabaseConnected()) {
    try {
      const doc = await CategoryModel.findOne({ slug }).lean();
      if (doc) return JSON.parse(JSON.stringify(doc));
    } catch (e) {
      console.error('[CategoryService] MongoDB getBySlug failed:', e);
    }
  }

  return memoryCategories.find((c) => c.slug === slug) || null;
}

export async function createCategory(data: Omit<Category, '_id' | 'createdAt' | 'wallpaperCount'>): Promise<Category> {
  const newCat: Category = {
    _id: `cat_${Date.now()}`,
    ...data,
    wallpaperCount: 0,
    createdAt: new Date().toISOString(),
  };

  const conn = await connectToDatabase();
  if (conn && isDatabaseConnected()) {
    try {
      const created = await CategoryModel.create({
        ...data,
        wallpaperCount: 0,
      });
      return JSON.parse(JSON.stringify(created));
    } catch (e) {
      console.error('[CategoryService] MongoDB create failed:', e);
    }
  }

  memoryCategories.push(newCat);
  return newCat;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  const conn = await connectToDatabase();
  if (conn && isDatabaseConnected()) {
    try {
      const updated = await CategoryModel.findByIdAndUpdate(id, updates, { new: true }).lean();
      if (updated) return JSON.parse(JSON.stringify(updated));
    } catch (e) {
      console.error('[CategoryService] MongoDB update failed:', e);
    }
  }

  const idx = memoryCategories.findIndex((c) => c._id === id);
  if (idx !== -1) {
    memoryCategories[idx] = { ...memoryCategories[idx], ...updates };
    return memoryCategories[idx];
  }
  return null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const conn = await connectToDatabase();
  if (conn && isDatabaseConnected()) {
    try {
      await CategoryModel.findByIdAndDelete(id);
    } catch (e) {
      console.error('[CategoryService] MongoDB delete failed:', e);
    }
  }

  memoryCategories = memoryCategories.filter((c) => c._id !== id);
  return true;
}
