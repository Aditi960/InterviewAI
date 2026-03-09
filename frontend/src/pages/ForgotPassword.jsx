import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Zap, Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const { darkMode } = useTheme();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.error('Password reset is not available. Please contact support.');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: darkMode ? '#0f172a' : '#fdf6f6', fontFamily: 'Plus Jakarta Sans, sans-serif', padding: 24 }}>
      <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 24, padding: 40, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>
            🔑
          </div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700, color: darkMode ? '#f1f5f9' : '#1e293b', marginBottom: 6 }}>Forgot Password?</h3>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Password reset is not currently available. Please contact support for assistance.</p>
        </div>

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
