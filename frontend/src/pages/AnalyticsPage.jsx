import { useState, useEffect } from 'react';
import api from '../lib/api.js';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { Loader2, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard/stats')
      .then(d => setData(d.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <Loader2 size={28} className="animate-spin text-[#00D4E8]" />
    </div>
  );

  const difficultyData = data?.recentSessions?.reduce((acc, s) => {
    const idx = acc.findIndex(d => d.name === s.difficulty);
    if (idx >= 0) acc[idx].value++;
    else acc.push({ name: s.difficulty, value: 1 });
    return acc;
  }, []) || [];

  const pieColors = { EASY: '#00D4E8', MEDIUM: '#FFD166', HARD: '#FF6B6B' };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">Analytics</h1>
      <p className="text-gray-500 text-sm mb-7">Detailed insights into your interview performance.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Score trend */}
        <div className="card md:col-span-2">
          <h2 className="font-display font-semibold text-gray-900 mb-5">Score Trend</h2>
          {data?.scoreHistory?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.scoreHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4E8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D4E8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`${v}/10`, 'Score']} />
                <Area type="monotone" dataKey="score" stroke="#00D4E8" strokeWidth={2.5} fill="url(#grad2)"
                  dot={{ fill: '#00D4E8', r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <TrendingUp size={28} className="mb-2 opacity-40" />
              <p className="text-sm">Complete interviews to see trend data</p>
            </div>
          )}
        </div>

        {/* Topic performance */}
        <div className="card">
          <h2 className="font-display font-semibold text-gray-900 mb-5">Topic Averages</h2>
          {data?.topicPerformance?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.topicPerformance} layout="vertical" margin={{ left: 20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" horizontal={false} />
                <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={70} />
                <Tooltip formatter={(v) => [`${v}/10`, 'Avg Score']} />
                <Bar dataKey="avgScore" radius={[0, 6, 6, 0]} maxBarSize={20}>
                  {data.topicPerformance.map((entry, i) => (
                    <Cell key={i} fill={entry.isWeak ? '#FF6B6B' : '#00D4E8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data yet</div>}
        </div>

        {/* Difficulty distribution */}
        <div className="card">
          <h2 className="font-display font-semibold text-gray-900 mb-5">Difficulty Distribution</h2>
          {difficultyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {difficultyData.map((entry, i) => (
                    <Cell key={i} fill={pieColors[entry.name] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data yet</div>}
        </div>

        {/* Stats summary */}
        {data?.stats && (
          <div className="card md:col-span-2">
            <h2 className="font-display font-semibold text-gray-900 mb-5">Summary Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Sessions', val: data.stats.totalInterviews, color: '#00D4E8' },
                { label: 'Average Score', val: `${data.stats.averageScore}/10`, color: '#FFD166' },
                { label: 'Best Score', val: `${data.stats.bestScore}/10`, color: '#06d6a0' },
                { label: 'Weak Topics', val: data.stats.weakTopicsCount, color: '#FF6B6B' },
              ].map(({ label, val, color }, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="font-display font-bold text-2xl" style={{ color }}>{val}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
