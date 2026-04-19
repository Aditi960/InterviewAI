const InterviewSession = require('../models/InterviewSession');

const getStats = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id?.toString();
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized user context' });
    }
    const userMatch = { userId };
    const completedUserMatch = { ...userMatch, status: 'completed' };

    const totalInterviews = await InterviewSession.countDocuments(userMatch);

    const sessions = await InterviewSession.find(completedUserMatch)
      .sort({ createdAt: -1 })
      .lean();

    if (!sessions.length) {
      return res.json({
        totalInterviews,
        averageScore: 0,
        bestScore: 0,
        weakTopicsCount: 0,
        recentSessions: [],
        scoreHistory: [],
        topicPerformance: [],
      });
    }

    // Stats calculations
    const scores = sessions.map(s => s.score);
    const averageScore = parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1));
    const bestScore = Math.max(...scores);

    // Aggregate topic performance
    const topicMap = {};
    sessions.forEach(session => {
      (session.topicAnalysis || []).forEach(topic => {
        const topicName = topic.name || topic.topic;
        const topicScore = typeof topic.score === 'number' ? topic.score : 0;
        if (!topicName) return;
        if (!topicMap[topicName]) topicMap[topicName] = { total: 0, count: 0 };
        topicMap[topicName].total += topicScore;
        topicMap[topicName].count += 1;
      });
    });

    const topicPerformance = Object.entries(topicMap).map(([name, data]) => ({
      name,
      average: parseFloat((data.total / data.count).toFixed(1)),
    }));

    const weakTopicsCount = topicPerformance.filter(t => t.average < 6).length;

    // Last 10 sessions for score history
    const scoreHistory = sessions.slice(0, 10).reverse().map((s, i) => ({
      label: `Interview ${i + 1}`,
      score: s.score,
      date: s.createdAt,
    }));

    // Recent sessions (last 5)
    const recentSessions = sessions.slice(0, 5).map(s => ({
      id: s._id,
      role: s.role,
      difficulty: s.difficulty,
      score: s.score,
      date: s.createdAt,
    }));

    res.json({
      totalInterviews,
      averageScore,
      bestScore,
      weakTopicsCount,
      recentSessions,
      scoreHistory,
      topicPerformance,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats };
