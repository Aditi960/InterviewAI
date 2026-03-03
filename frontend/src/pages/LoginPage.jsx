import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Zap, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { signIn, signInWithGoogle, signInWithGitHub, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // login | forgot
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(form.email, form.password);
        navigate('/dashboard');
      } else {
        await resetPassword(form.email);
        setSuccess('Password reset email sent! Check your inbox.');
        setMode('login');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    try {
      if (provider === 'google') await signInWithGoogle();
      else await signInWithGitHub();
    } catch (err) {
      setError(err.message || 'OAuth failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F5] flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#00D4E8] flex items-center justify-center shadow-md">
              <Zap size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-xl">InterviewAI</span>
          </Link>
        </div>

        <div className="card shadow-card-hover">
          <h2 className="font-display font-bold text-xl text-gray-900 mb-1">
            {mode === 'login' ? 'Welcome back' : 'Forgot Password?'}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {mode === 'login' ? 'Enter your details to access your account.' : "No worries, we'll send you reset instructions."}
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle size={15} />
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl px-4 py-3 mb-5 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
                required
              />
            </div>

            {mode === 'login' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-[#FF6B6B] hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input-field pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Send Reset Link'}
            </button>
          </form>

          {mode === 'login' && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">OR CONTINUE WITH</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <div className="space-y-2.5">
                {[
                  { label: 'Continue with Google', icon: '🇬', action: 'google' },
                  { label: 'Continue with GitHub', icon: '🐙', action: 'github' },
                ].map(({ label, icon, action }) => (
                  <button
                    key={action}
                    onClick={() => handleOAuth(action)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 hover:border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <span>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>

              <p className="text-center text-sm text-gray-500 mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#00D4E8] font-semibold hover:underline">
                  Create Account
                </Link>
              </p>
            </>
          )}

          {mode === 'forgot' && (
            <button
              onClick={() => setMode('login')}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-4 transition-colors"
            >
              Back to log in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
