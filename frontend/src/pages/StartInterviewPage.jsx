import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '../lib/api.js';
import { Upload, X, ChevronRight, Loader2 } from 'lucide-react';

const roles = [
  { label: 'Frontend Developer', emoji: '🖥️', desc: 'React, CSS, JavaScript' },
  { label: 'Backend Engineer', emoji: '⚙️', desc: 'Node.js, Databases, APIs' },
  { label: 'Full Stack Developer', emoji: '🔥', desc: 'End-to-end development' },
  { label: 'DevOps Engineer', emoji: '🚀', desc: 'Docker, CI/CD, Cloud' },
  { label: 'Data Scientist', emoji: '📊', desc: 'ML, Python, Statistics' },
];

const difficulties = [
  { value: 'EASY', label: 'Easy', desc: 'Fresher / Entry-level', color: '#00D4E8', bg: 'bg-cyan-50', questions: 5 },
  { value: 'MEDIUM', label: 'Medium', desc: 'Mid-level / 2-4 years', color: '#FFD166', bg: 'bg-amber-50', questions: 7 },
  { value: 'HARD', label: 'Hard', desc: 'Senior / 5+ years', color: '#FF6B6B', bg: 'bg-red-50', questions: 10 },
];

export default function StartInterviewPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: role, 2: difficulty, 3: resume
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) setResumeFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleStart = async () => {
    setError(''); setLoading(true);
    try {
      const formData = new FormData();
      formData.append('role', selectedRole);
      formData.append('difficulty', selectedDifficulty);
      if (resumeFile) formData.append('resume', resumeFile);

      const data = await api.post('/interviews/start', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/interview/${data.sessionId}`);
    } catch (e) {
      setError(e.error || 'Failed to start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = ['Choose Role', 'Select Difficulty', 'Upload Resume'];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">Start New Interview</h1>
      <p className="text-gray-500 text-sm mb-8">Set up your personalized AI interview session.</p>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-10">
        {stepTitles.map((title, i) => {
          const num = i + 1;
          const active = step === num;
          const done = step > num;
          return (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 cursor-pointer ${done ? 'text-[#00D4E8]' : active ? 'text-gray-900' : 'text-gray-400'}`} onClick={() => done && setStep(num)}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? 'bg-[#00D4E8] text-white' : active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {done ? '✓' : num}
                </div>
                <span className="text-sm font-medium hidden md:block">{title}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 min-w-[20px] transition-all ${step > num ? 'bg-[#00D4E8]' : 'bg-gray-200'}`} />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Role selection */}
      {step === 1 && (
        <div className="animate-fade-up">
          <h2 className="font-display font-semibold text-lg text-gray-900 mb-4">What role are you interviewing for?</h2>
          <div className="space-y-3">
            {roles.map(({ label, emoji, desc }) => (
              <button
                key={label}
                onClick={() => setSelectedRole(label)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-150 ${
                  selectedRole === label
                    ? 'border-[#00D4E8] bg-cyan-50/50'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <span className="text-2xl">{emoji}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                {selectedRole === label && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-[#00D4E8] flex items-center justify-center text-white text-xs flex-shrink-0">✓</div>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!selectedRole}
            className="btn-primary mt-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Step 2: Difficulty */}
      {step === 2 && (
        <div className="animate-fade-up">
          <h2 className="font-display font-semibold text-lg text-gray-900 mb-4">Choose difficulty level</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {difficulties.map(({ value, label, desc, color, bg, questions }) => (
              <button
                key={value}
                onClick={() => setSelectedDifficulty(value)}
                className={`p-5 rounded-2xl border-2 text-left transition-all duration-150 ${
                  selectedDifficulty === value
                    ? `border-current ${bg}`
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
                style={{ borderColor: selectedDifficulty === value ? color : undefined }}
              >
                <div className="w-8 h-8 rounded-xl mb-3 flex items-center justify-center text-white text-sm font-bold" style={{ background: color }}>
                  {label[0]}
                </div>
                <p className="font-display font-bold text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 mt-1">{desc}</p>
                <p className="text-xs font-medium mt-2" style={{ color }}>{questions} questions</p>
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedDifficulty}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Resume */}
      {step === 3 && (
        <div className="animate-fade-up">
          <h2 className="font-display font-semibold text-lg text-gray-900 mb-2">Upload your resume</h2>
          <p className="text-gray-500 text-sm mb-5">
            Optional but recommended. We'll tailor questions to your experience.
          </p>

          {/* Summary */}
          <div className="card mb-5 bg-gray-50 border border-gray-100 flex items-center gap-4">
            <div className="text-2xl">{roles.find(r => r.label === selectedRole)?.emoji}</div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{selectedRole}</p>
              <p className="text-xs text-gray-400">
                {selectedDifficulty} difficulty •{' '}
                {difficulties.find(d => d.value === selectedDifficulty)?.questions} questions
              </p>
            </div>
          </div>

          {resumeFile ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 text-lg">📄</div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{resumeFile.name}</p>
                <p className="text-xs text-gray-400">{(resumeFile.size / 1024).toFixed(0)} KB</p>
              </div>
              <button onClick={() => setResumeFile(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-[#00D4E8] bg-cyan-50'
                  : 'border-gray-200 hover:border-[#00D4E8] hover:bg-cyan-50/30'
              }`}
            >
              <input {...getInputProps()} />
              <Upload size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-700 text-sm mb-1">
                {isDragActive ? 'Drop your PDF here' : 'Drag & drop your resume'}
              </p>
              <p className="text-xs text-gray-400">or <span className="text-[#00D4E8] font-medium">browse files</span> · PDF only · max 5MB</p>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
            <button
              onClick={handleStart}
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-60 flex-1 justify-center"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating Questions…
                </>
              ) : (
                <>Start Interview</>
              )}
            </button>
          </div>

          {loading && (
            <p className="text-center text-xs text-gray-400 mt-3">
              AI is generating personalized questions for you…
            </p>
          )}
        </div>
      )}
    </div>
  );
}
