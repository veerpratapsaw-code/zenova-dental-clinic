import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  date: string;
  category: string;
  readTime: string;
  imageUrl: string;
  createdAt: Date;
}

const BlogSchema: Schema = new Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    name: { type: String, required: true },
    role: { type: String, required: true },
    avatar: { type: String, required: true }
  },
  date: { type: String, required: true },
  category: { type: String, required: true },
  readTime: { type: String, required: true },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const BlogModel = mongoose.model<IBlog>('Blog', BlogSchema);
