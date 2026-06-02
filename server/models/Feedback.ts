import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  author: string;
  role: string;
  quote: string;
  rating: number;
  treatmentRecieved: string;
  isApproved: boolean;
  avatarUrl?: string;
  order: number;
  createdAt: Date;
}

const FeedbackSchema: Schema = new Schema(
  {
    author: {
      type: String,
      required: [true, 'Author Name is required'],
      trim: true,
    },
    role: {
      type: String,
      default: 'Patient',
      trim: true,
    },
    quote: {
      type: String,
      required: [true, 'Review content is required'],
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    treatmentRecieved: {
      type: String,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    avatarUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop'
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export const FeedbackModel = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);
