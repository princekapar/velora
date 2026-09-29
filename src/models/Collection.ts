import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICollection extends Document {
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  wallpaperCount: number;
  featured: boolean;
  status: 'published' | 'draft';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    coverImage: { type: String, required: true },
    wallpaperCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ['published', 'draft'], default: 'published', index: true },
    order: { type: Number, default: 0, index: true },
  },
  {
    timestamps: true,
  }
);

export const CollectionModel: Model<ICollection> =
  mongoose.models.Collection || mongoose.model<ICollection>('Collection', CollectionSchema);

export default CollectionModel;
