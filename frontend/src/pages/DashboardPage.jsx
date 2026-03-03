import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';
import { format } from 'date-fns';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  Plus, TrendingUp, Award, BookOpen, Target,
  ChevronDown, FileText, Bell
} from 'lucide-react';

const DifficultyBadge = ({ difficulty }) => {
  const cls = difficulty === 'EASY' ? 'badge-easy' : difficulty === 'HARD' ? 'badge-hard' : 'badge-medium';
  return <span className={cls}>{difficulty}</span>;
};

const SkeletonCard = () => (
  <div className="stat-card">
    <div className="skeleton w-12 h-12 rounded-xl" />
    <div className="space-y-2">
      <div className="skeleton w-16 h-7 rounded" />
      <div className="skeleton w-24 h-4 rounded" />
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-card text-sm">
        <p className="text-gray-500">{label}</p>
        <p className="font-bold text-gray-900">{payload[0].value}/10</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scoreFilter, setScoreFilter] = useState('Last 30 Days');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/dashboard/stats');
        setStats(data);
      } catch (e) {
        setError(e.error || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = stats ? [
    {
      label: 'Total Interviews',
      value: stats.stats.totalInterviews,
      iconBg: 'bg-cyan-100',
      textColor: 'text-[#00D4E8]',
      icon: '📋',
    },
    {
      label: 'Average Score',
      value: `${stats.stats.averageScore}/10`,
      iconBg: 'bg-yellow-50',
      textColor: 'text-amber-500',
      icon: '⭐',
    },
    {
      label: 'Best Score',
      value: `${stats.stats.bestScore}/10`,
      iconBg: 'bg-cyan-50',
      textColor: 'text-[#00D4E8]',
      icon: '🏆',
    },
    {
      label: 'Weak Topics',
      value: stats.stats.weakTopicsCount,
      iconBg: 'bg-amber-50',
      textColor: 'text-amber-500',
      icon: '📚',
    },
  ] : [];

  return (
    <div className="p-6 max-w-screen-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-7 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Dashboard</h1>
          {profile && (
            <p className="text-gray-500 text-sm mt-0.5">
              Welcome back, <span className="font-semibold text-gray-700">{profile.name}</span> 👋
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search sessions, topics..."
              className="input-field pl-10 w-64 text-sm py-2.5"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <button className="relative p-2.5 rounded-xl bg-white border border-gray-200 hover:border-gray-300 transition-colors">
            <Bell size={18} className="text-gray-500" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#FF6B6B] rounded-full" />
          </button>
          <Link to="/start-interview" className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            <span>Start New Interview</span>
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          statCards.map((card, i) => (
            <div key={i} className="stat-card">
              <div className={`stat-icon ${card.iconBg}`}>
                <span className="text-xl">{card.icon}</span>
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        {/* Score Improvement */}
        <div className="card lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-gray-900">Score Improvement</h2>
            <button className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-300 transition-colors">
              {scoreFilter}
              <ChevronDown size={14} />
            </button>
          </div>

          {loading ? (
            <div className="skeleton h-48 rounded-xl" />
          ) : stats?.scoreHistory?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.scoreHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4E8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D4E8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#00D4E8"
                  strokeWidth={2.5}
                  fill="url(#scoreGradient)"
                  dot={{ fill: '#00D4E8', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: '#00D4E8' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400">
              <TrendingUp size={32} className="mb-2 opacity-40" />
              <p className="text-sm">Complete interviews to see your progress</p>
            </div>
          )}
        </div>

        {/* Topic Performance */}
        <div className="card lg:col-span-2">
          <h2 className="font-display font-semibold text-gray-900 mb-5">Topic Performance</h2>

          {loading ? (
            <div className="skeleton h-48 rounded-xl" />
          ) : stats?.topicPerformance?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.topicPerformance} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgScore" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {stats.topicPerformance.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.isWeak ? '#FF6B6B' : entry.avgScore >= 8 ? '#00D4E8' : '#FFD166'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400">
              <BarChart2 size={32} className="mb-2 opacity-40" />
              <p className="text-sm text-center">Topic data will appear after interviews</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-gray-900">Recent Sessions</h2>
          <Link to="/history" className="text-sm text-[#00D4E8] font-medium hover:underline">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50">
                <div className="skeleton w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton w-40 h-4 rounded" />
                  <div className="skeleton w-24 h-3 rounded" />
                </div>
                <div className="skeleton w-16 h-6 rounded-full" />
                <div className="skeleton w-12 h-4 rounded" />
                <div className="skeleton w-24 h-4 rounded" />
                <div className="skeleton w-24 h-8 rounded-xl" />
              </div>
            ))}
          </div>
        ) : stats?.recentSessions?.length > 0 ? (
          <>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-5 text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 border-b border-gray-100 mb-1">
              <span className="col-span-2">Role Context</span>
              <span>Difficulty</span>
              <span>Score</span>
              <span>Date</span>
            </div>

            <div className="space-y-1">
              {stats.recentSessions.map((session) => (
                <div
                  key={session._id}
                  className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-0 items-center py-4 border-b border-gray-50 last:border-0 group"
                >
                  {/* Role */}
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg flex-shrink-0">
                      {session.role.includes('Frontend') ? '🖥️' : session.role.includes('Backend') ? '⚙️' : '🔥'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{session.role}</p>
                      <p className="text-xs text-gray-400">
                        {session.difficulty === 'EASY' ? 'Fresher Level' : session.difficulty === 'HARD' ? 'Experienced Level' : 'Mid Level'}
                      </p>
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <DifficultyBadge difficulty={session.difficulty} />
                  </div>

                  {/* Score */}
                  <div>
                    <span className="font-bold text-gray-900">{session.score?.toFixed(1)}/10</span>
                  </div>

                  {/* Date */}
                  <div className="text-sm text-gray-500">
                    {format(new Date(session.createdAt), 'MMM d, yyyy')}
                  </div>

                  {/* Action */}
                  <div className="hidden md:block">
                    <Link
                      to={`/report/${session._id}`}
                      className="btn-secondary text-xs px-4 py-2 inline-flex items-center gap-1.5"
                    >
                      <FileText size={13} />
                      View Report
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#00D4E8]/10 flex items-center justify-center mx-auto mb-4">
              <Target size={28} className="text-[#00D4E8]" />
            </div>
            <h3 className="font-display font-semibold text-gray-700 mb-2">No interviews yet</h3>
            <p className="text-gray-400 text-sm mb-5">Start your first AI-powered interview to see results here.</p>
            <Link to="/start-interview" className="btn-primary inline-flex items-center gap-2">
              <Plus size={16} />
              Start Your First Interview
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
