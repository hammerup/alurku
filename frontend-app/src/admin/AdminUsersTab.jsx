import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

export default function AdminUsersTab({
  adminUsers,
  language,
  showNotification,
  handleDeleteUser,
  handleUpdateUserStatus,
  handleToggleSuperAdmin,
  handleManualVerify,
  fetchUsers,
  fetchStats,
}) {
  const tMsg = (en, id) => (language === 'id' ? id : en);

  // States
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [bulkUserConfirmOpen, setBulkUserConfirmOpen] = useState(false);
  const [bulkUserActionType, setBulkUserActionType] = useState('');
  const [isProcessingBulkUsers, setIsProcessingBulkUsers] = useState(false);

  const [showDeleteChoice, setShowDeleteChoice] = useState(false);
  const [deleteChoiceUser, setDeleteChoiceUser] = useState(null);

  const [userToProcess, setUserToProcess] = useState(null);
  const [processAction, setProcessAction] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [offboardDate, setOffboardDate] = useState('');

  // Escape key for modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (bulkUserConfirmOpen) setBulkUserConfirmOpen(false);
        if (showDeleteChoice) setShowDeleteChoice(false);
        if (userToProcess) setUserToProcess(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bulkUserConfirmOpen, showDeleteChoice, userToProcess]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return adminUsers.filter((u) => {
      const matchSearch =
        u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        (u.full_name && u.full_name.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(userSearchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (userStatusFilter === 'active') return u.account_status === 'active';
      if (userStatusFilter === 'unverified') return u.is_verified === 0;
      if (userStatusFilter === 'superadmin') return u.is_superadmin === 1;
      if (userStatusFilter === 'frozen') return u.account_status === 'frozen';
      if (userStatusFilter === 'pending_deletion') return u.account_status === 'pending_deletion';
      if (userStatusFilter === 'offboarding') return u.account_status === 'offboarding';
      return true;
    });
  }, [adminUsers, userSearchQuery, userStatusFilter]);

  const handleToggleSelectUser = (username) => {
    if (username === 'admin') return;
    setSelectedUsers((prev) => (prev.includes(username) ? prev.filter((u) => u !== username) : [...prev, username]));
  };

  const handleSelectAllUsers = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.filter((u) => u.username !== 'admin').map((u) => u.username));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleExecuteBulkUsers = () => {
    setIsProcessingBulkUsers(true);
    const promises = selectedUsers.map((username) => {
      if (bulkUserActionType === 'purge') {
        return axios.post('/api/admin/users/delete', { username });
      } else if (bulkUserActionType === 'verify') {
        return axios.put('/api/admin/users/verify', { username, status: '' });
      } else if (bulkUserActionType === 'freeze') {
        return axios.put('/api/admin/users/status', { username, status: 'frozen' });
      } else if (bulkUserActionType === 'soft_delete') {
        return axios.put('/api/admin/users/status', { username, status: 'pending_deletion' });
      } else if (bulkUserActionType === 'restore') {
        return axios.put('/api/admin/users/status', { username, status: 'active' });
      }
      return Promise.resolve();
    });

    Promise.allSettled(promises)
      .then((results) => {
        const successes = results.filter((r) => r.status === 'fulfilled').length;
        const failures = results.filter((r) => r.status === 'rejected').length;
        showNotification(
          tMsg(
            `Bulk action completed: ${successes} success, ${failures} failed.`,
            `Aksi massal selesai: ${successes} berhasil, ${failures} gagal.`
          ),
          failures > 0 ? 'info' : 'success'
        );
        fetchUsers();
        fetchStats();
        setSelectedUsers([]);
        setBulkUserConfirmOpen(false);
      })
      .finally(() => setIsProcessingBulkUsers(false));
  };

  const executeProcessAction = () => {
    if (!userToProcess) return;
    if (processAction === 'promote' || processAction === 'demote') {
      if (handleToggleSuperAdmin) handleToggleSuperAdmin(userToProcess);
    } else if (processAction === 'freeze') {
      if (handleUpdateUserStatus) handleUpdateUserStatus(userToProcess, 'frozen');
    } else if (processAction === 'unfreeze' || processAction === 'restore') {
      if (handleUpdateUserStatus) handleUpdateUserStatus(userToProcess, 'active');
    } else if (processAction === 'verify') {
      if (handleManualVerify) handleManualVerify(userToProcess);
    } else if (processAction === 'offboard') {
      if (handleUpdateUserStatus) handleUpdateUserStatus(userToProcess, 'offboarding', offboardDate);
    } else if (processAction === 'schedule') {
      if (handleUpdateUserStatus) handleUpdateUserStatus(userToProcess, 'pending_deletion');
    } else if (processAction === 'purge') {
      if (handleDeleteUser) handleDeleteUser(userToProcess);
    }
    setUserToProcess(null);
    setConfirmText('');
    setOffboardDate('');
    setTimeout(() => {
      fetchUsers();
      fetchStats();
    }, 500);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Action Bar */}
        <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-4 rounded-2xl shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-400 text-[18px]">search</span>
            <input
              type="text"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder={tMsg('Search users, email, name...', 'Cari username, nama, email...')}
              className="w-full pl-9 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'all', label: tMsg('All', 'Semua') },
              { id: 'active', label: tMsg('Active', 'Aktif') },
              { id: 'unverified', label: tMsg('Unverified', 'Belum Verif') },
              { id: 'superadmin', label: 'Super Admin' },
              { id: 'frozen', label: tMsg('Frozen', 'Dibekukan') },
              { id: 'pending_deletion', label: tMsg('Deleting Soon', 'Akan Dihapus') },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setUserStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  userStatusFilter === tab.id
                    ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38]'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk User Bar */}
        {selectedUsers.length > 0 && (
          <div className="bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-black">
              <span className="material-symbols-outlined text-[18px]">checklist</span>
              <span>{selectedUsers.length} {tMsg('users selected', 'pengguna dipilih')}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setBulkUserActionType('verify');
                  setBulkUserConfirmOpen(true);
                }}
                className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold cursor-pointer"
              >
                {tMsg('Verify All', 'Verifikasi Semua')}
              </button>
              <button
                onClick={() => {
                  setBulkUserActionType('restore');
                  setBulkUserConfirmOpen(true);
                }}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                {tMsg('Restore All', 'Pulihkan Semua')}
              </button>
              <button
                onClick={() => {
                  setBulkUserActionType('freeze');
                  setBulkUserConfirmOpen(true);
                }}
                className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold cursor-pointer"
              >
                {tMsg('Freeze All', 'Bekukan Semua')}
              </button>
              <button
                onClick={() => {
                  setBulkUserActionType('soft_delete');
                  setBulkUserConfirmOpen(true);
                }}
                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
              >
                {tMsg('Soft Delete', 'Hapus Bertahap')}
              </button>
              <button
                onClick={() => {
                  setBulkUserActionType('purge');
                  setBulkUserConfirmOpen(true);
                }}
                className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
              >
                {tMsg('Purge (Permanent)', 'Hapus Permanen')}
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="px-2 py-1 text-xs opacity-70 hover:opacity-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50 text-[10px] uppercase tracking-wider font-extrabold text-neutral-400">
                  <th className="p-3.5 pl-4 w-10 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAllUsers}
                      checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.filter((u) => u.username !== 'admin').length}
                      className="rounded cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5">{tMsg('User & Email', 'Pengguna & Email')}</th>
                  <th className="p-3.5">{tMsg('Role', 'Peran')}</th>
                  <th className="p-3.5">{tMsg('Status', 'Status')}</th>
                  <th className="p-3.5">{tMsg('Retention / Deletion', 'Masa Retensi')}</th>
                  <th className="p-3.5 pr-4 text-right">{tMsg('Actions', 'Aksi')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50 font-medium">
                {filteredUsers.map((u) => {
                  const isSelected = selectedUsers.includes(u.username);
                  const isRootAdmin = u.username === 'admin';
                  return (
                    <tr
                      key={u.username}
                      className={`hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors ${
                        isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="p-3.5 pl-4 text-center">
                        {!isRootAdmin && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectUser(u.username)}
                            className="rounded cursor-pointer"
                          />
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#111E38] dark:bg-neutral-700 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {u.username.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-[#111E38] dark:text-white flex items-center gap-1.5">
                              <span>@{u.username}</span>
                              {u.is_verified === 1 && (
                                <span className="material-symbols-outlined text-[14px] text-blue-500" title="Verified">verified</span>
                              )}
                              {u.is_superadmin === 1 && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[9px] font-black">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-400 truncate">
                              {u.email || u.full_name || tMsg('No email provided', 'Email tidak terisi')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
                          {u.is_superadmin === 1 ? tMsg('Super Administrator', 'Super Administrator') : tMsg('Workspace Member', 'Anggota Workspace')}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {u.account_status === 'active' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                            {tMsg('Active', 'Aktif')}
                          </span>
                        ) : u.account_status === 'frozen' ? (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold">
                            {tMsg('Frozen', 'Dibekukan')}
                          </span>
                        ) : u.account_status === 'pending_deletion' ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-[10px] font-bold">
                            {tMsg('Pending Deletion', 'Antrean Hapus')}
                          </span>
                        ) : u.account_status === 'offboarding' ? (
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                            {tMsg('Offboarding', 'Offboarding')}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px] font-bold">
                            {u.account_status || 'Unknown'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-neutral-400 text-[11px]">
                        {u.deletion_date ? (
                          <span className="text-red-500 font-bold">{u.deletion_date.split(' ')[0]}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Verify */}
                          {u.is_verified === 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setUserToProcess(u.username);
                                setProcessAction('verify');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] cursor-pointer"
                              title={tMsg('Manual Verify', 'Verifikasi Manual')}
                            >
                              {tMsg('Verify', 'Verif')}
                            </button>
                          )}

                          {/* Toggle Role */}
                          {!isRootAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                setUserToProcess(u.username);
                                setProcessAction(u.is_superadmin === 1 ? 'demote' : 'promote');
                              }}
                              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-amber-500 cursor-pointer"
                              title={u.is_superadmin === 1 ? tMsg('Demote to User', 'Turunkan ke Pengguna') : tMsg('Promote to Admin', 'Jadikan Admin')}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {u.is_superadmin === 1 ? 'shield_person' : 'security'}
                              </span>
                            </button>
                          )}

                          {/* Restore Account (Cancel Deletion / Offboarding) */}
                          {!isRootAdmin && (u.account_status === 'pending_deletion' || u.account_status === 'offboarding') && (
                            <button
                              type="button"
                              onClick={() => {
                                setUserToProcess(u.username);
                                setProcessAction('restore');
                              }}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                              title={tMsg('Cancel Deletion & Restore User', 'Batalkan Hapus & Pulihkan Akun')}
                            >
                              <span className="material-symbols-outlined text-[14px]">published_with_changes</span>
                              <span>{tMsg('Restore', 'Pulihkan')}</span>
                            </button>
                          )}

                          {/* Freeze / Unfreeze */}
                          {!isRootAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                setUserToProcess(u.username);
                                setProcessAction(u.account_status === 'frozen' ? 'unfreeze' : 'freeze');
                              }}
                              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-cyan-500 cursor-pointer"
                              title={u.account_status === 'frozen' ? tMsg('Unfreeze Account', 'Cairkan Akun') : tMsg('Freeze Account', 'Bekukan Akun')}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {u.account_status === 'frozen' ? 'lock_open' : 'lock'}
                              </span>
                            </button>
                          )}

                          {/* Offboard / Delete */}
                          {!isRootAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteChoiceUser(u.username);
                                setShowDeleteChoice(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-400 hover:text-red-500 cursor-pointer"
                              title={tMsg('Delete or Offboard', 'Hapus atau Offboard')}
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-neutral-400 font-bold">
                      {tMsg('No users found.', 'Tidak ada pengguna ditemukan.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── BULK USER CONFIRMATION MODAL ── */}
      {bulkUserConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-100 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121B2D] p-6 sm:p-8 w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl animate-fadeIn text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-800">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <h3 className="text-base font-black text-[#111E38] dark:text-white uppercase mb-2">
              {tMsg('Confirm Bulk Action', 'Konfirmasi Aksi Massal')}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
              {tMsg(
                `Are you sure you want to execute '${bulkUserActionType}' on ${selectedUsers.length} selected users?`,
                `Apakah Anda yakin ingin menjalankan aksi '${bulkUserActionType}' pada ${selectedUsers.length} pengguna terpilih?`
              )}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBulkUserConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 cursor-pointer"
              >
                {tMsg('Cancel', 'Batal')}
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkUsers}
                disabled={isProcessingBulkUsers}
                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isProcessingBulkUsers ? tMsg('Processing...', 'Memproses...') : tMsg('Yes, Proceed', 'Ya, Lanjutkan')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SINGLE USER DELETE CHOICE MODAL ── */}
      {showDeleteChoice && deleteChoiceUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-100 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121B2D] p-6 sm:p-8 w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl animate-fadeIn space-y-4">
            <h3 className="text-base font-black text-[#111E38] dark:text-white uppercase">
              {tMsg('Choose Deletion Method', 'Pilih Metode Penghapusan')}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {tMsg('Action for user:', 'Aksi untuk pengguna:')} <strong>@{deleteChoiceUser}</strong>
            </p>

            <button
              type="button"
              onClick={() => {
                setShowDeleteChoice(false);
                setUserToProcess(deleteChoiceUser);
                setProcessAction('schedule');
              }}
              className="w-full p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60 text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-amber-700 dark:text-amber-300 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">schedule</span> {tMsg('Soft Delete (90-Day Retention)', 'Hapus Bertahap (Masa Tenggang 90 Hari)')}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                {tMsg('Deactivates immediately, queued for permanent deletion in 90 days. Can be restored.', 'Akun dinonaktifkan segera, dapat dipulihkan dalam 90 hari.')}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowDeleteChoice(false);
                setUserToProcess(deleteChoiceUser);
                setProcessAction('purge');
              }}
              className="w-full p-4 rounded-2xl border border-red-200 dark:border-red-800/60 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/60 text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-red-700 dark:text-red-300 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">delete_forever</span> {tMsg('Purge Immediately (Permanent)', 'Hapus Segera (Permanen)')}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                {tMsg('Permanently deletes account and transfers owned projects to admin.', 'Menghapus permanen segera dan mengalihkan proyek ke admin.')}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowDeleteChoice(false);
                setUserToProcess(deleteChoiceUser);
                setProcessAction('offboard');
              }}
              className="w-full p-4 rounded-2xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/60 text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-purple-700 dark:text-purple-300 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">logout</span> {tMsg('Schedule Offboarding Date', 'Jadwalkan Tanggal Karyawan Keluar')}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                {tMsg('Account stays active until the employee’s last working day.', 'Akun tetap aktif hingga tanggal hari kerja terakhir karyawan.')}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteChoice(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 cursor-pointer"
            >
              {tMsg('Cancel', 'Batal')}
            </button>
          </div>
        </div>
      )}

      {/* ── USER PROCESS MODAL (SCHEDULE / PURGE / OFFBOARD / ROLE) ── */}
      {userToProcess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-100 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121B2D] p-6 sm:p-8 w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl animate-fadeIn text-center space-y-4">
            <h3 className="text-base font-black text-[#111E38] dark:text-white uppercase">
              {processAction === 'purge'
                ? tMsg('Purge User Account', 'Hapus Akun Permanen')
                : processAction === 'schedule'
                ? tMsg('Schedule Deletion (Grace Period)', 'Jadwalkan Penghapusan (Masa Tenggang)')
                : processAction === 'offboard'
                ? tMsg('Schedule Offboarding', 'Jadwalkan Offboarding')
                : processAction === 'restore'
                ? tMsg('Restore User Account', 'Pulihkan Akun Pengguna')
                : processAction === 'promote'
                ? tMsg('Promote to Admin', 'Jadikan Super Admin')
                : processAction === 'demote'
                ? tMsg('Demote to User', 'Turunkan ke Pengguna Biasa')
                : processAction === 'freeze'
                ? tMsg('Freeze Account', 'Bekukan Akun')
                : tMsg('Confirm Action', 'Konfirmasi Aksi')}
            </h3>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {tMsg('Target user:', 'Pengguna sasaran:')} <strong className="text-[#111E38] dark:text-white">@{userToProcess}</strong>
            </p>

            {processAction === 'restore' && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl text-left text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">published_with_changes</span>
                  {tMsg('Cancel deletion & reactivate account', 'Batalkan jadwal hapus & aktifkan akun')}
                </div>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed">
                  {tMsg(
                    'The deletion countdown will be stopped immediately. The user will regain normal access to their account and workspace projects.',
                    'Hitung mundur penghapusan akan dihentikan seketika. Pengguna akan mendapatkan kembali akses penuh ke akun dan proyek workspace mereka.'
                  )}
                </p>
              </div>
            )}

            {processAction === 'offboard' && (
              <div className="text-left space-y-1">
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                  {tMsg('Last Working Day', 'Hari Kerja Terakhir')}
                </label>
                <input
                  type="date"
                  value={offboardDate}
                  onChange={(e) => setOffboardDate(e.target.value)}
                  className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                  required
                />
              </div>
            )}

            {(processAction === 'purge' || processAction === 'schedule') && (
              <div className="text-left space-y-1">
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                  {tMsg('Type username to confirm:', 'Ketik username untuk konfirmasi:')} <strong>@{userToProcess}</strong>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={`@${userToProcess}`}
                  className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToProcess(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 cursor-pointer"
              >
                {tMsg('Cancel', 'Batal')}
              </button>
              <button
                type="button"
                onClick={executeProcessAction}
                disabled={
                  (processAction === 'purge' || processAction === 'schedule') &&
                  confirmText !== userToProcess &&
                  confirmText !== `@${userToProcess}`
                }
                className={`flex-1 py-2.5 rounded-xl text-xs font-black text-white shadow-md disabled:opacity-40 cursor-pointer ${
                  processAction === 'restore'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processAction === 'restore' ? tMsg('Restore Account', 'Pulihkan Akun') : tMsg('Confirm', 'Konfirmasi')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
