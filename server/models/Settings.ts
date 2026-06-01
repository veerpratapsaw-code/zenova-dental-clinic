import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  priorityPrice: number;
  emergencyPrice: number;
}

const SettingsSchema: Schema = new Schema(
  {
    priorityPrice: { type: Number, default: 1000 },
    emergencyPrice: { type: Number, default: 3500 }
  },
  { timestamps: true }
);

export const SettingsModel = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
