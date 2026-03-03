import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
      toast.success('Reset link sent! Check your inbox.')
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fdf5f5] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-brand-cyan rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-gray-900" />
          </div>
          <span className="font-display font-bold text-gray-900 text-lg">InterviewAI</span>
        </Link>

        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 text-2xl">🔑</div>

        <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">Forgot Password?</h1>
        <p className="text-gray-500 text-sm mb-8">No worries, we'll send you reset instructions to your email.</p>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-400 hover:bg-red-500 text-white font-display font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <p className="text-4xl mb-3">📬</p>
            <p className="font-display font-bold text-gray-800 mb-1">Check your inbox!</p>
            <p className="text-gray-500 text-sm">We sent a reset link to <strong>{email}</strong></p>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Back to{' '}
          <Link to="/login" className="text-brand-cyan font-medium hover:underline">log in</Link>
        </p>
      </div>
    </div>
  )
}
