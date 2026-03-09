import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { InterviewSession } from '../models/InterviewSession.js';
import { User } from '../models/User.js';
import { generateQuestions, evaluateAnswers } from '../services/aiService.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// POST /api/interviews/start - Create session and generate questions
router.post('/start', authMiddleware, async (req, res) => {
  const { role, difficulty, experienceLevel, resumeText } = req.body;

  if (!role || !difficulty) {
    throw new AppError('Role and difficulty are required', 400);
  }

  // Ensure user exists in MongoDB
  const user = await User.findById(req.user.id);

  // Generate AI questions
  const questions = await generateQuestions(role, difficulty, experienceLevel || 'Fresher', resumeText || '');

  // Create session
  const session = await InterviewSession.create({
    userId: req.user.id,
    role,
    difficulty,
    experienceLevel: experienceLevel || 'Fresher',
    questions,
    answers: [],
    status: 'in_progress',
  });

  res.status(201).json({ session });
});

// POST /api/interviews/submit - Submit answers and get evaluation
router.post('/submit', authMiddleware, async (req, res) => {
  const { sessionId, answers, duration } = req.body;

  if (!sessionId || !answers) {
    throw new AppError('Session ID and answers are required', 400);
  }

  const session = await InterviewSession.findOne({
    _id: sessionId,
    userId: req.user.id,
    status: 'in_progress',
  });

  if (!session) {
    throw new AppError('Interview session not found', 404);
  }

  // Evaluate with AI
  const evaluation = await evaluateAnswers(
    session.role,
    session.difficulty,
    session.questions,
    answers
  );

  // Update session
  session.answers = answers;
  session.score = evaluation.overallScore;
  session.feedback = {
    overall: evaluation.overall,
    strengths: evaluation.strengths || [],
    weaknesses: evaluation.weaknesses || [],
    improvements: evaluation.improvements || [],
  };
  session.topicAnalysis = evaluation.topicAnalysis || [];
  session.status = 'completed';
  session.duration = duration || 0;

  await session.save();

  res.json({ session });
});

// GET /api/interviews/history - Get all completed sessions
router.get('/history', authMiddleware, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [sessions, total] = await Promise.all([
    InterviewSession.find({
      userId: req.user.id,
      status: 'completed',
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-questions -answers'),
    InterviewSession.countDocuments({
      userId: req.user.id,
      status: 'completed',
    }),
  ]);

  res.json({
    sessions,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// GET /api/interviews/:id - Get single session with full report
router.get('/:id', authMiddleware, async (req, res) => {
  const session = await InterviewSession.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!session) {
    throw new AppError('Session not found', 404);
  }

  res.json({ session });
});

// DELETE /api/interviews/:id - Delete a session
router.delete('/:id', authMiddleware, async (req, res) => {
  const session = await InterviewSession.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!session) {
    throw new AppError('Session not found', 404);
  }

  res.json({ message: 'Session deleted successfully' });
});

export default router;
