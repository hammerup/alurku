import React, { useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Avatar } from '../SharedUI';

function getLocalToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function PersonalDashboardPage() {
  const {
    tasks = [],
    boards = [],
    currentUser,
    language = 'id',
    setSelectedTask,
    setSelectedBoard,
    setViewMode,
    avatarsMap = {},
    favoriteBoards = [],
  } = useAppContext();

  const tMsg = (en, id) => (language === 'id' ? id : en);
  const todayStr = getLocalToday();

  // Lookup map for boards
  const boardMap = useMemo(() => {
    const map = {};
    (boards || []).forEach((b) => {
      map[b.id] = b;
    });
    return map;
  }, [boards]);

  // Filter tasks assigned to current user
  const myTasks = useMemo(() => {
    if (!currentUser) return [];
    const cu = currentUser.toLowerCase();
    return tasks.filter((t) => {
      if (t.assignee && t.assignee.toLowerCase() === cu) return true;
      if (t.owner_username && t.owner_username.toLowerCase() === cu) return true;
      return false;
    });
  }, [tasks, currentUser]);

  // Statistics calculation
  const stats = useMemo(() => {
    let completedThisWeek = 0;
    let inProgress = 0;
    let overdue = 0;

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    myTasks.forEach((t) => {
      const isDone = t.status === 'Done' || t.status === 'Completed' || t.status === 'Rejected';
      if (isDone) {
        if (t.completed_time) {
          const compDate = new Date(t.completed_time.replace(/-/g, '/'));
          if (compDate >= sevenDaysAgo) completedThisWeek++;
        } else {
          completedThisWeek++;
        }
      } else {
        inProgress++;
        if (t.deadline) {
          const dl = String(t.deadline).split('T')[0].split(' ')[0];
          if (dl < todayStr) overdue++;
        }
      }
    });

    return {
      total: myTasks.length,
      completedThisWeek,
      inProgress,
      overdue,
    };
  }, [myTasks, todayStr]);

  // Urgent / High priority active tasks for today
  const urgentTasks = useMemo(() => {
    return myTasks
      .filter((t) => {
        const isDone = t.status === 'Done' || t.status === 'Completed' || t.status === 'Rejected';
        if (isDone) return false;
        const dl = t.deadline ? String(t.deadline).split('T')[0].split(' ')[0] : '';
        const isOverdue = dl && dl < todayStr;
        const isToday = dl && dl === todayStr;
        const isHigh = t.priority === 'Critical' || t.priority === 'High';
        return isOverdue || isToday || isHigh;
      })
      .slice(0, 5);
  }, [myTasks, todayStr]);

  // Pinned / Favorite Projects Progress
  const pinnedProjects = useMemo(() => {
    const favs = boards.filter((b) => favoriteBoards.includes(b.id));
    return favs.map((board) => {
      const boardTasks = tasks.filter((t) => parseInt(t.board_id) === parseInt(board.id));
      const total = boardTasks.length;
      const done = boardTasks.filter(
        (t) => t.status === 'Done' || t.status === 'Completed' || t.status === 'Rejected'
      ).length;
      const percent = total > 0 ? Math.round((done / total) * 100) : 0;
      return { ...board, total, done, percent };
    });
  }, [boards, favoriteBoards, tasks]);

  const handleOpenTask = (task) => {
    const board = boardMap[task.board_id];
    if (board) setSelectedBoard(board);
    setSelectedTask(task);
  };

  const handleGoToBoard = (board) => {
    setSelectedBoard(board);
    setViewMode('kanban');
    const slugify = (t) => (t ? t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '');
    const wsSlug = slugify(board.workspace_name || '');
    const bSlug = slugify(board.name);
    const url = wsSlug
      ? `/workspace/${wsSlug}/${board.workspace_id || ''}/project/${bSlug}/${board.id}`
      : `/project/${bSlug}/${board.id}`;
    window.history.pushState({}, '', url);
    window.dispatchEvent(new CustomEvent('alurku-navigate'));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F3F4F6] dark:bg-[#0d0f11] overflow-y-auto custom-scrollbar">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-[#121B2D] border-b border-neutral-200/70 dark:border-neutral-800/60 px-6 py-6 shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Avatar username={currentUser} size={40} avatarUrl={avatarsMap?.[currentUser]} />
            <div>
              <h1 className="text-xl font-extrabold text-[#111E38] dark:text-white tracking-tight">
                {tMsg(`Welcome back, ${currentUser}!`, `Selamat datang kembali, ${currentUser}!`)}
              </h1>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                {tMsg('Here is your personal productivity overview and active priorities.', 'Berikut adalah ringkasan produktivitas dan prioritas aktifmu.')}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              window.history.pushState({}, '', '/my-tasks');
              window.dispatchEvent(new CustomEvent('alurku-navigate'));
            }}
            className="flex items-center gap-2 px-3 py-2 bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] text-xs font-bold rounded-xl shadow-xs hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">task_alt</span>
            <span>{tMsg('View All My Tasks', 'Lihat Semua Tugas Saya')}</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/70 dark:border-neutral-800/60 p-4 rounded-xl shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {tMsg('Total My Tasks', 'Total Tugas Saya')}
              </p>
              <h3 className="text-2xl font-black text-[#111E38] dark:text-white mt-1">{stats.total}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-[#FACC15] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">assignment</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/70 dark:border-neutral-800/60 p-4 rounded-xl shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {tMsg('Completed (7 Days)', 'Selesai (7 Hari)')}
              </p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.completedThisWeek}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">check_circle</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/70 dark:border-neutral-800/60 p-4 rounded-xl shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {tMsg('In Progress', 'Sedang Berjalan')}
              </p>
              <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.inProgress}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">pending_actions</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/70 dark:border-neutral-800/60 p-4 rounded-xl shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {tMsg('Overdue Tasks', 'Tugas Terlambat')}
              </p>
              <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.overdue}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Urgent & Focus Tasks (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/70 dark:border-neutral-800/60 rounded-xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-500 text-xl">error</span>
                  <h2 className="text-sm font-extrabold text-[#111E38] dark:text-white uppercase tracking-wider">
                    {tMsg('Urgent & High Priority Focus', 'Fokus Utama & Tugas Mendesak')}
                  </h2>
                </div>
                <span className="text-xs font-semibold text-neutral-400">({urgentTasks.length})</span>
              </div>

              {urgentTasks.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-neutral-300 dark:text-neutral-700 mb-2">thumb_up</span>
                  <p className="text-xs font-medium text-neutral-400">
                    {tMsg('No urgent or overdue tasks right now. Great job!', 'Tidak ada tugas mendesak atau terlambat saat ini. Mantap!')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {urgentTasks.map((task) => {
                    const board = boardMap[task.board_id];
                    const dl = task.deadline ? String(task.deadline).split('T')[0].split(' ')[0] : null;
                    const isOv = dl && dl < todayStr;

                    return (
                      <div
                        key={task.id}
                        onClick={() => handleOpenTask(task)}
                        className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer border border-neutral-200/40 dark:border-neutral-800/40"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="text-xs font-bold text-[#111E38] dark:text-neutral-100 truncate">{task.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {board && (
                              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[10px]">folder</span>
                                {board.name}
                              </span>
                            )}
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                              {task.status}
                            </span>
                          </div>
                        </div>

                        {dl && (
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded-md shrink-0 flex items-center gap-1 ${
                              isOv
                                ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                                : 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[12px]">{isOv ? 'event_busy' : 'today'}</span>
                            {dl}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Pinned Projects & Quick Actions (Right 1 col) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/70 dark:border-neutral-800/60 rounded-xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400 text-xl">star</span>
                  <h2 className="text-sm font-extrabold text-[#111E38] dark:text-white uppercase tracking-wider">
                    {tMsg('Pinned Projects', 'Proyek Disematkan')}
                  </h2>
                </div>
                <span className="text-xs font-semibold text-neutral-400">({pinnedProjects.length})</span>
              </div>

              {pinnedProjects.length === 0 ? (
                <div className="text-center py-6 text-neutral-400 text-xs">
                  {tMsg('No pinned projects yet. Pin projects in the sidebar for quick tracking.', 'Belum ada proyek disematkan. Sematkan proyek di sidebar untuk pantauan cepat.')}
                </div>
              ) : (
                <div className="space-y-3">
                  {pinnedProjects.map((board) => (
                    <div
                      key={board.id}
                      onClick={() => handleGoToBoard(board)}
                      className="p-3 rounded-lg border border-neutral-200/50 dark:border-neutral-800/50 hover:border-amber-400/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#111E38] dark:text-white truncate group-hover:text-amber-500">
                          {board.name}
                        </span>
                        <span className="text-[10px] font-black text-amber-500">{board.percent}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${board.percent}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1.5">
                        <span>{board.done} / {board.total} {tMsg('done', 'selesai')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
