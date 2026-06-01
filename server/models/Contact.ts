import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

const ContactSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Inquirer Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'A valid callback email is required'],
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: [true, 'Inquiry message body is required'],
      trim: true,
    }
  },
  {
    timestamps: true
  }
);

export const ContactModel = mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);
