require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const authRoutes = require('./routes/auth');
const interviewRoutes = require('./routes/interviews');
const dashboardRoutes = require('./routes/dashboard');
const { errorHandler } = require('./middleware/errorHandler');
const User = require('./models/User');

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// ── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow server-to-server requests (no origin)
    if (!origin) return callback(null, true);
    // allow any vercel preview deployment
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // allow explicitly whitelisted origins
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again in 15 minutes.' },
});

const interviewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.INTERVIEW_RATE_LIMIT_MAX, 10) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many interview requests, please slow down.' },
});

// apply global limiter to all routes
app.use(globalLimiter);

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── MongoDB ───────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/interviewai')
  .then(async (conn) => {
    console.log('✅ MongoDB connected');
    // Drop the stale supabaseId unique index if it exists.
    // The field was removed from the User schema; leaving the index
    // causes E11000 duplicate-key errors on null values.
    try {
      await conn.connection.collection('users').dropIndex('supabaseId_1');
      console.log('Dropped stale supabaseId_1 index');
    } catch (_) {
      // Index doesn't exist – nothing to do
    }
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/interviews', interviewLimiter, interviewRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── One-time Admin Creation ───────────────────────────────────────────────────
app.get('/create-admin-once', async (req, res) => {
  try {
    await User.deleteOne({ email: 'admin@interviewai.com' });
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@interviewai.com',
      password: hashedPassword,
      role: 'admin',
    });
    res.status(201).json({ message: 'Admin user created', admin });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create admin', details: err.message });
  }
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;