const express = require('express');
const router = express.Router();
const User = require('../models/User');
const InterviewSession = require('../models/InterviewSession');

// GET /api/admin/users — find all users, exclude password field
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/users/:id — delete user and all their interview sessions
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await InterviewSession.deleteMany({ userId: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User and associated sessions deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/sessions — find all interview sessions, populate userId with name and email
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await InterviewSession.find().populate('userId', 'name email');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
