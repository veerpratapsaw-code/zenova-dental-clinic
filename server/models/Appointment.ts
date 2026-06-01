import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  name: string;
  phone: string;
  email: string;
  treatmentType: string;
  preferredDate: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  priorityLevel: 'standard' | 'priority' | 'emergency';
  patientId?: string;
  createdAt: Date;
}

const AppointmentSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Patient Full Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Contact Phone Number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Patient Contact Email is required'],
      trim: true,
      lowercase: true,
    },
    treatmentType: {
      type: String,
      required: [true, 'A selected clinical treatment is required'],
      trim: true,
    },
    preferredDate: {
      type: String,
      required: [true, 'Appointment target date is required'],
    },
    message: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    priorityLevel: {
      type: String,
      enum: ['standard', 'priority', 'emergency'],
      default: 'standard',
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: false,
    }
  },
  {
    timestamps: true // This will automatically supply createdAt and updatedAt fields
  }
);

// Fallback to existing model check to ensure esbuild hot-reserves or multi-compilations don't break
export const AppointmentModel = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
