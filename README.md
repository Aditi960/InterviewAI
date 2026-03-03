# InterviewAI - Full-Stack AI Interview Platform

A production-ready AI-powered interview preparation platform built with React, Node.js, MongoDB, Supabase Auth, and OpenAI.

## 🏗️ Architecture

```
interviewai/
├── frontend/          # React + Vite + TailwindCSS
└── backend/           # Node.js + Express + MongoDB
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Supabase account
- OpenAI API key

---

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env variables
npm run dev
```

**Backend `.env` variables:**
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/interviewai
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key   # NOT anon key
OPENAI_API_KEY=sk-your-openai-key
CLIENT_URL=http://localhost:5173
```

---

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Fill in your .env variables
npm run dev
```

**Frontend `.env` variables:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key          # NOT service key
VITE_API_URL=http://localhost:5000
```

---

## 🔐 Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Enable **Email/Password** auth in Authentication → Providers
3. Enable **Google** OAuth (optional) in Authentication → Providers
4. Copy **Project URL** and **Anon Key** for frontend env
5. Copy **Service Role Key** for backend env (Settings → API)

---

## 📊 MongoDB Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Whitelist your IP (or use 0.0.0.0/0 for development)
4. Copy the connection string to `MONGO_URI`

The app will auto-create collections and indexes on first run.

---

## 📡 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Server health check |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| POST | `/api/interviews/start` | Start new interview session |
| POST | `/api/interviews/submit` | Submit answers & get evaluation |
| GET | `/api/interviews/history` | Interview history (paginated) |
| GET | `/api/interviews/:id` | Single session detail |

All `/api/*` routes require `Authorization: Bearer <supabase-jwt>` header.

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, TailwindCSS, Recharts |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas |
| Auth | Supabase Auth (JWT) |
| AI | OpenAI GPT-4o-mini |
| Voice | Web Speech API |

---

## 📁 Key Files

- `frontend/src/context/AuthContext.jsx` — Supabase auth state management
- `frontend/src/lib/api.js` — Axios instance with JWT interceptor
- `backend/src/middleware/authMiddleware.js` — JWT validation via Supabase
- `backend/src/controllers/interviewController.js` — AI question generation & evaluation
- `backend/src/controllers/dashboardController.js` — Stats aggregation queries

---

## 🔒 Security

- All API routes protected by JWT middleware
- Supabase Service Key only used server-side (never exposed to client)
- Rate limiting on all API routes (100 req/15min)
- Helmet.js security headers
- CORS restricted to frontend origin
- MongoDB indexes on userId + createdAt for performance

---

## 📈 Production Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
```

### Backend → Railway / Render
```bash
cd backend
# Set env vars in platform dashboard
npm start
```
