import mongoose, { Schema, Document } from 'mongoose';

export interface IGalleryImage extends Document {
  title: string;
  category: string;
  imageUrl: string;
  spanClasses: string;
}

const GalleryImageSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    spanClasses: { type: String, default: 'md:col-span-1 md:row-span-1' }
  },
  { timestamps: true }
);

export const GalleryImageModel = mongoose.models.GalleryImage || mongoose.model<IGalleryImage>('GalleryImage', GalleryImageSchema);
