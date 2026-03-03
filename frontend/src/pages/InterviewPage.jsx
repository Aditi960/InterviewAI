import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import { Mic, MicOff, ChevronRight, ChevronLeft, Send, Loader2, Clock } from 'lucide-react';

export default function InterviewPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await api.get(`/interviews/${sessionId}`);
        const qs = data.session.questions.map((q, i) => ({ ...q, index: i }));
        setQuestions(qs);
      } catch (e) {
        setError(e.error || 'Failed to load interview session');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();

    // Timer
    timerRef.current = setInterval(() => setElapsed(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [sessionId]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const currentQ = questions[currentIndex];
  const currentAnswer = answers[currentIndex] || '';

  const setAnswer = (text) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: text }));
  };

  const startVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in your browser. Try Chrome.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswer(transcript);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const stopVoiceRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    const formattedAnswers = questions.map((q, i) => ({
      questionIndex: i,
      answer: answers[i] || '',
    }));

    const unanswered = formattedAnswers.filter(a => !a.answer.trim()).length;
    if (unanswered > 0 && !window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;

    setSubmitting(true);
    try {
      const data = await api.post('/interviews/submit', {
        sessionId,
        answers: formattedAnswers,
      });
      navigate(`/report/${sessionId}`);
    } catch (e) {
      setError(e.error || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 size={32} className="animate-spin text-[#00D4E8] mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading your interview…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>
    </div>
  );

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.values(answers).filter(a => a.trim()).length;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-xl text-gray-900">Live Interview</h1>
          <p className="text-gray-500 text-sm">{answeredCount}/{questions.length} answered</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-gray-600">
          <Clock size={14} className="text-[#00D4E8]" />
          {formatTime(elapsed)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00D4E8] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question navigation dots */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
              i === currentIndex
                ? 'bg-[#00D4E8] text-white'
                : answers[i]?.trim()
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question card */}
      {currentQ && (
        <div className="card mb-5 animate-fade-up">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-[#00D4E8]/10 text-[#00D4E8] text-xs font-semibold px-3 py-1 rounded-full">
              {currentQ.topic}
            </span>
            <span className="bg-gray-100 text-gray-500 text-xs font-medium px-3 py-1 rounded-full">
              Q{currentIndex + 1}
            </span>
          </div>
          <p className="text-gray-900 font-medium leading-relaxed">{currentQ.question}</p>
        </div>
      )}

      {/* Answer textarea */}
      <div className="card mb-5">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Your Answer</label>
          <button
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
              isRecording
                ? 'bg-red-100 text-red-600 animate-pulse-soft'
                : 'bg-gray-100 text-gray-600 hover:bg-[#00D4E8]/10 hover:text-[#00D4E8]'
            }`}
          >
            {isRecording ? <MicOff size={13} /> : <Mic size={13} />}
            {isRecording ? 'Stop Recording' : 'Voice Answer'}
          </button>
        </div>
        <textarea
          value={currentAnswer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here, or use the voice button to speak naturally…"
          rows={6}
          className="w-full px-0 py-0 border-0 focus:outline-none text-gray-700 text-sm leading-relaxed resize-none placeholder-gray-400"
        />
        {currentAnswer && (
          <div className="mt-2 text-right">
            <span className="text-xs text-gray-400">{currentAnswer.split(' ').filter(Boolean).length} words</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="btn-primary flex items-center gap-2"
          >
            Next Question
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Evaluating…
              </>
            ) : (
              <>
                Submit Interview
                <Send size={16} />
              </>
            )}
          </button>
        )}
      </div>

      {submitting && (
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">AI is evaluating your responses. This may take 10-30 seconds…</p>
        </div>
      )}
    </div>
  );
}
