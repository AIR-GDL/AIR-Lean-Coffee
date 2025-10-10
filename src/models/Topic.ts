import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITopic extends Document {
  content: string;
  author: string;
  votes: number;
  votedBy: string[]; // Array of user emails who voted
  status: 'to-discuss' | 'discussing' | 'discussed';
  createdAt: Date;
  discussedAt?: Date;
}

const TopicSchema = new Schema<ITopic>({
  content: {
    type: String,
    required: [true, 'Content is required'],
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  discussedAt: {
    type: Date,
  },
});

// Prevent model recompilation in development
const Topic: Model<ITopic> = mongoose.models.Topic || mongoose.model<ITopic>('Topic', TopicSchema);

export default Topic;
