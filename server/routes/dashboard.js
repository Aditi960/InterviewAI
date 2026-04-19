import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { InterviewSession } from '../models/InterviewSession.js';

const router = express.Router();

// GET /api/dashboard/stats - All dashboard data in one call
router.get('/stats', authMiddleware, async (req, res) => {
  const userId = req.user?.id || req.user?._id?.toString();
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized user context' });
  }
  const userMatch = { userId, status: 'completed' };

  // Run all aggregations in parallel
  const [summaryStats, scoreHistory, topicPerformance, recentSessions] = await Promise.all([
    // Summary stats aggregation
    InterviewSession.aggregate([
      { $match: userMatch },
      {
        $group: {
          _id: null,
          totalInterviews: { $sum: 1 },
          averageScore: { $avg: '$score' },
          bestScore: { $max: '$score' },
        },
      },
    ]),

    // Score history - last 30 sessions for trend line
    InterviewSession.find(userMatch)
      .sort({ createdAt: -1 })
      .limit(30)
      .select('score createdAt role')
      .lean(),

    // Topic performance aggregation
    InterviewSession.aggregate([
      { $match: userMatch },
      { $unwind: '$topicAnalysis' },
      {
        $group: {
          _id: '$topicAnalysis.topic',
          avgScore: { $avg: '$topicAnalysis.score' },
          count: { $sum: 1 },
        },
      },
      { $sort: { avgScore: -1 } },
    ]),

    // Recent 5 sessions
    InterviewSession.find(userMatch)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('role difficulty score createdAt experienceLevel')
      .lean(),
  ]);

  const stats = summaryStats[0] || { totalInterviews: 0, averageScore: 0, bestScore: 0 };

  // Count weak topics (avg score < 6)
  const weakTopics = topicPerformance.filter(t => t.avgScore < 6);

  res.json({
    stats: {
      totalInterviews: stats.totalInterviews,
      averageScore: stats.averageScore ? parseFloat(stats.averageScore.toFixed(1)) : 0,
      bestScore: stats.bestScore ? parseFloat(stats.bestScore.toFixed(1)) : 0,
      weakTopicsCount: weakTopics.length,
    },
    scoreHistory: scoreHistory.reverse(), // oldest to newest for chart
    topicPerformance: topicPerformance.map(t => ({
      topic: t._id,
      avgScore: parseFloat(t.avgScore.toFixed(1)),
      count: t.count,
      isWeak: t.avgScore < 6,
    })),
    recentSessions,
  });
});

// GET /api/dashboard/topic-breakdown - Detailed topic analysis
router.get('/topic-breakdown', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  const breakdown = await InterviewSession.aggregate([
    { $match: { userId, status: 'completed' } },
    { $unwind: '$topicAnalysis' },
    {
      $group: {
        _id: '$topicAnalysis.topic',
        avgScore: { $avg: '$topicAnalysis.score' },
        minScore: { $min: '$topicAnalysis.score' },
        maxScore: { $max: '$topicAnalysis.score' },
        count: { $sum: 1 },
        feedbacks: { $push: '$topicAnalysis.feedback' },
      },
    },
    { $sort: { avgScore: 1 } }, // worst first
  ]);

  res.json({ breakdown });
});

export default router;
