import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function ArchivedProjectsModal({ isOpen, onClose, language, showNotification, onProjectRestored }) {
  const [archivedBoards, setArchivedBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // board_id being processed

  const tMsg = (en, id) => (language === 'id' ? id : en);

  const fetchArchivedBoards = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const res = await axios.get('/api/boards/archived');
      setArchivedBoards(res.data || []);
    } catch (err) {
      showNotification(tMsg('Failed to load archived projects.', 'Gagal memuat proyek diarsipkan.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    fetchArchivedBoards();
  }, [fetchArchivedBoards]);

  const handleUnarchive = async (board) => {
    setActionLoading(board.id);
    try {
      await axios.patch(`/api/boards/${board.id}/unarchive`);
      showNotification(
        tMsg(`"${board.name}" restored to your projects.`, `"${board.name}" dipulihkan ke proyek aktif.`),
        'success'
      );
      setArchivedBoards((prev) => prev.filter((b) => b.id !== board.id));
      if (onProjectRestored) onProjectRestored();
    } catch (err) {
      showNotification(
        tMsg('Failed to restore project.', 'Gagal memulihkan proyek.'),
        'error'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (board) => {
    if (!window.confirm(tMsg(
      `Permanently delete "${board.name}"? This cannot be undone.`,
      `Hapus permanen "${board.name}"? Tindakan ini tidak bisa dibatalkan.`
    ))) return;
    setActionLoading(board.id);
    try {
      await axios.delete(`/api/boards/${board.id}`);
      showNotification(
        tMsg(`"${board.name}" permanently deleted.`, `"${board.name}" dihapus secara permanen.`),
        'success'
      );
      setArchivedBoards((prev) => prev.filter((b) => b.id !== board.id));
    } catch (err) {
      showNotification(tMsg('Failed to delete project.', 'Gagal menghapus proyek.'), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-neutral-950 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] border border-neutral-200 dark:border-neutral-800">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
              <svg className="w-5 h-5 text-neutral-500 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <polyline points="21 8 21 21 3 21 3 8" />
                <rect x="1" y="3" width="22" height="5" rx="1" />
                <line x1="10" y1="12" x2="14" y2="12" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-black text-neutral-900 dark:text-white">
                {tMsg('Archived Projects', 'Proyek Diarsipkan')}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {tMsg('Restore or permanently delete archived projects', 'Pulihkan atau hapus permanen proyek yang diarsipkan')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-neutral-400">
              <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span className="text-sm">{tMsg('Loading...', 'Memuat...')}</span>
            </div>
          ) : archivedBoards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-neutral-400">
              <svg className="w-12 h-12 text-neutral-200 dark:text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <polyline points="21 8 21 21 3 21 3 8" />
                <rect x="1" y="3" width="22" height="5" rx="1" />
                <line x1="10" y1="12" x2="14" y2="12" />
              </svg>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {tMsg('No archived projects yet', 'Belum ada proyek yang diarsipkan')}
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-600 text-center max-w-xs">
                {tMsg(
                  'Archive projects to keep your sidebar clean without deleting them.',
                  'Arsipkan proyek untuk menjaga sidebar tetap rapi tanpa menghapusnya.'
                )}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {archivedBoards.map((board) => (
                <div
                  key={board.id}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Project avatar */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-black shrink-0"
                      style={{ backgroundColor: `hsl(${(board.id * 47) % 360}, 55%, 45%)` }}
                    >
                      {board.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{board.name}</p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                        {board.task_count} {tMsg('tasks', 'tugas')}
                        {board.last_activity_date && (
                          <> · {tMsg('Last active', 'Terakhir aktif')}: {new Date(board.last_activity_date).toLocaleDateString()}</>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleUnarchive(board)}
                      disabled={actionLoading === board.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111E38] hover:bg-[#1a2d52] text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      title={tMsg('Restore Project', 'Pulihkan Proyek')}
                    >
                      {actionLoading === board.id ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                        </svg>
                      )}
                      {tMsg('Restore', 'Pulihkan')}
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(board)}
                      disabled={actionLoading === board.id}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                      title={tMsg('Delete Permanently', 'Hapus Permanen')}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 shrink-0 bg-neutral-50 dark:bg-neutral-900/30 rounded-b-2xl">
          <p className="text-[10px] text-neutral-400 dark:text-neutral-600 text-center">
            {tMsg(
              'Archived projects are hidden from your sidebar but all data is preserved.',
              'Proyek diarsipkan disembunyikan dari sidebar namun semua data tetap tersimpan.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
