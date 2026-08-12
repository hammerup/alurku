import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';

const STATUS_COLORS = {
  'To Do': 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'In Review': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'Done': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Rejected': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

const PRIORITY_COLORS = {
  'Critical': 'text-rose-500',
  'High': 'text-orange-500',
  'Medium': 'text-amber-500',
  'Low': 'text-sky-400',
};

function getLocalToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function MyTasksPage({ initialFilter = 'all' }) {
  const {
    tasks = [],
    setTasks,
    boards = [],
    currentUser,
    language = 'id',
    setSelectedTask,
    setSelectedBoard,
    setViewMode,
    navigateTo,
    avatarsMap,
    showNotification,
  } = useAppContext();

  const tMsg = (en, id) => (language === 'id' ? id : en);

  // Active filter tab: 'all' | 'today' | 'this-week' | 'overdue' | 'completed'
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupByBoard, setGroupByBoard] = useState(false);
  const [sortBy, setSortBy] = useState('deadline'); // 'deadline' | 'priority' | 'status'

  // Helper for Sunday to Saturday check
  const isDueThisWeek = (task) => {
    if (!task.deadline) return false;
    const dl = String(task.deadline).split('T')[0].split(' ')[0];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);

    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    saturday.setHours(23, 59, 59, 999);

    const sunStr = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`;
    const satStr = `${saturday.getFullYear()}-${String(saturday.getMonth() + 1).padStart(2, '0')}-${String(saturday.getDate()).padStart(2, '0')}`;

    return dl >= sunStr && dl <= satStr;
  };

  // Read filter from URL on mount/navigation
  useEffect(() => {
    const updateFilter = () => {
      const params = new URLSearchParams(window.location.search);
      const f = params.get('filter');
      if (f === 'today') setActiveFilter('today');
      else if (f === 'this-week') setActiveFilter('this-week');
      else if (f === 'overdue') setActiveFilter('overdue');
      else if (f === 'completed' || f === 'done') setActiveFilter('completed');
      else setActiveFilter('all');
    };
    
    updateFilter();
    
    window.addEventListener('popstate', updateFilter);
    window.addEventListener('alurku-navigate', updateFilter);
    
    return () => {
      window.removeEventListener('popstate', updateFilter);
      window.removeEventListener('alurku-navigate', updateFilter);
    };
  }, []);

  const todayStr = getLocalToday();

  // Build board lookup map
  const boardMap = useMemo(() => {
    const m = {};
    (boards || []).forEach(b => { m[b.id] = b; });
    return m;
  }, [boards]);

  const isUserAssigned = (task) => {
    if (!currentUser) return false;
    const cu = currentUser.toLowerCase();
    if (task.assignee && task.assignee.toLowerCase() === cu) return true;
    if (task.owner_username && task.owner_username.toLowerCase() === cu) return true;
    return false;
  };

  const isOverdue = (task) => {
    if (!task.deadline) return false;
    const dl = String(task.deadline).split('T')[0].split(' ')[0];
    return dl < todayStr;
  };

  const isDueToday = (task) => {
    if (!task.deadline) return false;
    const dl = String(task.deadline).split('T')[0].split(' ')[0];
    return dl === todayStr;
  };

  const isDone = (t) => t.status === 'Done' || t.status === 'Completed' || t.status === 'Rejected';

  const toggleTaskCompletion = async (e, task) => {
    e.stopPropagation();
    const newStatus = isDone(task) ? 'In Progress' : 'Done';
    const updated = { ...task, status: newStatus };

    // Optimistic UI update
    if (setTasks) {
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
    }

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      if (showNotification) {
        showNotification(
          newStatus === 'Done'
            ? tMsg('Task marked as completed!', 'Tugas ditandai selesai!')
            : tMsg('Task marked as in progress', 'Tugas dikembalikan ke proses')
        );
      }
    } catch {
      // Revert on error
      if (setTasks) {
        setTasks(prev => prev.map(t => t.id === task.id ? task : t));
      }
    }
  };

  const myTasks = useMemo(() => {
    return tasks.filter(isUserAssigned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, currentUser]);

  const filteredTasks = useMemo(() => {
    let filtered = myTasks;

    switch (activeFilter) {
      case 'today':
        filtered = filtered.filter(t => !isDone(t) && isDueToday(t));
        break;
      case 'this-week':
        filtered = filtered.filter(t => !isDone(t) && isDueThisWeek(t));
        break;
      case 'overdue':
        filtered = filtered.filter(t => !isDone(t) && isOverdue(t));
        break;
      case 'completed':
      case 'done':
        filtered = filtered.filter(t => isDone(t));
        break;
      default: // 'all'
        filtered = filtered.filter(t => !isDone(t));
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        (t.project_name || t.name || t.title || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (boardMap[t.board_id]?.name || '').toLowerCase().includes(q)
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'deadline') {
        const da = a.deadline ? String(a.deadline).split('T')[0] : '9999-12-31';
        const db = b.deadline ? String(b.deadline).split('T')[0] : '9999-12-31';
        return da.localeCompare(db);
      }
      if (sortBy === 'priority') {
        const order = { Critical: 0, High: 1, Medium: 2, Low: 3, '': 4 };
        return (order[a.priority] ?? 4) - (order[b.priority] ?? 4);
      }
      if (sortBy === 'status') {
        return (a.status || '').localeCompare(b.status || '');
      }
      return 0;
    });

    return filtered;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myTasks, activeFilter, searchQuery, sortBy]);

  // Group by board if enabled
  const groupedTasks = useMemo(() => {
    if (!groupByBoard) return null;
    const groups = {};
    filteredTasks.forEach(t => {
      const bid = t.board_id || '__none__';
      if (!groups[bid]) groups[bid] = [];
      groups[bid].push(t);
    });
    return groups;
  }, [filteredTasks, groupByBoard]);

  const handleOpenTask = (task) => {
    // Only set selected task, leave the board context alone 
    // to prevent navigating away from My Tasks
    setSelectedTask(task);
  };

  const handleGoToBoard = (boardId) => {
    const board = boardMap[boardId];
    if (!board) return;
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

  const overdueCount = useMemo(() => myTasks.filter(t => !isDone(t) && isOverdue(t)).length, [myTasks]);
  const todayCount = useMemo(() => myTasks.filter(t => !isDone(t) && isDueToday(t)).length, [myTasks]);
  const thisWeekCount = useMemo(() => myTasks.filter(t => !isDone(t) && isDueThisWeek(t)).length, [myTasks]);
  const allActiveCount = useMemo(() => myTasks.filter(t => !isDone(t)).length, [myTasks]);
  const completedCount = useMemo(() => myTasks.filter(t => isDone(t)).length, [myTasks]);

  const FILTERS = [
    {
      key: 'all',
      labelEn: 'All Active',
      labelId: 'Ditugaskan ke Saya',
      count: allActiveCount,
      icon: 'person_check',
      iconColor: 'text-indigo-500',
    },
    {
      key: 'today',
      labelEn: 'Due Today',
      labelId: 'Tenggat Hari Ini',
      count: todayCount,
      icon: 'today',
      iconColor: 'text-amber-500',
    },
    {
      key: 'this-week',
      labelEn: 'This Week',
      labelId: 'Minggu Ini',
      count: thisWeekCount,
      icon: 'date_range',
      iconColor: 'text-indigo-500',
    },
    {
      key: 'overdue',
      labelEn: 'Overdue',
      labelId: 'Terlambat',
      count: overdueCount,
      icon: 'warning',
      iconColor: 'text-rose-600',
    },
    {
      key: 'completed',
      labelEn: 'Completed',
      labelId: 'Selesai',
      count: completedCount,
      icon: 'task_alt',
      iconColor: 'text-emerald-500',
    },
  ];

  const renderTask = (task) => {
    const board = boardMap[task.board_id];
    const dl = task.deadline ? String(task.deadline).split('T')[0].split(' ')[0] : null;
    const isOv = dl && isOverdue(task) && !isDone(task);
    const isToday = dl && isDueToday(task) && !isDone(task);
    const statusColor = STATUS_COLORS[task.status] || STATUS_COLORS['To Do'];
    const priorityColor = PRIORITY_COLORS[task.priority] || 'text-neutral-400';
    const taskTitle = task.project_name || task.name || task.title || tMsg('Untitled Task', 'Tugas Tanpa Judul');
    const taskDone = isDone(task);

    // Subtasks progress if available
    const subtasks = task.subtasks || [];
    const completedSubtasks = subtasks.filter(st => st.is_completed || st.completed).length;

    return (
      <div
        key={task.id}
        onClick={() => handleOpenTask(task)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleOpenTask(task)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-[#121B2D] border border-neutral-200/70 dark:border-neutral-800/60 rounded-xl hover:border-[#FACC15]/60 dark:hover:border-[#FACC15]/40 hover:shadow-sm transition-all cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15]"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Interactive Checkbox for Task Completion */}
          <button
            type="button"
            onClick={(e) => toggleTaskCompletion(e, task)}
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
              taskDone
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-neutral-300 dark:border-neutral-600 hover:border-[#FACC15] dark:hover:border-[#FACC15] bg-transparent'
            }`}
            title={taskDone ? tMsg('Mark as incomplete', 'Tandai belum selesai') : tMsg('Mark as complete', 'Tandai selesai')}
          >
            {taskDone && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
          </button>

          {/* Priority Icon */}
          <span
            className={`material-symbols-outlined text-[16px] shrink-0 ${priorityColor}`}
            title={tMsg(`Priority: ${task.priority || 'Normal'}`, `Prioritas: ${task.priority || 'Normal'}`)}
          >
            {task.priority === 'Critical' ? 'priority_high' : task.priority === 'High' ? 'arrow_upward' : task.priority === 'Low' ? 'arrow_downward' : 'remove'}
          </span>

          {/* Task Main Details */}
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <h3 className={`text-sm font-semibold truncate ${taskDone ? 'line-through text-neutral-400 dark:text-neutral-500' : 'text-[#111E38] dark:text-neutral-100'}`}>
              {taskTitle}
            </h3>

            <div className="flex items-center gap-2 flex-wrap text-[11px]">
              {/* Status Badge */}
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${statusColor}`}>
                {task.status || 'To Do'}
              </span>

              {/* Project/Board Tag */}
              {board && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleGoToBoard(board.id); }}
                  className="text-slate-500 dark:text-slate-400 hover:text-[#111E38] dark:hover:text-[#FACC15] font-medium flex items-center gap-1 transition-colors"
                  title={tMsg('Open Project', 'Buka Proyek')}
                >
                  <span className="material-symbols-outlined text-[13px]">folder</span>
                  <span className="truncate max-w-40">{board.name}</span>
                </button>
              )}

              {/* Category */}
              {task.category && (
                <span className="text-neutral-400 dark:text-neutral-500 flex items-center gap-0.5">
                  • <span>{task.category}</span>
                </span>
              )}

              {/* Subtask count */}
              {subtasks.length > 0 && (
                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-0.5 ml-1">
                  <span className="material-symbols-outlined text-[12px]">checklist</span>
                  {completedSubtasks}/{subtasks.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Details: Assignee + Deadline */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Assignee Avatar */}
          {task.assignee && (
            <div
              className="w-6 h-6 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 text-white text-[10px] font-bold flex items-center justify-center uppercase shadow-2xs"
              title={`${tMsg('Assignee', 'Ditugaskan ke')}: ${task.assignee}`}
            >
              {task.assignee.substring(0, 2)}
            </div>
          )}

          {/* Deadline */}
          {dl ? (
            <div className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-lg ${
              isDone(task)
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                : isOv
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                : isToday
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
                : 'text-slate-500 dark:text-slate-400'
            }`}>
              <span className="material-symbols-outlined text-[14px]">
                {isOv ? 'event_busy' : isToday ? 'today' : 'calendar_today'}
              </span>
              <span>{dl}</span>
            </div>
          ) : (
            <span className="text-xs text-neutral-400 italic shrink-0">{tMsg('No deadline', 'Tanpa deadline')}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F3F4F6] dark:bg-[#0d0f11]">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#121B2D] border-b border-neutral-200/70 dark:border-neutral-800/60 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-extrabold text-[#111E38] dark:text-white tracking-tight">
              {tMsg('My Tasks', 'Tugas Saya')}
            </h1>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
              {tMsg('Tasks assigned to you across all projects', 'Semua tugas yang ditugaskan kepadamu di semua proyek')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[15px] text-neutral-400 pointer-events-none">search</span>
              <input
                type="text"
                placeholder={tMsg('Search tasks...', 'Cari tugas...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:border-[#FACC15] text-[#111E38] dark:text-neutral-100 w-44 transition-colors"
              />
            </div>

            {/* Group by board toggle */}
            <button
              onClick={() => setGroupByBoard(!groupByBoard)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                groupByBoard
                  ? 'bg-[#111E38] text-[#FACC15] border-[#111E38] dark:bg-[#FACC15] dark:text-[#111E38] dark:border-[#FACC15]'
                  : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-slate-600 dark:text-slate-300 hover:border-neutral-400 dark:hover:border-neutral-500'
              }`}
              title={tMsg('Group by project', 'Kelompokkan per proyek')}
            >
              <span className="material-symbols-outlined text-[15px]">folder_copy</span>
              {tMsg('By Project', 'Per Proyek')}
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              <option value="deadline">{tMsg('Sort: Deadline', 'Urut: Deadline')}</option>
              <option value="priority">{tMsg('Sort: Priority', 'Urut: Prioritas')}</option>
              <option value="status">{tMsg('Sort: Status', 'Urut: Status')}</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 mt-4 overflow-x-auto no-scrollbar">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === f.key
                  ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800/60 text-slate-600 dark:text-slate-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              <span className={`material-symbols-outlined text-[15px] ${activeFilter === f.key ? (f.key === 'today' || f.key === 'overdue' ? 'text-rose-300 dark:text-rose-400' : '') : f.iconColor}`}>
                {f.icon}
              </span>
              {language === 'id' ? f.labelId : f.labelEn}
              {f.count !== null && f.count > 0 && (
                <span className={`min-w-4 h-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center leading-none ${
                  activeFilter === f.key
                    ? 'bg-white/20 text-white dark:bg-[#111E38]/20 dark:text-[#111E38]'
                    : (f.key === 'overdue' || f.key === 'today') ? 'bg-rose-500 text-white' : 'bg-neutral-300 dark:bg-neutral-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-neutral-300 dark:text-neutral-700 mb-3">task_alt</span>
            <p className="text-sm font-semibold text-neutral-400 dark:text-neutral-500">
              {activeFilter === 'overdue'
                ? tMsg('No overdue tasks. Great work!', 'Tidak ada tugas terlambat. Kerjaan bagus!')
                : activeFilter === 'today'
                ? tMsg("You're all caught up for today!", 'Semua tugas hari ini sudah beres!')
                : activeFilter === 'done'
                ? tMsg('No completed tasks yet.', 'Belum ada tugas yang selesai.')
                : tMsg('No active tasks assigned to you.', 'Belum ada tugas aktif yang ditugaskan ke kamu.')}
            </p>
          </div>
        ) : !groupByBoard ? (
          <div className="flex flex-col gap-2">
            {filteredTasks.map(renderTask)}
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(groupedTasks || {}).map(([bid, bTasks]) => {
              const board = boardMap[bid] || { name: tMsg('Unknown Project', 'Proyek Tidak Diketahui'), id: bid };
              return (
                <div key={bid}>
                  <button
                    onClick={() => handleGoToBoard(bid)}
                    className="flex items-center gap-2 mb-2 group"
                  >
                    <span className="material-symbols-outlined text-[16px] text-neutral-400 group-hover:text-[#111E38] dark:group-hover:text-white transition-colors">folder_open</span>
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide group-hover:text-[#111E38] dark:group-hover:text-white transition-colors">
                      {board.name}
                    </span>
                    <span className="text-[10px] font-semibold text-neutral-400">({bTasks.length})</span>
                  </button>
                  <div className="flex flex-col gap-2 pl-0">
                    {bTasks.map(renderTask)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
