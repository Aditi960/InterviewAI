import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';
import { Save, Loader2, Check } from 'lucide-react';

export default function SettingsPage() {
  const { profile, fetchProfile } = useAuth();
  const [form, setForm] = useState({
    name: profile?.name || '',
    preferredRole: profile?.preferences?.preferredRole || 'Frontend Developer',
    targetDifficulty: profile?.preferences?.targetDifficulty || 'MEDIUM',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSaved(false);
    try {
      await api.put('/auth/profile', {
        name: form.name,
        preferences: {
          preferredRole: form.preferredRole,
          targetDifficulty: form.targetDifficulty,
        },
      });
      await fetchProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-lg">
      <h1 className="font-display font-bold text-2xl text-gray-900 mb-7">Settings</h1>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Profile */}
        <div className="card">
          <h2 className="font-display font-semibold text-gray-900 mb-5">Profile</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="input-field bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
            </div>
          </div>
        </div>

        {/* Interview preferences */}
        <div className="card">
          <h2 className="font-display font-semibold text-gray-900 mb-5">Interview Preferences</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Role</label>
              <select
                value={form.preferredRole}
                onChange={e => setForm(p => ({ ...p, preferredRole: e.target.value }))}
                className="input-field"
              >
                {['Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 'DevOps Engineer', 'Data Scientist'].map(r => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Difficulty</label>
              <div className="flex gap-3">
                {['EASY', 'MEDIUM', 'HARD'].map(d => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setForm(p => ({ ...p, targetDifficulty: d }))}
                    className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                      form.targetDifficulty === d
                        ? d === 'EASY' ? 'border-[#00D4E8] bg-cyan-50 text-[#00D4E8]'
                          : d === 'HARD' ? 'border-[#FF6B6B] bg-red-50 text-[#FF6B6B]'
                          : 'border-[#FFD166] bg-amber-50 text-amber-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin" />Saving…</>
          ) : saved ? (
            <><Check size={16} />Saved!</>
          ) : (
            <><Save size={16} />Save Settings</>
          )}
        </button>
      </form>
    </div>
  );
}
