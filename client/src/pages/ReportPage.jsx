import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import { CheckCircle, AlertCircle, ArrowUpRight, Trophy, Clock, ChevronDown } from 'lucide-react'
import api from '../lib/api'
import { format } from 'date-fns'

const ScoreRing = ({ score }) => {
  const pct = (score / 10) * 100
  const color = score >= 7 ? '#00e5ff' : score >= 5 ? '#fbbf24' : '#f87171'
  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="#f0f0f0" strokeWidth="10" />
        <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${pct * 3.14} 314`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-3xl text-gray-800">{score?.toFixed(1)}</span>
        <span className="text-gray-400 text-xs">/ 10</span>
      </div>
    </div>
  )
}

export default function ReportPage() {
  const { id } = useParams()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedQ, setExpandedQ] = useState(null)

  useEffect(() => {
    api.get(`/interviews/${id}`)
      .then(({ data }) => setSession(data.session))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-brand-cyan/20 rounded-xl mx-auto animate-pulse" />
          <p className="text-gray-500 text-sm">Loading your report...</p>
        </div>
      </div>
    )
  }

  if (!session) return <div className="p-8 text-gray-500">Report not found.</div>

  const radarData = session.topicAnalysis?.map(t => ({
    topic: t.topic,
    score: t.score,
  })) || []

  const scoreColor = session.score >= 7 ? 'text-emerald-600' : session.score >= 5 ? 'text-amber-500' : 'text-red-500'
  const scoreBg = session.score >= 7 ? 'bg-emerald-50' : session.score >= 5 ? 'bg-amber-50' : 'bg-red-50'

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <Link to="/history" className="hover:text-brand-cyan transition-colors">History</Link>
            <span>/</span>
            <span>{session.role}</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-800">Interview Report</h1>
          <p className="text-gray-400 text-sm mt-1">{format(new Date(session.createdAt), 'MMMM d, yyyy • h:mm a')}</p>
        </div>
        <Link to="/start" className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
          New Interview <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* Score overview */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        <div className={`card col-span-1 flex flex-col items-center justify-center ${scoreBg}`}>
          <Trophy size={20} className={scoreColor + ' mb-3'} />
          <ScoreRing score={session.score} />
          <p className="text-gray-500 text-sm mt-3">Overall Score</p>
        </div>

        <div className="card col-span-3">
          <h2 className="font-display font-bold text-lg text-gray-800 mb-3">Overall Feedback</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">{session.feedback?.overall}</p>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <CheckCircle size={12} className="text-emerald-500" /> Strengths
              </h3>
              <ul className="space-y-1.5">
                {session.feedback?.strengths?.map((s, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="text-emerald-400 mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertCircle size={12} className="text-red-400" /> Weaknesses
              </h3>
              <ul className="space-y-1.5">
                {session.feedback?.weaknesses?.map((w, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="text-red-400 mt-0.5">•</span> {w}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ArrowUpRight size={12} className="text-blue-400" /> Improvements
              </h3>
              <ul className="space-y-1.5">
                {session.feedback?.improvements?.map((imp, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="text-blue-400 mt-0.5">•</span> {imp}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Topic analysis + Radar */}
      <div className="grid grid-cols-5 gap-5 mb-6">
        <div className="card col-span-3">
          <h2 className="font-display font-bold text-lg text-gray-800 mb-4">Topic Breakdown</h2>
          <div className="space-y-3">
            {session.topicAnalysis?.map((t) => (
              <div key={t.topic}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 font-medium">{t.topic}</span>
                  <span className={`text-sm font-bold ${t.isWeak ? 'text-red-500' : 'text-gray-800'}`}>
                    {t.score}/10
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${t.isWeak ? 'bg-red-400' : t.score >= 8 ? 'bg-brand-cyan' : 'bg-amber-400'}`}
                    style={{ width: `${t.score * 10}%` }}
                  />
                </div>
                {t.feedback && <p className="text-xs text-gray-400 mt-1">{t.feedback}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="card col-span-2">
          <h2 className="font-display font-bold text-lg text-gray-800 mb-2">Skill Radar</h2>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#f0f0f0" />
                <PolarAngleAxis dataKey="topic" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Radar name="Score" dataKey="score" stroke="#00e5ff" fill="#00e5ff" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontFamily: 'DM Sans', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Q&A Review */}
      <div className="card">
        <h2 className="font-display font-bold text-lg text-gray-800 mb-4">Questions & Your Answers</h2>
        <div className="space-y-3">
          {session.questions?.map((q, i) => {
            const ans = session.answers?.find(a => a.questionIndex === i)
            return (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-gray-100 rounded-lg text-xs font-mono flex items-center justify-center text-gray-500 flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium text-gray-700 line-clamp-1">{q.question}</p>
                  </div>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform flex-shrink-0 ml-2 ${expandedQ === i ? 'rotate-180' : ''}`} />
                </button>
                {expandedQ === i && (
                  <div className="px-4 pb-4 border-t border-gray-50 pt-3 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Your Answer</p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {ans?.answer || <span className="text-gray-400 italic">No answer provided</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2">Expected Answer</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{q.expectedAnswer}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
