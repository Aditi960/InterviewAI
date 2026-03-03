import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  supabaseId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  avatarUrl: {
    type: String,
    default: null,
  },
  preferences: {
    defaultRole: { type: String, default: 'Frontend Developer' },
    defaultDifficulty: { type: String, default: 'medium' },
  },
}, {
  timestamps: true,
});

export const User = mongoose.model('User', userSchema);
