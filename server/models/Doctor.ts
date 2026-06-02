import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  name: string;
  role: string;
  experience: string;
  imageURL: string;
  specialty: string;
  education: string;
  bio: string;
  daysAvailable: string[];
  order: number;
}

const DoctorSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    experience: { type: String, required: true },
    imageURL: { type: String, required: true },
    specialty: { type: String, required: true },
    education: { type: String, required: true },
    bio: { type: String, required: true },
    daysAvailable: { type: [String], default: [] },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const DoctorModel = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);
