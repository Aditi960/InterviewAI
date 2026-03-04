import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Vapi from '@vapi-ai/web';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Upload, Mic, MicOff, ChevronRight, ChevronLeft, Send, Clock, Volume2, VolumeX } from 'lucide-react';
import useVoiceRecorder from '../hooks/useVoiceRecorder';

const ROLES = ['Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 'DevOps Engineer', 'Data Scientist'];
const DIFFICULTIES = [
  { key: 'EASY', label: 'Easy', desc: 'Fresher level, fundamentals', color: '#06b6d4' },
  { key: 'MEDIUM', label: 'Medium', desc: 'Intermediate, practical mix', color: '#eab308' },
  { key: 'HARD', label: 'Hard', desc: 'Senior level, system design', color: '#ef4444' },
];

const StartInterview = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timer, setTimer] = useState(0);
  const [muted, setMuted] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const vapiRef = useRef(null);

  useEffect(() => {
    vapiRef.current = new Vapi(import.meta.env.VITE_VAPI_API_KEY);
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  // ── Groq Whisper voice recorder (works in Brave, no Google dependency) ─────
  const { isRecording, isTranscribing, toggleRecording, stopRecording } = useVoiceRecorder({
    onTranscript: (text) => {
      setCurrentAnswer(prev => prev ? `${prev.trimEnd()} ${text}` : text);
    },
  });

  useEffect(() => {
    if (step === 2) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => {
      clearInterval(timerRef.current);
      stopRecording();
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, [step]);

  useEffect(() => {
    if (!session) return;
    const question = session.questions[currentQ]?.question;
    if (!question) return;

    if (vapiRef.current) {
      vapiRef.current.stop();
    }
    console.log('Vapi key:', import.meta.env.VITE_VAPI_API_KEY);
    console.log('Vapi instance:', vapiRef.current);
    console.log('Question to speak:', session?.questions[currentQ]?.question);
    if (!muted) {
      vapiRef.current?.say(session.questions[currentQ]?.question, true);
    }
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, [currentQ, session, muted]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const startInterview = async () => {
    if (!role) return toast.error('Select a role');
    if (!difficulty) return toast.error('Select difficulty');
    setLoading(true);
    try {
      const res = await api.post('/api/interviews/start', { role, difficulty });
      setSession(res.data);
      setAnswers(new Array(res.data.questions.length).fill(''));
      setStep(2);
    } catch (err) {
      toast.error(err.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = () => {
    stopRecording();
    const newAnswers = [...answers];
    newAnswers[currentQ] = currentAnswer;
    setAnswers(newAnswers);
    if (currentQ < session.questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setCurrentAnswer(newAnswers[currentQ + 1] || '');
    }
  };

  const goToQuestion = (index) => {
    stopRecording();
    const newAnswers = [...answers];
    newAnswers[currentQ] = currentAnswer;
    setAnswers(newAnswers);
    setCurrentQ(index);
    setCurrentAnswer(newAnswers[index] || '');
  };

  const submitInterview = async () => {
    stopRecording();
    const finalAnswers = [...answers];
    finalAnswers[currentQ] = currentAnswer;
    setLoading(true);
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    try {
      const res = await api.post('/api/interviews/submit', {
        sessionId: session.sessionId,
        answers: finalAnswers,
        duration,
      });
      toast.success(`Interview complete! Score: ${res.data.score}/10`);
      navigate(`/history/${session.sessionId}`);
    } catch (err) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 1: Setup ─────────────────────────────────────────────────────────

  if (step === 1) return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
        Start New Interview
      </h1>
      <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 32 }}>
        Select your role and difficulty to get AI-generated interview questions.
      </p>

      {/* Role */}
      <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 16, color: '#1e293b' }}>
          1. Select Role
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {ROLES.map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              style={{
                padding: '10px 18px', borderRadius: 12,
                border: `2px solid ${role === r ? '#06b6d4' : '#e2e8f0'}`,
                background: role === r ? '#e0f7fa' : 'white',
                color: role === r ? '#0891b2' : '#475569',
                fontSize: 14, fontWeight: role === r ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 16, color: '#1e293b' }}>
          2. Select Difficulty
        </h3>
        <div style={{ display: 'flex', gap: 12 }}>
          {DIFFICULTIES.map(({ key, label, desc, color }) => (
            <button
              key={key}
              onClick={() => setDifficulty(key)}
              style={{
                flex: 1, padding: '16px', borderRadius: 14,
                border: `2px solid ${difficulty === key ? color : '#e2e8f0'}`,
                background: difficulty === key ? `${color}15` : 'white',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s', fontFamily: 'inherit',
              }}
            >
              <div style={{ fontWeight: 700, color: difficulty === key ? color : '#1e293b', marginBottom: 4, fontSize: 14 }}>
                {label}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Resume */}
      <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 4, color: '#1e293b' }}>
          3. Upload Resume{' '}
          <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: 13 }}>(Optional)</span>
        </h3>
        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
          PDF format, used to personalise questions to your experience.
        </p>
        <label
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 8, padding: '24px', border: '2px dashed #e2e8f0',
            borderRadius: 12, cursor: 'pointer', background: '#fafafa',
          }}
        >
          <Upload size={24} color="#06b6d4" />
          <span style={{ fontSize: 14, color: '#64748b' }}>
            {resumeFile ? resumeFile.name : 'Click to upload PDF'}
          </span>
          <input
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={e => setResumeFile(e.target.files[0])}
          />
        </label>
      </div>

      <button
        onClick={startInterview}
        disabled={loading || !role || !difficulty}
        style={{
          width: '100%',
          background: (!role || !difficulty || loading) ? '#94a3b8' : '#06b6d4',
          color: 'white', border: 'none', borderRadius: 14, padding: '15px',
          fontSize: 16, fontWeight: 600,
          cursor: (!role || !difficulty || loading) ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, fontFamily: 'inherit',
        }}
      >
        {loading ? 'Generating Questions...' : 'Start Interview'} <ChevronRight size={18} />
      </button>
    </div>
  );

  // ─── Step 2: Interview ─────────────────────────────────────────────────────

  if (step === 2 && session) {
    const questions = session.questions;
    const progress = ((currentQ + 1) / questions.length) * 100;

    return (
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Interview in Progress
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 13, margin: '4px 0 0' }}>{role} · {difficulty}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', borderRadius: 12, padding: '8px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <Clock size={16} color="#06b6d4" />
            <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
              {formatTime(timer)}
            </span>
            <button
              onClick={() => setMuted(m => !m)}
              title={muted ? 'Unmute question voice' : 'Mute question voice'}
              aria-label={muted ? 'Unmute question voice' : 'Mute question voice'}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', padding: 4,
              }}
            >
              {muted ? <VolumeX size={16} color="#94a3b8" /> : <Volume2 size={16} color="#06b6d4" />}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ background: 'white', borderRadius: 16, padding: '14px 20px', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>
            Question {currentQ + 1} of {questions.length}
          </span>
          <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#06b6d4', borderRadius: 3, transition: 'width 0.3s ease' }} />
          </div>
          <span style={{ fontSize: 13, color: '#94a3b8', whiteSpace: 'nowrap' }}>{Math.round(progress)}%</span>
        </div>

        {/* Question */}
        <div style={{ background: 'white', borderRadius: 16, padding: 28, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#e0f7fa', color: '#0891b2', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, marginBottom: 16, letterSpacing: '0.04em' }}>
            Q{currentQ + 1} · {questions[currentQ]?.topic}
          </div>
          <p style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', lineHeight: 1.5, margin: 0 }}>
            {questions[currentQ]?.question}
          </p>
        </div>

        {/* Answer */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>Your Answer</label>
            <button
              onClick={toggleRecording}
              disabled={isTranscribing}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 10, border: 'none',
                background: isTranscribing ? '#f1f5f9' : isRecording ? '#fef2f2' : '#e0f7fa',
                color: isTranscribing ? '#94a3b8' : isRecording ? '#ef4444' : '#0891b2',
                fontSize: 13, fontWeight: 600,
                cursor: isTranscribing ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              {isTranscribing
                ? <>⏳ Transcribing...</>
                : isRecording
                  ? <><MicOff size={14} /> Stop Recording</>
                  : <><Mic size={14} /> Use Voice</>
              }
            </button>
          </div>

          {/* Recording indicator */}
          {isRecording && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '8px 12px', background: '#fef2f2', borderRadius: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s ease-in-out infinite', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 500 }}>
                Recording… click "Stop Recording" when done.
              </span>
            </div>
          )}

          {/* Transcribing indicator */}
          {isTranscribing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '8px 12px', background: '#f0f9ff', borderRadius: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4', animation: 'pulse 1s ease-in-out infinite', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#0891b2', fontWeight: 500 }}>
                Transcribing your audio via Groq Whisper…
              </span>
            </div>
          )}

          <textarea
            value={currentAnswer}
            onChange={e => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here, or click 'Use Voice' to speak…"
            rows={6}
            style={{
              width: '100%', padding: '14px', borderRadius: 12,
              border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none',
              fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6,
              boxSizing: 'border-box', color: '#1e293b',
            }}
          />
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
            💡 Click "Use Voice" → speak → click "Stop Recording". Groq Whisper will transcribe it.
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => goToQuestion(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '12px 20px', borderRadius: 12,
              border: '1.5px solid #e2e8f0', background: 'white',
              fontSize: 14, fontWeight: 500,
              cursor: currentQ === 0 ? 'not-allowed' : 'pointer',
              color: currentQ === 0 ? '#cbd5e1' : '#475569',
              fontFamily: 'inherit',
            }}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          {currentQ < questions.length - 1 ? (
            <button
              onClick={saveAnswer}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 6, padding: '12px 20px', borderRadius: 12, border: 'none',
                background: '#06b6d4', color: 'white', fontSize: 14,
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Next Question <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={submitInterview}
              disabled={loading}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '12px 20px', borderRadius: 12, border: 'none',
                background: loading ? '#94a3b8' : '#22c55e', color: 'white',
                fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Evaluating…' : <><Send size={16} /> Submit & Get Results</>}
            </button>
          )}
        </div>

        {/* Question dot nav */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => goToQuestion(i)}
              title={`Question ${i + 1}`}
              style={{
                width: i === currentQ ? 24 : 8, height: 8, borderRadius: 4,
                border: 'none',
                background: i === currentQ ? '#06b6d4' : answers[i] ? '#06b6d466' : '#e2e8f0',
                cursor: 'pointer', transition: 'all 0.2s', padding: 0,
              }}
            />
          ))}
        </div>

      </div>
    );
  }

  return null;
};

export default StartInterview;