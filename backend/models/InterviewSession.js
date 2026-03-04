const mongoose = require('mongoose');

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
    topic: { type: String },
    answer: { type: String, default: '' },
    evaluation: { type: String, default: '' },
    score: { type: Number, default: 0, min: 0, max: 10 },
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    supabaseId: {
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
    questions: [questionSchema],
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
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
    },
    duration: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

interviewSessionSchema.index({ supabaseId: 1, createdAt: -1 });
interviewSessionSchema.index({ supabaseId: 1, status: 1 });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);