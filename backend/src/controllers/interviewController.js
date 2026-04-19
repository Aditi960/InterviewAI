const OpenAI = require('openai');
const multer = require('multer');
const fs = require('fs');
const mammoth = require('mammoth');
const { PDFParse } = require('pdf-parse');
const InterviewSession = require('../models/InterviewSession');
const User = require('../models/User');

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const MAX_RESUME_TEXT_CHARS = 12000;
const QUESTION_TYPE_ORDER = [
  'HR',
  'HR',
  'PROJECT',
  'PROJECT',
  'PROJECT',
  'PROJECT',
  'PROJECT',
  'TECHNICAL',
  'TECHNICAL',
  'TECHNICAL',
];
const QUESTION_TYPE_COUNTS = { HR: 2, PROJECT: 5, TECHNICAL: 3 };
const TOTAL_QUESTION_COUNT = QUESTION_TYPE_ORDER.length;

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

const buildResumeQuestionPrompt = ({ role, difficulty, resumeText }) => `
You are an interview coach.
Create interview questions for a ${role} role at ${difficulty} difficulty.

Use this resume content:
"""${resumeText.slice(0, MAX_RESUME_TEXT_CHARS)}"""

Generate exactly 10 interview questions in this JSON format:
[
  { "type": "HR", "question": "..." },
  { "type": "HR", "question": "..." },
  { "type": "PROJECT", "question": "..." },
  { "type": "PROJECT", "question": "..." },
  { "type": "PROJECT", "question": "..." },
  { "type": "PROJECT", "question": "..." },
  { "type": "PROJECT", "question": "..." },
  { "type": "TECHNICAL", "question": "..." },
  { "type": "TECHNICAL", "question": "..." },
  { "type": "TECHNICAL", "question": "..." }
]
Return ONLY the JSON array. No explanations.

Category requirements:
- 2 HR questions (motivation, goals, project choice)
- 5 PROJECT questions (system flow, auth logic, API flow, challenges faced, scalability)
- 3 TECHNICAL questions (REST APIs, Express middleware, MongoDB queries)
- Questions must be unique and grounded in the provided resume.
`;

const validateTypedQuestions = (questions) => {
  if (!Array.isArray(questions) || questions.length !== TOTAL_QUESTION_COUNT) {
    throw new Error(`Groq response must be a JSON array of exactly ${TOTAL_QUESTION_COUNT} questions`);
  }

  const normalizedQuestions = questions.map((q, index) => {
    const type = typeof q?.type === 'string' ? q.type.trim().toUpperCase() : '';
    const question = typeof q?.question === 'string' ? q.question.trim() : '';
    if (!type || !question) {
      throw new Error(`Question ${index + 1} must include non-empty "type" and "question"`);
    }
    return { type, question };
  });

  const uniqueQuestions = new Set(normalizedQuestions.map((q) => q.question.toLowerCase()));
  if (uniqueQuestions.size !== TOTAL_QUESTION_COUNT) {
    throw new Error(`Questions must contain exactly ${TOTAL_QUESTION_COUNT} unique values`);
  }

  const typeCounts = normalizedQuestions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {});

  const hasValidDistribution = Object.entries(QUESTION_TYPE_COUNTS)
    .every(([type, count]) => (typeCounts[type] || 0) === count);

  if (!hasValidDistribution) {
    throw new Error('Questions must contain exactly 2 HR, 5 PROJECT, and 3 TECHNICAL questions');
  }

  const hasValidOrder = normalizedQuestions.every((q, index) => q.type === QUESTION_TYPE_ORDER[index]);
  if (!hasValidOrder) {
    throw new Error('Questions must follow the required category order: HR, HR, PROJECT x5, TECHNICAL x3');
  }

  return normalizedQuestions;
};

const extractResumeText = async (file) => {
  if (!file?.buffer) {
    throw new Error('No resume file uploaded');
  }

  if (file.mimetype === 'application/pdf') {
    const parser = new PDFParse({ data: file.buffer });
    try {
      const result = await parser.getText();
      return result?.text?.trim() || '';
    } finally {
      await parser.destroy();
    }
  }

  if (
    file.mimetype === 'application/msword'
    || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result?.value?.trim() || '';
  }

  throw new Error('Unsupported resume format');
};

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

// POST /api/interviews/upload-resume
const uploadResume = async (req, res, next) => {
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Body:', req.body);
  console.log('File:', req.file);

  try {
    const { role, difficulty } = req.body;
    const userId = req.user._id;

    if (!role || !difficulty) {
      return res.status(400).json({ error: 'Role and difficulty are required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    let resumeText = '';
    try {
      resumeText = await extractResumeText(req.file);
    } catch (parseErr) {
      return res.status(400).json({ error: `Failed to parse resume: ${parseErr.message}` });
    }

    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text could not be extracted' });
    }

    const completion = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: buildResumeQuestionPrompt({ role, difficulty, resumeText }) }],
      temperature: 0.4,
    });

    const raw = completion?.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      return res.status(502).json({ error: 'Groq returned an empty response' });
    }

    let parsed;
    try {
      parsed = parseJSON(raw);
    } catch {
      return res.status(502).json({ error: 'Failed to parse Groq questions response' });
    }

    let typedQuestions;
    try {
      typedQuestions = validateTypedQuestions(parsed);
    } catch (validationErr) {
      return res.status(502).json({ error: validationErr.message });
    }

    const groupedQuestions = typedQuestions.reduce((acc, q) => {
      acc[`${q.type.toLowerCase()}Questions`].push(q.question);
      return acc;
    }, { hrQuestions: [], projectQuestions: [], technicalQuestions: [] });

    const session = await InterviewSession.create({
      userId,
      role,
      difficulty,
      resumeUrl: req.file.originalname || '',
      status: 'in-progress',
      questions: typedQuestions.map(({ type, question }) => ({
        type,
        question,
        answer: '',
        evaluation: '',
        score: 0,
      })),
    });

    return res.status(201).json({
      sessionId: session._id,
      ...groupedQuestions,
      questions: typedQuestions,
    });
  } catch (err) {
    if (err?.status) {
      return res.status(err.status).json({
        error: err?.error?.message || err?.message || 'Groq API request failed',
      });
    }
    return next(err);
  }
};

// POST /api/interviews/start
const startInterview = async (req, res, next) => {
  try {
    const { role, difficulty } = req.body;
    const userId = req.user._id;

    if (!role || !difficulty) {
      return res.status(400).json({ error: 'Role and difficulty are required' });
    }

    const systemPrompt = `
Generate exactly 10 interview questions in this JSON format:
[
  { "type": "HR", "question": "..." },
  { "type": "HR", "question": "..." },
  { "type": "PROJECT", "question": "..." },
  { "type": "PROJECT", "question": "..." },
  { "type": "PROJECT", "question": "..." },
  { "type": "PROJECT", "question": "..." },
  { "type": "PROJECT", "question": "..." },
  { "type": "TECHNICAL", "question": "..." },
  { "type": "TECHNICAL", "question": "..." },
  { "type": "TECHNICAL", "question": "..." }
]
Return ONLY the JSON array. No explanations.

Create questions for a ${role} interview at ${difficulty} difficulty.
Category requirements:
- 2 HR questions (motivation, goals, project choice)
- 5 PROJECT questions (system flow, auth logic, API flow, challenges faced, scalability)
- 3 TECHNICAL questions (REST APIs, Express middleware, MongoDB queries)
`;

    let raw = '';
    try {
      const completion = await openai.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.8,
      });
      raw = completion?.choices?.[0]?.message?.content?.trim() || '';
      if (!raw) {
        return res.status(502).json({ error: 'Groq returned an empty response' });
      }
    } catch (groqErr) {
      const message = groqErr?.error?.message || groqErr?.message || 'Groq API failed to generate interview questions';
      const status = groqErr?.status && Number.isInteger(groqErr.status) ? groqErr.status : 502;
      return res.status(status).json({ error: message });
    }

    let questions;
    try {
      questions = parseJSON(raw);
    } catch {
      return res.status(502).json({ error: 'Failed to parse Groq questions response as JSON array' });
    }

    let normalizedQuestions;
    try {
      normalizedQuestions = validateTypedQuestions(questions);
    } catch (validationErr) {
      return res.status(502).json({ error: validationErr.message });
    }

    const session = await InterviewSession.create({
      userId,
      role,
      difficulty,
      status: 'in-progress',
      questions: normalizedQuestions.map(({ type, question }) => ({
        type,
        question,
        answer: '',
        evaluation: '',
        score: 0,
      })),
    });

    res.status(201).json({
      sessionId: session._id,
      questions: normalizedQuestions,
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
  uploadResume,
};
