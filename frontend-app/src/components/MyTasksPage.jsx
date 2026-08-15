import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useAppContext } from '../hooks/useAppContext';

const STATUS_COLORS = {
  'To Do': 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'In Review': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'Done': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Rejected': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

// Consistent avatar background color per username (inline style — avoids Tailwind purge)
const AVATAR_COLORS = [
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f97316', // orange
  '#0ea5e9', // sky
  '#ec4899', // pink
  '#f59e0b', // amber
];
function avatarBg(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash];
}

function getLocalToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function MyTasksPage({ initialFilter = 'all' }) {
  const {
    tasks = [],
    setTasks,
    fetchTasks,
    boards = [],
    currentUser,
    language = 'id',
    dateFormat: contextDateFormat,
    setSelectedTask,
    setSelectedBoard,
    setViewMode,
    navigateTo,
    avatarsMap,
    showNotification,
  } = useAppContext();

  const tMsg = (en, id) => (language === 'id' ? id : en);

  const dateFormat = contextDateFormat || (typeof window !== 'undefined' ? localStorage.getItem('alurku_date_format') : null) || 'DD MMM YYYY';

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupByBoard, setGroupByBoard] = useState(false);
  const [sortBy, setSortBy] = useState('deadline');
  // Animation states
  const [completingIds, setCompletingIds] = useState(new Set());
  const [uncompletingIds, setUncompletingIds] = useState(new Set());
  // Collapsible project groups: Set of board IDs that are collapsed
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());

  // Quick Subtasks Popover state
  const [popoverTaskId, setPopoverTaskId] = useState(null);
  const [subtasksCache, setSubtasksCache] = useState({});
  const [loadingSubtaskId, setLoadingSubtaskId] = useState(null);

  // Close floating popover when clicking anywhere outside
  useEffect(() => {
    const handleDocumentClick = () => {
      if (popoverTaskId !== null) {
        setPopoverTaskId(null);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [popoverTaskId]);

  // Format absolute date using user preference
  const formatPreferredDate = (dateStr) => {
    if (!dateStr) return '-';
    const cleanStr = String(dateStr).split('T')[0].split(' ')[0];
    const parts = cleanStr.split('-');
    if (parts.length !== 3) return cleanStr;
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    if (isNaN(d.getTime())) return cleanStr;

    const monthsId = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const months = language === 'id' ? monthsId : monthsEn;

    const dayStr = String(d.getDate()).padStart(2, '0');
    const monthNum = String(d.getMonth() + 1).padStart(2, '0');
    const yearStr = d.getFullYear();
    const monthName = months[d.getMonth()];

    if (dateFormat === 'DD/MM/YYYY') {
      return `${dayStr}/${monthNum}/${yearStr}`;
    } else if (dateFormat === 'YYYY-MM-DD') {
      return `${yearStr}-${monthNum}-${dayStr}`;
    } else if (dateFormat === 'MMM DD, YYYY') {
      return `${monthName} ${dayStr}, ${yearStr}`;
    }
    return `${dayStr} ${monthName} ${yearStr}`;
  };

  // Human-friendly relative deadline
  const formatHumanDeadline = (deadlineStr) => {
    if (!deadlineStr) return null;
    const cleanStr = String(deadlineStr).split('T')[0].split(' ')[0];
    const parts = cleanStr.split('-');
    if (parts.length !== 3) return formatPreferredDate(deadlineStr);

    const taskDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return tMsg('Today', 'Hari ini');
    } else if (diffDays === -1) {
      return tMsg('Yesterday', 'Kemarin');
    } else if (diffDays < -1 && diffDays >= -7) {
      return tMsg(`${Math.abs(diffDays)}d ago`, `${Math.abs(diffDays)} hari lalu`);
    } else if (diffDays === 1) {
      return tMsg('Tomorrow', 'Besok');
    } else if (diffDays > 1 && diffDays <= 7) {
      return tMsg(`In ${diffDays}d`, `${diffDays} hari lagi`);
    }

    return formatPreferredDate(deadlineStr);
  };

  // Sunday-to-Saturday week check
  const isDueThisWeek = (task) => {
    if (!task.deadline) return false;
    const dl = String(task.deadline).split('T')[0].split(' ')[0];
    const today = new Date();
    const dayOfWeek = today.getDay();
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

  const boardMap = useMemo(() => {
    const m = {};
    (boards || []).forEach(b => { m[b.id] = b; });
    return m;
  }, [boards]);

  const isUserAssigned = (task) => {
    if (!currentUser) return false;
    const uid = String(currentUser.id || '');
    const uname = (currentUser.username || currentUser.name || '').toLowerCase();
    // Primary: task.requester contains "@username" mentions
    if (task.requester) {
      const mentions = (task.requester.match(/@(\S+)/g) || []).map(m => m.slice(1).toLowerCase());
      if (mentions.includes(uname)) return true;
    }
    // main_assignee field
    if (task.main_assignee && task.main_assignee.toLowerCase() === uname) return true;
    // Fallback legacy fields
    if (String(task.assignee_id || '') === uid) return true;
    if ((task.assignee || '').toLowerCase() === uname) return true;
    if (String(task.assigned_to || '') === uid) return true;
    if (Array.isArray(task.assignees)) {
      return task.assignees.some(a =>
        String(a?.id || a?.user_id || '') === uid ||
        (a?.username || a?.name || '').toLowerCase() === uname
      );
    }
    return false;
  };

  const isDone = (t) => t.status === 'Done' || t.status === 'Completed' || t.status === 'Rejected';
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

  const toggleTaskCompletion = async (e, task) => {
    e.stopPropagation();
    const wasCompleted = isDone(task);
    const newStatus = wasCompleted ? 'In Progress' : 'Done';

    if (!wasCompleted) {
      // COMPLETING: show done state visually for 700ms, then animate out + update state
      setCompletingIds(prev => new Set([...prev, task.id]));
      setTimeout(async () => {
        const updated = { ...task, status: newStatus };
        if (setTasks) setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
        setCompletingIds(prev => { const n = new Set(prev); n.delete(task.id); return n; });
        try {
          await axios.put(`/api/tasks/${task.id}`, { status: newStatus });
          if (showNotification) showNotification(tMsg('Task marked as completed! ✓', 'Tugas ditandai selesai! ✓'));
          if (fetchTasks) fetchTasks();
        } catch (err) {
          console.error('Failed to update task status:', err);
          if (setTasks) setTasks(prev => prev.map(t => t.id === task.id ? task : t));
          if (showNotification) showNotification(tMsg('Failed to update task status', 'Gagal memperbarui status tugas'), 'error');
        }
      }, 700);
    } else {
      // UN-COMPLETING: play exit animation first, THEN update state so task
      // stays visible in the completed filter during the animation.
      setUncompletingIds(prev => new Set([...prev, task.id]));
      setTimeout(async () => {
        const updated = { ...task, status: newStatus };
        if (setTasks) setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
        setUncompletingIds(prev => { const n = new Set(prev); n.delete(task.id); return n; });
        try {
          await axios.put(`/api/tasks/${task.id}`, { status: newStatus });
          if (showNotification) showNotification(tMsg('Task moved back to in progress', 'Tugas dikembalikan ke proses'));
          if (fetchTasks) fetchTasks();
        } catch (err) {
          console.error('Failed to update task status:', err);
          if (setTasks) setTasks(prev => prev.map(t => t.id === task.id ? task : t));
          if (showNotification) showNotification(tMsg('Failed to update task status', 'Gagal memperbarui status tugas'), 'error');
        }
      }, 600);
    }
  };

  // Toggle quick subtask popover & fetch subtasks if needed
  const handleToggleSubtaskPopover = async (e, task) => {
    e.stopPropagation();
    if (popoverTaskId === task.id) {
      setPopoverTaskId(null);
      return;
    }
    setPopoverTaskId(task.id);
    if (!subtasksCache[task.id]) {
      setLoadingSubtaskId(task.id);
      try {
        const res = await axios.get(`/api/tasks/${task.id}/subtasks`);
        const list = res.data?.subtasks || [];
        setSubtasksCache(prev => ({ ...prev, [task.id]: list }));
      } catch (err) {
        console.error('Failed to load subtasks:', err);
      } finally {
        setLoadingSubtaskId(null);
      }
    }
  };

  // Toggle single subtask item inside popover
  const handleToggleSubtaskItem = async (e, taskId, sub) => {
    e.stopPropagation();
    const newDone = sub.is_done ? 0 : 1;
    // Optimistic cache update
    setSubtasksCache(prev => ({
      ...prev,
      [taskId]: (prev[taskId] || []).map(s => s.id === sub.id ? { ...s, is_done: newDone } : s)
    }));
    // Optimistic task list update
    if (setTasks) {
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          const curDone = t.subtask_done ?? 0;
          const delta = newDone ? 1 : -1;
          return { ...t, subtask_done: Math.max(0, curDone + delta) };
        }
        return t;
      }));
    }
    try {
      await axios.put(`/api/subtasks/${sub.id}`, { is_done: newDone });
      if (fetchTasks) fetchTasks();
    } catch (err) {
      console.error('Failed to toggle subtask:', err);
      // Revert cache on error
      setSubtasksCache(prev => ({
        ...prev,
        [taskId]: (prev[taskId] || []).map(s => s.id === sub.id ? { ...s, is_done: sub.is_done } : s)
      }));
      if (showNotification) showNotification(tMsg('Failed to update subtask', 'Gagal memperbarui subtask'), 'error');
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
        filtered = filtered.filter(t => isDone(t));
        break;
      default:
        filtered = filtered.filter(t => !isDone(t));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        (t.project_name || t.name || t.title || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (boardMap[t.board_id]?.name || '').toLowerCase().includes(q)
      );
    }
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'deadline') {
        const da = a.deadline ? String(a.deadline).split('T')[0] : '9999-12-31';
        const db = b.deadline ? String(b.deadline).split('T')[0] : '9999-12-31';
        return da.localeCompare(db);
      }
      if (sortBy === 'priority') {
        const order = { Critical: 0, High: 1, Medium: 2, Low: 3, '': 4 };
        const pa = a.impact || a.priority || a.priority_str || '';
        const pb = b.impact || b.priority || b.priority_str || '';
        return (order[pa] ?? 4) - (order[pb] ?? 4);
      }
      if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '');
      return 0;
    });
    return filtered;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myTasks, activeFilter, searchQuery, sortBy]);

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

  const handleOpenTask = (task) => { setSelectedTask(task); };

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

  const toggleGroupCollapse = (bid) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(bid)) next.delete(bid);
      else next.add(bid);
      return next;
    });
  };

  const overdueCount = useMemo(() => myTasks.filter(t => !isDone(t) && isOverdue(t)).length, [myTasks]);
  const todayCount = useMemo(() => myTasks.filter(t => !isDone(t) && isDueToday(t)).length, [myTasks]);
  const thisWeekCount = useMemo(() => myTasks.filter(t => !isDone(t) && isDueThisWeek(t)).length, [myTasks]);
  const allActiveCount = useMemo(() => myTasks.filter(t => !isDone(t)).length, [myTasks]);
  const completedCount = useMemo(() => myTasks.filter(t => isDone(t)).length, [myTasks]);

  const FILTERS = [
    { key: 'all', labelEn: 'All Active', labelId: 'Ditugaskan ke Saya', count: allActiveCount, icon: 'person_check', iconColor: 'text-indigo-500' },
    { key: 'today', labelEn: 'Due Today', labelId: 'Tenggat Hari Ini', count: todayCount, icon: 'today', iconColor: 'text-amber-500' },
    { key: 'this-week', labelEn: 'This Week', labelId: 'Minggu Ini', count: thisWeekCount, icon: 'date_range', iconColor: 'text-indigo-500' },
    { key: 'overdue', labelEn: 'Overdue', labelId: 'Terlambat', count: overdueCount, icon: 'warning', iconColor: 'text-rose-600' },
    { key: 'completed', labelEn: 'Completed', labelId: 'Selesai', count: completedCount, icon: 'task_alt', iconColor: 'text-emerald-500' },
  ];

  // Collect all unique assignees from task data returned by the list API.
  const getTaskAssignees = (task) => {
    const seen = new Set();
    const people = [];
    const addPerson = (name) => {
      if (!name || typeof name !== 'string') return;
      const clean = name.trim().replace(/^@/, '');
      if (!clean) return;
      const key = clean.toLowerCase();
      if (!seen.has(key)) { seen.add(key); people.push(clean); }
    };
    if (task.requester) {
      const mentions = task.requester.match(/@(\S+)/g) || [];
      mentions.forEach(m => addPerson(m.replace('@', '')));
    }
    if (task.main_assignee) addPerson(task.main_assignee);
    if (task.subtask_assignees) {
      task.subtask_assignees.split(',').forEach(a => addPerson(a.trim()));
    }
    if (Array.isArray(task.assignees)) task.assignees.forEach(a => addPerson(a?.username || a?.name || a));
    return people;
  };

  const renderTask = (task) => {
    const board = boardMap[task.board_id];
    const dlRaw = task.deadline ? String(task.deadline) : null;
    const isOv = dlRaw && isOverdue(task) && !isDone(task);
    const isToday = dlRaw && isDueToday(task) && !isDone(task);
    const humanDeadline = dlRaw ? formatHumanDeadline(dlRaw) : null;
    const formattedAbsoluteDate = dlRaw ? formatPreferredDate(dlRaw) : null;

    const statusColor = STATUS_COLORS[task.status] || STATUS_COLORS['To Do'];

    // Impact / Priority resolution
    const rawImpact = task.impact || task.priority || task.priority_str || 'Medium';

    const taskTitle = task.project_name || task.name || task.title || tMsg('Untitled Task', 'Tugas Tanpa Judul');
    const taskDone = isDone(task);
    const isCompleting = completingIds.has(task.id);
    const isUncompleting = uncompletingIds.has(task.id);
    const showAsDone = taskDone || isCompleting;

    // Subtask progress
    const subtaskTotal = task.subtask_total ?? (task.subtasks?.length ?? 0);
    const subtaskDone  = task.subtask_done  ?? (task.subtasks?.filter(st => st.is_completed || st.completed || st.is_done).length ?? 0);
    const subtaskPct   = subtaskTotal > 0 ? Math.round((subtaskDone / subtaskTotal) * 100) : 0;

    // All assignees (task + subtasks)
    const allAssignees = getTaskAssignees(task);
    const MAX_AVATARS = 3;
    const visibleAvatars = allAssignees.slice(0, MAX_AVATARS);
    const extraCount = allAssignees.length - MAX_AVATARS;

    const animStyle = isCompleting
      ? { animation: 'taskCompleteSlideOut 0.65s ease forwards', animationDelay: '0.05s', pointerEvents: 'none' }
      : isUncompleting
      ? { animation: 'taskUncompleteSlideOut 0.55s ease forwards', pointerEvents: 'none' }
      : {};

    return (
      <div
        key={task.id}
        onClick={() => !isCompleting && handleOpenTask(task)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !isCompleting && handleOpenTask(task)}
        style={animStyle}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-[#121B2D] border rounded-xl transition-all cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15] ${
          isCompleting
            ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20'
            : isUncompleting
            ? 'border-[#FACC15]/50 dark:border-[#FACC15]/30'
            : 'border-neutral-200/70 dark:border-neutral-800/60 hover:border-[#FACC15]/60 dark:hover:border-[#FACC15]/40 hover:shadow-xs'
        }`}
      >
        {/* Left Side: Checkbox + Title & Metadata */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Checkbox */}
          <button
            type="button"
            onClick={(e) => toggleTaskCompletion(e, task)}
            disabled={isCompleting}
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 shrink-0 ${
              showAsDone
                ? 'bg-emerald-500 border-emerald-500 text-white scale-110'
                : 'border-neutral-300 dark:border-neutral-600 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/30 bg-transparent'
            }`}
            title={showAsDone ? tMsg('Mark as incomplete', 'Tandai belum selesai') : tMsg('Mark as complete', 'Tandai selesai')}
          >
            {showAsDone && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
          </button>

          {/* Title + Metadata row */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-semibold truncate transition-all duration-300 ${showAsDone ? 'line-through text-neutral-400 dark:text-neutral-500' : 'text-[#111E38] dark:text-neutral-100'}`}>
              {taskTitle}
            </h3>

            <div className="flex items-center gap-2 flex-wrap mt-0.5 text-[11px]">
              {/* Status Badge */}
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md transition-all duration-300 ${
                isCompleting ? STATUS_COLORS['Done'] : statusColor
              }`}>
                {isCompleting ? 'Done' : (task.status || 'To Do')}
              </span>

              {/* Impact / Urgency Badge */}
              {rawImpact && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 transition-opacity duration-300 ${isCompleting ? 'opacity-40' : ''} ${
                    rawImpact === 'High' || rawImpact === 'Critical'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'
                      : rawImpact === 'Low'
                      ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/50'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                  }`}
                  title={`${tMsg('Impact', 'Dampak')}: ${rawImpact}`}
                >
                  <span className="material-symbols-outlined text-[11px]">
                    {rawImpact === 'High' || rawImpact === 'Critical' ? 'bolt' : rawImpact === 'Low' ? 'south' : 'drag_handle'}
                  </span>
                  <span>{rawImpact === 'High' ? tMsg('High', 'Tinggi') : rawImpact === 'Low' ? tMsg('Low', 'Rendah') : tMsg('Med', 'Sedang')}</span>
                </span>
              )}

              {/* Project/Board tag (only when NOT grouped by board) */}
              {!groupByBoard && board && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleGoToBoard(board.id); }}
                  className={`text-slate-500 dark:text-slate-400 hover:text-[#111E38] dark:hover:text-[#FACC15] font-medium flex items-center gap-1 transition-colors ${isCompleting ? 'opacity-40' : ''}`}
                  title={tMsg('Open Project', 'Buka Proyek')}
                >
                  <span className="material-symbols-outlined text-[13px]">folder</span>
                  <span className="truncate max-w-36">{board.name}</span>
                </button>
              )}

              {/* Category */}
              {task.category && (
                <span className={`text-neutral-400 dark:text-neutral-500 flex items-center gap-0.5 transition-opacity duration-300 ${isCompleting ? 'opacity-40' : ''}`}>
                  • <span>{task.category}</span>
                </span>
              )}

              {/* Interactive Subtask Badge with Floating Quick-List Popover */}
              {subtaskTotal > 0 && (
                <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(e) => handleToggleSubtaskPopover(e, task)}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-all hover:scale-105 cursor-pointer ${
                      popoverTaskId === task.id
                        ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-900 dark:text-amber-200 shadow-xs ring-2 ring-[#FACC15]/40'
                        : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border-neutral-200/60 dark:border-neutral-700/60'
                    }`}
                    title={tMsg('Click to view & checklist subtasks', 'Klik untuk melihat & checklist subtask')}
                  >
                    <span className="material-symbols-outlined text-[12px] text-slate-500 dark:text-slate-400">checklist</span>
                    <span className={`text-[10px] font-semibold ${subtaskPct === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                      {subtaskDone}/{subtaskTotal}
                    </span>
                    <div className="w-10 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden ml-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          subtaskPct === 100
                            ? 'bg-emerald-500'
                            : subtaskPct >= 50
                            ? 'bg-blue-500'
                            : 'bg-[#FACC15]'
                        }`}
                        style={{ width: `${subtaskPct}%` }}
                      />
                    </div>
                    <span className="material-symbols-outlined text-[11px] text-neutral-400">
                      {popoverTaskId === task.id ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {/* Floating Subtask Dropdown Popover */}
                  {popoverTaskId === task.id && (
                    <div
                      className="absolute left-0 top-full mt-2 z-40 w-72 max-w-xs bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-700/80 rounded-xl shadow-2xl p-3 text-left animate-in fade-in zoom-in-95 duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-[#FACC15]">checklist</span>
                          <span className="text-xs font-bold text-[#111E38] dark:text-white">
                            {tMsg('Subtasks', 'Daftar Subtask')}
                          </span>
                          <span className="text-[10px] font-semibold text-neutral-400">
                            ({subtaskDone}/{subtaskTotal})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPopoverTaskId(null)}
                          className="w-5 h-5 rounded flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>

                      {loadingSubtaskId === task.id ? (
                        <div className="py-4 flex items-center justify-center text-xs text-neutral-400 gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          <span>{tMsg('Loading subtasks...', 'Memuat subtask...')}</span>
                        </div>
                      ) : (subtasksCache[task.id] || []).length === 0 ? (
                        <div className="py-3 text-center text-xs text-neutral-400">
                          {tMsg('No subtasks found', 'Tidak ada subtask')}
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                          {(subtasksCache[task.id] || []).map((sub) => (
                            <div
                              key={sub.id}
                              onClick={(e) => handleToggleSubtaskItem(e, task.id, sub)}
                              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/60 cursor-pointer transition-colors group/sub"
                            >
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                                  sub.is_done
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-neutral-300 dark:border-neutral-600 bg-transparent group-hover/sub:border-emerald-500'
                                }`}
                              >
                                {sub.is_done ? (
                                  <span className="material-symbols-outlined text-[11px] font-bold">check</span>
                                ) : null}
                              </div>
                              <span className={`text-xs flex-1 truncate ${sub.is_done ? 'line-through text-neutral-400 dark:text-neutral-500' : 'text-[#111E38] dark:text-neutral-200'}`}>
                                {sub.task_name}
                              </span>
                              {sub.assignee && (
                                <span
                                  className="w-4 h-4 rounded-full text-[8px] font-bold text-white flex items-center justify-center uppercase shrink-0"
                                  style={{ backgroundColor: avatarBg(sub.assignee) }}
                                  title={`Assignee: ${sub.assignee}`}
                                >
                                  {sub.assignee.substring(0, 2)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Avatars + Deadline + Hover Quick Action */}
        <div className={`flex items-center gap-3 shrink-0 transition-opacity duration-300 ${isCompleting ? 'opacity-30' : ''}`}>
          {/* Avatar Stack */}
          {visibleAvatars.length > 0 && (
            <div className="flex items-center -space-x-2">
              {visibleAvatars.map((name, i) => (
                <div
                  key={i}
                  title={name}
                  className="w-6 h-6 rounded-full text-white text-[9px] font-bold flex items-center justify-center uppercase border-2 border-white dark:border-[#121B2D] shadow-xs shrink-0"
                  style={{ backgroundColor: avatarBg(name), zIndex: visibleAvatars.length - i }}
                >
                  {name.substring(0, 2)}
                </div>
              ))}
              {extraCount > 0 && (
                <div
                  title={`+${extraCount} ${tMsg('more', 'lainnya')}`}
                  className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-[#121B2D]"
                >
                  +{extraCount}
                </div>
              )}
            </div>
          )}

          {/* Deadline Badge with Human-Friendly relative text & Tooltip */}
          {dlRaw ? (
            <div
              title={`${tMsg('Deadline', 'Tenggat Waktu')}: ${formattedAbsoluteDate} (${dlRaw.split('T')[0]})`}
              className={`text-xs font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                showAsDone
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                  : isOv
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                  : isToday
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
                  : 'text-slate-600 dark:text-slate-300 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {isOv ? 'event_busy' : isToday ? 'today' : 'calendar_today'}
              </span>
              <span>{humanDeadline}</span>
            </div>
          ) : (
            <span className="text-xs text-neutral-300 dark:text-neutral-600 shrink-0">—</span>
          )}

          {/* Hover Quick Action Button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleOpenTask(task); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-[#111E38] dark:hover:text-[#FACC15] hover:bg-neutral-100 dark:hover:bg-neutral-800 opacity-0 group-hover:opacity-100 transition-all shrink-0"
            title={tMsg('Open task details', 'Buka detail tugas')}
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F3F4F6] dark:bg-[#0d0f11]">
      {/* CSS animations */}
      <style>{`
        @keyframes taskCompleteSlideOut {
          0%   { opacity: 1; transform: translateX(0) scaleY(1); max-height: 100px; }
          30%  { opacity: 1; transform: translateX(0) scaleY(1); }
          70%  { opacity: 0; transform: translateX(10px) scaleY(0.85); max-height: 100px; }
          100% { opacity: 0; transform: translateX(14px) scaleY(0); max-height: 0;
                 padding-top: 0; padding-bottom: 0; margin: 0; overflow: hidden; }
        }
        @keyframes taskUncompleteSlideOut {
          0%   { opacity: 1; transform: translateX(0) scaleY(1); max-height: 100px; }
          30%  { opacity: 1; transform: translateX(-4px) scaleY(1); }
          70%  { opacity: 0; transform: translateX(-12px) scaleY(0.85); max-height: 100px; }
          100% { opacity: 0; transform: translateX(-16px) scaleY(0); max-height: 0;
                 padding-top: 0; padding-bottom: 0; margin: 0; overflow: hidden; }
        }
      `}</style>

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
              <option value="priority">{tMsg('Sort: Priority / Impact', 'Urut: Prioritas / Dampak')}</option>
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
              <span className={`material-symbols-outlined text-[15px] ${activeFilter === f.key ? '' : f.iconColor}`}>
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
                : activeFilter === 'completed'
                ? tMsg('No completed tasks yet.', 'Belum ada tugas yang selesai.')
                : tMsg('No active tasks assigned to you.', 'Belum ada tugas aktif yang ditugaskan ke kamu.')}
            </p>
          </div>
        ) : !groupByBoard ? (
          <div className="flex flex-col gap-2">
            {filteredTasks.map(task => (
              <React.Fragment key={task.id}>{renderTask(task)}</React.Fragment>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedTasks || {}).map(([bid, bTasks]) => {
              const board = boardMap[bid] || { name: tMsg('Unknown Project', 'Proyek Tidak Diketahui'), id: bid };
              const isCollapsed = collapsedGroups.has(bid);

              return (
                <div key={bid} className="rounded-xl border border-neutral-200/80 dark:border-neutral-800/70 bg-white dark:bg-[#121B2D]">
                  {/* Group Header */}
                  <div className="flex items-center gap-0 border-b border-neutral-100 dark:border-neutral-800/60">
                    {/* Collapse toggle */}
                    <button
                      onClick={() => toggleGroupCollapse(bid)}
                      className="flex items-center justify-center w-9 h-10 text-neutral-400 hover:text-[#111E38] dark:hover:text-white transition-colors shrink-0"
                      title={isCollapsed ? tMsg('Expand', 'Perluas') : tMsg('Collapse', 'Ciutkan')}
                    >
                      <span
                        className="material-symbols-outlined text-[18px] transition-transform duration-200"
                        style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
                      >
                        expand_more
                      </span>
                    </button>

                    {/* Folder icon + Board name (clickable → goes to board) */}
                    <button
                      onClick={() => handleGoToBoard(bid)}
                      className="flex items-center gap-2 flex-1 py-2.5 pr-4 group text-left"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#FACC15]">folder_open</span>
                      <span className="text-sm font-bold text-[#111E38] dark:text-neutral-100 group-hover:text-[#111E38] dark:group-hover:text-[#FACC15] transition-colors">
                        {board.name}
                      </span>
                      <span className="text-[11px] font-semibold text-neutral-400 ml-1">
                        {bTasks.length} {tMsg('tasks', 'tugas')}
                      </span>

                      {/* Task count + open icon */}
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="material-symbols-outlined text-[14px] text-neutral-400 group-hover:text-[#111E38] dark:group-hover:text-[#FACC15] transition-colors">
                          open_in_new
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Task list (collapsible) */}
                  <div
                    style={{
                      maxHeight: isCollapsed ? '0' : 'none',
                      overflow: isCollapsed ? 'hidden' : 'visible',
                      display: isCollapsed ? 'none' : 'block',
                    }}
                  >
                    <div className="flex flex-col gap-2 p-3">
                      {bTasks.map(task => (
                        <React.Fragment key={task.id}>{renderTask(task)}</React.Fragment>
                      ))}
                    </div>
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
