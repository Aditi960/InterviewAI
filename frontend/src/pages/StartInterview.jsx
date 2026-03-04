import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Vapi from '@vapi-ai/web';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Upload, Mic, MicOff, ChevronRight, ChevronLeft, Send, Clock, Volume2, VolumeX } from 'lucide-react';
import useVoiceRecorder from '../hooks/useVoiceRecorder';
import { useTheme } from '../context/ThemeContext';

const ROLES = ['Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 'DevOps Engineer', 'Data Scientist'];
const DIFFICULTIES = [
  { key: 'EASY', label: 'Easy', desc: 'Fresher level, fundamentals', color: '#06b6d4' },
  { key: 'MEDIUM', label: 'Medium', desc: 'Intermediate, practical mix', color: '#eab308' },
  { key: 'HARD', label: 'Hard', desc: 'Senior level, system design', color: '#ef4444' },
];

const StartInterview = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
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
      vapiRef.current?.stop();
      vapiRef.current?.start({
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en",
        },
        model: {
          provider: "openai",
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `Read this question exactly, word for word, then stop: "${session.questions[currentQ]?.question}"`,
            },
          ],
        },
        voice: {
          provider: "elevenlabs",
          voiceId: "paula",
        },
        firstMessage: session.questions[currentQ]?.question,
        firstMessageMode: "assistant-speaks-first-with-model-generated-message",
      });
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
    <div className="max-w-[720px] mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif', color: darkMode ? '#f1f5f9' : '#1e293b' }}>
        Start New Interview
      </h1>
      <p className="text-sm sm:text-[15px] mb-6 sm:mb-8" style={{ color: '#94a3b8' }}>
        Select your role and difficulty to get AI-generated interview questions.
      </p>

      {/* Role */}
      <div className="p-4 sm:p-6 mb-4 sm:mb-5" style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h3 className="text-sm sm:text-[15px] font-bold mb-3 sm:mb-4" style={{ fontFamily: 'Syne, sans-serif', color: darkMode ? '#f1f5f9' : '#1e293b' }}>
          1. Select Role
        </h3>
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {ROLES.map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className="min-h-[44px] text-xs sm:text-sm"
              style={{
                padding: '10px 14px', borderRadius: 12,
                border: `2px solid ${darkMode ? (role === r ? '#06b6d4' : '#334155') : (role === r ? '#06b6d4' : '#e2e8f0')}`,
                background: darkMode ? (role === r ? '#164e63' : '#0f172a') : (role === r ? '#e0f7fa' : 'white'),
                color: role === r ? '#0891b2' : (darkMode ? '#94a3b8' : '#475569'),
                fontWeight: role === r ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="p-4 sm:p-6 mb-4 sm:mb-5" style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h3 className="text-sm sm:text-[15px] font-bold mb-3 sm:mb-4" style={{ fontFamily: 'Syne, sans-serif', color: darkMode ? '#f1f5f9' : '#1e293b' }}>
          2. Select Difficulty
        </h3>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {DIFFICULTIES.map(({ key, label, desc, color }) => (
            <button
              key={key}
              onClick={() => setDifficulty(key)}
              className="min-h-[44px]"
              style={{
                flex: 1, padding: '14px 16px', borderRadius: 14,
                border: `2px solid ${darkMode ? (difficulty === key ? color : '#334155') : (difficulty === key ? color : '#e2e8f0')}`,
                background: difficulty === key ? `${color}15` : (darkMode ? '#0f172a' : 'white'),
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s', fontFamily: 'inherit',
              }}
            >
              <div className="text-sm font-bold mb-1" style={{ color: difficulty === key ? color : (darkMode ? '#f1f5f9' : '#1e293b') }}>
                {label}
              </div>
              <div className="text-xs" style={{ color: '#94a3b8' }}>{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Resume */}
      <div className="p-4 sm:p-6 mb-5 sm:mb-7" style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h3 className="text-sm sm:text-[15px] font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif', color: darkMode ? '#f1f5f9' : '#1e293b' }}>
          3. Upload Resume{' '}
          <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: 13 }}>(Optional)</span>
        </h3>
        <p className="text-xs sm:text-[13px] mb-3 sm:mb-4" style={{ color: '#94a3b8' }}>
          PDF format, used to personalise questions to your experience.
        </p>
        <label
          className="flex flex-col items-center gap-2 p-5 sm:p-6 cursor-pointer"
          style={{
            border: `2px dashed ${darkMode ? '#334155' : '#e2e8f0'}`,
            borderRadius: 12, background: darkMode ? '#0f172a' : '#fafafa',
          }}
        >
          <Upload size={24} color="#06b6d4" />
          <span className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
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
        className="w-full min-h-[48px] text-sm sm:text-base font-semibold"
        style={{
          background: (!role || !difficulty || loading) ? '#94a3b8' : '#06b6d4',
          color: 'white', border: 'none', borderRadius: 14, padding: '15px',
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
      <div className="max-w-[760px] mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-[22px] font-bold m-0" style={{ fontFamily: 'Syne, sans-serif', color: darkMode ? '#f1f5f9' : '#1e293b' }}>
              Interview in Progress
            </h2>
            <p className="text-xs sm:text-[13px] mt-1" style={{ color: '#94a3b8' }}>{role} · {difficulty}</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto" style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 12, padding: '8px 12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <Clock size={16} color="#06b6d4" />
            <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: darkMode ? '#f1f5f9' : '#1e293b' }}>
              {formatTime(timer)}
            </span>
            <button
              onClick={() => setMuted(m => !m)}
              title={muted ? 'Unmute question voice' : 'Mute question voice'}
              aria-label={muted ? 'Unmute question voice' : 'Mute question voice'}
              className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 4,
              }}
            >
              {muted ? <VolumeX size={16} color="#94a3b8" /> : <Volume2 size={16} color="#06b6d4" />}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-[14px_20px] mb-4 sm:mb-5" style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <span className="text-xs sm:text-[13px] font-medium whitespace-nowrap" style={{ color: '#64748b' }}>
            Q {currentQ + 1}/{questions.length}
          </span>
          <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#06b6d4', borderRadius: 3, transition: 'width 0.3s ease' }} />
          </div>
          <span className="text-xs sm:text-[13px] whitespace-nowrap" style={{ color: '#94a3b8' }}>{Math.round(progress)}%</span>
        </div>

        {/* Question */}
        <div className="p-4 sm:p-7 mb-4 sm:mb-5" style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="inline-flex items-center gap-1.5 mb-3 sm:mb-4 text-xs font-semibold tracking-wide" style={{ background: '#e0f7fa', color: '#0891b2', padding: '4px 12px', borderRadius: 100 }}>
            Q{currentQ + 1} · {questions[currentQ]?.topic}
          </div>
          <p className="text-base sm:text-lg font-semibold leading-relaxed m-0" style={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}>
            {questions[currentQ]?.question}
          </p>
        </div>

        {/* Answer */}
        <div className="p-4 sm:p-6 mb-4 sm:mb-5" style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold" style={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}>Your Answer</label>
            <button
              onClick={toggleRecording}
              disabled={isTranscribing}
              className="min-h-[44px] flex items-center gap-1.5 px-3 sm:px-3.5 rounded-[10px] border-none text-xs sm:text-[13px] font-semibold"
              style={{
                background: isTranscribing ? '#f1f5f9' : isRecording ? '#fef2f2' : '#e0f7fa',
                color: isTranscribing ? '#94a3b8' : isRecording ? '#ef4444' : '#0891b2',
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
            <div className="flex items-center gap-2 mb-2.5 p-2 sm:p-[8px_12px]" style={{ background: '#fef2f2', borderRadius: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s ease-in-out infinite', flexShrink: 0 }} />
              <span className="text-xs sm:text-[13px] font-medium" style={{ color: '#ef4444' }}>
                Recording… click "Stop Recording" when done.
              </span>
            </div>
          )}

          {/* Transcribing indicator */}
          {isTranscribing && (
            <div className="flex items-center gap-2 mb-2.5 p-2 sm:p-[8px_12px]" style={{ background: '#f0f9ff', borderRadius: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4', animation: 'pulse 1s ease-in-out infinite', flexShrink: 0 }} />
              <span className="text-xs sm:text-[13px] font-medium" style={{ color: '#0891b2' }}>
                Transcribing your audio via Groq Whisper…
              </span>
            </div>
          )}

          <textarea
            value={currentAnswer}
            onChange={e => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here, or click 'Use Voice' to speak…"
            rows={5}
            className="w-full text-sm p-3 sm:p-3.5"
            style={{
              borderRadius: 12,
              border: `1.5px solid ${darkMode ? '#334155' : '#e2e8f0'}`, outline: 'none',
              fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6,
              boxSizing: 'border-box', color: darkMode ? '#f1f5f9' : '#1e293b',
              background: darkMode ? '#0f172a' : undefined,
            }}
          />
          <div className="text-[11px] sm:text-xs mt-1.5" style={{ color: '#94a3b8' }}>
            💡 Click "Use Voice" → speak → click "Stop Recording". Groq Whisper will transcribe it.
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => goToQuestion(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="min-h-[44px] flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 text-sm font-medium w-full sm:w-auto"
            style={{
              borderRadius: 12,
              border: `1.5px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white',
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
              className="min-h-[44px] flex-1 flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 text-sm font-semibold"
              style={{
                borderRadius: 12, border: 'none',
                background: '#06b6d4', color: 'white',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Next Question <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={submitInterview}
              disabled={loading}
              className="min-h-[44px] flex-1 flex items-center justify-center gap-2 px-4 sm:px-5 py-3 text-sm font-semibold"
              style={{
                borderRadius: 12, border: 'none',
                background: loading ? '#94a3b8' : '#22c55e', color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Evaluating…' : <><Send size={16} /> Submit & Get Results</>}
            </button>
          )}
        </div>

        {/* Question dot nav */}
        <div className="flex gap-1.5 justify-center mt-4 flex-wrap">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => goToQuestion(i)}
              title={`Question ${i + 1}`}
              className="min-h-[24px] min-w-[24px] flex items-center justify-center"
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