import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: 'admin' | 'superadmin';
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
