import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  profilePic?: string;
  address?: string;
  dob?: string;
  gender?: string;
  medicalHistory?: string;
  createdAt: Date;
}

const PatientSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, required: true },
  profilePic: { type: String },
  address: { type: String },
  dob: { type: String },
  gender: { type: String },
  medicalHistory: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const PatientModel = mongoose.model<IPatient>('Patient', PatientSchema);
