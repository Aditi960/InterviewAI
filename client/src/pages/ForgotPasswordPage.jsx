import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    toast.error('Password reset is not available. Please contact support.')
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
        <p className="text-gray-500 text-sm mb-8">Password reset is not currently available. Please contact support for assistance.</p>

        <p className="text-center text-sm text-gray-500 mt-6">
          Back to{' '}
          <Link to="/login" className="text-brand-cyan font-medium hover:underline">log in</Link>
        </p>
      </div>
    </div>
  )
}
