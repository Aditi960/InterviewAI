import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      {/* Left panel */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 40px', color: 'white' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'white', marginBottom: 60 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} fill="white" />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20 }}>InterviewAI</span>
        </Link>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
          Your AI-powered
          <br />interview coach
        </h2>
        <p style={{ opacity: 0.85, fontSize: 16, lineHeight: 1.6, marginBottom: 40, maxWidth: 340 }}>
          Practice with real interview questions, get instant feedback, and track your improvement over time.
        </p>
        {['Personalized AI questions', 'Real-time voice answers', 'Detailed performance analytics'].map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, opacity: 0.9 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>✓</div>
            <span style={{ fontSize: 14 }}>{item}</span>
          </div>
        ))}
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, background: '#fafafa' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 700, marginBottom: 6, color: '#1e293b' }}>Welcome back</h3>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 32 }}>Enter your details to access your account.</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 11, paddingBottom: 11, borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: 'white' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: '#06b6d4', textDecoration: 'none', fontWeight: 500 }}>Forgot Password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', paddingLeft: 38, paddingRight: 40, paddingTop: 11, paddingBottom: 11, borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: 'white' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              style={{ width: '100%', background: loading ? '#94a3b8' : '#06b6d4', color: 'white', border: 'none', borderRadius: 12, padding: '12px', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {['Google', 'GitHub', 'LinkedIn'].map(provider => (
            <button
              key={provider}
              onClick={provider === 'Google' ? handleGoogle : undefined}
              style={{ width: '100%', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '10px', fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: 10, fontFamily: 'inherit', color: '#1e293b', transition: 'border-color 0.15s' }}
            >
              Continue with {provider}
            </button>
          ))}

          <p style={{ textAlign: 'center', fontSize: 14, color: '#64748b', marginTop: 20 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: 600 }}>Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
