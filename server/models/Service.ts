import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  title: string;
  description: string;
  iconName: string;
  details: string[];
  duration: string;
  avgCost: string;
  order: number;
}

const ServiceSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    iconName: { type: String, required: true },
    details: [{ type: String }],
    duration: { type: String, required: true },
    avgCost: { type: String, required: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const ServiceModel = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
