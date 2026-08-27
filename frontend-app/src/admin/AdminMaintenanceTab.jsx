import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Live clock: ticks every second client-side, syncs offset from server_time once on mount
function LiveServerClock({ stats, tMsg, fetchStats }) {
  const [displayTime, setDisplayTime] = useState('—');
  const offsetRef = useRef(null);

  // Calculate offset once when server_time is first available
  useEffect(() => {
    if (stats?.system_health?.server_time && offsetRef.current === null) {
      const serverMs = new Date(stats.system_health.server_time.replace(' ', 'T')).getTime();
      offsetRef.current = serverMs - Date.now();
    }
  }, [stats]);

  // Tick every second
  useEffect(() => {
    const tick = () => {
      const offset = offsetRef.current ?? 0;
      const adjusted = new Date(Date.now() + offset);
      setDisplayTime(
        adjusted.toLocaleString('id-ID', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          hour12: false,
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Re-sync server offset every 5 minutes to prevent drift
  useEffect(() => {
    if (!fetchStats) return;
    const id = setInterval(() => fetchStats(), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchStats]);

  return (
    <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800/60">
      <span className="text-neutral-400 flex items-center gap-1">
        <span className="material-symbols-outlined text-[13px]">schedule</span>
        {tMsg('Server Time (Live)', 'Waktu Server (Langsung)')}
      </span>
      <span className="font-mono font-bold tabular-nums">{displayTime}</span>
    </div>
  );
}

export default function AdminMaintenanceTab({ language, showNotification, stats, fetchStats, fetchUsers }) {
  const tMsg = (en, id) => (language === 'id' ? id : en);

  const [isCleaningOrphans, setIsCleaningOrphans] = useState(false);
  const [isPurgingExpired, setIsPurgingExpired] = useState(false);

  const handleRunCleanupOrphans = async () => {
    setIsCleaningOrphans(true);
    try {
      await axios.post('/api/admin/maintenance/cleanup-orphans');
      if (showNotification) showNotification(tMsg('Orphan cleanup completed successfully', 'Pembersihan data yatim berhasil'), 'success');
      if (fetchStats) fetchStats();
    } catch (err) {
      console.error(err);
      if (showNotification) showNotification(tMsg('Failed to run orphan cleanup', 'Gagal menjalankan pembersihan data yatim'), 'error');
    } finally {
      setIsCleaningOrphans(false);
    }
  };

  const handleRunPurgeExpired = async () => {
    if (!window.confirm(tMsg(
      'Are you sure you want to permanently purge expired accounts? This cannot be undone.',
      'Apakah Anda yakin ingin menghapus permanen akun kedaluwarsa? Tindakan ini tidak dapat dibatalkan.'
    ))) return;

    setIsPurgingExpired(true);
    try {
      await axios.post('/api/admin/maintenance/purge-expired');
      if (showNotification) showNotification(tMsg('Expired accounts purged successfully', 'Akun kedaluwarsa berhasil dihapus permanen'), 'success');
      if (fetchUsers) fetchUsers();
      if (fetchStats) fetchStats();
    } catch (err) {
      console.error(err);
      if (showNotification) showNotification(tMsg('Failed to purge expired accounts', 'Gagal menghapus permanen akun kedaluwarsa'), 'error');
    } finally {
      setIsPurgingExpired(false);
    }
  };

  const dbLabel = stats?.system_health?.db_type || 'SQLite';

  return (
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

          <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-[#111E38] dark:text-white">
                {tMsg('Clean Orphaned Subtasks & Comments', 'Bersihkan Subtask & Komentar Yatim')}
              </h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">
                {tMsg(
                  'Removes subtasks and comments that belong to deleted tasks to keep database fast and light.',
                  'Membersihkan record subtask dan komentar yang tugas induknya sudah dihapus untuk mengoptimalkan kecepatan database.'
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRunCleanupOrphans}
              disabled={isCleaningOrphans}
              className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[16px]">mop</span>
              <span>{isCleaningOrphans ? tMsg('Cleaning...', 'Membersihkan...') : tMsg('Run Orphan Cleaner', 'Jalankan Pembersih Data Yatim')}</span>
            </button>
          </div>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-[#111E38] dark:text-white">
                {tMsg('Purge Expired Accounts (90+ Days)', 'Hapus Permanen Akun Kedaluwarsa (90+ Hari)')}
              </h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">
                {tMsg(
                  'Executes permanent purge for accounts queued for deletion whose 90-day grace period has passed.',
                  'Mengeksekusi penghapusan permanen untuk akun dalam antrean hapus yang telah melewati masa tenggang 90 hari.'
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRunPurgeExpired}
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
          </div>
        </div>
      </div>
    </div>
  );
}
