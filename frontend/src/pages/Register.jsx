import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Zap, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const { signUp } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Medium', 'Strong'][strength];
  const strengthColor = ['', '#ef4444', '#eab308', '#22c55e'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Fill all fields');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await signUp(form.email, form.password, form.name);
      toast.success('Account created! Check your email for verification.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      {/* Left — hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center p-10 lg:px-10 text-white" style={{ background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)' }}>
        <Link to="/" className="flex items-center gap-2.5 no-underline text-white mb-14">
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <Zap size={18} fill="white" />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20 }}>InterviewAI</span>
        </Link>
        <h2 className="break-words" style={{ fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
          Start your AI
          <br />interview journey
        </h2>
        <p style={{ opacity: 0.85, fontSize: 16, lineHeight: 1.6, maxWidth: 340 }}>
          Join thousands of students who have aced their interviews using our AI-powered coaching platform.
        </p>
      </div>

      {/* Right — full width on mobile */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-10" style={{ background: darkMode ? '#0f172a' : '#fafafa' }}>
        <div className="w-full max-w-[380px]">
          <h3 className="break-words" style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 700, marginBottom: 6, color: darkMode ? '#f1f5f9' : '#1e293b' }}>Create an account</h3>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 32 }}>Start your AI interview journey today.</p>

          <form onSubmit={handleSubmit}>
            {[
              { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe', icon: User },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com', icon: Mail },
            ].map(({ label, key, type, placeholder, icon: Icon }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: darkMode ? '#94a3b8' : '#475569', marginBottom: 6 }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <Icon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full"
                    style={{ paddingLeft: 38, paddingRight: 14, paddingTop: 11, paddingBottom: 11, borderRadius: 12, border: `1.5px solid ${darkMode ? '#334155' : '#e2e8f0'}`, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: darkMode ? '#1e293b' : 'white', ...(darkMode ? { color: '#f1f5f9' } : {}) }}
                  />
                </div>
              </div>
            ))}

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: darkMode ? '#94a3b8' : '#475569', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Create a password"
                  className="w-full"
                  style={{ paddingLeft: 38, paddingRight: 40, paddingTop: 11, paddingBottom: 11, borderRadius: 12, border: `1.5px solid ${darkMode ? '#334155' : '#e2e8f0'}`, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: darkMode ? '#1e293b' : 'white', ...(darkMode ? { color: '#f1f5f9' } : {}) }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} aria-label={showPass ? 'Hide password' : 'Show password'} className="min-w-[44px] min-h-[44px] flex items-center justify-center" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 4, borderRadius: 2, background: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(strength / 3) * 100}%`, background: strengthColor, transition: 'width 0.3s, background 0.3s', borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 11, color: strengthColor, fontWeight: 600 }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: darkMode ? '#94a3b8' : '#475569', marginBottom: 6 }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="password"
                  value={form.confirm}
                  onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Repeat your password"
                  className="w-full"
                  style={{ paddingLeft: 38, paddingRight: 14, paddingTop: 11, paddingBottom: 11, borderRadius: 12, border: `1.5px solid ${form.confirm && form.confirm !== form.password ? '#ef4444' : darkMode ? '#334155' : '#e2e8f0'}`, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: darkMode ? '#1e293b' : 'white', ...(darkMode ? { color: '#f1f5f9' } : {}) }}
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full min-h-[44px]"
              style={{ background: loading ? '#94a3b8' : '#06b6d4', color: 'white', border: 'none', borderRadius: 12, padding: '12px', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', marginTop: 12 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: 600 }}>Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
