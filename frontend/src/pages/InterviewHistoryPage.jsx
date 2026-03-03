import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api.js';
import { format } from 'date-fns';
import { FileText, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const DifficultyBadge = ({ d }) => {
  const cls = d === 'EASY' ? 'badge-easy' : d === 'HARD' ? 'badge-hard' : 'badge-medium';
  return <span className={cls}>{d}</span>;
};

export default function InterviewHistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    try {
      const data = await api.get(`/interviews/history?page=${page}&limit=10`);
      setSessions(data.sessions);
      setPagination(data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Interview History</h1>
          <p className="text-gray-500 text-sm mt-1">{pagination.total} total sessions</p>
        </div>
        <Link to="/start-interview" className="btn-primary text-sm">+ New Interview</Link>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-[#00D4E8]" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">No interview sessions yet.</p>
            <Link to="/start-interview" className="btn-primary">Start Your First Interview</Link>
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-12 text-xs font-semibold text-gray-400 uppercase tracking-wider pb-4 border-b border-gray-100 mb-1">
              <span className="col-span-4">Role</span>
              <span className="col-span-2">Difficulty</span>
              <span className="col-span-2">Score</span>
              <span className="col-span-2">Date</span>
              <span className="col-span-2">Report</span>
            </div>

            <div className="divide-y divide-gray-50">
              {sessions.map(session => (
                <div key={session._id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-0 items-center py-4">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-base flex-shrink-0">
                      {session.role.includes('Frontend') ? '🖥️' : session.role.includes('Backend') ? '⚙️' : '🔥'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{session.role}</p>
                      <p className="text-xs text-gray-400">
                        {session.topicAnalysis?.length || 0} topics covered
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2"><DifficultyBadge d={session.difficulty} /></div>
                  <div className="col-span-2">
                    <span className={`font-bold text-sm ${session.score >= 8 ? 'text-[#00D4E8]' : session.score >= 6 ? 'text-amber-500' : 'text-[#FF6B6B]'}`}>
                      {session.score?.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="col-span-2 text-sm text-gray-500">
                    {format(new Date(session.createdAt), 'MMM d, yyyy')}
                  </div>
                  <div className="col-span-2">
                    <Link to={`/report/${session._id}`} className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5">
                      <FileText size={12} />
                      View Report
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between pt-5 mt-3 border-t border-gray-50">
                <button
                  onClick={() => fetchHistory(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="btn-ghost flex items-center gap-1 disabled:opacity-40"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => fetchHistory(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="btn-ghost flex items-center gap-1 disabled:opacity-40"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
