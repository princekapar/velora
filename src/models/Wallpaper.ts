import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWallpaper extends Document {
  title: string;
  slug: string;
  description?: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  orientation: 'portrait' | 'landscape' | 'square';
  deviceType: 'phone' | 'desktop' | 'both';
  resolution: string;
  format: string;
  fileSize: number;
  category: string;
  tags: string[];
  featured: boolean;
  status: 'published' | 'draft';
  downloads: number;
  views: number;
  collectionSlug?: string;
  colorPalette?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WallpaperSchema = new Schema<IWallpaper>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true, index: true },
    thumbnailUrl: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    aspectRatio: { type: Number, required: true },
    orientation: { type: String, enum: ['portrait', 'landscape', 'square'], required: true, index: true },
    deviceType: { type: String, enum: ['phone', 'desktop', 'both'], required: true, index: true },
    resolution: { type: String, default: '4K', index: true },
    format: { type: String, default: 'webp' },
    fileSize: { type: Number, default: 0 },
    category: { type: String, required: true, index: true },
    tags: [{ type: String, index: true }],
    featured: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ['published', 'draft'], default: 'published', index: true },
    downloads: { type: Number, default: 0, index: true },
    views: { type: Number, default: 0, index: true },
    collectionSlug: { type: String, index: true },
    colorPalette: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

WallpaperSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const WallpaperModel: Model<IWallpaper> =
  mongoose.models.Wallpaper || mongoose.model<IWallpaper>('Wallpaper', WallpaperSchema);

export default WallpaperModel;
