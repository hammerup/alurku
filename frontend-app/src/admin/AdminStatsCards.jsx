
export default function AdminStatsCards({ stats, adminUsers, language }) {
  const tMsg = (en, id) => (language === 'id' ? id : en);

  const orphanProjectsCount = stats?.projects?.orphans || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {/* Card 1: Users */}
      <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-4 rounded-2xl shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">{tMsg('Total Users', 'Total Pengguna')}</span>
          <span className="material-symbols-outlined text-[20px] text-blue-500">group</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-[#111E38] dark:text-white">
            {stats?.users?.total ?? (adminUsers?.length || 0)}
          </span>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            {stats?.users?.verified ?? 0} {tMsg('verified', 'terverifikasi')}
          </span>
        </div>
        <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2 flex gap-2">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">star</span> {stats?.users?.superadmins ?? 0} admin
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">ac_unit</span> {stats?.users?.frozen ?? 0} {tMsg('frozen', 'beku')}
          </span>
        </div>
      </div>

      {/* Card 2: Projects */}
      <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-4 rounded-2xl shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">{tMsg('Projects', 'Direktori Proyek')}</span>
          <span className="material-symbols-outlined text-[20px] text-amber-500">folder_open</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-[#111E38] dark:text-white">
            {stats?.projects?.total ?? 0}
          </span>
          <span className="text-[11px] font-bold text-neutral-500">
            {tMsg('spaces', 'ruang')}
          </span>
        </div>
        <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2">
          {orphanProjectsCount} {tMsg('orphaned projects', 'proyek yatim')}
        </div>
      </div>

      {/* Card 3: Tasks & Workload */}
      <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-4 rounded-2xl shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">{tMsg('Total Tasks', 'Total Tugas')}</span>
          <span className="material-symbols-outlined text-[20px] text-emerald-500">task_alt</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-[#111E38] dark:text-white">
            {stats?.tasks?.total ?? 0}
          </span>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            {stats?.tasks?.completed ?? 0} {tMsg('done', 'selesai')}
          </span>
        </div>
        <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2 flex gap-2">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">checklist</span> {stats?.tasks?.subtasks ?? 0} subtasks
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">chat_bubble</span> {stats?.tasks?.comments ?? 0} msgs
          </span>
        </div>
      </div>

      {/* Card 4: System Health */}
      <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-4 rounded-2xl shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">{tMsg('System Health', 'Kesehatan Sistem')}</span>
          <span className="material-symbols-outlined text-[20px] text-purple-500">dns</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            {tMsg('All Systems Operational', 'Semua Berjalan Normal')}
          </span>
        </div>
        <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2 flex gap-2">
          <span>{tMsg('DB: Online', 'DB: Aktif')}</span>
          <span>AI: {stats?.system_health?.gemini_configured || stats?.system_health?.groq_configured ? tMsg('Ready', 'Aktif') : tMsg('Not Set', 'Belum Aktif')}</span>
        </div>
      </div>
    </div>
  );
}
