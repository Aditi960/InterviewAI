import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Database, Layers, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import api from '../lib/api'
import { format } from 'date-fns'

const ROLE_ICONS = {
  'Frontend Developer': FileText,
  'Backend Engineer': Database,
  'Full Stack Developer': Layers,
}

const DiffBadge = ({ d }) => {
  const m = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' }
  return <span className={m[d] || 'badge-easy'}>{d}</span>
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async (page = 1) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/interviews/history?page=${page}&limit=10`)
      setSessions(data.sessions)
      setPagination(data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = sessions.filter(s =>
    !search || s.role.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-800">Interview History</h1>
          <p className="text-gray-400 text-sm mt-1">{pagination.total} total sessions</p>
        </div>
        <Link to="/start" className="btn-primary text-sm py-2.5 px-5">+ New Interview</Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10 max-w-xs"
          placeholder="Filter by role..."
        />
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-10 h-10 bg-brand-cyan/20 rounded-xl mx-auto animate-pulse mb-3" />
            <p className="text-gray-400 text-sm">Loading sessions...</p>
          </div>
        ) : filtered.length > 0 ? (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Role', 'Difficulty', 'Score', 'Level', 'Date', 'Action'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s) => {
                  const Icon = ROLE_ICONS[s.role] || FileText
                  return (
                    <tr key={s._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                            <Icon size={16} className="text-gray-500" />
                          </div>
                          <span className="font-medium text-gray-800 text-sm">{s.role}</span>
                        </div>
                      </td>
                      <td className="py-4"><DiffBadge d={s.difficulty} /></td>
                      <td className="py-4">
                        <span className={`font-display font-bold ${
                          s.score >= 7 ? 'text-emerald-600' : s.score >= 5 ? 'text-amber-500' : 'text-red-500'
                        }`}>
                          {s.score?.toFixed(1)}/10
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-500">{s.experienceLevel}</td>
                      <td className="py-4 text-sm text-gray-500">{format(new Date(s.createdAt), 'MMM d, yyyy')}</td>
                      <td className="py-4">
                        <Link to={`/report/${s._id}`} className="btn-secondary py-1.5 px-4 text-xs">View Report</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-400">
                  Page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => load(pagination.page - 1)}
                    className="btn-secondary py-2 px-3 disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => load(pagination.page + 1)}
                    className="btn-secondary py-2 px-3 disabled:opacity-40"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm mb-3">No sessions found</p>
            <Link to="/start" className="btn-primary text-sm py-2.5 px-6 inline-block">Start your first interview</Link>
          </div>
        )}
      </div>
    </div>
  )
}
