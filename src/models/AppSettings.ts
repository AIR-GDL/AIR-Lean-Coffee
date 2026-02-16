import mongoose from 'mongoose';

interface AppSettings {
  votesPerUser: number;
  minDiscussionMinutes: number;
  maxDiscussionMinutes: number;
  hideArchivedTopics: boolean;
}

const AppSettingsSchema = new mongoose.Schema<AppSettings>({
  votesPerUser: {
    type: Number,
    required: true,
    default: 3,
    min: 1,
    max: 10,
  },
  minDiscussionMinutes: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
    max: 59,
  },
  maxDiscussionMinutes: {
    type: Number,
    required: true,
    default: 10,
    min: 2,
    max: 60,
  },
  hideArchivedTopics: {
    type: Boolean,
    required: true,
    default: false,
  },
}, {
  timestamps: true,
});

// Ensure only one document exists for global settings
AppSettingsSchema.pre('save', async function(next) {
  const count = await mongoose.models.AppSettings?.countDocuments() || 0;
  if (count > 0 && !this.isNew) {
    const existing = await mongoose.models.AppSettings.findOne();
    if (existing && existing._id.toString() !== this._id.toString()) {
      next(new Error('Only one global settings document is allowed'));
      return;
    }
  }
  next();
});

export default mongoose.models.AppSettings || mongoose.model<AppSettings>('AppSettings', AppSettingsSchema);
