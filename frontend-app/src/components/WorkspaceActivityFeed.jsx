import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const ACTION_LABELS = {
  task_created: { id: 'Tugas Dibuat', en: 'Task Created', color: 'bg-blue-100 text-blue-700' },
  task_updated: { id: 'Diperbarui', en: 'Updated', color: 'bg-amber-100 text-amber-700' },
  task_completed: { id: 'Tugas Selesai', en: 'Task Completed', color: 'bg-emerald-100 text-emerald-700' },
  task_status_changed: { id: 'Status Berubah', en: 'Status Changed', color: 'bg-amber-100 text-amber-700' },
  comment_added: { id: 'Komentar Baru', en: 'Comment Added', color: 'bg-purple-100 text-purple-700' },
  member_joined: { id: 'Member Bergabung', en: 'Member Joined', color: 'bg-indigo-100 text-indigo-700' },
  board_created: { id: 'Proyek Dibuat', en: 'Project Created', color: 'bg-sky-100 text-sky-700' },
};

function relativeTime(isoStr, lang = 'id') {
  if (!isoStr) return '';
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
  if (diff < 60) return lang === 'id' ? 'Baru saja' : 'Just now';
  if (diff < 3600) return lang === 'id' ? `${Math.floor(diff / 60)} menit lalu` : `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return lang === 'id' ? `${Math.floor(diff / 3600)} jam lalu` : `${Math.floor(diff / 3600)}h ago`;
  return lang === 'id' ? `${Math.floor(diff / 86400)} hari lalu` : `${Math.floor(diff / 86400)}d ago`;
}

function AvatarCircle({ username }) {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];
  const color = colors[username?.charCodeAt(0) % colors.length] || '#111E38';
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
      style={{ backgroundColor: color }}
    >
      {(username || '?').charAt(0).toUpperCase()}
    </div>
  );
}

export default function WorkspaceActivityFeed({ workspaceId, lang = 'id', apiBase = '/api', token }) {
  const [activities, setActivities] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');
  const limit = 20;

  const fetchActivities = useCallback(async (pg = 1, reset = false) => {
    if (!workspaceId || !token) return;
    setLoading(true);
    try {
      const params = { page: pg, limit };
      if (actionFilter) params.action = actionFilter;
      if (search) params.search = search;
      const resp = await axios.get(`${apiBase}/workspaces/${workspaceId}/activity`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = resp.data;
      if (reset || pg === 1) {
        setActivities(data.activities || []);
      } else {
        setActivities(prev => [...prev, ...(data.activities || [])]);
      }
      setTotal(data.total || 0);
      setPage(pg);
    } catch (e) {
      console.error('[ActivityFeed] fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [workspaceId, token, actionFilter, search, apiBase]);

  useEffect(() => {
    fetchActivities(1, true);
  }, [fetchActivities]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchActivities(1, true);
  };

  const handleLoadMore = () => {
    fetchActivities(page + 1, false);
  };

  const hasMore = activities.length < total;

  const actionOptions = [
    { value: '', label: lang === 'id' ? 'Semua Aksi' : 'All Actions' },
    { value: 'task_created', label: lang === 'id' ? 'Tugas Dibuat' : 'Task Created' },
    { value: 'task_completed', label: lang === 'id' ? 'Tugas Selesai' : 'Task Completed' },
    { value: 'task_status_changed', label: lang === 'id' ? 'Status Berubah' : 'Status Changed' },
    { value: 'comment_added', label: lang === 'id' ? 'Komentar' : 'Comment' },
    { value: 'member_joined', label: lang === 'id' ? 'Member Bergabung' : 'Member Joined' },
    { value: 'board_created', label: lang === 'id' ? 'Proyek Dibuat' : 'Project Created' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-[#111E38]">
          {lang === 'id' ? 'Aktivitas Terkini' : 'Recent Activity'}
        </h3>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-[#111E38] hover:bg-gray-50 transition-colors"
        >
          <svg
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {lang === 'id' ? 'Perbarui' : 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder={lang === 'id' ? 'Cari tugas atau proyek…' : 'Search task or project…'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] px-3 py-2 text-sm border border-gray-200 rounded-lg text-[#111E38] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
        />
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-[#111E38] bg-white focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
        >
          {actionOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Activity List */}
      {loading && activities.length === 0 ? (
        <div className="flex justify-center py-8">
          <svg className="w-6 h-6 animate-spin text-[#FACC15]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : activities.length === 0 ? (
        <div className="py-10 text-center text-gray-400 text-sm">
          {lang === 'id'
            ? 'Belum ada aktivitas tercatat di workspace ini.'
            : 'No activity recorded in this workspace yet.'}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activities.map(act => {
            const actionInfo = ACTION_LABELS[act.action] || { id: act.action, en: act.action, color: 'bg-gray-100 text-gray-600' };
            return (
              <div key={act.id} className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3">
                <AvatarCircle username={act.username} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[#111E38]">{act.username}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${actionInfo.color}`}>
                      {lang === 'id' ? actionInfo.id : actionInfo.en}
                    </span>
                  </div>
                  {act.target_title && (
                    <p className="text-sm text-gray-600 mt-0.5 truncate">
                      {act.target_title}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                  {relativeTime(act.created_at, lang)}
                </span>
              </div>
            );
          })}

          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="w-full py-2.5 text-sm font-medium text-[#111E38] border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {loading
                ? (lang === 'id' ? 'Memuat…' : 'Loading…')
                : (lang === 'id' ? 'Muat Lebih Banyak' : 'Load More')}
            </button>
          )}
        </div>
      )}

      {/* Total count */}
      {total > 0 && (
        <p className="text-xs text-gray-400 text-center">
          {lang === 'id'
            ? `Menampilkan ${activities.length} dari ${total} aktivitas`
            : `Showing ${activities.length} of ${total} activities`}
        </p>
      )}
    </div>
  );
}
