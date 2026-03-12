import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const getPasswordStrength = (pass) => {
  if (!pass) return { label: '', color: '', width: '0%' }
  if (pass.length < 6) return { label: 'Weak', color: 'bg-red-400', width: '30%' }
  if (pass.length < 10 || !/[A-Z]/.test(pass) || !/[0-9]/.test(pass)) return { label: 'Medium', color: 'bg-yellow-400', width: '65%' }
  return { label: 'Strong', color: 'bg-green-400', width: '100%' }
}

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const strength = getPasswordStrength(form.password)

  const update = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await signUp(form.email, form.password, form.name)
      toast.success('Account created! Check your email to verify.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fdf5f5] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-brand-cyan rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-gray-900" />
          </div>
          <span className="font-display font-bold text-gray-900 text-lg">InterviewAI</span>
        </div>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">Create an account</h1>
          <p className="text-gray-500 text-sm">Start your AI interview journey today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Full Name</label>
            <input value={form.name} onChange={update('name')} className="input-field" placeholder="John Doe" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={update('email')} className="input-field" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={update('password')}
                className="input-field pr-10"
                placeholder="Create a password"
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
                </div>
                <span className="text-xs text-gray-500">{strength.label}</span>
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={form.confirm}
              onChange={update('confirm')}
              className="input-field"
              placeholder="Repeat your password"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60 mt-2">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-cyan font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
