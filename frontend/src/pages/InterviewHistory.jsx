import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../lib/api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Calendar, ChevronRight, ArrowLeft, CheckCircle, XCircle, Lightbulb, Clock } from 'lucide-react';

const DiffBadge = ({ d }) => {
  const map = { EASY: ['#06b6d4', '#e0f7fa'], MEDIUM: ['#eab308', '#fefce8'], HARD: ['#ef4444', '#fef2f2'] };
  const [c, bg] = map[d] || ['#94a3b8', '#f1f5f9'];
  return <span style={{ background: bg, color: c, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700 }}>{d}</span>;
};

const ScoreRing = ({ score }) => {
  const r = 40, circ = 2 * Math.PI * r;
  const dash = (score / 10) * circ;
  const color = score >= 8 ? '#22c55e' : score >= 6 ? '#06b6d4' : score >= 4 ? '#eab308' : '#ef4444';
  return (
    <svg width={100} height={100} viewBox="0 0 100 100">
      <circle cx={50} cy={50} r={r} fill="none" stroke="#f1f5f9" strokeWidth={8} />
      <circle cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dasharray 1s ease' }} />
      <text x={50} y={50} textAnchor="middle" dy="0.35em" fontSize={18} fontWeight={700} fill={color}>{score}</text>
    </svg>
  );
};

// Session Detail view
const SessionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { darkMode } = useTheme();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('SessionDetail route id:', id);
    if (!id) {
      console.log('SessionDetail: missing id, skipping API call');
      setLoading(false);
      return;
    }

    console.log('SessionDetail fetching API with id:', id);
    api.get(`/api/interviews/${id}`)
      .then(res => setSession(res.data))
      .catch(() => toast.error('Failed to load session'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading report...</div>;
  if (!session) return <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Session not found.</div>;

  return (
    <div className="max-w-[800px] mx-auto">
      <button onClick={() => navigate('/history')} className="flex items-center gap-1.5 mb-4 sm:mb-5 min-h-[44px] text-sm" style={{ background: 'none', border: 'none', color: darkMode ? '#94a3b8' : '#64748b', cursor: 'pointer', fontFamily: 'inherit' }}>
        <ArrowLeft size={16} /> Back to History
      </button>

      {/* Header card */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-5 sm:p-7 mb-4 sm:mb-5" style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <ScoreRing score={session.score} />
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-lg sm:text-[22px] font-bold mb-1.5" style={{ fontFamily: 'Syne, sans-serif', color: darkMode ? '#f1f5f9' : '#1e293b', margin: '0 0 6px' }}>{session.role}</h2>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-2.5 mb-2">
            <DiffBadge d={session.difficulty} />
            <span className="text-xs sm:text-[13px] flex items-center gap-1" style={{ color: '#94a3b8' }}>
              <Calendar size={13} />
              {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            {session.duration > 0 && (
              <span className="text-xs sm:text-[13px] flex items-center gap-1" style={{ color: '#94a3b8' }}>
                <Clock size={13} />
                {Math.floor(session.duration / 60)}m {session.duration % 60}s
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed m-0" style={{ color: '#64748b' }}>{session.feedback?.summary}</p>
        </div>
      </div>

      {/* Feedback */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5">
        {[
          { title: 'Strengths', items: session.feedback?.strengths, color: '#22c55e', bg: '#f0fdf4', icon: CheckCircle },
          { title: 'Weaknesses', items: session.feedback?.weaknesses, color: '#ef4444', bg: '#fef2f2', icon: XCircle },
          { title: 'Improvements', items: session.feedback?.improvements, color: '#f97316', bg: '#fff7ed', icon: Lightbulb },
        ].map(({ title, items, color, bg, icon: Icon }) => (
          <div key={title} className="p-4 sm:p-5" style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-3 sm:mb-3.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon size={16} color={color} />
              </div>
              <span className="text-sm font-bold" style={{ fontFamily: 'Syne, sans-serif', color: darkMode ? '#f1f5f9' : '#1e293b' }}>{title}</span>
            </div>
            <ul className="m-0 pl-4">
              {(items || []).map((item, i) => (
                <li key={i} className="text-xs sm:text-[13px] mb-1" style={{ color: darkMode ? '#94a3b8' : '#475569', lineHeight: 1.6 }}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Topic analysis */}
      {session.topicAnalysis?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 mb-4 sm:mb-5" style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div>
            <h3 className="text-sm sm:text-[15px] font-bold mb-3 sm:mb-4" style={{ fontFamily: 'Syne, sans-serif', color: darkMode ? '#f1f5f9' : '#1e293b' }}>Topic Scores</h3>
            {session.topicAnalysis.map(t => (
              <div key={t.name || t.topic} className="mb-3 sm:mb-3.5">
                <div className="flex justify-between mb-1">
                  <span className="text-xs sm:text-[13px] font-medium" style={{ color: darkMode ? '#94a3b8' : '#475569' }}>{t.name || t.topic}</span>
                  <span className="text-xs sm:text-[13px] font-bold" style={{ color: t.score < 6 ? '#ef4444' : '#22c55e' }}>{t.score}/10</span>
                </div>
                <div style={{ height: 6, background: darkMode ? '#334155' : '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(t.score / 10) * 100}%`, background: t.score < 6 ? '#ef4444' : '#06b6d4', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={session.topicAnalysis.map(t => ({ topic: t.name || t.topic, score: t.score }))}>
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis dataKey="topic" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Radar dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} dot={{ r: 3, fill: '#06b6d4' }} />
              <Tooltip formatter={v => [`${v}/10`, 'Score']} contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Q&A breakdown */}
      {session.questions?.length > 0 && (
        <div className="p-4 sm:p-6" style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm sm:text-[15px] font-bold mb-4 sm:mb-5" style={{ fontFamily: 'Syne, sans-serif', color: darkMode ? '#f1f5f9' : '#1e293b' }}>Question Breakdown</h3>
          {session.questions.map((q, i) => (
            <div key={i} style={{ borderBottom: i < session.questions.length - 1 ? `1px solid ${darkMode ? '#334155' : '#f1f5f9'}` : 'none', paddingBottom: i < session.questions.length - 1 ? 16 : 0, marginBottom: i < session.questions.length - 1 ? 16 : 0 }}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-3 mb-2">
                <div className="flex gap-2">
                  <span className="text-[11px] font-bold whitespace-nowrap px-2 py-0.5 rounded-md shrink-0" style={{ background: '#e0f7fa', color: '#0891b2' }}>Q{i + 1}</span>
                  <p className="m-0 text-sm font-semibold leading-relaxed" style={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}>{q.question}</p>
                </div>
                <span className="text-sm font-bold whitespace-nowrap self-end sm:self-auto" style={{ color: (q.score || 0) >= 7 ? '#22c55e' : '#ef4444' }}>{q.score || 0}/10</span>
              </div>
              {q.answer && <p className="text-xs sm:text-[13px] italic ml-0 sm:ml-9 mb-1.5" style={{ color: darkMode ? '#94a3b8' : '#64748b', lineHeight: 1.6, margin: q.answer ? '0 0 6px' : 0 }}>"{q.answer}"</p>}
              {q.evaluation && <p className="text-xs sm:text-[13px] ml-0 sm:ml-9 p-2 sm:p-[8px_12px] rounded-lg" style={{ color: darkMode ? '#94a3b8' : '#475569', lineHeight: 1.5, background: darkMode ? '#0f172a' : '#f8fafc', borderLeft: '3px solid #06b6d4', margin: 0 }}>{q.evaluation}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// History List view
const HistoryList = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    api.get(`/api/interviews/history?page=${page}&limit=10`)
      .then(res => { setSessions(res.data.sessions); setPagination(res.data.pagination); })
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading history...</div>;

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style={{ fontFamily: 'Syne, sans-serif', color: darkMode ? '#f1f5f9' : '#1e293b' }}>Interview History</h1>
      {sessions.length === 0 ? (
        <div className="p-10 sm:p-[60px] text-center" style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎤</div>
          <p className="text-sm sm:text-[15px]" style={{ color: '#94a3b8' }}>No interviews yet. <button onClick={() => navigate('/start-interview')} style={{ color: '#06b6d4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: 15 }}>Start your first!</button></p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:gap-3">
          {sessions.map(s => (
            <div key={s._id} onClick={() => navigate(`/dashboard/session/${s._id}`)}
              className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-[20px_24px]"
              style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-lg sm:text-xl shrink-0" style={{ background: darkMode ? '#334155' : '#f1f5f9' }}>💼</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm sm:text-[15px] font-bold mb-1 truncate" style={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}>{s.role}</div>
                <div className="flex items-center gap-2">
                  <DiffBadge d={s.difficulty} />
                  <span className="text-[11px] sm:text-xs hidden sm:inline" style={{ color: '#94a3b8' }}>{new Date(s.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-base sm:text-xl font-extrabold" style={{ color: s.score >= 7 ? '#22c55e' : s.score >= 5 ? '#eab308' : '#ef4444' }}>{s.score}/10</div>
                <div className="text-[10px] sm:text-[11px]" style={{ color: '#94a3b8' }}>Score</div>
              </div>
              <ChevronRight size={18} color="#cbd5e1" className="shrink-0 hidden sm:block" />
            </div>
          ))}
        </div>
      )}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className="min-w-[44px] min-h-[44px] sm:w-9 sm:h-9 rounded-lg text-sm font-semibold"
              style={{ border: `1.5px solid ${page === i + 1 ? '#06b6d4' : darkMode ? '#334155' : '#e2e8f0'}`, background: page === i + 1 ? '#06b6d4' : darkMode ? '#1e293b' : 'white', color: page === i + 1 ? 'white' : '#475569', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const InterviewHistory = () => {
  const { id } = useParams();
  return id ? <SessionDetail /> : <HistoryList />;
};

export default InterviewHistory;
