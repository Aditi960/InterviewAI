import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { Search, Bell, Plus, FileText, Database, Layers } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'

const ROLE_ICONS = {
  'Frontend Developer': FileText,
  'Backend Engineer': Database,
  'Full Stack Developer': Layers,
}

const DiffBadge = ({ difficulty }) => {
  const map = {
    easy: 'badge-easy',
    medium: 'badge-medium',
    hard: 'badge-hard',
  }
  return <span className={map[difficulty] || 'badge-easy'}>{difficulty}</span>
}

const StatCard = ({ icon, iconBg, value, label }) => (
  <div className="stat-card animate-slide-up">
    <div className={`stat-icon ${iconBg}`} />
    <div>
      <p className="font-display font-bold text-3xl text-gray-800">{value}</p>
      <p className="text-gray-500 text-sm mt-0.5">{label}</p>
    </div>
  </div>
)

export default function DashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('Last 30 Days')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/dashboard/stats')
        setStats(data)
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const scoreChartData = stats?.scoreHistory?.map((s, i) => ({
    name: `Interview ${i + 1}`,
    score: s.score,
  })) || []

  const topicChartData = stats?.topicPerformance?.slice(0, 6).map(t => ({
    topic: t.topic.replace(' ', '\n'),
    score: t.avgScore,
    fill: t.isWeak ? '#f87171' : t.avgScore >= 8 ? '#00e5ff' : '#fbbf24',
  })) || []

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-brand-cyan/20 rounded-xl mx-auto animate-pulse" />
          <p className="text-gray-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-cyan w-56 font-body"
              placeholder="Search sessions, topics..."
            />
          </div>
          <button className="relative w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:border-gray-300 transition-colors">
            <Bell size={16} className="text-gray-500" />
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-400 rounded-full" />
          </button>
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} className="w-10 h-10 rounded-xl object-cover" alt="avatar" />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-brand-cyan to-blue-400 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <Link to="/start" className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
            <Plus size={16} />
            Start New Interview
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        <StatCard
          iconBg="bg-sky-100"
          value={stats?.stats.totalInterviews || 0}
          label="Total Interviews"
        />
        <StatCard
          iconBg="bg-amber-100"
          value={`${stats?.stats.averageScore || 0}/10`}
          label="Average Score"
        />
        <StatCard
          iconBg="bg-sky-50"
          value={`${stats?.stats.bestScore || 0}/10`}
          label="Best Score"
        />
        <StatCard
          iconBg="bg-amber-400"
          value={stats?.stats.weakTopicsCount || 0}
          label="Weak Topics"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-5 gap-5 mb-6">
        {/* Score Improvement */}
        <div className="card col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-gray-800 text-lg">Score Improvement</h2>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-cyan font-body bg-white"
            >
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>All Time</option>
            </select>
          </div>
          {scoreChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={scoreChartData}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontFamily: 'DM Sans' }}
                  formatter={(v) => [`${v}/10`, 'Score']}
                />
                <Area type="monotone" dataKey="score" stroke="#00e5ff" strokeWidth={2.5} fill="url(#scoreGradient)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 text-sm">No interview data yet</p>
                <Link to="/start" className="text-brand-cyan text-sm font-medium mt-1 block hover:underline">Start your first interview →</Link>
              </div>
            </div>
          )}
        </div>

        {/* Topic Performance */}
        <div className="card col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-gray-800 text-lg">Topic Performance</h2>
          </div>
          {topicChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topicChartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                <XAxis dataKey="topic" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontFamily: 'DM Sans' }}
                  formatter={(v) => [`${v}/10`, 'Avg Score']}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {topicChartData.map((entry, idx) => (
                    <rect key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-gray-400 text-sm text-center">Complete interviews to see topic analytics</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-gray-800 text-lg">Recent Sessions</h2>
          <Link to="/history" className="btn-secondary py-2 px-4 text-sm">View All</Link>
        </div>

        {stats?.recentSessions?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Role Context</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Difficulty</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Score</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentSessions.map((s) => {
                  const Icon = ROLE_ICONS[s.role] || FileText
                  return (
                    <tr key={s._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Icon size={16} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{s.role}</p>
                            <p className="text-xs text-gray-400">{s.experienceLevel} Level</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4"><DiffBadge difficulty={s.difficulty} /></td>
                      <td className="py-4">
                        <span className="font-display font-bold text-gray-800">{s.score?.toFixed(1)}/10</span>
                      </td>
                      <td className="py-4 text-sm text-gray-500">
                        {format(new Date(s.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="py-4">
                        <Link
                          to={`/report/${s._id}`}
                          className="btn-secondary py-1.5 px-4 text-xs"
                        >
                          View Report
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-400 text-sm mb-3">No interviews completed yet</p>
            <Link to="/start" className="btn-primary text-sm py-2.5 px-6 inline-flex items-center gap-2">
              <Plus size={14} />
              Start Your First Interview
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
