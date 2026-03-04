const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
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
      preferredRole: { type: String, default: 'Frontend Developer' },
      targetDifficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);