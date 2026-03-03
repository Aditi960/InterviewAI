import { Link } from 'react-router-dom';
import { Zap, Mic, BarChart2, FileText, ArrowRight, Play, Check } from 'lucide-react';

const features = [
  {
    icon: FileText,
    color: '#00D4E8',
    bg: 'bg-cyan-50',
    title: 'Resume-based Interviews',
    desc: 'Upload your PDF and let our AI generate tailored, role-specific questions perfectly matched to your experience level.',
  },
  {
    icon: Mic,
    color: '#FF6B6B',
    bg: 'bg-red-50',
    title: 'Voice-based Answering',
    desc: 'Use the Web Speech API to answer naturally. We transcribe your speech into text in real-time, providing a realistic interview environment.',
  },
  {
    icon: BarChart2,
    color: '#FFD166',
    bg: 'bg-amber-50',
    title: 'AI Performance Analytics',
    desc: 'Receive a score out of 10, detailed feedback, and a breakdown of your weak topics, automatically saved to your protected dashboard.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFF5F5] font-body">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00D4E8] flex items-center justify-center">
              <Zap size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-lg">interviewAI</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-gray-900 transition-colors">For Students</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
              Log In
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-600 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#00D4E8] animate-pulse" />
            Now: Web Speech API Integration
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight text-gray-900 mb-6">
            Ace Your Interviews<br />
            with <span className="text-[#FF6B6B]">AI</span>
          </h1>

          <p className="text-gray-500 text-lg leading-relaxed max-w-xl mx-auto mb-10">
            Upload your resume, speak naturally using your mic, and get instant topic-wise feedback, scoring, and actionable insights to land your dream job.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-7 py-3">
              Create Free Account
              <ArrowRight size={18} />
            </Link>
            <button className="btn-secondary flex items-center gap-2 text-base px-7 py-3">
              <Play size={16} className="fill-current" />
              Watch Demo
            </button>
          </div>
        </div>

        {/* Mock dashboard preview */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-gray-900 rounded-3xl p-6 shadow-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-3">
              {/* Mini stats */}
              {[
                { label: 'AI Score', val: '8.5', color: '#00D4E8' },
                { label: 'Sessions', val: '24', color: '#FFD166' },
                { label: 'Best Score', val: '9.5', color: '#06d6a0' },
              ].map((s, i) => (
                <div key={i} className="bg-white/10 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                  <p className="font-display font-bold text-2xl" style={{ color: s.color }}>{s.val}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-white/5 rounded-xl p-4 h-24 flex items-end gap-1.5">
              {[40, 55, 45, 60, 70, 65, 78, 82, 88, 92, 88, 95].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm"
                  style={{ height: `${h}%`, background: i >= 10 ? '#00D4E8' : `rgba(0, 212, 232, ${0.3 + i * 0.05})` }}
                />
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-2 text-center">Your score improvement over time</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center text-gray-900 mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-gray-500 text-center mb-14 max-w-xl mx-auto">
            Our AI-powered platform gives you the tools to prepare smarter, not harder.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, color, bg, title, desc }, i) => (
              <div key={i} className="card hover:shadow-card-hover transition-shadow duration-300">
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-5`}>
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center text-gray-900 mb-14">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Upload Resume', desc: 'Upload your PDF resume for personalized questions.' },
              { step: '02', title: 'Choose Role', desc: 'Select your target role and difficulty level.' },
              { step: '03', title: 'Start Interview', desc: 'Answer AI-generated questions by voice or text.' },
              { step: '04', title: 'Get Feedback', desc: 'Receive detailed scores, strengths, and improvements.' },
            ].map(({ step, title, desc }, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#00D4E8]/10 flex items-center justify-center mx-auto mb-4">
                  <span className="font-display font-bold text-[#00D4E8]">{step}</span>
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gray-900 mx-6 rounded-3xl mb-10 max-w-5xl lg:mx-auto">
        <div className="text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to ace your next interview?
          </h2>
          <p className="text-gray-400 mb-8">Join thousands of candidates preparing efficiently with AI.</p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
            Create Free Account
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm">
        © 2024 InterviewAI. Built with ❤️ to help you succeed.
      </footer>
    </div>
  );
}
