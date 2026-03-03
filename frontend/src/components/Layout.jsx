import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Play, History, BarChart3,
  Settings, LogOut, Menu, X, Zap, Bell, Search,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/start-interview', icon: Play, label: 'Start Interview' },
  { to: '/history', icon: History, label: 'Interview History' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Layout = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || 'U';

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`flex flex-col h-full py-6 px-4 ${mobile ? '' : ''}`}
      style={{ background: '#fff', borderRight: '1px solid #f1f5f9' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#06b6d4' }}>
          <Zap size={16} color="white" fill="white" />
        </div>
        <span className="font-display font-700 text-lg" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
          InterviewAI
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => mobile && setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`
            }
            style={({ isActive }) => isActive ? { background: '#06b6d4' } : {}}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150 mt-4"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#fdf6f6' }}>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-56 shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 shadow-2xl">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-6 py-4 bg-white border-b border-slate-100">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} className="text-slate-600" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xs relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search sessions, topics..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors relative">
              <Bell size={16} className="text-slate-500" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: '#f97316' }} />
            </button>

            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white cursor-pointer"
              style={{ background: '#06b6d4' }}
              title={user?.email}
            >
              {initials}
            </div>

            <button
              onClick={() => navigate('/start-interview')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: '#06b6d4' }}
            >
              <Play size={14} fill="white" />
              Start New Interview
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
