import { Link } from 'react-router-dom'
import { ArrowRight, Mic, Brain, BarChart3, Zap, CheckCircle, Star } from 'lucide-react'

const features = [
  {
    icon: Brain,
    color: 'bg-sky-100 text-sky-600',
    title: 'Resume-based Interviews',
    desc: 'Upload your PDF and let our AI generate tailored, role-specific questions perfectly matched to your experience level.',
  },
  {
    icon: Mic,
    color: 'bg-red-100 text-red-500',
    title: 'Voice-based Answering',
    desc: 'Use the Web Speech API to answer naturally. We transcribe your speech into text in real-time, providing a realistic interview environment.',
  },
  {
    icon: BarChart3,
    color: 'bg-amber-100 text-amber-500',
    title: 'AI Performance Analytics',
    desc: 'Receive a score out of 10, detailed feedback, and a breakdown of your weak topics, automatically saved to your protected dashboard.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fdf5f5] font-body">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-cyan rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-gray-900" />
          </div>
          <span className="font-display font-bold text-gray-900">interviewAI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600 font-medium">
          <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</a>
          <a href="#students" className="hover:text-gray-900 transition-colors">For Students</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2">
            Log In
          </Link>
          <Link to="/signup" className="btn-primary text-sm py-2.5 px-5">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-xs text-gray-600 font-medium mb-8 shadow-sm">
          <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-pulse" />
          Now: Web Speech API Integration
        </div>

        <h1 className="font-display text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight mb-6 max-w-3xl mx-auto">
          Ace Your Interviews<br />
          with <span className="text-brand-cyan">AI</span>
        </h1>

        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Upload your resume, speak naturally using your mic, and get instant topic-wise feedback,
          scoring, and actionable insights to land your dream job.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/signup" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
            Create Free Account
            <ArrowRight size={16} />
          </Link>
          <button className="btn-secondary flex items-center gap-2 text-base px-8 py-4">
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-xs">▶</span>
            </div>
            Watch Demo
          </button>
        </div>

        {/* Dashboard preview */}
        <div className="mt-16 rounded-2xl bg-gray-900 p-4 shadow-2xl max-w-4xl mx-auto overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 bg-red-400 rounded-full" />
              <span className="w-3 h-3 bg-yellow-400 rounded-full" />
              <span className="w-3 h-3 bg-green-400 rounded-full" />
            </div>
            <div className="flex-1 bg-gray-800 rounded-md h-6 flex items-center px-3">
              <span className="text-gray-500 text-xs font-mono">interviewai.app/dashboard</span>
            </div>
          </div>
          {/* Mini dashboard mockup */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-800 rounded-xl p-3 col-span-2">
              <p className="text-gray-400 text-xs mb-2">Score Improvement</p>
              <div className="h-20 flex items-end gap-1">
                {[40,45,50,60,58,68,72,80,85,88].map((h, i) => (
                  <div key={i} className="flex-1 bg-brand-cyan/60 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {[{ label: 'Total', val: '24' }, { label: 'Avg Score', val: '7.8' }, { label: 'Best', val: '9.5' }].map(s => (
                <div key={s.label} className="bg-gray-800 rounded-xl p-3">
                  <p className="text-gray-400 text-xs">{s.label}</p>
                  <p className="text-white font-display font-bold text-lg">{s.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card hover:shadow-card-hover transition-all">
              <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                <f.icon size={20} />
              </div>
              <h3 className="font-display font-bold text-gray-800 text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Auth flow section */}
      <section className="max-w-7xl mx-auto px-8 py-16">
        <h2 className="font-display text-3xl font-bold text-gray-800 text-center mb-2">Authentication Flow UI</h2>
        <p className="text-gray-500 text-center mb-12">Clean, secure, and production-ready components designed for JWT and OAuth integrations.</p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Login card */}
          <div className="card">
            <h3 className="font-display font-bold text-gray-800 text-xl mb-1">Welcome back</h3>
            <p className="text-gray-400 text-sm mb-5">Enter your details to access your account.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <div className="input-field text-gray-400 text-sm">you@example.com</div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-gray-500">Password</label>
                  <span className="text-xs text-brand-cyan cursor-pointer">Forgot Password?</span>
                </div>
                <div className="input-field text-gray-400 text-sm">••••••••</div>
              </div>
              <Link to="/login" className="btn-primary w-full block text-center text-sm py-3">Log in</Link>
              <div className="text-center text-xs text-gray-400">OR CONTINUE WITH</div>
              {['Google', 'GitHub', 'LinkedIn'].map(p => (
                <button key={p} className="btn-secondary w-full text-sm py-2.5">Continue with {p}</button>
              ))}
              <p className="text-center text-xs text-gray-500">Don't have an account? <Link to="/signup" className="text-brand-cyan">Create Account</Link></p>
            </div>
          </div>

          {/* Signup card */}
          <div className="card">
            <h3 className="font-display font-bold text-gray-800 text-xl mb-1">Create an account</h3>
            <p className="text-gray-400 text-sm mb-5">Start your AI interview journey today.</p>
            <div className="space-y-3">
              {['Full Name', 'Email', 'Password', 'Confirm Password'].map(f => (
                <div key={f}>
                  <label className="text-xs text-gray-500 mb-1 block">{f}</label>
                  <div className="input-field text-gray-400 text-sm">{f === 'Full Name' ? 'John Doe' : f === 'Email' ? 'you@example.com' : f === 'Password' ? 'Create a password' : 'Repeat your password'}</div>
                  {f === 'Password' && (
                    <div className="flex gap-1 mt-1">
                      <div className="h-1 flex-1 bg-green-400 rounded" />
                      <div className="h-1 flex-1 bg-yellow-400 rounded" />
                      <div className="h-1 flex-1 bg-gray-200 rounded" />
                    </div>
                  )}
                </div>
              ))}
              <Link to="/signup" className="btn-primary w-full block text-center text-sm py-3">Create Account</Link>
              <p className="text-center text-xs text-gray-500">Already have an account? <Link to="/login" className="text-brand-cyan">Log in</Link></p>
            </div>
          </div>

          {/* Forgot password card */}
          <div className="card">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🔑</span>
            </div>
            <h3 className="font-display font-bold text-gray-800 text-xl mb-1">Forgot Password?</h3>
            <p className="text-gray-400 text-sm mb-5">No worries, we'll send you reset instructions to your email.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <div className="input-field text-gray-400 text-sm">you@example.com</div>
              </div>
              <Link to="/forgot-password" className="block w-full bg-red-400 hover:bg-red-500 text-white font-semibold text-sm py-3 rounded-xl text-center transition-colors">
                Send Reset Link
              </Link>
              <p className="text-center text-xs text-gray-500">Back to <Link to="/login" className="text-brand-cyan">log in</Link></p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-8 py-12 mb-8">
        <div className="bg-gray-800 rounded-2xl p-12 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-3">Ready to ace your next interview?</h2>
          <p className="text-gray-400 mb-8">Join thousands of final-year students preparing efficiently with AI.</p>
          <Link to="/signup" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
            Create Free Account
          </Link>
        </div>
      </section>

      <footer className="text-center py-6 text-gray-400 text-sm">
        © 2024 InterviewAI. Built with ❤️ for job seekers.
      </footer>
    </div>
  )
}
