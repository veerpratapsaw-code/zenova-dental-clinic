import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  priorityPrice: number;
  emergencyPrice: number;
  formFields: {
    requirePhone: boolean;
    requireDate: boolean;
    requireMessage: boolean;
  };
  heroStats: {
    yearsOfCare: number;
    smilesDesigned: number;
    successRate: number;
  };
}

const SettingsSchema: Schema = new Schema(
  {
    priorityPrice: { type: Number, default: 1000 },
    emergencyPrice: { type: Number, default: 3500 },
    formFields: {
      requirePhone: { type: Boolean, default: true },
      requireDate: { type: Boolean, default: true },
      requireMessage: { type: Boolean, default: true }
    },
    heroStats: {
      yearsOfCare: { type: Number, default: 20 },
      smilesDesigned: { type: Number, default: 12 },
      successRate: { type: Number, default: 98 }
    }
  },
  { timestamps: true }
);

export const SettingsModel = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
