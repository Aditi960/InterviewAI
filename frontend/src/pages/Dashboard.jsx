import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { TrendingUp, Award, Target, AlertTriangle, Calendar, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const StatCard = ({ label, value, sub, color, icon: Icon, darkMode }) => (
  <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-[20px_24px] min-w-0" style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
      <Icon size={20} color={color} />
    </div>
    <div className="min-w-0">
      <div className="text-lg sm:text-2xl font-bold leading-none" style={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}>{value}</div>
      <div className="text-xs sm:text-[13px] mt-1 truncate" style={{ color: '#94a3b8' }}>{label}</div>
    </div>
  </div>
);

const DifficultyBadge = ({ d }) => {
  const map = { EASY: ['#06b6d4', '#e0f7fa'], MEDIUM: ['#eab308', '#fefce8'], HARD: ['#ef4444', '#fef2f2'] };
  const [c, bg] = map[d] || ['#94a3b8', '#f1f5f9'];
  return (
    <span style={{ background: bg, color: c, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
      {d}
    </span>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('Last 30 Days');

  useEffect(() => {
    api.get('/api/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#06b6d4', margin: '0 auto 12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const TOPIC_COLORS = ['#06b6d4', '#eab308', '#ef4444', '#06b6d4', '#f97316'];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold m-0" style={{ fontFamily: 'Syne, sans-serif', color: darkMode ? '#f1f5f9' : '#1e293b' }}>Dashboard</h1>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatCard label="Total Interviews" value={stats?.stats?.totalInterviews || 0} color="#06b6d4" icon={TrendingUp} darkMode={darkMode} />
        <StatCard label="Average Score" value={`${stats?.stats?.averageScore || 0}/10`} color="#eab308" icon={Target} darkMode={darkMode} />
        <StatCard label="Best Score" value={`${stats?.stats?.bestScore || 0}/10`} color="#22c55e" icon={Award} darkMode={darkMode} />
        <StatCard label="Weak Topics" value={stats?.stats?.weakTopicsCount || 0} color="#f97316" icon={AlertTriangle} darkMode={darkMode} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-4 sm:gap-5 mb-4 sm:mb-6">
        {/* Score trend */}
        <div className="p-4 sm:p-6" style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-5">
            <h3 className="text-sm sm:text-base font-bold m-0" style={{ fontFamily: 'Syne, sans-serif', color: darkMode ? '#f1f5f9' : '#1e293b' }}>Score Improvement</h3>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="text-xs sm:text-[13px] self-start sm:self-auto"
              style={{ color: darkMode ? '#94a3b8' : '#64748b', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, borderRadius: 8, padding: '4px 8px', outline: 'none', background: darkMode ? '#0f172a' : undefined }}
            >
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>All Time</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats?.scoreHistory || []}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }}
                formatter={val => [`${val}/10`, 'Score']}
              />
              <Area type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ fill: '#06b6d4', r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Topic performance */}
        <div className="p-4 sm:p-6" style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm sm:text-base font-bold mb-4 sm:mb-5" style={{ fontFamily: 'Syne, sans-serif', color: darkMode ? '#f1f5f9' : '#1e293b', margin: '0 0 20px' }}>Topic Performance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.topicPerformance || []} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }}
                formatter={val => [`${val}/10`, 'Score']}
              />
              <Bar dataKey="avgScore" radius={[6, 6, 0, 0]}>
                {(stats?.topicPerformance || []).map((entry, i) => (
                  <Cell key={i} fill={entry.avgScore < 6 ? '#ef4444' : TOPIC_COLORS[i % TOPIC_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent sessions */}
      <div className="p-4 sm:p-6" style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h3 className="text-sm sm:text-base font-bold m-0" style={{ fontFamily: 'Syne, sans-serif', color: darkMode ? '#f1f5f9' : '#1e293b' }}>Recent Sessions</h3>
          <button
            onClick={() => navigate('/history')}
            className="min-h-[44px] flex items-center gap-1 px-3 sm:px-3.5 text-xs sm:text-[13px] font-medium"
            style={{ background: darkMode ? '#1e293b' : 'white', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, borderRadius: 10, cursor: 'pointer', color: darkMode ? '#94a3b8' : '#475569' }}
          >
            View All <ChevronRight size={14} />
          </button>
        </div>

        {/* Mobile card view */}
        <div className="block sm:hidden">
          {(stats?.recentSessions || []).length === 0 && (
            <div className="text-center py-10 text-sm" style={{ color: '#94a3b8' }}>
              No sessions yet.{' '}
              <button onClick={() => navigate('/start-interview')} style={{ color: '#06b6d4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: 14 }}>
                Start your first interview →
              </button>
            </div>
          )}
          {(stats?.recentSessions || []).map((session) => (
            <div key={session._id} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-b-0">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm shrink-0" style={{ background: darkMode ? '#334155' : '#f1f5f9' }}>💼</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}>{session.role}</div>
                <div className="flex items-center gap-2 mt-1">
                  <DifficultyBadge d={session.difficulty} />
                  <span className="text-[11px]" style={{ color: '#94a3b8' }}>
                    {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-base font-bold" style={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}>{session.score}/10</div>
              </div>
              <button
                onClick={() => navigate(`/history/${session._id}`)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <ChevronRight size={18} color="#cbd5e1" />
              </button>
            </div>
          ))}
        </div>

        {/* Desktop table view */}
        <div className="hidden sm:block overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${darkMode ? '#334155' : '#f1f5f9'}` }}>
                {['ROLE CONTEXT', 'DIFFICULTY', 'SCORE', 'DATE', 'ACTION'].map(h => (
                  <th key={h} style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textAlign: 'left', padding: '0 8px 12px', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(stats?.recentSessions || []).length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: 14 }}>
                    No sessions yet.{' '}
                    <button onClick={() => navigate('/start-interview')} style={{ color: '#06b6d4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: 14 }}>
                      Start your first interview →
                    </button>
                  </td>
                </tr>
              )}
              {(stats?.recentSessions || []).map((session, i) => (
                <tr key={session._id} style={{ borderBottom: i < stats.recentSessions.length - 1 ? `1px solid ${darkMode ? '#334155' : '#f1f5f9'}` : 'none' }}>
                  <td style={{ padding: '14px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: darkMode ? '#334155' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>💼</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: darkMode ? '#f1f5f9' : '#1e293b' }}>{session.role}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{session.difficulty === 'EASY' ? 'Fresher' : session.difficulty === 'HARD' ? 'Experienced' : 'Mid'} Level</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 8px' }}><DifficultyBadge d={session.difficulty} /></td>
                  <td style={{ padding: '14px 8px', fontWeight: 700, fontSize: 15, color: darkMode ? '#f1f5f9' : '#1e293b' }}>{session.score}/10</td>
                  <td style={{ padding: '14px 8px', fontSize: 13, color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={13} />
                      {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td style={{ padding: '14px 8px' }}>
                    <button
                      onClick={() => navigate(`/history/${session._id}`)}
                      className="min-h-[44px]"
                      style={{ background: darkMode ? '#1e293b' : 'white', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 500, color: darkMode ? '#94a3b8' : '#475569', whiteSpace: 'nowrap' }}
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
