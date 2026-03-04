import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Zap, Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const { darkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Enter your email');
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Reset link sent!');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: darkMode ? '#0f172a' : '#fdf6f6', fontFamily: 'Plus Jakarta Sans, sans-serif', padding: 24 }}>
      <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 24, padding: 40, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>
            🔑
          </div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700, color: darkMode ? '#f1f5f9' : '#1e293b', marginBottom: 6 }}>Forgot Password?</h3>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>No worries, we'll send you reset instructions to your email.</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: darkMode ? '#94a3b8' : '#475569', marginBottom: 6 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 11, paddingBottom: 11, borderRadius: 12, border: `1.5px solid ${darkMode ? '#334155' : '#e2e8f0'}`, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: darkMode ? '#0f172a' : undefined, color: darkMode ? '#f1f5f9' : undefined }}
                />
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              style={{ width: '100%', background: '#f97316', color: 'white', border: 'none', borderRadius: 12, padding: '12px', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
            <p style={{ color: '#22c55e', fontWeight: 600 }}>Reset link sent to {email}</p>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 6 }}>Check your inbox and follow the instructions.</p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: darkMode ? '#94a3b8' : '#64748b', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
            <ArrowLeft size={14} /> Back to log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
