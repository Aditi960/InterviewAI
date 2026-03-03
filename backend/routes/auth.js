import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/auth/profile - get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/auth/profile - update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (preferences) updates.preferences = { ...req.user.preferences, ...preferences };

    const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
