import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  wallpaperCount: number;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    coverImage: { type: String, required: true },
    wallpaperCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0, index: true },
  },
  {
    timestamps: true,
  }
);

export const CategoryModel: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default CategoryModel;
