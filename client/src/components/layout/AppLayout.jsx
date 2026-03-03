import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, PlayCircle, History, BarChart3,
  Settings, LogOut, Zap, Bell
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/start', icon: PlayCircle, label: 'Start Interview' },
  { to: '/history', icon: History, label: 'Interview History' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function AppLayout({ children }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-[#fdf5f5]">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col fixed h-full z-10 shadow-sm">
        {/* Logo */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-cyan rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-gray-900" />
            </div>
            <span className="font-display font-bold text-gray-900 text-lg tracking-tight">InterviewAI</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              <span className="text-sm">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom: user + logout */}
        <div className="p-4 border-t border-gray-100">
          {profile && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-cyan to-blue-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {profile.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{profile.name}</p>
                <p className="text-xs text-gray-400 truncate">{profile.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-500 hover:bg-red-50"
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  )
}
