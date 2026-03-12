# InterviewAI - Full-Stack AI Interview Platform

A production-ready AI-powered interview preparation platform built with React, Node.js, MongoDB, JWT authentication, and OpenAI.

## 🏗️ Architecture

```
interviewai/
├── frontend/          # React + Vite + TailwindCSS (primary frontend)
├── client/            # React + Vite + TailwindCSS (alternative frontend)
├── backend/           # Node.js + Express + MongoDB (CommonJS)
└── server/            # Node.js + Express + MongoDB (ES modules)
```

### Directory Overview

| Directory | Description |
|-----------|-------------|
| **frontend/** | Primary React 18 + Vite frontend with full auth flow, dashboard, interview, analytics, history, and settings pages |
| **client/** | Alternative React 18 + Vite frontend including landing, login, signup, forgot-password, dashboard, interview, history, analytics, and report pages |
| **backend/** | Original CommonJS Node.js + Express REST API with controllers, models, middleware, and routes for interviews and dashboard |
| **server/** | Modern ES-module Node.js + Express REST API with auth routes, AI service layer, JWT middleware, and Mongoose models |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- OpenAI API key

---

### Run Everything at Once (root)

```bash
npm run install:all   # installs backend + frontend dependencies
npm run dev           # starts backend (:5000) and frontend (:5173) concurrently
```

---

### Backend Setup (`backend/` — CommonJS)

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
JWT_SECRET=interviewai_super_secret_key_2024
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-your-openai-key
CLIENT_URL=http://localhost:5173
```

---

### Server Setup (`server/` — ES Modules)

```bash
cd server
npm install
cp .env.example .env
# Fill in your .env variables
npm run dev
```

**Server `.env` variables:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/interviewai
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
CLIENT_URL=http://localhost:5173
```

---

### Frontend Setup (`frontend/` — primary UI)

```bash
cd frontend
npm install
cp .env.example .env
# Fill in your .env variables
npm run dev
```

**Frontend `.env` variables:**
```env
VITE_API_URL=http://localhost:5000
```

---

### Client Setup (`client/` — alternative UI)

```bash
cd client
npm install
npm run dev
```

The `client/` frontend uses the same environment variables as `frontend/`.

---

## 🔐 Supabase Setup

The app uses custom JWT + bcrypt authentication:

1. Users register with email, password, and name at `/api/auth/register`
2. Users log in with email and password at `/api/auth/login`
3. JWT tokens are stored in localStorage and sent as `Authorization: Bearer <token>` headers
4. Passwords are hashed with bcrypt (12 rounds)

**Required environment variables on Render:**
- `JWT_SECRET=interviewai_super_secret_key_2024`
- `JWT_EXPIRES_IN=7d`

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
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/profile` | Get current user profile |
| GET | `/health` | Server health check |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| POST | `/api/interviews/start` | Start new interview session |
| POST | `/api/interviews/submit` | Submit answers & get evaluation |
| GET | `/api/interviews/history` | Interview history (paginated) |
| GET | `/api/interviews/:id` | Single session detail |

All `/api/*` routes (except auth) require `Authorization: Bearer <jwt-token>` header.

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend (frontend/ & client/) | React 18, Vite, TailwindCSS, Recharts, Lucide React |
| Backend (backend/ & server/) | Node.js, Express, Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt (custom) |
| AI | OpenAI GPT-4o-mini |
| Voice | Web Speech API |

---

## 📁 Key Files

- `frontend/src/context/AuthContext.jsx` — JWT auth state management
- `frontend/src/lib/api.js` — Axios instance with JWT interceptor
- `backend/src/middleware/authMiddleware.js` — JWT token verification
- `backend/src/routes/auth.js` — Register and login endpoints
- `backend/src/controllers/interviewController.js` — AI question generation & evaluation
- `backend/src/controllers/dashboardController.js` — Stats aggregation queries

**server/ (ES modules API)**
- `server/middleware/` — JWT auth middleware
- `server/services/aiService.js` — OpenAI integration service
- `server/models/InterviewSession.js` — Mongoose interview session model
- `server/models/User.js` — Mongoose user model
- `server/routes/auth.js` — Authentication routes
- `server/routes/interviews.js` — Interview CRUD & evaluation routes
- `server/routes/dashboard.js` — Dashboard stats routes

---

## 🔒 Security

- All API routes protected by JWT middleware
- Passwords hashed with bcrypt (12 rounds)
- JWT secret stored server-side only (never exposed to client)
- Rate limiting on all API routes (100 req/15min)
- Helmet.js security headers
- CORS restricted to frontend origin
- MongoDB indexes on userId + createdAt for performance

---

## 📈 Production Deployment

### Frontend → Vercel
```bash
# Primary frontend
cd frontend && npm run build
# Deploy dist/ folder to Vercel

# Or alternative frontend
cd client && npm run build
# Deploy dist/ folder to Vercel
```

### Backend → Railway / Render
```bash
# CommonJS backend
cd backend
# Set env vars in platform dashboard
npm start

# Or ES-module server
cd server
# Set env vars in platform dashboard
npm start
```
