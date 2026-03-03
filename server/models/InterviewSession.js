import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  expectedAnswer: { type: String },
});

const answerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  answer: { type: String, default: '' },
  timeTaken: { type: Number, default: 0 }, // seconds
});

const topicAnalysisSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  score: { type: Number, min: 0, max: 10 },
  feedback: { type: String },
  isWeak: { type: Boolean, default: false },
});

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
    ref: 'User',
  },
  role: {
    type: String,
    required: true,
    enum: ['Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 'DevOps Engineer', 'Data Scientist'],
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard'],
  },
  experienceLevel: {
    type: String,
    enum: ['Fresher', 'Junior', 'Mid-level', 'Senior'],
    default: 'Fresher',
  },
  resumeUrl: {
    type: String,
    default: null,
  },
  questions: [questionSchema],
  answers: [answerSchema],
  score: {
    type: Number,
    min: 0,
    max: 10,
    default: null,
  },
  feedback: {
    overall: { type: String, default: '' },
    strengths: [String],
    weaknesses: [String],
    improvements: [String],
  },
  topicAnalysis: [topicAnalysisSchema],
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress',
  },
  duration: {
    type: Number,
    default: 0, // total seconds
  },
}, {
  timestamps: true,
});

// Compound indexes for optimized queries
interviewSessionSchema.index({ userId: 1, createdAt: -1 });
interviewSessionSchema.index({ userId: 1, status: 1 });

export const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
