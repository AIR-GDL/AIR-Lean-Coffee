import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  votesRemaining: number;
  roles: string[];
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  votesRemaining: {
    type: Number,
    default: 3,
  },
  roles: {
    type: [String],
    default: ['user'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: {
    transform(_doc, ret: Record<string, unknown>) {
      delete ret.isAdmin;
      return ret;
    },
  },
  toObject: {
    transform(_doc, ret: Record<string, unknown>) {
      delete ret.isAdmin;
      return ret;
    },
  },
});

// Prevent model recompilation in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
