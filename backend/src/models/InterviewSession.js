const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({ name: String, score: Number, feedback: String }, { _id: false });
const questionSchema = new mongoose.Schema({ question: String, answer: String, evaluation: String, score: Number }, { _id: false });

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, required: true, enum: ['Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 'DevOps Engineer', 'Data Scientist'] },
  difficulty: { type: String, required: true, enum: ['EASY', 'MEDIUM', 'HARD'] },
  resumeUrl: { type: String, default: '' },
  questions: [questionSchema],
  score: { type: Number, min: 0, max: 10, default: 0 },
  feedback: {
    strengths: [String],
    weaknesses: [String],
    improvements: [String],
    summary: String,
  },
  topicAnalysis: [topicSchema],
  status: { type: String, default: 'completed', enum: ['pending', 'in-progress', 'completed'] },
  duration: { type: Number, default: 0 },
}, { timestamps: true });

interviewSessionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
