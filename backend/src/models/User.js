const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  supabaseId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  avatarUrl: { type: String, default: '' },
  preferences: {
    defaultDifficulty: { type: String, default: 'MEDIUM' },
    targetRole: { type: String, default: '' },
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
