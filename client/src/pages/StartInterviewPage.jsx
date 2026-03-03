import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, ChevronRight, FileText, X, Check } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'Frontend Developer', emoji: '🎨', desc: 'React, CSS, JS, Performance' },
  { value: 'Backend Engineer', emoji: '⚙️', desc: 'Node.js, APIs, Databases' },
  { value: 'Full Stack Developer', emoji: '🚀', desc: 'End-to-end development' },
  { value: 'DevOps Engineer', emoji: '🔧', desc: 'CI/CD, Docker, Cloud' },
  { value: 'Data Scientist', emoji: '📊', desc: 'ML, Python, Statistics' },
]

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', color: 'border-emerald-300 text-emerald-700 hover:bg-emerald-50', activeColor: 'bg-emerald-500 text-white border-emerald-500', desc: 'Beginner friendly' },
  { value: 'medium', label: 'Medium', color: 'border-amber-300 text-amber-700 hover:bg-amber-50', activeColor: 'bg-amber-500 text-white border-amber-500', desc: 'Standard interview' },
  { value: 'hard', label: 'Hard', color: 'border-red-300 text-red-700 hover:bg-red-50', activeColor: 'bg-red-500 text-white border-red-500', desc: 'Senior level' },
]

const LEVELS = ['Fresher', 'Junior', 'Mid-level', 'Senior']

export default function StartInterviewPage() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('Fresher')
  const [resumeText, setResumeText] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setResumeFile(file)
    // Read as text for AI context
    const reader = new FileReader()
    reader.onload = (evt) => setResumeText(evt.target.result?.slice(0, 3000) || '')
    reader.readAsText(file)
  }

  const handleStart = async () => {
    if (!role || !difficulty) return toast.error('Please select a role and difficulty')
    setLoading(true)
    try {
      const { data } = await api.post('/interviews/start', {
        role,
        difficulty,
        experienceLevel,
        resumeText,
      })
      toast.success('Interview prepared! Good luck 🎯')
      navigate(`/interview/${data.session._id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start interview')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">Start New Interview</h1>
        <p className="text-gray-500 text-sm">Configure your practice session to match your target role.</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
              ${step > s ? 'bg-brand-cyan text-gray-900' : step === s ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > s ? <Check size={14} /> : s}
            </div>
            <span className={`text-sm ${step >= s ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
              {s === 1 ? 'Role & Level' : s === 2 ? 'Difficulty' : 'Resume'}
            </span>
            {s < 3 && <ChevronRight size={14} className="text-gray-300" />}
          </div>
        ))}
      </div>

      {/* Step 1: Role */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="font-display font-bold text-xl text-gray-800 mb-4">Select Your Target Role</h2>
            <div className="grid grid-cols-1 gap-3">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all
                    ${role === r.value ? 'border-brand-cyan bg-brand-cyan/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <div>
                    <p className={`font-medium text-sm ${role === r.value ? 'text-gray-900' : 'text-gray-700'}`}>{r.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                  </div>
                  {role === r.value && <Check size={16} className="ml-auto text-brand-cyan" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display font-bold text-base text-gray-800 mb-3">Experience Level</h3>
            <div className="flex gap-2 flex-wrap">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setExperienceLevel(l)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all
                    ${experienceLevel === l ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => role && setStep(2)}
            disabled={!role}
            className="btn-primary w-full py-4 disabled:opacity-40 mt-4"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 2: Difficulty */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="font-display font-bold text-xl text-gray-800">Choose Difficulty</h2>
          <div className="grid grid-cols-3 gap-4">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`p-6 rounded-2xl border-2 text-center transition-all
                  ${difficulty === d.value ? d.activeColor : `border-gray-200 bg-white ${d.color}`}`}
              >
                <p className="font-display font-bold text-xl mb-1">{d.label}</p>
                <p className={`text-xs ${difficulty === d.value ? 'opacity-80' : 'text-gray-400'}`}>{d.desc}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-4">← Back</button>
            <button
              onClick={() => difficulty && setStep(3)}
              disabled={!difficulty}
              className="btn-primary flex-1 py-4 disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Resume */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="font-display font-bold text-xl text-gray-800 mb-1">Upload Resume (Optional)</h2>
            <p className="text-gray-500 text-sm">Adding your resume helps generate more personalized questions.</p>
          </div>

          <div
            onClick={() => fileRef.current.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
              ${resumeFile ? 'border-brand-cyan bg-brand-cyan/5' : 'border-gray-300 hover:border-gray-400 bg-white'}`}
          >
            <input ref={fileRef} type="file" accept=".pdf,.txt,.doc" className="hidden" onChange={handleFileChange} />
            {resumeFile ? (
              <div className="flex flex-col items-center gap-2">
                <FileText size={32} className="text-brand-cyan" />
                <p className="text-sm font-medium text-gray-700">{resumeFile.name}</p>
                <p className="text-xs text-gray-400">{(resumeFile.size / 1024).toFixed(0)} KB</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setResumeFile(null); setResumeText('') }}
                  className="text-xs text-red-400 flex items-center gap-1 mt-1"
                >
                  <X size={12} /> Remove
                </button>
              </div>
            ) : (
              <>
                <Upload size={32} className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm font-medium">Click to upload or drag & drop</p>
                <p className="text-gray-400 text-xs mt-1">PDF, TXT, DOC up to 5MB</p>
              </>
            )}
          </div>

          {/* Summary */}
          <div className="card bg-gray-50 border border-gray-100">
            <h3 className="font-medium text-gray-700 text-sm mb-3">Interview Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-400">Role</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">{role}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Difficulty</p>
                <p className="text-sm font-medium text-gray-800 capitalize mt-0.5">{difficulty}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Level</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">{experienceLevel}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1 py-4">← Back</button>
            <button
              onClick={handleStart}
              disabled={loading}
              className="btn-primary flex-1 py-4 disabled:opacity-60"
            >
              {loading ? 'Generating questions...' : '🎯 Start Interview'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
