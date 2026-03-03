import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import api from '../lib/api'

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/topic-breakdown'),
    ]).then(([statsRes, breakdownRes]) => {
      setData({ ...statsRes.data, breakdown: breakdownRes.data.breakdown })
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-brand-cyan/20 rounded-xl mx-auto animate-pulse" />
          <p className="text-gray-500 text-sm">Crunching your data...</p>
        </div>
      </div>
    )
  }

  const scoreHistory = data?.scoreHistory?.map((s, i) => ({
    name: `#${i + 1}`,
    score: s.score,
    role: s.role,
  })) || []

  const topicData = data?.topicPerformance?.map(t => ({
    topic: t.topic,
    avg: t.avgScore,
    count: t.count,
    fill: t.isWeak ? '#f87171' : '#00e5ff',
  })) || []

  const radarData = data?.topicPerformance?.map(t => ({
    topic: t.topic,
    score: t.avgScore,
  })) || []

  const weakTopics = data?.topicPerformance?.filter(t => t.isWeak) || []

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-800">Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Detailed breakdown of your interview performance</p>
      </div>

      {/* Summary pills */}
      <div className="flex gap-4 mb-8 flex-wrap">
        {[
          { label: 'Total Interviews', value: data?.stats.totalInterviews || 0, color: 'bg-sky-100 text-sky-700' },
          { label: 'Average Score', value: `${data?.stats.averageScore || 0}/10`, color: 'bg-amber-100 text-amber-700' },
          { label: 'Best Score', value: `${data?.stats.bestScore || 0}/10`, color: 'bg-emerald-100 text-emerald-700' },
          { label: 'Weak Topics', value: data?.stats.weakTopicsCount || 0, color: 'bg-red-100 text-red-600' },
        ].map(s => (
          <div key={s.label} className={`${s.color} px-5 py-3 rounded-xl`}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="font-display font-bold text-2xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Score trend */}
        <div className="card">
          <h2 className="font-display font-bold text-lg text-gray-800 mb-4">Score Trend</h2>
          {scoreHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontFamily: 'DM Sans', fontSize: '12px' }} />
                <Line type="monotone" dataKey="score" stroke="#00e5ff" strokeWidth={2.5} dot={{ fill: '#00e5ff', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>}
        </div>

        {/* Radar */}
        <div className="card">
          <h2 className="font-display font-bold text-lg text-gray-800 mb-4">Skill Coverage</h2>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#f0f0f0" />
                <PolarAngleAxis dataKey="topic" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Radar dataKey="score" stroke="#00e5ff" fill="#00e5ff" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontFamily: 'DM Sans', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Complete more interviews</div>}
        </div>
      </div>

      {/* Topic bar chart */}
      <div className="card mb-5">
        <h2 className="font-display font-bold text-lg text-gray-800 mb-4">Topic Performance</h2>
        {topicData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topicData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="topic" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontFamily: 'DM Sans', fontSize: '12px' }} />
              <Bar dataKey="avg" radius={[4, 4, 0, 0]} fill="#00e5ff" />
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="h-32 flex items-center justify-center text-gray-400 text-sm">No topic data</div>}
      </div>

      {/* Weak topics */}
      {weakTopics.length > 0 && (
        <div className="card border-l-4 border-red-300">
          <h2 className="font-display font-bold text-lg text-red-600 mb-3">⚠️ Focus Areas</h2>
          <p className="text-gray-500 text-sm mb-4">These topics need improvement (score below 6/10)</p>
          <div className="grid grid-cols-3 gap-3">
            {weakTopics.map(t => (
              <div key={t.topic} className="bg-red-50 border border-red-100 rounded-xl p-3">
                <p className="font-medium text-red-700 text-sm">{t.topic}</p>
                <p className="text-2xl font-display font-bold text-red-500 mt-1">{t.avgScore}/10</p>
                <p className="text-xs text-red-400 mt-0.5">across {t.count} interview{t.count !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
