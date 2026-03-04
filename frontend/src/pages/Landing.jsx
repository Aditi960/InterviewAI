import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mic, BarChart3, ArrowRight, Play, CheckCircle, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';

const Landing = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const features = [
    {
      icon: '📄',
      color: '#06b6d4',
      title: 'Resume-based Interviews',
      desc: 'Upload your PDF and let our AI generate tailored, role-specific questions perfectly matched to your experience level.',
    },
    {
      icon: '🎙️',
      color: '#f97316',
      title: 'Voice-based Answering',
      desc: 'Use the Web Speech API to answer naturally. We transcribe your speech into text in real-time.',
    },
    {
      icon: '📊',
      color: '#eab308',
      title: 'AI Performance Analytics',
      desc: 'Receive a score out of 10, detailed feedback, and a breakdown of your weak topics, auto-saved to your dashboard.',
    },
  ];

  return (
    <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', background: darkMode ? '#0f172a' : '#fdf6f6', minHeight: '100vh' }}>
      {/* Nav */}
      <Navbar />

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 40px 40px', background: darkMode ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(180deg, #fef9c3 0%, #fdf6f6 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
          background: darkMode ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.8)', borderRadius: 100, marginBottom: 24,
          fontSize: 13, fontWeight: 500, color: darkMode ? '#94a3b8' : '#475569', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
          backdropFilter: 'blur(8px)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4', display: 'inline-block' }} />
          Now: Web Speech API Integration
        </div>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20, color: darkMode ? '#f1f5f9' : '#1e293b' }}>
          Ace Your Interviews
          <br /><span style={{ color: '#06b6d4' }}>with AI</span>
        </h1>
        <p style={{ fontSize: 18, color: darkMode ? '#94a3b8' : '#64748b', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.6 }}>
          Upload your resume, speak naturally using your mic, and get instant topic-wise feedback, scoring, and actionable insights to land your dream job.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/register')}
            style={{ background: '#06b6d4', color: 'white', padding: '14px 28px', borderRadius: 14, border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            Create Free Account <ArrowRight size={16} />
          </button>
          <button style={{ background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f1f5f9' : '#1e293b', padding: '14px 28px', borderRadius: 14, border: darkMode ? '1.5px solid #334155' : '1.5px solid #e2e8f0', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Play size={16} fill="#06b6d4" stroke="#06b6d4" /> Watch Demo
          </button>
        </div>

        {/* Dashboard mockup */}
        <div style={{ maxWidth: 780, margin: '60px auto 0', background: '#1e293b', borderRadius: 24, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ background: '#334155', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8, fontFamily: 'monospace' }}>InterviewAI Dashboard</span>
          </div>
          <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Total Interviews', val: '24', color: '#06b6d4' },
              { label: 'Average Score', val: '7.8/10', color: '#eab308' },
              { label: 'Best Score', val: '9.5/10', color: '#22c55e' },
              { label: 'Weak Topics', val: '3', color: '#f97316' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background: '#334155', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color }}>{val}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 40px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {features.map(({ icon, color, title, desc }) => (
            <div key={title} style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 20, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: darkMode ? '1px solid #334155' : '1px solid #f1f5f9' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>
                {icon}
              </div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, marginBottom: 10, color: darkMode ? '#f1f5f9' : '#1e293b' }}>{title}</h3>
              <p style={{ color: darkMode ? '#94a3b8' : '#64748b', lineHeight: 1.65, fontSize: 14, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Auth section preview */}
      <section style={{ padding: '60px 40px', background: darkMode ? '#0f172a' : 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 32, color: darkMode ? '#f1f5f9' : '#1e293b', marginBottom: 10 }}>Authentication Flow UI</h2>
          <p style={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: 15 }}>Clean, secure, and production-ready components designed for JWT and OAuth integrations.</p>
        </div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 900, margin: '0 auto' }}>
          <div style={{ background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: 16, padding: 24, width: 240, border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
            <h4 style={{ fontWeight: 700, marginBottom: 4, color: darkMode ? '#f1f5f9' : '#1e293b' }}>Welcome back</h4>
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>Enter your details to access your account.</p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Email</label>
              <div style={{ background: darkMode ? '#0f172a' : 'white', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#94a3b8' }}>you@example.com</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Password</label>
              <div style={{ background: darkMode ? '#0f172a' : 'white', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#94a3b8' }}>••••••••</div>
            </div>
            <button style={{ width: '100%', background: '#06b6d4', color: 'white', border: 'none', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Log In</button>
          </div>

          <div style={{ background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: 16, padding: 24, width: 240, border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
            <h4 style={{ fontWeight: 700, marginBottom: 4, color: darkMode ? '#f1f5f9' : '#1e293b' }}>Create an account</h4>
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>Start your AI interview journey today.</p>
            {['Full Name', 'Email', 'Password', 'Confirm Password'].map(field => (
              <div key={field} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>{field}</label>
                <div style={{ background: darkMode ? '#0f172a' : 'white', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#94a3b8' }}>
                  {field === 'Full Name' ? 'John Doe' : field === 'Email' ? 'you@example.com' : 'Enter ' + field.toLowerCase()}
                </div>
              </div>
            ))}
            <button style={{ width: '100%', background: '#06b6d4', color: 'white', border: 'none', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 6 }}>Create Account</button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', textAlign: 'center', background: '#1e293b', margin: '0 40px 40px', borderRadius: 24 }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', color: 'white', fontSize: 36, fontWeight: 800, marginBottom: 12 }}>Ready to ace your next interview?</h2>
        <p style={{ color: '#94a3b8', marginBottom: 28 }}>Join thousands of final-year students preparing efficiently with AI.</p>
        <button
          onClick={() => navigate('/register')}
          style={{ background: '#06b6d4', color: 'white', padding: '14px 32px', borderRadius: 14, border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
        >
          Create Free Account
        </button>
      </section>
    </div>
  );
};

export default Landing;
