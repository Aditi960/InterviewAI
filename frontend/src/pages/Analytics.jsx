import React, { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const Analytics = () => {
  const { darkMode } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading analytics...</div>;

  const totalInterviews = stats?.stats?.totalInterviews ?? stats?.totalInterviews ?? 0;
  if (!stats || totalInterviews === 0) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
      <p style={{ color: '#94a3b8' }}>Complete at least one interview to see analytics.</p>
    </div>
  );

  const topicPerformance = (stats.topicPerformance || []).map(t => ({
    name: t.name || t.topic,
    average: t.average ?? t.avgScore,
    count: t.count,
    isWeak: (t.average ?? t.avgScore) < 6,
  }));

  const scoreHistory = (stats.scoreHistory || []).map((s, i) => ({
    ...s,
    label: s.label || `Interview ${i + 1}`,
  }));

  const PIE_COLORS = ['#06b6d4', '#eab308', '#ef4444', '#22c55e', '#f97316'];

  return (
    <div>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700, color: darkMode ? '#f1f5f9' : '#1e293b', marginBottom: 24 }}>Analytics</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: darkMode ? '#f1f5f9' : '#1e293b', marginBottom: 20 }}>Score Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={scoreHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 13 }} formatter={v => [`${v}/10`, 'Score']} />
              <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: darkMode ? '#f1f5f9' : '#1e293b', marginBottom: 20 }}>Topic Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={topicPerformance} dataKey="average" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                {topicPerformance.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={v => [`${v}/10`, 'Avg Score']} contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weak topics highlight */}
      {topicPerformance.filter(t => t.average < 6).length > 0 && (
        <div style={{ background: darkMode ? '#451a1a' : '#fef2f2', borderRadius: 16, padding: 20, border: darkMode ? '1px solid #7f1d1d' : '1px solid #fee2e2', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#ef4444', marginBottom: 12 }}>⚠️ Weak Topics (Score below 6/10)</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {topicPerformance.filter(t => t.average < 6).map(t => (
              <div key={t.name} style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 10, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: darkMode ? '#f1f5f9' : '#1e293b' }}>{t.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>{t.average}/10</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: darkMode ? '#f1f5f9' : '#1e293b', marginBottom: 20 }}>Topic Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={topicPerformance} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: '#475569' }} axisLine={false} tickLine={false} width={100} />
            <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 13 }} formatter={v => [`${v}/10`, 'Score']} />
            <Bar dataKey="average" radius={[0, 6, 6, 0]}>
              {topicPerformance.map((entry, i) => (
                <Cell key={i} fill={entry.average < 6 ? '#ef4444' : '#06b6d4'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
