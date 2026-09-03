import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Live clock: ticks every second client-side, syncs offset from server_time once on mount
function LiveServerClock({ stats, tMsg, fetchStats }) {
  const [displayServerTime, setDisplayServerTime] = useState('—');
  const [displayLocalTime, setDisplayLocalTime] = useState('—');
  const [tzDifferenceStr, setTzDifferenceStr] = useState('');
  const offsetRef = useRef(null);

  // Calculate offset once when server_time is first available
  useEffect(() => {
    if (stats?.system_health?.server_time_iso) {
      const serverMs = new Date(stats.system_health.server_time_iso).getTime();
      offsetRef.current = serverMs - Date.now();
    } else if (stats?.system_health?.server_time && offsetRef.current === null) {
      const serverMs = new Date(stats.system_health.server_time.replace(' ', 'T') + 'Z').getTime();
      offsetRef.current = serverMs - Date.now();
    }
  }, [stats]);

  // Tick every second
  useEffect(() => {
    const tick = () => {
      const offset = offsetRef.current ?? 0;
      const now = new Date();
      const adjustedServer = new Date(Date.now() + offset);

      // Local browser time (e.g. WIB / Asia/Jakarta)
      const localTzName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Lokal';
      setDisplayLocalTime(
        `${now.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })} ${now.toLocaleTimeString('id-ID', { hour12: false })} (${localTzName})`
      );

      // Server UTC time
      setDisplayServerTime(
        `${adjustedServer.getUTCFullYear()}-${String(adjustedServer.getUTCMonth() + 1).padStart(2, '0')}-${String(adjustedServer.getUTCDate()).padStart(2, '0')} ${String(adjustedServer.getUTCHours()).padStart(2, '0')}:${String(adjustedServer.getUTCMinutes()).padStart(2, '0')}:${String(adjustedServer.getUTCSeconds()).padStart(2, '0')} UTC`
      );

      // Local timezone offset in hours relative to UTC
      const localOffsetHours = -now.getTimezoneOffset() / 60;
      const diffFormatted = localOffsetHours === 0 
        ? tMsg('Same as UTC', 'Sama dengan UTC')
        : localOffsetHours > 0
        ? tMsg(`+${localOffsetHours}h ahead of UTC`, `+${localOffsetHours} jam dari UTC`)
        : tMsg(`${localOffsetHours}h behind UTC`, `${localOffsetHours} jam dari UTC`);
      setTzDifferenceStr(diffFormatted);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tMsg]);

  // Re-sync server offset every 5 minutes to prevent drift
  useEffect(() => {
    if (!fetchStats) return;
    const id = setInterval(() => fetchStats(), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchStats]);

  return (
    <>
      <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800/60">
        <span className="text-neutral-400 flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]">public</span>
          {tMsg('Server & Database Time (UTC)', 'Waktu Server & Database (UTC)')}
        </span>
        <span className="font-mono font-bold tabular-nums text-neutral-600 dark:text-neutral-300">{displayServerTime}</span>
      </div>
      <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800/60">
        <span className="text-neutral-400 flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]">schedule</span>
          {tMsg('Your Local Time', 'Waktu Lokal Anda')}
        </span>
        <span className="font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{displayLocalTime}</span>
      </div>
      {tzDifferenceStr && (
        <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/60 text-[11px]">
          <span className="text-neutral-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">timelapse</span>
            {tMsg('Timezone Offset', 'Selisih Zona Waktu')}
          </span>
          <span className="font-medium text-neutral-500 dark:text-neutral-400">{tzDifferenceStr}</span>
        </div>
      )}
    </>
  );
}

export default function AdminMaintenanceTab({ language, showNotification, stats, fetchStats, fetchUsers }) {
  const tMsg = (en, id) => (language === 'id' ? id : en);

  const [isCleaningOrphans, setIsCleaningOrphans] = useState(false);
  const [isPurgingExpired, setIsPurgingExpired] = useState(false);

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    actionType: null, // 'orphans' | 'purge'
    title: '',
    message: '',
    confirmButtonText: '',
    isDestructive: false,
  });

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && confirmModal.isOpen) {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmModal.isOpen]);

  const handleOpenOrphanCleanupModal = () => {
    setConfirmModal({
      isOpen: true,
      actionType: 'orphans',
      title: tMsg('Clean Orphaned Database Records', 'Bersihkan Data Yatim Database'),
      message: tMsg(
        'This routine searches and permanently deletes orphaned subtasks and comments whose parent task no longer exists. This improves query speed and frees up database space.',
        'Rutinitas ini mencari dan menghapus permanen subtask serta komentar yang tugas induknya sudah tidak ada di database. Tindakan ini menjaga kecepatan dan menghemat ruang penyimpanan.'
      ),
      confirmButtonText: tMsg('Start Cleanup', 'Mulai Pembersihan'),
      isDestructive: false,
    });
  };

  const handleOpenPurgeExpiredModal = () => {
    const activeGraceDays = stats?.system_health?.soft_delete_grace_days || 90;
    setConfirmModal({
      isOpen: true,
      actionType: 'purge',
      title: tMsg('Purge Expired Accounts Permanently', 'Hapus Permanen Akun Kedaluwarsa'),
      message: tMsg(
        `This will PERMANENTLY delete all user accounts that have been queued for deletion and passed their ${activeGraceDays}-day retention grace period. Associated boards, comments, and notifications will be scrubbed. This action CANNOT be undone.`,
        `Tindakan ini akan MENGHAPUS PERMANEN semua akun pengguna dalam antrean hapus yang telah melewati masa tenggang ${activeGraceDays} hari. Seluruh riwayat, notifikasi, dan data terkait akan dibersihkan. Tindakan ini TIDAK DAPAT dibatalkan.`
      ),
      confirmButtonText: tMsg('Confirm Permanent Purge', 'Konfirmasi Hapus Permanen'),
      isDestructive: true,
    });
  };

  const executeModalAction = async () => {
    const { actionType } = confirmModal;
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));

    if (actionType === 'orphans') {
      setIsCleaningOrphans(true);
      try {
        const res = await axios.post('/api/admin/maintenance/cleanup-orphans');
        const subtasksCount = res.data?.cleaned_subtasks ?? 0;
        const commentsCount = res.data?.cleaned_comments ?? 0;
        if (showNotification) {
          showNotification(
            tMsg(
              `Orphan cleaner finished: ${subtasksCount} subtasks and ${commentsCount} comments removed.`,
              `Pembersihan selesai: ${subtasksCount} subtask dan ${commentsCount} komentar yatim dibersihkan.`
            ),
            'success'
          );
        }
        if (fetchStats) fetchStats();
      } catch (err) {
        console.error(err);
        if (showNotification) showNotification(tMsg('Failed to run orphan cleanup', 'Gagal menjalankan pembersihan data yatim'), 'error');
      } finally {
        setIsCleaningOrphans(false);
      }
    } else if (actionType === 'purge') {
      setIsPurgingExpired(true);
      try {
        const res = await axios.post('/api/admin/maintenance/purge-expired');
        const purgedCount = res.data?.purged_count ?? 0;
        if (showNotification) {
          showNotification(
            tMsg(
              `Purge complete: ${purgedCount} expired user accounts permanently removed.`,
              `Pembersihan selesai: ${purgedCount} akun kedaluwarsa berhasil dihapus permanen.`
            ),
            'success'
          );
        }
        if (fetchUsers) fetchUsers();
        if (fetchStats) fetchStats();
      } catch (err) {
        console.error(err);
        if (showNotification) showNotification(tMsg('Failed to purge expired accounts', 'Gagal menghapus permanen akun kedaluwarsa'), 'error');
      } finally {
        setIsPurgingExpired(false);
      }
    }
  };

  const dbLabel = stats?.system_health?.db_type || 'SQLite';
  const graceDays = stats?.system_health?.soft_delete_grace_days || 90;
  const orphanSubtasks = stats?.tasks?.orphan_subtasks ?? stats?.system_health?.orphan_subtasks ?? 0;
  const orphanComments = stats?.tasks?.orphan_comments ?? stats?.system_health?.orphan_comments ?? 0;
  const totalOrphans = orphanSubtasks + orphanComments;
  const expiredAccountsCount = stats?.users?.expired_accounts ?? stats?.system_health?.expired_accounts ?? 0;

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Maintenance Tools */}
          <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-3xl shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <span className="material-symbols-outlined text-amber-500">cleaning_services</span>
              <h3 className="text-sm font-extrabold text-[#111E38] dark:text-white">
                {tMsg('Database Maintenance Routines', 'Rutinitas Pemeliharaan Database')}
              </h3>
            </div>

            {/* Card 1: Orphan Cleaner */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-[#111E38] dark:text-white flex items-center gap-1.5">
                    <span>{tMsg('Clean Orphaned Subtasks & Comments', 'Bersihkan Subtask & Komentar Yatim')}</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">
                    {tMsg(
                      'Removes subtasks and comments that belong to deleted tasks to keep database fast and light.',
                      'Membersihkan record subtask dan komentar yang tugas induknya sudah dihapus untuk mengoptimalkan kecepatan database.'
                    )}
                  </p>
                </div>
              </div>

              {/* Realtime Detection Pill */}
              <div className="flex items-center gap-2">
                {totalOrphans === 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-emerald-600">check_circle</span>
                    <span>{tMsg('0 Orphan records detected (Optimal)', '0 Data yatim terdeteksi (Optimal)')}</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-amber-600">warning</span>
                    <span>{tMsg(`${totalOrphans} orphan records (${orphanSubtasks} subtasks, ${orphanComments} comments)`, `${totalOrphans} data yatim (${orphanSubtasks} subtask, ${orphanComments} komentar)`)}</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleOpenOrphanCleanupModal}
                disabled={isCleaningOrphans}
                className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-[#111E38] dark:text-white"
              >
                <span className="material-symbols-outlined text-[16px]">mop</span>
                <span>{isCleaningOrphans ? tMsg('Cleaning...', 'Membersihkan...') : tMsg('Run Orphan Cleaner', 'Jalankan Pembersih Data Yatim')}</span>
              </button>
            </div>

            {/* Card 2: Purge Expired Accounts */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-[#111E38] dark:text-white">
                  {tMsg(`Purge Expired Accounts (${graceDays}+ Days)`, `Hapus Permanen Akun Kedaluwarsa (${graceDays}+ Hari)`)}
                </h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">
                  {tMsg(
                    `Executes permanent purge for accounts queued for deletion whose ${graceDays}-day grace period has passed.`,
                    `Mengeksekusi penghapusan permanen untuk akun dalam antrean hapus yang telah melewati masa tenggang ${graceDays} hari.`
                  )}
                </p>
              </div>

              {/* Realtime Detection Pill */}
              <div className="flex items-center gap-2">
                {expiredAccountsCount === 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">schedule</span>
                    <span>{tMsg('0 Expired accounts ready for purge', '0 Akun kedaluwarsa siap dihapus')}</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 flex items-center gap-1 animate-pulse">
                    <span className="material-symbols-outlined text-[13px] text-rose-600">error</span>
                    <span>{tMsg(`${expiredAccountsCount} expired accounts ready to purge`, `${expiredAccountsCount} akun kedaluwarsa siap dihapus permanen`)}</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleOpenPurgeExpiredModal}
                disabled={isPurgingExpired}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-950/50 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                <span>{isPurgingExpired ? tMsg('Purging...', 'Menghapus...') : tMsg('Purge Expired Accounts', 'Hapus Akun Kedaluwarsa')}</span>
              </button>
            </div>
          </div>

          {/* System Diagnostics */}
          <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-3xl shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <span className="material-symbols-outlined text-blue-500">monitor_heart</span>
              <h3 className="text-sm font-extrabold text-[#111E38] dark:text-white">
                {tMsg('System Diagnostics & Status', 'Diagnostik & Status Sistem')}
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Live ticking clock */}
              <LiveServerClock stats={stats} tMsg={tMsg} fetchStats={fetchStats} />

              <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800/60">
                <span className="text-neutral-400">{tMsg('Database Connection', 'Koneksi Database')}</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {tMsg('Connected', 'Terhubung')} ({dbLabel})
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800/60">
                <span className="text-neutral-400">{tMsg('Active Retention Grace Period', 'Masa Tenggang Hapus Aktif')}</span>
                <span className="font-mono font-bold text-neutral-700 dark:text-neutral-200">
                  {graceDays} {tMsg('Days', 'Hari')}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800/60">
                <span className="text-neutral-400">Google Gemini API</span>
                <span className={stats?.system_health?.gemini_configured ? 'text-emerald-500 font-bold' : 'text-neutral-400'}>
                  {stats?.system_health?.gemini_configured ? tMsg('Configured', 'Terkonfigurasi') : tMsg('Not Configured', 'Belum Terkonfigurasi')}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800/60">
                <span className="text-neutral-400">Groq GPT-OSS 120B</span>
                <span className={stats?.system_health?.groq_configured ? 'text-emerald-500 font-bold' : 'text-neutral-400'}>
                  {stats?.system_health?.groq_configured ? tMsg('Configured', 'Terkonfigurasi') : tMsg('Not Configured', 'Belum Terkonfigurasi')}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-neutral-400">SMTP Email Server</span>
                <span className={stats?.system_health?.smtp_configured ? 'text-emerald-500 font-bold' : 'text-neutral-400'}>
                  {stats?.system_health?.smtp_configured ? tMsg('Configured', 'Terkonfigurasi') : tMsg('Not Configured', 'Belum Terkonfigurasi')}
                </span>
              </div>

              {/* Timezone & UTC Standard explanation */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-start gap-2 mt-2">
                <span className="material-symbols-outlined text-[15px] text-blue-500 shrink-0 mt-0.5">info</span>
                <p className="leading-relaxed">
                  {tMsg(
                    'Database & server timestamps are stored in UTC (+00:00) by standard. Your web browser converts deadlines and activity to your local timezone.',
                    'Data waktu server & database disimpan dalam standar UTC (+00:00). Antarmuka web otomatis mengonversi jadwal ke zona waktu lokal Anda (WIB/GMT+7).'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CUSTOM CONFIRMATION MODAL ── */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-100 flex items-center justify-center p-4">
          <div 
            className="bg-white dark:bg-[#121B2D] p-6 sm:p-8 w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl animate-fadeIn text-center space-y-4"
            role="dialog"
            aria-modal="true"
          >
            <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center ${confirmModal.isDestructive ? 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'}`}>
              <span className="material-symbols-outlined text-[24px]">
                {confirmModal.isDestructive ? 'delete_forever' : 'cleaning_services'}
              </span>
            </div>

            <h3 className="text-base font-black text-[#111E38] dark:text-white">
              {confirmModal.title}
            </h3>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed text-left p-3.5 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50">
              {confirmModal.message}
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
              >
                {tMsg('Cancel', 'Batal')}
              </button>
              <button
                type="button"
                onClick={executeModalAction}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black text-white shadow-md transition-colors cursor-pointer ${
                  confirmModal.isDestructive
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-[#111E38] hover:bg-neutral-800 dark:bg-[#FACC15] dark:text-[#111E38] dark:hover:bg-[#EAB308]'
                }`}
              >
                {confirmModal.confirmButtonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
