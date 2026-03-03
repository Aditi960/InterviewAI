import InterviewSession from '../models/InterviewSession.js';

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.supabaseId;

    // Run all aggregations in parallel for performance
    const [statsResult, recentSessions, scoreHistory, topicPerformance] = await Promise.all([
      // Overall stats
      InterviewSession.aggregate([
        { $match: { userId, status: 'completed' } },
        {
          $group: {
            _id: null,
            totalInterviews: { $sum: 1 },
            averageScore: { $avg: '$score' },
            bestScore: { $max: '$score' },
          },
        },
      ]),

      // Recent sessions (last 5)
      InterviewSession.find({ userId, status: 'completed' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('role difficulty score createdAt topicAnalysis'),

      // Score history (last 30)
      InterviewSession.find({ userId, status: 'completed' })
        .sort({ createdAt: -1 })
        .limit(30)
        .select('score createdAt')
        .then(sessions => sessions.reverse()),

      // Topic performance aggregation
      InterviewSession.aggregate([
        { $match: { userId, status: 'completed' } },
        { $unwind: '$topicAnalysis' },
        {
          $group: {
            _id: '$topicAnalysis.name',
            avgScore: { $avg: '$topicAnalysis.score' },
            count: { $sum: 1 },
          },
        },
        { $sort: { avgScore: -1 } },
      ]),
    ]);

    const stats = statsResult[0] || { totalInterviews: 0, averageScore: 0, bestScore: 0 };

    // Count weak topics (avg score < 6)
    const weakTopics = topicPerformance.filter(t => t.avgScore < 6);

    res.json({
      stats: {
        totalInterviews: stats.totalInterviews,
        averageScore: stats.averageScore ? parseFloat(stats.averageScore.toFixed(1)) : 0,
        bestScore: stats.bestScore ? parseFloat(stats.bestScore.toFixed(1)) : 0,
        weakTopicsCount: weakTopics.length,
      },
      recentSessions,
      scoreHistory: scoreHistory.map((s, i) => ({
        label: `Interview ${i + 1}`,
        score: s.score,
        date: s.createdAt,
      })),
      topicPerformance: topicPerformance.map(t => ({
        name: t._id,
        avgScore: parseFloat(t.avgScore.toFixed(1)),
        isWeak: t.avgScore < 6,
      })),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: error.message });
  }
};
