import { useState, useCallback, useEffect, useRef, Fragment } from 'react';
import axios from 'axios';

export default function AdminContentReviewTab({ language, showNotification }) {
  const tMsg = useCallback((en, id) => (language === 'id' ? id : en), [language]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [contentType, setContentType] = useState('all');
  const [userFilter, setUserFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Results State
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 25;

  // Moderation State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contentToDelete, setContentToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [userToFreeze, setUserToFreeze] = useState('');
  const [isFreezing, setIsFreezing] = useState(false);

  // Expanded rows
  const [expandedRows, setExpandedRows] = useState(new Set());

  const searchInputRef = useRef(null);

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (showDeleteModal) setShowDeleteModal(false);
        else if (showFreezeModal) setShowFreezeModal(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showDeleteModal, showFreezeModal]);

  // Search handler
  const handleSearch = useCallback((pageNum = 1) => {
    setIsLoading(true);
    setPage(pageNum);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    if (contentType !== 'all') params.append('type', contentType);
    if (userFilter.trim()) params.append('username', userFilter.trim());
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);
    params.append('page', pageNum);
    params.append('per_page', perPage);

    axios
      .get(`/api/admin/content/search?${params.toString()}`)
      .then((res) => {
        setResults(res.data.results || []);
        setTotalResults(res.data.total || 0);
        setExpandedRows(new Set());
      })
      .catch((err) => {
        showNotification(
          err.response?.data?.detail || tMsg('Failed to search content', 'Gagal mencari konten'),
          'error'
        );
      })
      .finally(() => setIsLoading(false));
  }, [searchQuery, contentType, userFilter, fromDate, toDate, showNotification, tMsg]);

  // Delete content handler
  const handleDeleteContent = () => {
    if (!contentToDelete) return;
    setIsDeleting(true);

    let deletePromise;
    if (contentToDelete.type === 'task_comment') {
      deletePromise = axios.delete(
        `/api/tasks/${contentToDelete.task_id}/comments/${contentToDelete.id}`
      );
    } else if (contentToDelete.type === 'chat') {
      deletePromise = axios.delete(
        `/api/boards/${contentToDelete.board_id}/chat/${contentToDelete.id}`
      );
    } else if (contentToDelete.type === 'dm') {
      deletePromise = axios.delete(`/api/dm/${contentToDelete.id}`);
    } else {
      setIsDeleting(false);
      return;
    }

    deletePromise
      .then(() => {
        showNotification(tMsg('Content deleted successfully', 'Konten berhasil dihapus'), 'success');
        setShowDeleteModal(false);
        setContentToDelete(null);
        setDeleteReason('');
        // Refresh results
        handleSearch(page);
      })
      .catch((err) => {
        showNotification(
          err.response?.data?.detail || tMsg('Failed to delete content', 'Gagal menghapus konten'),
          'error'
        );
      })
      .finally(() => setIsDeleting(false));
  };

  // Freeze user handler
  const handleFreezeUser = () => {
    if (!userToFreeze) return;
    setIsFreezing(true);
    axios
      .put('/api/admin/users/status', { username: userToFreeze, status: 'frozen' })
      .then(() => {
        showNotification(
          tMsg(`User @${userToFreeze} has been frozen`, `Pengguna @${userToFreeze} telah dibekukan`),
          'success'
        );
        setShowFreezeModal(false);
        setUserToFreeze('');
      })
      .catch((err) => {
        showNotification(
          err.response?.data?.detail || tMsg('Failed to freeze user', 'Gagal membekukan pengguna'),
          'error'
        );
      })
      .finally(() => setIsFreezing(false));
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalPages = Math.ceil(totalResults / perPage);

  const contentTypeOptions = [
    { id: 'all', label: tMsg('All Content', 'Semua Konten') },
    { id: 'task', label: tMsg('Tasks', 'Tugas') },
    { id: 'task_comment', label: tMsg('Task Comments', 'Komentar Tugas') },
    { id: 'chat', label: tMsg('Team Chat', 'Chat Tim') },
    { id: 'dm', label: tMsg('Direct Messages', 'Pesan Langsung') },
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'task': return 'task_alt';
      case 'task_comment': return 'comment';
      case 'chat': return 'forum';
      case 'dm': return 'mail';
      default: return 'description';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'task': return tMsg('Task', 'Tugas');
      case 'task_comment': return tMsg('Comment', 'Komentar');
      case 'chat': return tMsg('Chat', 'Chat');
      case 'dm': return tMsg('DM', 'DM');
      default: return type;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'task': return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300';
      case 'task_comment': return 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300';
      case 'chat': return 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300';
      case 'dm': return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300';
      default: return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400';
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Privacy Notice */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-4 rounded-2xl flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-500 text-[20px] mt-0.5 shrink-0">privacy_tip</span>
          <div>
            <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
              {tMsg('Content Review — Privacy Notice', 'Tinjauan Konten — Pemberitahuan Privasi')}
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5 leading-relaxed">
              {tMsg(
                'This tool provides read-only access to user-generated content for Terms of Service compliance review. All moderation actions are logged. Access this responsibly.',
                'Alat ini menyediakan akses baca-saja ke konten pengguna untuk tinjauan kepatuhan Syarat & Ketentuan. Semua tindakan moderasi tercatat. Gunakan dengan bertanggung jawab.'
              )}
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-4 rounded-2xl shadow-2xs space-y-3">
          {/* Row 1: Search + Content Type */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-400 text-[18px]">search</span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(1)}
                placeholder={tMsg('Search content, keywords, usernames...', 'Cari konten, kata kunci, username...')}
                className="w-full pl-9 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto">
              {contentTypeOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setContentType(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    contentType === opt.id
                      ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38]'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: User filter + Date range + Search button */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="relative sm:w-56">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-400 text-[18px]">person</span>
              <input
                type="text"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                placeholder={tMsg('Filter by username...', 'Filter berdasarkan username...')}
                className="w-full pl-9 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
              <span className="material-symbols-outlined text-[16px]">date_range</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-2 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs outline-none"
              />
              <span>—</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-2 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => handleSearch(1)}
              disabled={isLoading}
              className="px-5 py-2 bg-[#FACC15] hover:bg-amber-400 text-[#111E38] font-black text-xs rounded-xl border border-amber-400/80 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">search</span>
              <span>{isLoading ? tMsg('Searching...', 'Mencari...') : tMsg('Search', 'Cari')}</span>
            </button>
          </div>
        </div>

        {/* Results Count */}
        {totalResults > 0 && (
          <div className="flex items-center justify-between text-xs font-bold text-neutral-500 px-1">
            <span>
              {tMsg(
                `Showing ${(page - 1) * perPage + 1}-${Math.min(page * perPage, totalResults)} of ${totalResults} results`,
                `Menampilkan ${(page - 1) * perPage + 1}-${Math.min(page * perPage, totalResults)} dari ${totalResults} hasil`
              )}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => handleSearch(page - 1)}
                  className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <span className="px-2 font-mono">{page}/{totalPages}</span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => handleSearch(page + 1)}
                  className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results Table */}
        <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl shadow-2xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-[32px] text-neutral-300 animate-spin">progress_activity</span>
              <span className="text-xs font-bold text-neutral-400">{tMsg('Searching content...', 'Mencari konten...')}</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-neutral-200 dark:text-neutral-700 mb-3 block">content_paste_search</span>
              <div className="text-sm font-bold text-neutral-400 dark:text-neutral-500">
                {totalResults === 0 && searchQuery
                  ? tMsg('No content matches your search.', 'Tidak ada konten yang sesuai pencarian.')
                  : tMsg('Search for user content to begin review.', 'Cari konten pengguna untuk memulai tinjauan.')}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                {tMsg('Use keywords, usernames, or content types to filter results.', 'Gunakan kata kunci, username, atau tipe konten untuk menyaring hasil.')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50 text-[10px] uppercase tracking-wider font-extrabold text-neutral-400">
                    <th className="p-3.5 pl-4 w-8"></th>
                    <th className="p-3.5">{tMsg('Type', 'Tipe')}</th>
                    <th className="p-3.5">{tMsg('Author', 'Penulis')}</th>
                    <th className="p-3.5">{tMsg('Content Preview', 'Pratinjau Konten')}</th>
                    <th className="p-3.5">{tMsg('Context', 'Konteks')}</th>
                    <th className="p-3.5">{tMsg('Date', 'Tanggal')}</th>
                    <th className="p-3.5 pr-4 text-right">{tMsg('Actions', 'Aksi')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50 font-medium">
                  {results.map((item) => (
                    <Fragment key={`${item.type}-${item.id}`}>
                      <tr className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                        <td className="p-3.5 pl-4">
                          <button
                            type="button"
                            onClick={() => toggleRow(`${item.type}-${item.id}`)}
                            className="p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                          >
                            <span className={`material-symbols-outlined text-[16px] text-neutral-400 transition-transform ${expandedRows.has(`${item.type}-${item.id}`) ? 'rotate-90' : ''}`}>
                              chevron_right
                            </span>
                          </button>
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${getTypeColor(item.type)}`}>
                            <span className="material-symbols-outlined text-[12px]">{getTypeIcon(item.type)}</span>
                            {getTypeLabel(item.type)}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-[#111E38] dark:bg-neutral-700 text-white flex items-center justify-center font-bold text-[9px] uppercase shrink-0">
                              {(item.author || '??').slice(0, 2)}
                            </div>
                            <span className="font-bold text-[#111E38] dark:text-white">@{item.author}</span>
                          </div>
                        </td>
                        <td className="p-3.5 max-w-xs">
                          <div className="truncate text-neutral-600 dark:text-neutral-300">
                            {item.preview || item.content?.substring(0, 80) || '—'}
                          </div>
                        </td>
                        <td className="p-3.5 text-neutral-400 text-[11px]">
                          {item.project_name && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">folder</span>
                              {item.project_name}
                            </span>
                          )}
                          {item.task_title && (
                            <span className="flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-outlined text-[12px]">task_alt</span>
                              {item.task_title}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-neutral-400 text-[11px] font-mono whitespace-nowrap">
                          {item.created_at ? item.created_at.split('T')[0] : '—'}
                        </td>
                        <td className="p-3.5 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.type !== 'task' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setContentToDelete(item);
                                  setShowDeleteModal(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-400 hover:text-red-500 cursor-pointer"
                                title={tMsg('Delete Content', 'Hapus Konten')}
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setUserToFreeze(item.author);
                                setShowFreezeModal(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-neutral-400 hover:text-cyan-500 cursor-pointer"
                              title={tMsg('Freeze User', 'Bekukan Pengguna')}
                            >
                              <span className="material-symbols-outlined text-[16px]">block</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded row */}
                      {expandedRows.has(`${item.type}-${item.id}`) && (
                        <tr>
                          <td colSpan="7" className="p-0">
                            <div className="px-6 py-4 bg-neutral-50/50 dark:bg-neutral-900/30 border-l-4 border-[#FACC15]">
                              <div className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400 mb-2">
                                {tMsg('Full Content', 'Konten Lengkap')}
                              </div>
                              <div className="text-xs text-[#111E38] dark:text-neutral-200 leading-relaxed whitespace-pre-wrap break-words max-h-48 overflow-y-auto custom-scrollbar bg-white dark:bg-[#121B2D] p-3 rounded-xl border border-neutral-200 dark:border-neutral-800">
                                {item.content || tMsg('No content body available.', 'Konten tidak tersedia.')}
                              </div>
                              {item.task_title && (
                                <div className="mt-2 text-[11px] text-neutral-400">
                                  <span className="font-bold">{tMsg('Task:', 'Tugas:')}</span> {item.task_title}
                                  {item.project_name && <span> · <span className="font-bold">{tMsg('Project:', 'Proyek:')}</span> {item.project_name}</span>}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Content Modal */}
      {showDeleteModal && contentToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-100 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121B2D] p-6 sm:p-8 w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl animate-fadeIn text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center mx-auto border border-red-200 dark:border-red-800">
              <span className="material-symbols-outlined text-[28px]">delete_sweep</span>
            </div>
            <h3 className="text-base font-black text-[#111E38] dark:text-white uppercase">
              {tMsg('Delete Content', 'Hapus Konten')}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {tMsg(
                `Delete this ${getTypeLabel(contentToDelete.type).toLowerCase()} by @${contentToDelete.author}?`,
                `Hapus ${getTypeLabel(contentToDelete.type).toLowerCase()} ini oleh @${contentToDelete.author}?`
              )}
            </p>
            <div className="bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-xl text-left text-[11px] text-neutral-600 dark:text-neutral-300 max-h-24 overflow-y-auto">
              {contentToDelete.preview || contentToDelete.content?.substring(0, 200) || '—'}
            </div>

            <div className="text-left space-y-1">
              <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                {tMsg('Reason (optional)', 'Alasan (opsional)')}
              </label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder={tMsg('e.g., ToS violation, spam, inappropriate', 'cth: Pelanggaran ToS, spam, tidak pantas')}
                className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteReason('');
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 cursor-pointer"
              >
                {tMsg('Cancel', 'Batal')}
              </button>
              <button
                type="button"
                onClick={handleDeleteContent}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? tMsg('Deleting...', 'Menghapus...') : tMsg('Delete', 'Hapus')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Freeze User Modal */}
      {showFreezeModal && userToFreeze && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-100 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121B2D] p-6 sm:p-8 w-full max-w-sm border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl animate-fadeIn text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500 flex items-center justify-center mx-auto border border-cyan-200 dark:border-cyan-800">
              <span className="material-symbols-outlined text-[28px]">block</span>
            </div>
            <h3 className="text-base font-black text-[#111E38] dark:text-white uppercase">
              {tMsg('Freeze User Account', 'Bekukan Akun Pengguna')}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {tMsg(
                `Freeze @${userToFreeze}'s account? They will be unable to log in until unfrozen.`,
                `Bekukan akun @${userToFreeze}? Mereka tidak akan bisa masuk hingga dicairkan kembali.`
              )}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFreezeModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 cursor-pointer"
              >
                {tMsg('Cancel', 'Batal')}
              </button>
              <button
                type="button"
                onClick={handleFreezeUser}
                disabled={isFreezing}
                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-cyan-600 hover:bg-cyan-700 text-white shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isFreezing ? tMsg('Freezing...', 'Membekukan...') : tMsg('Freeze Account', 'Bekukan Akun')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
