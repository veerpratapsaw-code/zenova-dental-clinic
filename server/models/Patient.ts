import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  createdAt: Date;
}

const PatientSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const PatientModel = mongoose.model<IPatient>('Patient', PatientSchema);
