import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Users, FileText, LogOut, Trash2, Calendar } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
    if (!token || user.role !== 'admin') {
      navigate('/admin/login');
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data);
    } catch {
      toast.error('Failed to load users');
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await api.get('/api/admin/sessions');
      setSessions(res.data);
    } catch {
      toast.error('Failed to load sessions');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (activeTab === 'users') {
        await fetchUsers();
      } else {
        await fetchSessions();
      }
      setLoading(false);
    };
    loadData();
  }, [activeTab]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handlePromote = async (user) => {
    const confirmed = window.confirm(`Are you sure you want to grant admin access to ${user.name}?`);
    if (!confirmed) return;
    try {
      await api.post('/api/admin/promote', { userId: user._id });
      setUsers(prevUsers => prevUsers.map(u => (
        u._id === user._id ? { ...u, role: 'admin' } : u
      )));
      toast.success('User promoted to admin successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to promote user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#06b6d4', margin: '0 auto 12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const tabStyle = (tab) => ({
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    borderBottom: activeTab === tab ? '2px solid #06b6d4' : '2px solid transparent',
    background: 'none',
    color: activeTab === tab ? '#06b6d4' : (darkMode ? '#94a3b8' : '#64748b'),
    fontFamily: 'inherit',
  });

  return (
    <div style={{ minHeight: '100vh', background: darkMode ? '#0f172a' : '#f8fafc', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700, margin: 0, color: darkMode ? '#f1f5f9' : '#1e293b' }}>
          Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: darkMode ? '#1e293b' : 'white',
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 500,
            cursor: 'pointer', color: darkMode ? '#94a3b8' : '#475569', fontFamily: 'inherit',
          }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, marginBottom: 24 }}>
        <button onClick={() => setActiveTab('users')} style={tabStyle('users')}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={16} /> Users
          </span>
        </button>
        <button onClick={() => setActiveTab('sessions')} style={tabStyle('sessions')}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={16} /> Sessions
          </span>
        </button>
      </div>

      {/* Content */}
      <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: 24 }}>
        {activeTab === 'users' ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${darkMode ? '#334155' : '#f1f5f9'}` }}>
                  {['NAME', 'EMAIL', 'JOINED DATE', 'ACTION'].map(h => (
                    <th key={h} style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textAlign: 'left', padding: '0 8px 12px', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>
                      No users found.
                    </td>
                  </tr>
                )}
                {users.map((user, i) => (
                  <tr key={user._id} style={{ borderBottom: i < users.length - 1 ? `1px solid ${darkMode ? '#334155' : '#f1f5f9'}` : 'none' }}>
                    <td style={{ padding: '14px 8px', fontWeight: 600, fontSize: 14, color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                      {user.name}
                    </td>
                    <td style={{ padding: '14px 8px', fontSize: 13, color: darkMode ? '#94a3b8' : '#64748b' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '14px 8px', fontSize: 13, color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={13} />
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {user.role !== 'admin' ? (
                          <button
                            onClick={() => handlePromote(user)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              background: darkMode ? '#083344' : '#ecfeff', border: '1px solid #67e8f9',
                              borderRadius: 8, padding: '6px 14px', fontSize: 13,
                              cursor: 'pointer', fontWeight: 600, color: '#0891b2',
                              fontFamily: 'inherit',
                            }}
                          >
                            Make Admin
                          </button>
                        ) : (
                          <span
                            style={{
                              background: darkMode ? '#1e3a8a' : '#dbeafe',
                              border: '1px solid #93c5fd',
                              color: darkMode ? '#bfdbfe' : '#1d4ed8',
                              borderRadius: 999,
                              padding: '4px 10px',
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: '0.04em',
                            }}
                          >
                            Admin
                          </span>
                        )}
                        <button
                          onClick={() => handleDelete(user._id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: '#fef2f2', border: '1px solid #fecaca',
                            borderRadius: 8, padding: '6px 14px', fontSize: 13,
                            cursor: 'pointer', fontWeight: 500, color: '#ef4444',
                            fontFamily: 'inherit',
                          }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${darkMode ? '#334155' : '#f1f5f9'}` }}>
                  {['USER NAME', 'ROLE', 'DIFFICULTY', 'SCORE', 'DATE'].map(h => (
                    <th key={h} style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textAlign: 'left', padding: '0 8px 12px', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>
                      No sessions found.
                    </td>
                  </tr>
                )}
                {sessions.map((session, i) => (
                  <tr key={session._id} style={{ borderBottom: i < sessions.length - 1 ? `1px solid ${darkMode ? '#334155' : '#f1f5f9'}` : 'none' }}>
                    <td style={{ padding: '14px 8px', fontWeight: 600, fontSize: 14, color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                      {session.userName || session.user?.name || 'N/A'}
                    </td>
                    <td style={{ padding: '14px 8px', fontSize: 13, color: darkMode ? '#94a3b8' : '#64748b' }}>
                      {session.role}
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      <DifficultyBadge d={session.difficulty} />
                    </td>
                    <td style={{ padding: '14px 8px', fontWeight: 700, fontSize: 15, color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                      {session.score}/10
                    </td>
                    <td style={{ padding: '14px 8px', fontSize: 13, color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={13} />
                        {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const DifficultyBadge = ({ d }) => {
  const map = { EASY: ['#06b6d4', '#e0f7fa'], MEDIUM: ['#eab308', '#fefce8'], HARD: ['#ef4444', '#fef2f2'] };
  const [c, bg] = map[d] || ['#94a3b8', '#f1f5f9'];
  return (
    <span style={{ background: bg, color: c, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
      {d}
    </span>
  );
};

export default AdminDashboard;
