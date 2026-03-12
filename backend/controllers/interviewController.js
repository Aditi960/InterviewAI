const OpenAI = require('openai');
const multer = require('multer');
const fs = require('fs');
const InterviewSession = require('../models/InterviewSession');
const User = require('../models/User');

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const ROLE_TOPICS = {
  'Frontend Developer': ['React', 'JavaScript', 'CSS', 'HTML', 'Performance'],
  'Backend Engineer': ['Node.js', 'APIs', 'Databases', 'System Design', 'Security'],
  'Full Stack Developer': ['React', 'Node.js', 'Databases', 'APIs', 'System Design'],
  'DevOps Engineer': ['CI/CD', 'Docker', 'Kubernetes', 'Cloud', 'Monitoring'],
  'Data Scientist': ['Python', 'ML Algorithms', 'Statistics', 'Data Wrangling', 'Model Deployment'],
};

// Strips ```json ... ``` fences the AI sometimes wraps around responses
const parseJSON = (raw) => {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned);
};

const upload = multer({
  dest: '/tmp/',
  limits: { fileSize: 25 * 1024 * 1024 },
}).single('audio');

// POST /api/interviews/transcribe
const transcribeAudio = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: `Upload error: ${err.message}` });
    if (!req.file) return res.status(400).json({ error: 'No audio file received' });

    const filePath = req.file.path;
    const renamedPath = `${filePath}.webm`;

    try {
      fs.renameSync(filePath, renamedPath);

      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(renamedPath),
        model: 'whisper-large-v3',
        response_format: 'text',
        language: 'en',
      });

      fs.unlinkSync(renamedPath);
      res.json({ text: transcription });
    } catch (transcribeErr) {
      try { fs.unlinkSync(filePath); } catch (_) {}
      try { fs.unlinkSync(renamedPath); } catch (_) {}
      next(transcribeErr);
    }
  });
};

// POST /api/interviews/start
const startInterview = async (req, res, next) => {
  try {
    const { role, difficulty } = req.body;
    const userId = req.user._id;

    if (!role || !difficulty) {
      return res.status(400).json({ error: 'Role and difficulty are required' });
    }

    const difficultyMap = {
      EASY: 'beginner-level',
      MEDIUM: 'intermediate-level',
      HARD: 'senior-level',
    };

    const prompt = `
Generate 5 ${difficultyMap[difficulty]} interview questions for a ${role}.

Return ONLY a valid JSON array. No markdown, no code fences, no explanation.

[
  {
    "question": "text",
    "topic": "one of: ${(ROLE_TOPICS[role] || ['General']).join(', ')}",
    "expectedAnswer": "key points"
  }
]
`;

    const completion = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content.trim();

    let questions;
    try {
      questions = parseJSON(raw);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI questions', raw });
    }

    const session = await InterviewSession.create({
      userId: req.user._id,
      role,
      difficulty,
      status: 'in-progress',
      questions: questions.map((q) => ({
        question: q.question,
        answer: '',
        evaluation: '',
        score: 0,
      })),
    });

    res.status(201).json({
      sessionId: session._id,
      questions: questions.map((q, i) => ({
        id: i,
        question: q.question,
        topic: q.topic,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/interviews/submit
const submitInterview = async (req, res, next) => {
  try {
    const { sessionId, answers, duration } = req.body;
    const userId = req.user._id;

    const session = await InterviewSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const questionsWithAnswers = session.questions.map((q, i) => ({
      question: q.question,
      answer: answers[i] || 'No answer provided',
    }));

    const evaluationPrompt = `
Evaluate these interview answers for a ${session.role} position.

Return ONLY valid JSON. No markdown, no code fences, no explanation before or after.

{
  "overallScore": 7,
  "questions": [
    { "score": 7, "evaluation": "brief feedback" }
  ],
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1"],
  "improvements": ["improvement 1"],
  "summary": "2 sentence overall summary",
  "topicAnalysis": [
    { "name": "Topic", "score": 7, "feedback": "brief feedback" }
  ]
}

Q&A to evaluate:
${questionsWithAnswers
  .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
  .join('\n\n')}
`;

    const completion = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: evaluationPrompt }],
      temperature: 0.3,
    });

    const raw = completion.choices[0].message.content.trim();

    let result;
    try {
      result = parseJSON(raw);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI evaluation', raw });
    }

    session.questions = session.questions.map((q, i) => ({
      ...q.toObject(),
      answer: answers[i] || '',
      evaluation: result.questions?.[i]?.evaluation || '',
      score: result.questions?.[i]?.score || 0,
    }));

    session.score = result.overallScore || 0;
    session.feedback = {
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      improvements: result.improvements || [],
      summary: result.summary || '',
    };

    session.topicAnalysis = result.topicAnalysis || [];
    session.status = 'completed';
    session.duration = duration || 0;

    await session.save();

    res.json({
      sessionId: session._id,
      score: session.score,
      feedback: session.feedback,
      topicAnalysis: session.topicAnalysis,
      questions: session.questions,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/interviews/history
const getHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      InterviewSession.find({ userId, status: 'completed' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-questions')
        .lean(),
      InterviewSession.countDocuments({ userId, status: 'completed' }),
    ]);

    res.json({
      sessions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/interviews/:id
const getSession = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();

    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  startInterview,
  submitInterview,
  getHistory,
  getSession,
  transcribeAudio,
};