import mongoose from 'mongoose';

const topicAnalysisSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 10 },
    feedback: { type: String },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    topic: { type: String, required: true },
    difficulty: { type: String },
  },
  { _id: false }
);

const answerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 'DevOps Engineer', 'Data Scientist'],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['EASY', 'MEDIUM', 'HARD'],
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
      strengths: [String],
      weaknesses: [String],
      improvements: [String],
      summary: String,
    },
    topicAnalysis: [topicAnalysisSchema],
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for performance
interviewSessionSchema.index({ userId: 1, createdAt: -1 });
interviewSessionSchema.index({ userId: 1, status: 1 });

export default mongoose.model('InterviewSession', interviewSessionSchema);
