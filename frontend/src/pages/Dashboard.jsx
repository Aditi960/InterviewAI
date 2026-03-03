import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { TrendingUp, Award, Target, AlertTriangle, Calendar, ChevronRight } from 'lucide-react';

const StatCard = ({ label, value, sub, color, icon: Icon }) => (
  <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 160 }}>
    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{label}</div>
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>Dashboard</h1>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard label="Total Interviews" value={stats?.totalInterviews || 0} color="#06b6d4" icon={TrendingUp} />
        <StatCard label="Average Score" value={`${stats?.averageScore || 0}/10`} color="#eab308" icon={Target} />
        <StatCard label="Best Score" value={`${stats?.bestScore || 0}/10`} color="#22c55e" icon={Award} />
        <StatCard label="Weak Topics" value={stats?.weakTopicsCount || 0} color="#f97316" icon={AlertTriangle} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginBottom: 24 }}>
        {/* Score trend */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#1e293b', margin: 0 }}>Score Improvement</h3>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              style={{ fontSize: 13, color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 8, padding: '4px 8px', outline: 'none' }}
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
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }}
                formatter={val => [`${val}/10`, 'Score']}
              />
              <Area type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ fill: '#06b6d4', r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Topic performance */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#1e293b', margin: '0 0 20px' }}>Topic Performance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.topicPerformance || []} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }}
                formatter={val => [`${val}/10`, 'Score']}
              />
              <Bar dataKey="average" radius={[6, 6, 0, 0]}>
                {(stats?.topicPerformance || []).map((entry, i) => (
                  <Cell key={i} fill={entry.average < 6 ? '#ef4444' : TOPIC_COLORS[i % TOPIC_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent sessions */}
      <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#1e293b', margin: 0 }}>Recent Sessions</h3>
          <button
            onClick={() => navigate('/history')}
            style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 500, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            View All <ChevronRight size={14} />
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
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
              <tr key={session.id} style={{ borderBottom: i < stats.recentSessions.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <td style={{ padding: '14px 8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>💼</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>{session.role}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{session.difficulty === 'EASY' ? 'Fresher' : session.difficulty === 'HARD' ? 'Experienced' : 'Mid'} Level</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 8px' }}><DifficultyBadge d={session.difficulty} /></td>
                <td style={{ padding: '14px 8px', fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{session.score}/10</td>
                <td style={{ padding: '14px 8px', fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={13} />
                  {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td style={{ padding: '14px 8px' }}>
                  <button
                    onClick={() => navigate(`/history/${session.id}`)}
                    style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 500, color: '#475569', whiteSpace: 'nowrap' }}
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
  );
};

export default Dashboard;
