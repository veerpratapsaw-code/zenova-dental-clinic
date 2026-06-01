import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  priorityPrice: number;
  emergencyPrice: number;
  formFields: {
    requirePhone: boolean;
    requireDate: boolean;
    requireMessage: boolean;
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
    }
  },
  { timestamps: true }
);

export const SettingsModel = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
