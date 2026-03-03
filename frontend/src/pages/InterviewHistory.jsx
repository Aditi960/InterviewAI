import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../lib/api';
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
const SessionDetail = ({ id }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/interviews/${id}`)
      .then(res => setSession(res.data))
      .catch(() => toast.error('Failed to load session'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading report...</div>;
  if (!session) return <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Session not found.</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <button onClick={() => navigate('/history')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748b', fontSize: 14, cursor: 'pointer', marginBottom: 20, fontFamily: 'inherit' }}>
        <ArrowLeft size={16} /> Back to History
      </button>

      {/* Header card */}
      <div style={{ background: 'white', borderRadius: 16, padding: 28, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 24 }}>
        <ScoreRing score={session.score} />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>{session.role}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <DiffBadge d={session.difficulty} />
            <span style={{ fontSize: 13, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={13} />
              {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            {session.duration > 0 && (
              <span style={{ fontSize: 13, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={13} />
                {Math.floor(session.duration / 60)}m {session.duration % 60}s
              </span>
            )}
          </div>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0, lineHeight: 1.5 }}>{session.feedback?.summary}</p>
        </div>
      </div>

      {/* Feedback */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
        {[
          { title: 'Strengths', items: session.feedback?.strengths, color: '#22c55e', bg: '#f0fdf4', icon: CheckCircle },
          { title: 'Weaknesses', items: session.feedback?.weaknesses, color: '#ef4444', bg: '#fef2f2', icon: XCircle },
          { title: 'Improvements', items: session.feedback?.improvements, color: '#f97316', bg: '#fff7ed', icon: Lightbulb },
        ].map(({ title, items, color, bg, icon: Icon }) => (
          <div key={title} style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={color} />
              </div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{title}</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {(items || []).map((item, i) => (
                <li key={i} style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, marginBottom: 4 }}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Topic analysis */}
      {session.topicAnalysis?.length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#1e293b', marginBottom: 16 }}>Topic Scores</h3>
            {session.topicAnalysis.map(t => (
              <div key={t.name} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>{t.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: t.score < 6 ? '#ef4444' : '#22c55e' }}>{t.score}/10</span>
                </div>
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(t.score / 10) * 100}%`, background: t.score < 6 ? '#ef4444' : '#06b6d4', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={session.topicAnalysis.map(t => ({ topic: t.name, score: t.score }))}>
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis dataKey="topic" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Radar dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} dot={{ r: 3, fill: '#06b6d4' }} />
              <Tooltip formatter={v => [`${v}/10`, 'Score']} contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Q&A breakdown */}
      {session.questions?.length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#1e293b', marginBottom: 20 }}>Question Breakdown</h3>
          {session.questions.map((q, i) => (
            <div key={i} style={{ borderBottom: i < session.questions.length - 1 ? '1px solid #f1f5f9' : 'none', paddingBottom: i < session.questions.length - 1 ? 20 : 0, marginBottom: i < session.questions.length - 1 ? 20 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 12 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ background: '#e0f7fa', color: '#0891b2', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>Q{i + 1}</span>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1e293b', lineHeight: 1.5 }}>{q.question}</p>
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: (q.score || 0) >= 7 ? '#22c55e' : '#ef4444', whiteSpace: 'nowrap' }}>{q.score || 0}/10</span>
              </div>
              {q.answer && <p style={{ margin: '0 0 6px 36px', fontSize: 13, color: '#64748b', lineHeight: 1.6, fontStyle: 'italic' }}>"{q.answer}"</p>}
              {q.evaluation && <p style={{ margin: '0 0 0 36px', fontSize: 13, color: '#475569', lineHeight: 1.5, background: '#f8fafc', padding: '8px 12px', borderRadius: 8, borderLeft: '3px solid #06b6d4' }}>{q.evaluation}</p>}
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
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 24 }}>Interview History</h1>
      {sessions.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 16, padding: '60px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎤</div>
          <p style={{ color: '#94a3b8', fontSize: 15 }}>No interviews yet. <button onClick={() => navigate('/start-interview')} style={{ color: '#06b6d4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: 15 }}>Start your first!</button></p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sessions.map(s => (
            <div key={s._id} onClick={() => navigate(`/history/${s._id}`)}
              style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'box-shadow 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'}
            >
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>💼</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', marginBottom: 4 }}>{s.role}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DiffBadge d={s.difficulty} />
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(s.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.score >= 7 ? '#22c55e' : s.score >= 5 ? '#eab308' : '#ef4444' }}>{s.score}/10</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Score</div>
              </div>
              <ChevronRight size={18} color="#cbd5e1" />
            </div>
          ))}
        </div>
      )}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              style={{ width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${page === i + 1 ? '#06b6d4' : '#e2e8f0'}`, background: page === i + 1 ? '#06b6d4' : 'white', color: page === i + 1 ? 'white' : '#475569', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit' }}
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
  return id ? <SessionDetail id={id} /> : <HistoryList />;
};

export default InterviewHistory;
