import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail, Bell, Shield, LogOut, Save } from 'lucide-react';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [notifications, setNotifications] = useState({ email: true, weekly: false });

  const handleSave = () => toast.success('Settings saved!');
  const handleLogout = async () => { await signOut(); navigate('/'); };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700, color: darkMode ? '#f1f5f9' : '#1e293b', marginBottom: 24 }}>Settings</h1>

      {/* Profile */}
      <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <User size={18} color="#06b6d4" />
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: darkMode ? '#f1f5f9' : '#1e293b', margin: 0 }}>Profile</h3>
        </div>
        <div style={{ display: 'flex', align: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: darkMode ? '#94a3b8' : '#475569', marginBottom: 6 }}>Display Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${darkMode ? '#334155' : '#e2e8f0'}`, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: darkMode ? '#0f172a' : undefined, color: darkMode ? '#f1f5f9' : undefined }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: darkMode ? '#94a3b8' : '#475569', marginBottom: 6 }}>Email</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: darkMode ? '#0f172a' : '#f8fafc', border: `1.5px solid ${darkMode ? '#334155' : '#e2e8f0'}`, fontSize: 14, color: darkMode ? '#94a3b8' : '#94a3b8' }}>
                <Mail size={14} />
                {user?.email}
              </div>
            </div>
          </div>
        </div>
        <button onClick={handleSave}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#06b6d4', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          <Save size={14} /> Save Changes
        </button>
      </div>

      {/* Notifications */}
      <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Bell size={18} color="#eab308" />
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: darkMode ? '#f1f5f9' : '#1e293b', margin: 0 }}>Notifications</h3>
        </div>
        {[
          { key: 'email', label: 'Email notifications', desc: 'Get report summaries via email after each session' },
          { key: 'weekly', label: 'Weekly progress digest', desc: 'Receive a weekly summary of your improvement' },
        ].map(({ key, label, desc }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: key === 'email' ? `1px solid ${darkMode ? '#334155' : '#f1f5f9'}` : 'none' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: darkMode ? '#f1f5f9' : '#1e293b' }}>{label}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{desc}</div>
            </div>
            <button
              onClick={() => setNotifications(p => ({ ...p, [key]: !p[key] }))}
              style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: notifications[key] ? '#06b6d4' : (darkMode ? '#334155' : '#e2e8f0'), cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}
            >
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: notifications[key] ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Shield size={18} color="#ef4444" />
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: darkMode ? '#f1f5f9' : '#1e293b', margin: 0 }}>Account</h3>
        </div>
        <button onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: darkMode ? 'rgba(239,68,68,0.1)' : '#fef2f2', color: '#ef4444', border: `1px solid ${darkMode ? '#7f1d1d' : '#fee2e2'}`, borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Settings;
