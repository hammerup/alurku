import React, { useState, useMemo, useEffect, useRef } from 'react';
import axios from 'axios';
import { HighlightText } from './Utils';
import { IconPerson, Avatar } from './SharedUI';

export default function TableList({
  clonedTaskIds,
  filteredTasks = [],
  setSelectedTask,
  currentUser,
  avatarsMap = {},
  formatDateMMM = (d) => d,
  handleQuickAddTask = () => {},
  selectedBoard,
  accountStatus,
  categories = [],
  teamMembers = [],
  isMentioning,
  mentionIndex,
  setMentionIndex,
  setIsMentioning,
  mentionQuery,
  handleRequesterChange = () => {},
  insertMention = () => {},
  notifications = [],
  boards = [],
  fetchTasks,
  setClonedTaskIds,
  showNotification,
  searchQuery = '',
  language = 'en',
}) {
  const tMsg = (en, id) => (language === 'id' ? id : en);

  const getTaskDeadlineInfo = (task) => {
    if (!task.deadline) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dl = new Date(task.deadline.replace(/-/g, '/'));
    dl.setHours(0, 0, 0, 0);
    const diffDays = Math.round((dl - today) / (1000 * 60 * 60 * 24));

    let timeStr = '';
    let badgeColor = 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700';

    if (diffDays < 0) {
      timeStr = tMsg(`${Math.abs(diffDays)}d overdue`, `${Math.abs(diffDays)} hari lewat`);
      badgeColor = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50';
    } else if (diffDays === 0) {
      timeStr = tMsg('Today', 'Hari Ini');
      badgeColor = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
    } else if (diffDays === 1) {
      timeStr = tMsg('1d left', '1 hari lagi');
      badgeColor = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
    } else if (diffDays < 7) {
      timeStr = tMsg(`${diffDays}d left`, `${diffDays} hari lagi`);
      badgeColor = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
    } else {
      const w = Math.floor(diffDays / 7);
      const d = diffDays % 7;
      timeStr = d === 0 ? tMsg(`${w}w left`, `${w} minggu lagi`) : tMsg(`${w}w ${d}d left`, `${w} minggu ${d} hari lagi`);
      badgeColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
    }

    return { badgeColor, timeStr };
  };

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage, setTasksPerPage] = useState(() => {
    if (typeof window !== 'undefined') return Number(localStorage.getItem('alurku_tasks_per_page')) || 15;
    return 15;
  });
  const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
  const [showCompletedMobile, setShowCompletedMobile] = useState(false);
  const [processingTaskId, setProcessingTaskId] = useState(null);
  const [newlyAddedId, setNewlyAddedId] = useState(null);
  const [newlyActivatedId, setNewlyActivatedId] = useState(null);
  const [newlyReactivatedId, setNewlyReactivatedId] = useState(null);
  const [newlyCompletedId, setNewlyCompletedId] = useState(null);
  const [isArchiveExpanded, setIsArchiveExpanded] = useState(false);

  const handleAnimationEnd = (taskId) => {
    if (newlyActivatedId === taskId) {
      setNewlyActivatedId(null);
    }
    if (newlyCompletedId === taskId) {
      setNewlyCompletedId(null);
    }
    if (newlyReactivatedId === taskId) {
      setNewlyReactivatedId(null);
    }
  };

  useEffect(() => localStorage.setItem('alurku_tasks_per_page', tasksPerPage), [tasksPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTasks, sortConfig, tasksPerPage]);

  const getLocalToday = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(
      2,
      '0'
    )}`;
  };

  const [quickAddData, setQuickAddData] = useState({
    project_name: '',
    requester: currentUser ? `@${currentUser}` : '',
    category: categories?.[0] || 'Development',
    deadline: '',
    impact: 'Medium',
    etc: 2,
  });

  const optimisticIdRef = useRef(null);
  const [displayTasks, setDisplayTasks] = useState(filteredTasks);
  useEffect(() => {
    if (optimisticIdRef.current) {
      const realNewTask = filteredTasks.find(
        (t) =>
          t.project_name === optimisticIdRef.current.name &&
          t.requester === optimisticIdRef.current.requester &&
          !displayTasks.some((dt) => dt.id === t.id)
      );

      if (realNewTask) {
        const tempIdToReplace = optimisticIdRef.current.id;
        setDisplayTasks((prev) => {
          const newTasks = prev.map((t) => (t.id === tempIdToReplace ? realNewTask : t));
          return newTasks;
        });
        optimisticIdRef.current = null;
      } else {
        // Fallback if match fails, to prevent stale UI
        setDisplayTasks(filteredTasks);
      }
    } else {
      setDisplayTasks(filteredTasks);
    }
  }, [filteredTasks]);

  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [bulkTargetBoard, setBulkTargetBoard] = useState('');
  const [isBulkMoving, setIsBulkMoving] = useState(false);

  const handleToggleBulkSelect = () => {
    if (isBulkSelectMode) {
      setSelectedTaskIds([]);
    }
    setIsBulkSelectMode((prev) => !prev);
  };

  const handleToggleSelectTask = (taskId) => {
    setSelectedTaskIds((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]));
  };

  const handleSelectAllCurrentPage = (e) => {
    if (e.target.checked) {
      setSelectedTaskIds(currentTasks.map((t) => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const [isBulkOperating, setIsBulkOperating] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const handleBulkMarkStatus = async (newStatus) => {
    if (selectedTaskIds.length === 0) return;
    setIsBulkOperating(true);
    try {
      await Promise.all(
        selectedTaskIds.map((id) => axios.put(`/api/tasks/${id}`, { status: newStatus }))
      );
      const count = selectedTaskIds.length;
      setSelectedTaskIds([]);
      if (fetchTasks) fetchTasks();
      if (showNotification) {
        showNotification(
          language === 'id'
            ? `Berhasil mengubah status ${count} tugas menjadi ${newStatus}`
            : `Successfully updated status for ${count} tasks to ${newStatus}`,
          'success'
        );
      }
    } catch (e) {
      console.error(e);
      if (showNotification) showNotification(tMsg('Failed to update some tasks', 'Gagal memperbarui beberapa tugas'), 'error');
    } finally {
      setIsBulkOperating(false);
    }
  };

  const executeBulkDelete = async () => {
    if (selectedTaskIds.length === 0) return;
    setIsBulkOperating(true);
    setShowBulkDeleteConfirm(false);
    try {
      await Promise.all(
        selectedTaskIds.map((id) => axios.delete(`/api/tasks/${id}`))
      );
      const count = selectedTaskIds.length;
      setSelectedTaskIds([]);
      if (fetchTasks) fetchTasks();
      if (showNotification) {
        showNotification(
          language === 'id'
            ? `Berhasil menghapus ${count} tugas`
            : `Successfully deleted ${count} tasks`,
          'success'
        );
      }
    } catch (e) {
      console.error(e);
      if (showNotification) showNotification(tMsg('Failed to delete some tasks', 'Gagal menghapus beberapa tugas'), 'error');
    } finally {
      setIsBulkOperating(false);
    }
  };

  const handleBulkMove = async () => {
    if (!bulkTargetBoard || selectedTaskIds.length === 0) return;
    setIsBulkMoving(true);
    const tasksToMove = filteredTasks.filter((t) => selectedTaskIds.includes(t.id));
    try {
      for (const t of tasksToMove) {
        const payload = {
          project_name: t.project_name,
          requester: t.requester,
          category: t.category,
          description: t.description || '',
          supporting_access: t.supporting_access || '',
          start_date: t.start_date || (t.timestamp && t.timestamp.split(' ')[0]),
          deadline: t.deadline ? t.deadline.split(' ')[0] + ' 17:00:00' : '',
          impact: t.impact || 'Medium',
          etc: t.etc || 2,
          status: t.status,
          board_id: parseInt(bulkTargetBoard),
        };
        await axios.put(`/api/tasks/${t.id}/details`, payload);
      }
      setSelectedTaskIds([]);
      setBulkTargetBoard('');
      if (fetchTasks) fetchTasks();
      if (showNotification) showNotification('Tasks successfully moved!', 'success');
    } catch (e) {
      console.error(e);
      if (showNotification) showNotification('Failed to move some tasks', 'error');
    } finally {
      setIsBulkMoving(false);
    }
  };

  const handleToggleTaskDone = async (task, e) => {
    e.stopPropagation();
    if (processingTaskId === task.id) return; // Mencegah klik ganda
    setProcessingTaskId(task.id);
    
    const newStatus = task.status === 'Done' ? 'In Progress' : 'Done';

    // 1. MULAI ANIMASI KELUAR (SLIDE OUT) SEBELUM DATA BERPINDAH
    if (newStatus === 'Done') {
      setNewlyCompletedId(task.id);
    } else {
      setNewlyReactivatedId(task.id);
    }

    try {
      // Gunakan endpoint status yang lebih ringan & bisa me-return cloned_task_id
      const apiCall = axios.put(`/api/tasks/${task.id}`, { status: newStatus });
      const animationDelay = new Promise((resolve) => setTimeout(resolve, 500)); // Sinkronkan dengan durasi CSS animasi 0.5s

      // 2. JALANKAN API DAN TUNGGU ANIMASI KELUAR SELESAI
      const [res] = await Promise.all([apiCall, animationDelay]);

      if (res.data?.cloned_task_id && setClonedTaskIds) {
        const clonedId = res.data.cloned_task_id;
        setClonedTaskIds((prev) => {
          const next = new Set(prev);
          next.add(clonedId);
          next.add(Number(clonedId));
          next.add(String(clonedId));
          return next;
        });
      }

      // 3. OPTIMISTIC UI UPDATE: Pindahkan task ke daftar baru SETELAH slide-out selesai
      setDisplayTasks((prevTasks) => 
        prevTasks.map((t) => t.id === task.id ? { 
          ...t, 
          status: newStatus,
          completed_time: newStatus === 'Done' ? new Date().toISOString() : t.completed_time
        } : t)
      );

      // 4. ATUR ANIMASI MASUK (SLIDE IN) DI DAFTAR TUJUAN
      if (newStatus === 'In Progress') {
        setNewlyReactivatedId(null);
        setNewlyActivatedId(task.id);
      }

      // Sinkronisasi data di background agar UI tidak out-of-sync
      if (fetchTasks) fetchTasks();
    } catch (error) {
      console.error('Failed to update task status:', error);
      if (showNotification) {
        showNotification(error.response?.data?.detail || 'Failed to update task status.', 'error');
      }
      // Kembalikan UI jika API gagal
      setNewlyCompletedId(null);
      setNewlyReactivatedId(null);
      if (fetchTasks) fetchTasks();
    } finally {
      setProcessingTaskId(null);
    }
  };

  useEffect(() => {
    if (categories && !categories.includes(quickAddData.category)) {
      setQuickAddData((prev) => ({ ...prev, category: categories[0] }));
    }
  }, [categories]);

  const submitQuickAdd = () => {
    if (quickAddData.project_name.trim()) {
      const tempId = `temp-${Date.now()}`;
      const newTask = {
        ...quickAddData,
        id: tempId,
        timestamp: new Date().toISOString(),
        status: 'Pending',
        priority_lvl: 'normal',
        priority_str: 'NORMAL',
        subtask_total: 0,
        subtask_done: 0,
        owner_username: currentUser,
        board_id: selectedBoard.id,
        board_name: selectedBoard.name,
      };

      optimisticIdRef.current = { id: tempId, name: newTask.project_name, requester: newTask.requester };

      setDisplayTasks((prev) => [newTask, ...prev]);
      setNewlyAddedId(tempId);

      handleQuickAddTask(quickAddData)
        .then(() => {
          if (fetchTasks) fetchTasks();
          showNotification('Task created!', 'success');
        })
        .catch((err) => {
          showNotification(err.response?.data?.detail || 'Failed to create task', 'error');
          setDisplayTasks((prev) => prev.filter((t) => t.id !== tempId));
          optimisticIdRef.current = null;
        });

      setQuickAddData({
        project_name: '',
        requester: currentUser ? `@${currentUser}` : '',
        category: categories?.[0] || 'Development',
        deadline: '',
        impact: 'Medium',
        etc: 2,
      });
    }
  };

  const sortedTasks = useMemo(() => {
    let sortableTasks = [...displayTasks];
    if (sortConfig.key !== null) {
      sortableTasks.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'deadline') {
          aValue = a.deadline
            ? new Date(a.deadline.replace(/-/g, '/')).getTime()
            : sortConfig.direction === 'ascending'
            ? Infinity
            : -Infinity;
          bValue = b.deadline
            ? new Date(b.deadline.replace(/-/g, '/')).getTime()
            : sortConfig.direction === 'ascending'
            ? Infinity
            : -Infinity;
        } else if (sortConfig.key === 'start_date') {
          aValue = a.start_date
            ? new Date(a.start_date.replace(/-/g, '/')).getTime()
            : sortConfig.direction === 'ascending'
            ? Infinity
            : -Infinity;
          bValue = b.start_date
            ? new Date(b.start_date.replace(/-/g, '/')).getTime()
            : sortConfig.direction === 'ascending'
            ? Infinity
            : -Infinity;
        } else if (sortConfig.key === 'priority_lvl') {
          const prioWeight = { critical: 3, warning: 2, normal: 1 };
          let weightA = prioWeight[a.priority_lvl] || 0;
          let weightB = prioWeight[b.priority_lvl] || 0;
          if (weightA === weightB) {
            const impactWeight = { High: 3, Medium: 2, Low: 1 };
            weightA = impactWeight[a.impact || 'Medium'] || 0;
            weightB = impactWeight[b.impact || 'Medium'] || 0;
          }
          aValue = weightA;
          bValue = weightB;
        } else if (sortConfig.key === 'impact') {
          const impactWeight = { High: 3, Medium: 2, Low: 1 };
          aValue = impactWeight[a.impact || 'Medium'] || 0;
          bValue = impactWeight[b.impact || 'Medium'] || 0;
        } else if (sortConfig.key === 'etc') {
          aValue = a.etc || 0;
          bValue = b.etc || 0;
        } else if (sortConfig.key === 'queue') {
          const isGlobal = !selectedBoard || selectedBoard.id === 'global';
          aValue = (isGlobal ? a.queue_global_number : a.queue_project_number) || 999999;
          bValue = (isGlobal ? b.queue_global_number : b.queue_project_number) || 999999;
        } else if (sortConfig.key === 'subtasks') {
          aValue = a.subtask_total > 0 ? a.subtask_done / a.subtask_total : -1;
          bValue = b.subtask_total > 0 ? b.subtask_done / b.subtask_total : -1;
        } else {
          aValue = (aValue || '').toString().toLowerCase();
          bValue = (bValue || '').toString().toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableTasks;
  }, [displayTasks, sortConfig, selectedBoard]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      key = null;
      direction = 'ascending';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return null;
    return (
      <svg className="w-3 h-3 inline ml-1 text-[#111E38] dark:text-[#FACC15]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        {sortConfig.direction === 'ascending' ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        )}
      </svg>
    );
  };

  const activeTasks = useMemo(
    () => sortedTasks.filter((task) => task.status !== 'Done' && task.status !== 'Rejected'),
    [sortedTasks]
  );
  const doneTasks = useMemo(
    () =>
      sortedTasks
        .filter((task) => task.status === 'Done')
        .sort((a, b) => new Date(b.completed_time || 0) - new Date(a.completed_time || 0)),
    [sortedTasks]
  );

  const archiveLimit = 10;
  const visibleDoneTasks = useMemo(() => {
    return !isArchiveExpanded ? doneTasks.slice(0, archiveLimit) : doneTasks;
  }, [doneTasks, isArchiveExpanded]);

  const archivedCount = doneTasks.length - visibleDoneTasks.length;

  const totalPages = Math.ceil(activeTasks.length / tasksPerPage) || 1;
  const currentTasks = activeTasks.slice((currentPage - 1) * tasksPerPage, currentPage * tasksPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const isSameBoard =
    selectedBoard && selectedBoard.id !== 'global' && String(bulkTargetBoard) === String(selectedBoard.id);

  return (
    <>
      {/* Tambahkan CSS di sini agar animasi lebih halus */}
      <style>{`
        @keyframes slide-in-from-top {
          0% {
            transform: translateY(-20px) scale(0.98);
            opacity: 0;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        .animate-slide-in-from-top { animation: slide-in-from-top 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
      {/* Tambahkan CSS di sini agar animasi lebih halus */}
      <style>{`
        @keyframes slide-in-from-left {
          0% { transform: translateX(-20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in-from-left 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
          will-change: transform, opacity;
        }
        @keyframes slide-in-from-right {
          0% { transform: translateX(20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-from-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
          will-change: transform, opacity;
        }
        @keyframes slide-out-to-right {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(50px); opacity: 0; }
        }
        .animate-slide-out {
          animation: slide-out-to-right 0.5s ease-out forwards;
          will-change: transform, opacity;
        }
        @keyframes slide-out-to-left {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-50px); opacity: 0; }
        }
        .animate-slide-out-left {
          animation: slide-out-to-left 0.5s ease-out forwards;
          will-change: transform, opacity;
        }
      `}</style>
      <div className="flex flex-1 min-h-0 gap-6 text-slate-800 dark:text-slate-200">
        {/* Main Task List Container */}
        <div className="flex flex-col flex-1 min-h-0 relative">
          {/* Sort & Filter Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-2 text-xs font-bold text-neutral-500 dark:text-neutral-400 shrink-0">
            {/* Left: Compact Sort By Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-extrabold flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" /></svg>
                {tMsg('Sort by:', 'Urutkan:')}
              </span>
              <div className="relative">
                <select
                  onChange={(e) => requestSort(e.target.value)}
                  value={sortConfig.key || ''}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#111E38] dark:text-neutral-200 outline-none focus:ring-2 focus:ring-[#FACC15] cursor-pointer shadow-2xs transition-all"
                >
                  <option value="">{tMsg('Default', 'Bawaan')}</option>
                  <option value="queue">{tMsg('Queue Priority', 'Urutan Antrean')}</option>
                  <option value="project_name">{tMsg('Task Name', 'Nama Tugas')}</option>
                  <option value="status">{tMsg('Status', 'Status')}</option>
                  <option value="start_date">{tMsg('Start Date', 'Tanggal Mulai')}</option>
                  <option value="deadline">{tMsg('Deadline', 'Tenggat Waktu')}</option>
                  <option value="priority_lvl">{tMsg('Priority Level', 'Tingkat Prioritas')}</option>
                </select>
              </div>
              {sortConfig.key && (
                <button
                  onClick={() => requestSort(sortConfig.key)}
                  className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                  title={sortConfig.direction === 'ascending' ? 'Ascending (A-Z, 0-9)' : 'Descending (Z-A, 9-0)'}
                >
                  {renderSortIcon(sortConfig.key)}
                </button>
              )}
            </div>
            {isBulkSelectMode && (
              <div className="ml-auto flex flex-wrap items-center gap-2">
                {selectedTaskIds.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mr-1 border-r border-neutral-200 dark:border-neutral-700/50 pr-3">
                    <span className="text-[#111E38] dark:text-[#FACC15] font-black text-[10px] uppercase tracking-wider bg-amber-100/70 dark:bg-amber-950/50 px-2 py-1 rounded-md">
                      {selectedTaskIds.length} {tMsg('Selected', 'Terpilih')}
                    </span>
                    
                    {/* Bulk Mark as Done */}
                    <button
                      onClick={() => handleBulkMarkStatus('Done')}
                      disabled={isBulkOperating}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                      title={tMsg('Mark selected tasks as Done', 'Tandai tugas terpilih sebagai selesai')}
                    >
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      <span className="hidden sm:inline">{tMsg('Done', 'Selesai')}</span>
                    </button>

                    {/* Bulk Mark as In Progress */}
                    <button
                      onClick={() => handleBulkMarkStatus('In Progress')}
                      disabled={isBulkOperating}
                      className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                      title={tMsg('Set status to In Progress', 'Ubah status ke Sedang Dikerjakan')}
                    >
                      <span className="material-symbols-outlined text-xs">play_arrow</span>
                      <span className="hidden sm:inline">{tMsg('In Progress', 'Kerjakan')}</span>
                    </button>

                    {/* Bulk Delete */}
                    <button
                      onClick={() => setShowBulkDeleteConfirm(true)}
                      disabled={isBulkOperating}
                      className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                      title={tMsg('Delete selected tasks', 'Hapus tugas terpilih')}
                    >
                      <span className="material-symbols-outlined text-xs">delete</span>
                      <span className="hidden sm:inline">{tMsg('Delete', 'Hapus')}</span>
                    </button>

                    {/* Bulk Move to Project */}
                    <select
                      value={bulkTargetBoard}
                      onChange={(e) => setBulkTargetBoard(e.target.value)}
                      className="py-1 px-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-800 dark:text-white text-[10px] font-bold outline-none"
                    >
                      <option value="" className="text-slate-800 dark:text-white">{tMsg('Move to...', 'Pindah ke...')}</option>
                      {boards?.map((b) => (
                        <option key={b.id} value={b.id} className="text-slate-800 dark:text-white">
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleBulkMove}
                      disabled={!bulkTargetBoard || isBulkMoving || isBulkOperating || isSameBoard}
                      className="bg-[#111E38] dark:bg-[#FACC15] text-white dark:text-[#111E38] px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {isBulkMoving ? '...' : tMsg('Move', 'Pindah')}
                    </button>
                  </div>
                )}
                <label className="flex items-center gap-2 cursor-pointer bg-neutral-200 dark:bg-neutral-800 px-3 py-1.5 rounded-md text-neutral-800 dark:text-neutral-200 transition-colors text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={currentTasks.length > 0 && selectedTaskIds.length === currentTasks.length}
                    onChange={handleSelectAllCurrentPage}
                    className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  {tMsg('Select All', 'Pilih Semua')}
                </label>
              </div>
            )}
          </div>

          {/* Task List Content */}
          <div className="flex-1 overflow-y-auto w-full custom-scrollbar relative min-h-0 py-2 space-y-2">
            {/* Quick Add Row */}
            {selectedBoard && selectedBoard.id !== 'global' && accountStatus !== 'suspended' && currentPage === 1 && (
              <div className="bg-neutral-50/70 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 focus-within:border-[#FACC15] focus-within:ring-2 focus-within:ring-[#FACC15]/30 rounded-2xl p-3.5 transition-all shadow-2xs flex flex-col gap-2.5 relative">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-[#FACC15]/20 text-[#111E38] dark:text-[#FACC15] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  </div>
                  <input
                    type="text"
                    value={quickAddData.project_name}
                    onChange={(e) => setQuickAddData({ ...quickAddData, project_name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        submitQuickAdd();
                      }
                    }}
                    placeholder={tMsg('New task title... (Press Enter to save)', 'Tulis tugas baru... (Tekan Enter untuk simpan)')}
                    className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-sm font-semibold text-[#111E38] dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 transition-all"
                  />
                  <button
                    onClick={submitQuickAdd}
                    className="hidden md:flex items-center gap-1.5 bg-[#111E38] hover:bg-slate-800 dark:bg-[#FACC15] dark:hover:bg-yellow-400 text-white dark:text-[#111E38] px-3.5 py-1.5 rounded-xl text-xs font-extrabold shadow-xs transition-colors cursor-pointer"
                  >
                    <span>{tMsg('Add Task', 'Tambah')}</span>
                  </button>
                </div>

                {/* Quick Add Metadata Inputs */}
                <div className="flex flex-wrap items-center gap-2 pl-10">
                  {/* Assignee Input */}
                  <div className="relative group">
                    <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-[#FACC15]">
                      <svg className="w-3.5 h-3.5 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <input
                        type="text"
                        value={quickAddData.requester}
                        onChange={(e) => handleRequesterChange(e.target.value, setQuickAddData, quickAddData)}
                        onKeyDown={(e) => {
                          if (isMentioning) {
                            const filtered = teamMembers.filter((m) => m.toLowerCase().includes(mentionQuery));
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setMentionIndex((prev) => (prev + 1) % (filtered.length || 1));
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setMentionIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
                            } else if (e.key === 'Enter' || e.key === 'Tab') {
                              if (filtered.length > 0) {
                                e.preventDefault();
                                insertMention(filtered[mentionIndex] || filtered[0], setQuickAddData, quickAddData);
                              }
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              setIsMentioning(false);
                            }
                          }
                        }}
                        placeholder="@assignee..."
                        className="w-24 bg-transparent border-none focus:ring-0 outline-none text-xs font-medium text-slate-700 dark:text-slate-300 placeholder-slate-400"
                      />
                    </div>
                    {isMentioning && accountStatus !== 'suspended' && (
                      <div className="absolute left-0 top-full mt-1 w-48 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-xl z-99 max-h-40 overflow-y-auto py-2">
                        {teamMembers.filter((m) => m.toLowerCase().includes(mentionQuery)).length > 0 ? (
                          teamMembers
                            .filter((m) => m.toLowerCase().includes(mentionQuery))
                            .map((m, idx) => (
                              <div
                                key={m}
                                ref={(el) => {
                                  if (mentionIndex === idx && el) {
                                    el.scrollIntoView({ block: 'nearest' });
                                  }
                                }}
                                className={`px-4 py-2 cursor-pointer text-xs text-black dark:text-white font-bold border-b border-neutral-100 dark:border-neutral-800/50 last:border-0 ${
                                  mentionIndex === idx
                                    ? 'bg-neutral-100 dark:bg-neutral-800'
                                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                }`}
                                onClick={() => insertMention(m, setQuickAddData, quickAddData)}
                              >
                                @{m}
                              </div>
                            ))
                        ) : (
                          <div className="px-4 py-2 text-xs text-neutral-400 font-bold italic">Not found</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Category Input */}
                  <select
                    value={quickAddData.category}
                    onChange={(e) => setQuickAddData({ ...quickAddData, category: e.target.value })}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-[#FACC15] cursor-pointer"
                  >
                    {categories?.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  {/* Priority Input */}
                  <select
                    value={quickAddData.impact}
                    onChange={(e) => setQuickAddData({ ...quickAddData, impact: e.target.value })}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-[#FACC15] cursor-pointer"
                    title={tMsg('Priority', 'Prioritas')}
                  >
                    <option value="High">{tMsg('High Priority', 'Prioritas Tinggi')}</option>
                    <option value="Medium">{tMsg('Med Priority', 'Prioritas Sedang')}</option>
                    <option value="Low">{tMsg('Low Priority', 'Prioritas Rendah')}</option>
                  </select>

                  {/* Deadline Input */}
                  <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-[#FACC15]">
                    <svg className="w-3.5 h-3.5 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <input
                      type="date"
                      value={quickAddData.deadline}
                      onChange={(e) => setQuickAddData({ ...quickAddData, deadline: e.target.value })}
                      className="bg-transparent border-none focus:ring-0 outline-none text-xs font-bold text-slate-700 dark:text-slate-300"
                    />
                  </div>
 
                  {/* Time Estimate Input */}
                  <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-[#FACC15]" title={tMsg('Estimated time in hours', 'Estimasi waktu dalam jam')}>
                    <svg className="w-3.5 h-3.5 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={quickAddData.etc}
                      onChange={(e) => setQuickAddData({ ...quickAddData, etc: parseFloat(e.target.value) || 0 })}
                      className="w-12 bg-transparent border-none focus:ring-0 outline-none text-xs font-bold text-slate-700 dark:text-slate-300 text-center"
                      placeholder={tMsg('Hours', 'Jam')}
                    />
                  </div>
                  {/* Mobile submit */}
                  <button
                    onClick={submitQuickAdd}
                    className="md:hidden mt-2 w-full bg-[#111E38] dark:bg-[#FACC15] text-white dark:text-[#111E38] px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors uppercase tracking-widest cursor-pointer"
                  >
                    {tMsg('Add Task', 'Tambah Tugas')}
                  </button>
                </div>
              </div>
            )}

            {/* Pure Flat List View Items */}
            {currentTasks.length > 0 ? (
              <div className="divide-y divide-neutral-200/80 dark:divide-neutral-800/80">
                {currentTasks.map((task) => {
                    const isNewClone = clonedTaskIds && (clonedTaskIds.has(task.id) || clonedTaskIds.has(String(task.id)) || clonedTaskIds.has(Number(task.id)));
                    const isGlobal = !selectedBoard || selectedBoard.id === 'global';
                    const qPos = isGlobal ? task.queue_global_number : task.queue_project_number;
                    const qTot = isGlobal ? task.total_global_queue : task.total_project_queue;
                    const unreadComments = (notifications || []).filter(
                      (n) => !n.is_read && n.related_task_id === task.id && (n.type === 'comment' || n.type === 'mention' || n.type === 'mention_no_email')
                    ).length;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const dlDate = task.deadline ? new Date(task.deadline.replace(/-/g, '/')) : null;
                    if (dlDate) dlDate.setHours(0, 0, 0, 0);
                    const isOverdue = dlDate && dlDate < today && task.status !== 'Done' && task.status !== 'Rejected';

                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        data-testid={`task-item-${task.id}`}
                        onAnimationEnd={() => {
                          if (newlyAddedId === task.id) setNewlyAddedId(null);
                          if (newlyActivatedId === task.id) setNewlyActivatedId(null);
                        }}
                        className={`hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 rounded-xl transition-all duration-150 cursor-pointer group px-3.5 py-3 border-l-2 border-transparent hover:border-[#FACC15] ${
                          newlyCompletedId === task.id ? 'animate-slide-out' : ''
                        } ${newlyActivatedId === task.id ? 'animate-slide-in-right' : ''} ${
                          newlyAddedId === task.id ? 'animate-slide-in-from-top' : ''
                        } ${
                          isNewClone
                            ? 'bg-amber-50/40 dark:bg-amber-950/20'
                            : isOverdue
                            ? 'bg-red-50/25 dark:bg-red-950/15'
                            : ''
                        } ${task.status === 'Done' ? 'opacity-65' : ''}`}
                      >
                        {/* Simple Clean Todo List Item Layout */}
                        <div className="flex items-center justify-between gap-3 min-w-0">
                          {/* Left: Checkbox + Title + Subtitle/Project */}
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            {/* Todo Checkbox */}
                            <div className="shrink-0 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                              {processingTaskId === task.id ? (
                                <div className="w-5 h-5 border-2 border-indigo-200 dark:border-indigo-700 border-t-indigo-500 rounded-full animate-spin"></div>
                              ) : isBulkSelectMode ? (
                                <input
                                  type="checkbox"
                                  checked={selectedTaskIds.includes(task.id)}
                                  onChange={() => handleToggleSelectTask(task.id)}
                                  className="rounded border-neutral-300 w-4.5 h-4.5 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleTaskDone(task, e)}
                                  title={task.status === 'Done' ? tMsg('Mark as incomplete', 'Tandai belum selesai') : tMsg('Mark as completed', 'Tandai selesai')}
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                                    task.status === 'Done'
                                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                                      : 'border-neutral-300 dark:border-neutral-600 hover:border-amber-500 dark:hover:border-[#FACC15] bg-transparent'
                                  }`}
                                >
                                  {task.status === 'Done' && (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3.5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                  )}
                                </button>
                              )}
                            </div>

                            {/* Task Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                {isNewClone && (
                                  <span className="text-[8px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider bg-indigo-500 text-white shrink-0">
                                    NEW
                                  </span>
                                )}
                                <span className={`text-sm font-semibold text-[#111E38] dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-[#FACC15] transition-colors truncate ${
                                  task.status === 'Done' ? 'line-through text-neutral-400 dark:text-neutral-500' : ''
                                }`}>
                                  <HighlightText text={task.project_name} query={searchQuery} />
                                </span>

                                {unreadComments > 0 && (
                                  <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded-md font-bold flex items-center gap-1 shrink-0">
                                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    {unreadComments}
                                  </span>
                                )}
                              </div>

                              {/* Subtitle meta details */}
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                                <span className="font-medium truncate max-w-40">{task.board_name}</span>
                                {task.category && (
                                  <>
                                    <span className="text-neutral-300 dark:text-neutral-700">•</span>
                                    <span className="truncate max-w-32">{task.category}</span>
                                  </>
                                )}
                                {qPos && qTot && (
                                  <>
                                    <span className="text-neutral-300 dark:text-neutral-700">•</span>
                                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
                                      Q {qPos}/{qTot}
                                    </span>
                                  </>
                                )}
                                {task.recurring && task.recurring !== 'none' && (
                                  <>
                                    <span className="text-neutral-300 dark:text-neutral-700">•</span>
                                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                      {task.recurring}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Badges, Assignee, Due Date */}
                          <div className="flex items-center gap-3 shrink-0">
                            {/* Status Pill */}
                            <span className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                              task.status === 'Done'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                                : task.status === 'Rejected'
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                : task.status === 'In Progress'
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50'
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                task.status === 'Done' ? 'bg-emerald-500' : task.status === 'In Progress' ? 'bg-blue-500' : task.status === 'Rejected' ? 'bg-slate-400' : 'bg-amber-500'
                              }`}></span>
                              <span>{task.status === 'Pending' ? 'To do' : task.status}</span>
                            </span>

                            {/* Priority Indicator */}
                            {task.impact && (
                              <span className={`hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                task.impact === 'High'
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                                  : task.impact === 'Low'
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                              }`}>
                                {task.impact}
                              </span>
                            )}

                            {/* Assignee Avatar */}
                            {task.requester && (
                              <div className="flex items-center gap-1.5" title={task.requester}>
                                <Avatar name={task.requester} url={avatarsMap[task.requester.replace('@', '').trim()]} size="w-6 h-6 shrink-0" textClass="text-[9px]" />
                                <span className="hidden xl:inline text-xs font-medium text-neutral-600 dark:text-neutral-300 truncate max-w-20">
                                  {task.requester.startsWith('@') ? task.requester : `@${task.requester}`}
                                </span>
                              </div>
                            )}

                            {/* Deadline / Due Date */}
                            {task.deadline && (
                              <div className="flex items-center gap-1 text-right">
                                <svg className={`w-3.5 h-3.5 shrink-0 ${isOverdue ? 'text-rose-500' : 'text-neutral-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                                <span className={`text-xs font-semibold ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-600 dark:text-neutral-400'}`}>
                                  {formatDateMMM(task.deadline)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-neutral-400 dark:text-neutral-500 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-2.5">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p className="font-bold text-sm text-[#111E38] dark:text-neutral-200">{tMsg('No tasks found.', 'Belum ada tugas.')}</p>
                  <p className="text-xs mt-1 text-neutral-500">{tMsg('Enjoy the clarity of an empty list, or add a new task!', 'Nikmati daftar yang rapi, atau buat tugas baru!')}</p>
                </div>
              )}

            {/* Mobile Completed Tasks Toggle (Visible only on < xl screens) */}
            <div className="xl:hidden w-full border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 mt-6 shadow-sm overflow-hidden mb-2">
              <button
                onClick={() => setShowCompletedMobile(!showCompletedMobile)}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Completed Tasks <span className="bg-neutral-200 dark:bg-neutral-700 px-2 py-0.5 rounded-full text-[10px]">{doneTasks.length}</span>
                </span>
                <span className="text-lg leading-none">{showCompletedMobile ? '▾' : '▸'}</span>
              </button>
              
               {showCompletedMobile && (
                <div className="flex flex-col max-h-[50vh] bg-neutral-50/50 dark:bg-neutral-950/50 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {visibleDoneTasks.length > 0 ? (
                      visibleDoneTasks.map((task) => (
                        <div
                          key={task.id}
                          onAnimationEnd={() => handleAnimationEnd(task.id)}
                          className={`bg-white dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-start gap-3 opacity-70 hover:opacity-100 transition-all duration-300 cursor-pointer group ${
                            newlyCompletedId === task.id ? 'animate-slide-in' : ''
                          } ${newlyReactivatedId === task.id ? 'animate-slide-out-left' : ''}`}
                          onClick={() => setSelectedTask(task)}
                        >
                          {processingTaskId === task.id ? (
                             <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5" onClick={(e) => e.stopPropagation()}>
                               <div className="w-4 h-4 border-2 border-indigo-200 dark:border-indigo-700 border-t-indigo-500 rounded-full animate-spin"></div>
                             </div>
                          ) : (
                            <input
                              type="checkbox"
                              checked={true}
                              onChange={(e) => handleToggleTaskDone(task, e)}
                              onClick={(e) => e.stopPropagation()}
                              title="Mark as not done"
                              className="mt-0.5 rounded-full border-neutral-400 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4 bg-indigo-600 shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold line-through text-neutral-600 dark:text-neutral-400 truncate group-hover:text-indigo-600 transition-colors">
                              {task.project_name}
                            </p>
                            <p className="text-[9px] font-medium text-neutral-400 mt-0.5">
                              {formatDateMMM(task.completed_time)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs font-bold text-neutral-400">
                        No completed tasks yet.
                      </div>
                    )}
                  </div>
                  {doneTasks.length > archiveLimit && (
                    <div className="p-3 shrink-0 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                      <button
                        onClick={() => setIsArchiveExpanded(!isArchiveExpanded)}
                        className="w-full py-2 bg-neutral-200/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors shadow-sm"
                      >
                        {isArchiveExpanded ? '⬆ Hide Archived Tasks' : `📂 View ${archivedCount} Archived Tasks`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Footer / Pagination */}
          {sortedTasks.length > 0 && (
            <div className="flex flex-col justify-between items-center px-1 py-4 gap-4 shrink-0 mt-auto">
              <div className="w-full flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-[10px] font-bold text-slate-500 uppercase tracking-widest">Show:</span>
                <select
                  value={tasksPerPage}
                  onChange={(e) => {
                    setTasksPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold py-1.5 px-2 rounded-lg cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value={15}>15 Tasks</option>
                  <option value={30}>30 Tasks</option>
                  <option value={60}>60 Tasks</option>
                  <option value={120}>120 Tasks</option>
                </select>
                </div>
                <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Active: <span className="text-slate-800 dark:text-slate-200">{activeTasks.length}</span>
                </span>
                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
                <button
                  onClick={handleToggleBulkSelect}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors uppercase tracking-widest ${
                    isBulkSelectMode
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700 hover:bg-red-200'
                      : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  {isBulkSelectMode ? 'Cancel Bulk' : 'Bulk Select'}
                </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  Prev
                </button>

                <div className="hidden sm:flex items-center gap-1.5 mx-2">
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' && setCurrentPage(page)}
                      disabled={page === '...'}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                        page === currentPage
                          ? 'bg-indigo-600 text-white shadow-md'
                          : page === '...'
                          ? 'text-slate-400 bg-transparent cursor-default'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <span className="sm:hidden px-3 text-xs font-black text-slate-800 dark:text-white tracking-widest">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Completed Tasks Sidebar (Desktop only) */}
        <div className="hidden xl:flex flex-col w-80 shrink-0 border-l border-neutral-200/80 dark:border-neutral-800/80 pl-6">
          <div className="flex flex-col flex-1 min-h-0">
            <h3 className="py-2.5 text-sm font-extrabold text-[#111E38] dark:text-white shrink-0 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/80 mb-2">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {tMsg('Completed Tasks', 'Tugas Selesai')}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                {doneTasks.length}
              </span>
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar py-1">
              {visibleDoneTasks.length > 0 ? (
                visibleDoneTasks.map((task) => (
                  <div
                    key={task.id}
                    data-testid={`task-item-${task.id}`}
                    onAnimationEnd={() => handleAnimationEnd(task.id)}
                    className={`p-2.5 rounded-xl border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 flex items-start gap-2.5 opacity-70 hover:opacity-100 transition-all duration-200 cursor-pointer group ${
                      newlyCompletedId === task.id ? 'animate-slide-in' : ''
                    } ${newlyReactivatedId === task.id ? 'animate-slide-out-left' : ''}`}
                  >
                    {processingTaskId === task.id ? (
                      <div
                        className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="w-3.5 h-3.5 border-2 border-indigo-200 dark:border-indigo-700 border-t-indigo-500 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleToggleTaskDone(task, e)}
                        title={tMsg('Mark as incomplete', 'Tandai belum selesai')}
                        className="mt-0.5 w-4.5 h-4.5 rounded-full bg-emerald-500 border-2 border-emerald-500 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                      >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </button>
                    )}
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedTask(task)}>
                      <p
                        className="text-xs font-semibold line-through text-neutral-500 dark:text-neutral-400 truncate group-hover:text-[#111E38] dark:group-hover:text-neutral-200 transition-colors"
                        title={task.project_name}
                      >
                        {task.project_name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-medium text-neutral-400 truncate max-w-28">
                          {task.board_name}
                        </span>
                        <span className="text-neutral-300 dark:text-neutral-700">•</span>
                        <p className="text-[9px] font-medium text-neutral-400">{formatDateMMM(task.completed_time)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-neutral-400 dark:text-neutral-600">
                  <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-center">
                    {tMsg('No completed tasks yet.', 'Belum ada tugas yang selesai.')}
                    <br />
                    <span className="text-neutral-400 font-normal text-[11px]">{tMsg('Keep going!', 'Tetap semangat!')}</span>
                  </p>
                </div>
              )}
            </div>
            {doneTasks.length > archiveLimit && (
              <div className="pt-3 shrink-0 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={() => setIsArchiveExpanded(!isArchiveExpanded)}
                  className="w-full py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <svg className={`w-3.5 h-3.5 transition-transform ${isArchiveExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                  {isArchiveExpanded
                    ? tMsg('Hide Archived Tasks', 'Sembunyikan Arsip')
                    : tMsg(`View ${archivedCount} Archived Tasks`, `Lihat ${archivedCount} Arsip`)}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* In-App Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 transition-opacity"
          onClick={() => setShowBulkDeleteConfirm(false)}
        >
          <div
            className="bg-white dark:bg-[#121B2D] p-6 sm:p-7 w-full max-w-sm border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs border border-rose-200 dark:border-rose-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-base font-extrabold text-[#111E38] dark:text-white mb-2">
              {tMsg('Delete Selected Tasks?', 'Hapus Tugas Terpilih?')}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-5 text-xs font-medium leading-relaxed">
              {tMsg(
                `Are you sure you want to permanently delete ${selectedTaskIds.length} selected tasks? This action cannot be undone.`,
                `Apakah kamu yakin ingin menghapus ${selectedTaskIds.length} tugas terpilih secara permanen? Tindakan ini tidak dapat dibatalkan.`
              )}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-xs cursor-pointer"
              >
                {tMsg('Cancel', 'Batal')}
              </button>
              <button
                type="button"
                onClick={executeBulkDelete}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors text-xs shadow-xs cursor-pointer"
              >
                {tMsg('Delete', 'Hapus')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}