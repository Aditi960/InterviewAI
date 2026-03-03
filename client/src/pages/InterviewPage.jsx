import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Mic, MicOff, Send, ChevronRight, Clock, Zap } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function InterviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [recording, setRecording] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const startTime = useRef(Date.now())
  const recognitionRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/interviews/${id}`)
        setSession(data.session)
        // Initialize answers array
        setAnswers(data.session.questions.map((_, i) => ({ questionIndex: i, answer: '', timeTaken: 0 })))
      } catch {
        toast.error('Session not found')
        navigate('/dashboard')
      }
    }
    load()
  }, [id])

  useEffect(() => {
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime.current) / 1000)), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in your browser')
      return
    }

    if (recording) {
      recognitionRef.current?.stop()
      setRecording(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('')
      setCurrentAnswer(transcript)
    }

    recognition.onerror = () => { setRecording(false); toast.error('Microphone error') }
    recognition.onend = () => setRecording(false)

    recognitionRef.current = recognition
    recognition.start()
    setRecording(true)
  }

  const saveAnswer = () => {
    setAnswers(prev => prev.map((a, i) =>
      i === currentQ ? { ...a, answer: currentAnswer } : a
    ))
  }

  const nextQuestion = () => {
    saveAnswer()
    if (currentQ < session.questions.length - 1) {
      setCurrentQ(currentQ + 1)
      setCurrentAnswer(answers[currentQ + 1]?.answer || '')
    }
  }

  const handleSubmit = async () => {
    saveAnswer()
    setSubmitting(true)
    try {
      const finalAnswers = answers.map((a, i) => ({
        ...a,
        answer: i === currentQ ? currentAnswer : a.answer,
      }))
      const { data } = await api.post('/interviews/submit', {
        sessionId: id,
        answers: finalAnswers,
        duration: elapsed,
      })
      toast.success('Interview submitted! Evaluating your answers...')
      navigate(`/report/${data.session._id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed')
      setSubmitting(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-brand-cyan/20 rounded-xl mx-auto animate-pulse mb-4" />
          <p className="text-gray-400 text-sm">Loading interview...</p>
        </div>
      </div>
    )
  }

  const q = session.questions[currentQ]
  const progress = ((currentQ + 1) / session.questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-950 text-white font-body flex flex-col">
      {/* Top bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-brand-cyan rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-gray-900" />
          </div>
          <span className="font-display font-bold text-white">InterviewAI</span>
          <span className="text-gray-600 text-sm">•</span>
          <span className="text-gray-400 text-sm">{session.role}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide
            ${session.difficulty === 'easy' ? 'bg-emerald-900/50 text-emerald-400' :
              session.difficulty === 'medium' ? 'bg-amber-900/50 text-amber-400' :
              'bg-red-900/50 text-red-400'}`}>
            {session.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock size={14} />
            <span className="font-mono">{formatTime(elapsed)}</span>
          </div>
          <span className="text-gray-400 text-sm">
            Question {currentQ + 1} of {session.questions.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-brand-cyan transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 max-w-3xl mx-auto w-full">
        {/* Topic badge */}
        <div className="mb-6 self-start">
          <span className="text-xs font-semibold bg-gray-800 text-brand-cyan px-3 py-1.5 rounded-full">
            {q.topic}
          </span>
        </div>

        {/* Question */}
        <div className="w-full mb-8">
          <h2 className="font-display text-2xl font-bold text-white leading-relaxed">
            {q.question}
          </h2>
        </div>

        {/* Answer area */}
        <div className="w-full space-y-4">
          <div className="relative">
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here, or use the microphone to speak..."
              className="w-full h-40 bg-gray-900 border border-gray-700 rounded-2xl p-5 text-gray-200 text-sm
                         focus:outline-none focus:border-brand-cyan/60 resize-none font-body
                         placeholder:text-gray-600 transition-all"
            />
            <button
              onClick={toggleRecording}
              className={`absolute bottom-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all
                ${recording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse-slow'
                  : 'bg-gray-700 hover:bg-gray-600'
                }`}
            >
              {recording ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          </div>

          {recording && (
            <div className="flex items-center gap-2 text-red-400 text-xs">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              Recording... speak your answer
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between w-full mt-8">
          <div className="flex gap-2">
            {session.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => { saveAnswer(); setCurrentQ(i); setCurrentAnswer(answers[i]?.answer || '') }}
                className={`w-8 h-8 rounded-lg text-xs font-mono transition-all
                  ${i === currentQ ? 'bg-brand-cyan text-gray-900 font-bold' :
                    answers[i]?.answer ? 'bg-gray-700 text-gray-300' : 'bg-gray-800 text-gray-500'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            {currentQ < session.questions.length - 1 ? (
              <button onClick={nextQuestion} className="btn-primary flex items-center gap-2 py-3 px-6">
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-brand-cyan text-gray-900 font-display font-semibold px-8 py-3 rounded-xl
                           flex items-center gap-2 hover:shadow-glow transition-all disabled:opacity-60"
              >
                {submitting ? 'Evaluating...' : <>Submit <Send size={16} /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
