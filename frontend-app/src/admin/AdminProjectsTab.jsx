import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

export default function AdminProjectsTab({ language, showNotification, fetchStats }) {
  const tMsg = useCallback((en, id) => (language === 'id' ? id : en), [language]);

  const [adminBoards, setAdminBoards] = useState([]);
  const [isBoardsLoading, setIsBoardsLoading] = useState(true);
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [boardsToDelete, setBoardsToDelete] = useState([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [boardToTransfer, setBoardToTransfer] = useState(null);
  const [newOwnerInput, setNewOwnerInput] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const fetchBoards = useCallback(() => {
    axios
      .get('/api/admin/boards')
      .then((res) => setAdminBoards(res.data.boards || []))
      .catch(() => {})
      .finally(() => setIsBoardsLoading(false));
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setBoardToTransfer(null);
        setDeleteConfirmOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredAdminBoards = useMemo(() => {
    return adminBoards.filter((b) => {
      const matchFilter = projectFilter === 'all' || b.owner_status === projectFilter;
      const matchSearch =
        b.name.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
        b.owner_username.toLowerCase().includes(projectSearchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [adminBoards, projectFilter, projectSearchQuery]);

  const handleExecuteTransfer = (e) => {
    e.preventDefault();
    if (!boardToTransfer || !newOwnerInput.trim()) return;
    setIsTransferring(true);
    axios
      .put(`/api/admin/boards/${boardToTransfer.id}/transfer`, { new_owner: newOwnerInput.trim() })
      .then((res) => {
        showNotification(res.data.message || tMsg('Transferred', 'Proyek berhasil dipindah'), 'success');
        setBoardToTransfer(null);
        setNewOwnerInput('');
        fetchBoards();
        fetchStats();
      })
      .catch((err) => {
        showNotification(err.response?.data?.detail || tMsg('Transfer failed', 'Transfer gagal'), 'error');
      })
      .finally(() => setIsTransferring(false));
  };

  const handleBulkDeleteProjects = () => {
    setIsDeletingBulk(true);
    const promises = boardsToDelete.map((b) => axios.delete(`/api/boards/${b.id}`));
    Promise.allSettled(promises)
      .then((results) => {
        const successes = results.filter((r) => r.status === 'fulfilled').length;
        const failures = results.filter((r) => r.status === 'rejected').length;
        showNotification(
          tMsg(
            `Deleted ${successes} project(s). ${failures ? `${failures} failed.` : ''}`,
            `Berhasil menghapus ${successes} proyek. ${failures ? `${failures} gagal.` : ''}`
          ),
          failures > 0 ? 'info' : 'success'
        );
        setDeleteConfirmOpen(false);
        setBoardsToDelete([]);
        fetchBoards();
        fetchStats();
      })
      .finally(() => setIsDeletingBulk(false));
  };

  return (
    <>
      <div className="space-y-4">
        <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-4 rounded-2xl shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-400 text-[18px]">search</span>
            <input
              type="text"
              value={projectSearchQuery}
              onChange={(e) => setProjectSearchQuery(e.target.value)}
              placeholder={tMsg('Search projects or owner...', 'Cari proyek atau pemilik...')}
              className="w-full pl-9 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
            />
          </div>

          <div className="flex items-center gap-1">
            {[
              { id: 'all', label: tMsg('All Projects', 'Semua Proyek') },
              { id: 'orphan', label: tMsg('Orphaned Projects', 'Proyek Yatim') },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setProjectFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  projectFilter === tab.id
                    ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38]'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl shadow-2xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50 text-[10px] uppercase tracking-wider font-extrabold text-neutral-400">
                <th className="p-3.5 pl-4">{tMsg('Project Name', 'Nama Proyek')}</th>
                <th className="p-3.5">{tMsg('Current Owner', 'Pemilik Saat Ini')}</th>
                <th className="p-3.5">{tMsg('Owner Status', 'Status Pemilik')}</th>
                <th className="p-3.5">{tMsg('Created Date', 'Tanggal Dibuat')}</th>
                <th className="p-3.5 pr-4 text-right">{tMsg('Actions', 'Aksi')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50 font-medium">
              {filteredAdminBoards.map((b) => (
                <tr key={b.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                  <td className="p-3.5 pl-4 font-bold text-[#111E38] dark:text-white flex items-center">
                    <span className="material-symbols-outlined text-[16px] align-middle mr-1">folder</span> {b.name}
                  </td>
                  <td className="p-3.5 text-neutral-600 dark:text-neutral-300">
                    @{b.owner_username}
                  </td>
                  <td className="p-3.5">
                    {b.owner_status === 'orphan' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                        <span className="material-symbols-outlined text-[12px] align-middle mr-0.5">warning</span> {tMsg('Orphaned (No Owner)', 'Yatim (Tanpa Pemilik)')}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        {b.owner_status}
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-neutral-400 text-[11px]">
                    {b.created_at ? b.created_at.split('T')[0] : '—'}
                  </td>
                  <td className="p-3.5 pr-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setBoardToTransfer(b);
                          setNewOwnerInput('');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-[11px] cursor-pointer"
                      >
                        {tMsg('Transfer Ownership', 'Pindah Pemilik')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBoardsToDelete([b]);
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-400 hover:text-red-500 cursor-pointer"
                        title={tMsg('Delete Project', 'Hapus Proyek')}
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {isBoardsLoading ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-neutral-400 font-bold">
                    <span className="material-symbols-outlined text-[24px] animate-spin align-middle mr-2">progress_activity</span>
                    {tMsg('Loading projects...', 'Memuat direktori proyek...')}
                  </td>
                </tr>
              ) : filteredAdminBoards.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-neutral-400 font-bold">
                    {tMsg('No projects found.', 'Tidak ada proyek ditemukan.')}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── TRANSFER PROJECT MODAL ── */}
      {boardToTransfer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-100 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121B2D] p-6 sm:p-8 w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl animate-fadeIn">
            <h3 className="text-base font-black text-[#111E38] dark:text-white uppercase mb-2">
              {tMsg('Transfer Project Ownership', 'Pindahkan Pemilik Proyek')}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              {tMsg('Transfer project', 'Pindahkan kepemilikan proyek')} <strong>"{boardToTransfer.name}"</strong> {tMsg('to a new username:', 'ke username baru:')}
            </p>

            <form onSubmit={handleExecuteTransfer} className="space-y-4">
              <input
                type="text"
                autoFocus
                value={newOwnerInput}
                onChange={(e) => setNewOwnerInput(e.target.value)}
                placeholder={tMsg('New owner username...', 'Username pemilik baru...')}
                className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                required
              />

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setBoardToTransfer(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 cursor-pointer"
                >
                  {tMsg('Cancel', 'Batal')}
                </button>
                <button
                  type="submit"
                  disabled={isTransferring}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-[#FACC15] hover:bg-amber-400 text-[#111E38] border border-amber-400 disabled:opacity-50 cursor-pointer"
                >
                  {isTransferring ? tMsg('Transferring...', 'Memindahkan...') : tMsg('Confirm Transfer', 'Konfirmasi Pindah')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PROJECT DELETE CONFIRMATION MODAL ── */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-100 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121B2D] p-6 sm:p-8 w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl animate-fadeIn text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-800">
              <span className="material-symbols-outlined text-[28px]">delete</span>
            </div>
            <h3 className="text-base font-black text-[#111E38] dark:text-white uppercase">
              {tMsg('Delete Project(s)?', 'Hapus Proyek?')}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {tMsg(
                `Are you sure you want to permanently delete ${boardsToDelete.length} project(s)? All tasks within will be deleted.`,
                `Apakah Anda yakin ingin menghapus permanen ${boardsToDelete.length} proyek? Semua tugas di dalamnya akan terhapus.`
              )}
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 cursor-pointer"
              >
                {tMsg('Cancel', 'Batal')}
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteProjects}
                disabled={isDeletingBulk}
                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isDeletingBulk ? tMsg('Deleting...', 'Menghapus...') : tMsg('Yes, Delete', 'Ya, Hapus')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
