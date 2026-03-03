import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { User } from '../models/User.js';

const router = express.Router();

// Sync user profile after Supabase login
router.post('/sync', authMiddleware, async (req, res) => {
  const { id: supabaseId, email } = req.user;
  const { name, avatarUrl } = req.body;

  let user = await User.findOne({ supabaseId });

  if (!user) {
    user = await User.create({
      supabaseId,
      email,
      name: name || email.split('@')[0],
      avatarUrl: avatarUrl || null,
    });
  } else {
    // Update existing user info
    if (name) user.name = name;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    await user.save();
  }

  res.json({ user });
});

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findOne({ supabaseId: req.user.id });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
});

// Update user preferences
router.patch('/preferences', authMiddleware, async (req, res) => {
  const user = await User.findOneAndUpdate(
    { supabaseId: req.user.id },
    { $set: { preferences: req.body } },
    { new: true }
  );

  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({ user });
});

export default router;
