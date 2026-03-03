import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api.js';
import { format } from 'date-fns';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowLeft, Download, Award, TrendingUp, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';

const ScoreRing = ({ score, size = 100 }) => {
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 10) * circ;
  const color = score >= 8 ? '#00D4E8' : score >= 6 ? '#FFD166' : '#FF6B6B';

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#f0f0f5" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
        <text x="50" y="47" textAnchor="middle" fontFamily="DM Sans" fontSize="18" fontWeight="bold" fill="#1a1a2e">{score?.toFixed(1)}</text>
        <text x="50" y="60" textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize="9" fill="#9ca3af">/10</text>
      </svg>
    </div>
  );
};

export default function ReportPage() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/interviews/${sessionId}`)
      .then(data => setSession(data.session))
      .catch(e => setError(e.error || 'Failed to load report'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <Loader2 size={32} className="animate-spin text-[#00D4E8]" />
    </div>
  );

  if (error || !session) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error || 'Session not found'}</div>
    </div>
  );

  const radarData = session.topicAnalysis?.map(t => ({ subject: t.name, score: t.score, fullMark: 10 })) || [];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <Link to="/history" className="p-2 rounded-xl bg-white border border-gray-200 hover:border-gray-300 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display font-bold text-xl text-gray-900">Interview Report</h1>
          <p className="text-gray-500 text-sm">
            {session.role} · {session.difficulty} · {format(new Date(session.createdAt), 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Score overview */}
      <div className="card mb-5 flex flex-col md:flex-row items-center gap-8">
        <ScoreRing score={session.score} size={120} />
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
            <Award size={20} className="text-[#FFD166]" />
            <span className="font-display font-bold text-lg text-gray-900">
              {session.score >= 8 ? 'Excellent Performance!' : session.score >= 6 ? 'Good Job!' : 'Keep Practicing!'}
            </span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed max-w-md">
            {session.feedback?.summary}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 flex-shrink-0">
          {[
            { label: 'Score', val: `${session.score?.toFixed(1)}/10` },
            { label: 'Questions', val: session.questions?.length || 0 },
            { label: 'Topics', val: session.topicAnalysis?.length || 0 },
            { label: 'Duration', val: `~${Math.ceil((session.questions?.length || 0) * 2)}m` },
          ].map(({ label, val }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="font-display font-bold text-gray-900">{val}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="card border-l-4 border-[#00D4E8]">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-[#00D4E8]" />
            <h3 className="font-semibold text-sm text-gray-900">Strengths</h3>
          </div>
          <ul className="space-y-1.5">
            {session.feedback?.strengths?.map((s, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                <span className="text-[#00D4E8] mt-0.5">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="card border-l-4 border-[#FF6B6B]">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-[#FF6B6B]" />
            <h3 className="font-semibold text-sm text-gray-900">Weaknesses</h3>
          </div>
          <ul className="space-y-1.5">
            {session.feedback?.weaknesses?.map((s, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                <span className="text-[#FF6B6B] mt-0.5">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="card border-l-4 border-[#FFD166]">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-amber-500" />
            <h3 className="font-semibold text-sm text-gray-900">Improvements</h3>
          </div>
          <ul className="space-y-1.5">
            {session.feedback?.improvements?.map((s, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                <span className="text-amber-500 mt-0.5">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Topic breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Radar chart */}
        {radarData.length > 0 && (
          <div className="card">
            <h3 className="font-display font-semibold text-sm text-gray-900 mb-4">Topic Radar</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#f0f0f5" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Radar dataKey="score" stroke="#00D4E8" fill="#00D4E8" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip formatter={(val) => [`${val}/10`, 'Score']} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Topic scores list */}
        <div className="card">
          <h3 className="font-display font-semibold text-sm text-gray-900 mb-4">Topic Breakdown</h3>
          <div className="space-y-3">
            {session.topicAnalysis?.map((t, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">{t.name}</span>
                  <span className={`text-xs font-bold ${t.score >= 8 ? 'text-[#00D4E8]' : t.score >= 6 ? 'text-amber-500' : 'text-[#FF6B6B]'}`}>
                    {t.score}/10
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${t.score * 10}%`,
                      background: t.score >= 8 ? '#00D4E8' : t.score >= 6 ? '#FFD166' : '#FF6B6B',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Q&A Review */}
      {session.questions?.length > 0 && (
        <div className="card">
          <h3 className="font-display font-semibold text-sm text-gray-900 mb-5">Q&A Review</h3>
          <div className="space-y-5">
            {session.questions.map((q, i) => (
              <div key={i} className="border-b border-gray-50 last:border-0 pb-5 last:pb-0">
                <div className="flex items-start gap-3 mb-2">
                  <span className="w-6 h-6 rounded-lg bg-[#00D4E8]/10 text-[#00D4E8] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{q.question}</p>
                    <span className="text-xs text-gray-400">{q.topic}</span>
                  </div>
                </div>
                {session.answers?.[i]?.answer && (
                  <div className="ml-9 bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Your answer:</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{session.answers[i].answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Link to="/dashboard" className="btn-secondary flex items-center gap-2">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <Link to="/start-interview" className="btn-primary">
          Start New Interview
        </Link>
      </div>
    </div>
  );
}
