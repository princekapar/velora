import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITag extends Document {
  name: string;
  slug: string;
  count: number;
}

const TagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    count: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const TagModel: Model<ITag> =
  mongoose.models.Tag || mongoose.model<ITag>('Tag', TagSchema);

export default TagModel;
