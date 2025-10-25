import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITopic extends Document {
  title: string;
  description?: string;
  author: string;
  votes: number;
  votedBy: string[]; // Array of user emails who voted
  status: 'to-discuss' | 'discussing' | 'discussed';
  archived: boolean; // Whether the topic has been archived
  createdAt: Date;
  discussedAt?: Date;
  totalTimeDiscussed: number; // Total discussion time in seconds
}

const TopicSchema = new Schema<ITopic>({
  title: {
    type: String,
    required: [true, 'Title is required'],
  },
  description: {
    type: String,
    required: false,
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
  },
  votes: {
    type: Number,
    default: 0,
  },
  votedBy: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['to-discuss', 'discussing', 'discussed'],
    default: 'to-discuss',
  },
  archived: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  discussedAt: {
    type: Date,
  },
  totalTimeDiscussed: {
    type: Number,
    default: 0,
  },
});

// Prevent model recompilation in development
const Topic: Model<ITopic> = mongoose.models.Topic || mongoose.model<ITopic>('Topic', TopicSchema);

export default Topic;
