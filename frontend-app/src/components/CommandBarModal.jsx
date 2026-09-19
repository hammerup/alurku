import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';

/**
 * CommandBarModal
 * Modern Command Bar & Quick-Add task modal with Natural Language Parsing (NLP).
 * Adheres strictly to the alurku. Brand Book:
 * - Colors: Deep Navy (#111E38), Flat Yellow (#FACC15), Calm Gray (#F3F4F6)
 * - 100% Inline SVG icons (zero raw emojis)
 * - Full Bilingual Support (ID / EN)
 * - Accessible Keyboard Navigation (Cmd/Ctrl+K, Esc, ArrowUp, ArrowDown, Enter)
 */
export default function CommandBarModal({
  isOpen,
  onClose,
  language = 'id',
  isDarkMode = false,
  currentUser = '',
  boards = [],
  selectedBoard = null,
  onSelectBoard,
  teamMembers = [],
  onTaskCreated,
  onOpenUpgradeModal,
  onOpenCreateProject,
  onToggleTheme,
  onToggleLanguage,
  onNavigateTab,
  onTriggerAI,
  showNotification,
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const tMsg = (en, id) => (language === 'id' ? id : en);

  // Focus input whenever opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  }, [isOpen]);

  // Helper to format Date to YYYY-MM-DD
  const formatYMD = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Natural Language Task Parser
  // ─────────────────────────────────────────────────────────────────────────────
  const parsedTask = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.startsWith('>') || trimmed.startsWith('ai:') || trimmed.startsWith('tanya:')) {
      return null;
    }

    let raw = trimmed;
    let priority = 'Medium';
    let deadline = formatYMD(new Date());
    let assignee = currentUser;
    let targetBoardId = selectedBoard && selectedBoard.id !== 'global' ? selectedBoard.id : boards[0]?.id || null;

    // 1. Priority Parser: p:urgent, p:high, !urgent, !tinggi, etc.
    const priorityMatch = raw.match(/(?:p:|!)(urgent|mendesak|high|tinggi|medium|sedang|low|rendah)\b/i);
    if (priorityMatch) {
      const pStr = priorityMatch[1].toLowerCase();
      if (['urgent', 'mendesak'].includes(pStr)) priority = 'High';
      else if (['high', 'tinggi'].includes(pStr)) priority = 'High';
      else if (['low', 'rendah'].includes(pStr)) priority = 'Low';
      else priority = 'Medium';
      raw = raw.replace(priorityMatch[0], '');
    }

    // 2. Due Date Parser: due:today, due:tomorrow, tgl:besok, etc.
    const dueMatch = raw.match(/(?:due:|tgl:)(today|hari-ini|tomorrow|besok|lusa|\d{4}-\d{2}-\d{2})\b/i);
    if (dueMatch) {
      const dStr = dueMatch[1].toLowerCase();
      const today = new Date();
      if (['today', 'hari-ini'].includes(dStr)) {
        deadline = formatYMD(today);
      } else if (['tomorrow', 'besok'].includes(dStr)) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        deadline = formatYMD(tomorrow);
      } else if (dStr === 'lusa') {
        const lusa = new Date(today);
        lusa.setDate(lusa.getDate() + 2);
        deadline = formatYMD(lusa);
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) {
        deadline = dStr;
      }
      raw = raw.replace(dueMatch[0], '');
    }

    // 3. Assignee Parser: @username
    const assigneeMatch = raw.match(/@([\w.-]+)\b/);
    if (assigneeMatch) {
      const uCandidate = assigneeMatch[1];
      const found = teamMembers.find(
        (m) => m.username?.toLowerCase() === uCandidate.toLowerCase() || m.full_name?.toLowerCase().includes(uCandidate.toLowerCase())
      );
      if (found) {
        assignee = found.username;
      } else {
        assignee = uCandidate;
      }
      raw = raw.replace(assigneeMatch[0], '');
    }

    // 4. Board Parser: #projectname
    const boardMatch = raw.match(/#([\w-]+)\b/);
    if (boardMatch) {
      const bName = boardMatch[1].toLowerCase();
      const foundBoard = boards.find(
        (b) => b.id !== 'global' && b.name.toLowerCase().replace(/\s+/g, '-').includes(bName)
      );
      if (foundBoard) {
        targetBoardId = foundBoard.id;
      }
      raw = raw.replace(boardMatch[0], '');
    }

    const cleanTitle = raw.replace(/\s+/g, ' ').trim();
    if (!cleanTitle) return null;

    const matchedBoardObj = boards.find((b) => b.id === targetBoardId);

    return {
      title: cleanTitle,
      priority,
      deadline,
      assignee,
      boardId: targetBoardId,
      boardName: matchedBoardObj?.name || tMsg('Active Project', 'Proyek Aktif'),
    };
  }, [query, currentUser, selectedBoard, boards, teamMembers, language]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Action Items & Quick Navigation
  // ─────────────────────────────────────────────────────────────────────────────
  const allActions = useMemo(() => {
    const list = [
      // Quick AI prompt
      {
        id: 'action-ai',
        category: tMsg('AI Assistant', 'Asisten AI'),
        title: tMsg('Ask Luruka AI...', 'Tanya Asisten AI Luruka...'),
        subtitle: tMsg('Auto planning, task breakdown, duration forecast', 'Perencana otomatis, breakdown tugas, estimasi durasi'),
        icon: (
          <svg className="w-4 h-4 text-[#FACC15]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        handler: () => {
          if (onTriggerAI) onTriggerAI(query.replace(/^(?:ai:|tanya:)\s*/i, ''));
          onClose();
        },
      },
      // Navigation views
      {
        id: 'nav-kanban',
        category: tMsg('Workspace Views', 'Tampilan Ruang Kerja'),
        title: tMsg('Kanban Board', 'Papan Kerja Kanban'),
        subtitle: tMsg('Switch to visual status columns', 'Pindah ke tampilan kolom status'),
        icon: (
          <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        ),
        handler: () => {
          if (onNavigateTab) onNavigateTab('kanban');
          onClose();
        },
      },
      {
        id: 'nav-timeline',
        category: tMsg('Workspace Views', 'Tampilan Ruang Kerja'),
        title: tMsg('Gantt Timeline', 'Lini Masa Gantt Chart'),
        subtitle: tMsg('Interactive schedules and dependencies', 'Jadwal interaktif dan dependensi tugas'),
        icon: (
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
        handler: () => {
          if (onNavigateTab) onNavigateTab('timeline');
          onClose();
        },
      },
      {
        id: 'nav-workload',
        category: tMsg('Workspace Views', 'Tampilan Ruang Kerja'),
        title: tMsg('Workload Analytics', 'Analisis Beban Kerja & Burnout'),
        subtitle: tMsg('Capacity distribution and team health', 'Distribusi kapasitas & kesehatan tim'),
        icon: (
          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
        handler: () => {
          if (onNavigateTab) onNavigateTab('analytics');
          onClose();
        },
      },
      {
        id: 'nav-calendar',
        category: tMsg('Workspace Views', 'Tampilan Ruang Kerja'),
        title: tMsg('Project Calendar', 'Kalender Proyek'),
        subtitle: tMsg('Monthly and weekly scheduled deadlines', 'Kalender deadline mingguan dan bulanan'),
        icon: (
          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
        handler: () => {
          if (onNavigateTab) onNavigateTab('calendar');
          onClose();
        },
      },
      {
        id: 'nav-chat',
        category: tMsg('Workspace Views', 'Tampilan Ruang Kerja'),
        title: tMsg('Workspace Chat', 'Chat Workspace Terpadu'),
        subtitle: tMsg('Live team discussions and channel threads', 'Diskusi tim langsung dan thread ruang kerja'),
        icon: (
          <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        ),
        handler: () => {
          if (onNavigateTab) onNavigateTab('chat');
          onClose();
        },
      },
      // Quick project jumping
      ...(boards || [])
        .filter((b) => b.id !== 'global')
        .map((b) => ({
          id: `project-${b.id}`,
          category: tMsg('Projects', 'Daftar Proyek'),
          title: b.name,
          subtitle: tMsg('Switch active project board', 'Buka papan proyek ini'),
          icon: (
            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          ),
          handler: () => {
            if (onSelectBoard) onSelectBoard(b);
            onClose();
          },
        })),
      // System & Preferences
      {
        id: 'action-new-project',
        category: tMsg('Actions', 'Aksi Cepat'),
        title: tMsg('Create New Project', 'Buat Proyek Baru'),
        subtitle: tMsg('Create a new team project board', 'Tambah papan proyek kerja baru'),
        icon: (
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        ),
        handler: () => {
          if (onOpenCreateProject) onOpenCreateProject();
          onClose();
        },
      },
      {
        id: 'action-upgrade',
        category: tMsg('Actions', 'Aksi Cepat'),
        title: tMsg('Upgrade Plan (Pro / Business)', 'Tingkatkan Paket (Pro / Business)'),
        subtitle: tMsg('Unlock Gantt, Workload, 25 seats & unlimited projects', 'Buka Gantt, Workload, 25 seat & proyek tanpa batas'),
        icon: (
          <svg className="w-4 h-4 text-[#FACC15]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        ),
        handler: () => {
          if (onOpenUpgradeModal) onOpenUpgradeModal();
          onClose();
        },
      },
      {
        id: 'action-toggle-theme',
        category: tMsg('Preferences', 'Preferensi'),
        title: isDarkMode ? tMsg('Switch to Light Mode', 'Ganti ke Tema Terang (Light Mode)') : tMsg('Switch to Dark Mode', 'Ganti ke Tema Gelap (Dark Mode)'),
        subtitle: tMsg('Toggle application visual appearance', 'Ubah tampilan visual aplikasi'),
        icon: isDarkMode ? (
          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ),
        handler: () => {
          if (onToggleTheme) onToggleTheme();
          onClose();
        },
      },
      {
        id: 'action-toggle-lang',
        category: tMsg('Preferences', 'Preferensi'),
        title: language === 'id' ? 'Switch to English Language' : 'Ganti ke Bahasa Indonesia',
        subtitle: tMsg('Toggle bilingual interface', 'Ubah bahasa antarmuka aplikasi'),
        icon: (
          <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
        ),
        handler: () => {
          if (onToggleLanguage) onToggleLanguage();
          onClose();
        },
      },
    ];

    if (!query.trim()) return list;

    const qLower = query.toLowerCase().replace(/^[>@#]\s*/, '').trim();
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(qLower) ||
        item.subtitle.toLowerCase().includes(qLower) ||
        item.category.toLowerCase().includes(qLower)
    );
  }, [query, boards, language, isDarkMode, onNavigateTab, onSelectBoard, onOpenCreateProject, onOpenUpgradeModal, onToggleTheme, onToggleLanguage, onTriggerAI, onClose]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Quick Task Creation Dispatcher
  // ─────────────────────────────────────────────────────────────────────────────
  const handleCreateParsedTask = async () => {
    if (!parsedTask || !parsedTask.title.trim()) return;
    if (!parsedTask.boardId) {
      if (showNotification) {
        showNotification(
          tMsg('Please create or select a project board first.', 'Pilih atau buat papan proyek terlebih dahulu.'),
          'error'
        );
      }
      return;
    }

    setIsSubmitting(true);
    const payload = {
      project_name: parsedTask.title,
      requester: parsedTask.assignee || currentUser,
      category: 'Development',
      description: '',
      supporting_access: '',
      start_date: formatYMD(new Date()),
      deadline: `${parsedTask.deadline} 17:00:00`,
      impact: parsedTask.priority,
      etc: 2,
      recurring: 'none',
      subtasks: [],
    };

    try {
      await axios.post(`/api/boards/${parsedTask.boardId}/tasks`, payload);
      if (showNotification) {
        showNotification(
          tMsg(
            `Task "${parsedTask.title}" created in ${parsedTask.boardName}!`,
            `Tugas "${parsedTask.title}" berhasil dibuat di ${parsedTask.boardName}!`
          ),
          'success'
        );
      }
      if (onTaskCreated) onTaskCreated();
      onClose();
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || tMsg('Failed to create task.', 'Gagal membuat tugas.');
      if (showNotification) showNotification(detail, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Keyboard Navigation Handler
  // ─────────────────────────────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    const isK = e.key === 'k' || e.key === 'K' || e.code === 'KeyK' || e.keyCode === 75;
    if ((e.metaKey || e.ctrlKey) && isK) {
      e.preventDefault();
      e.stopPropagation();
      onClose();
      return;
    }

    // Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      if (parsedTask) {
        handleCreateParsedTask();
      } else if (allActions.length > 0 && allActions[selectedIndex]) {
        allActions[selectedIndex].handler();
      }
      return;
    }

    // Arrow keys
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allActions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allActions.length) % Math.max(1, allActions.length));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#121B2D] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[85vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-[#FAFAFA] dark:bg-[#0d0f11]">
          <div className="text-[#111E38] dark:text-[#FACC15] shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={tMsg(
              'Type task (e.g. Design UI p:urgent due:tomorrow @budi #project) or search action...',
              'Ketik tugas (mis: Desain UI p:urgent due:tomorrow @budi #proyek) atau cari aksi...'
            )}
            className="flex-1 bg-transparent text-sm sm:text-base font-semibold text-[#111E38] dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-hidden"
          />

          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-bold text-neutral-500 dark:text-neutral-400 bg-neutral-200/70 dark:bg-neutral-800 rounded-md border border-neutral-300 dark:border-neutral-700">
              ESC
            </kbd>
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white p-1 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Dynamic Interactive Task Preview Chip (If NLP matched) */}
        {parsedTask && (
          <div className="p-3 bg-[#FACC15]/10 dark:bg-[#FACC15]/5 border-b border-[#FACC15]/30 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-extrabold text-[#111E38] dark:text-white flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                {tMsg('Quick-Add Task:', 'Buat Tugas Cepat:')}
              </span>
              <span className="bg-white dark:bg-[#111E38] font-bold text-[#111E38] dark:text-white px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700">
                "{parsedTask.title}"
              </span>
              <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold px-2 py-0.5 rounded-md">
                ⚡ {parsedTask.priority}
              </span>
              <span className="bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 font-bold px-2 py-0.5 rounded-md">
                📅 {parsedTask.deadline}
              </span>
              <span className="bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 font-bold px-2 py-0.5 rounded-md">
                👤 @{parsedTask.assignee}
              </span>
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-md">
                📁 {parsedTask.boardName}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCreateParsedTask}
              disabled={isSubmitting}
              className="bg-[#FACC15] hover:bg-yellow-400 text-[#111E38] font-black text-xs px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>{tMsg('Creating...', 'Membuat...')}</span>
              ) : (
                <>
                  <span>{tMsg('Press Enter', 'Tekan Enter')}</span>
                  <kbd className="bg-[#111E38]/10 text-[#111E38] px-1.5 py-0.2 rounded text-[10px]">↵</kbd>
                </>
              )}
            </button>
          </div>
        )}

        {/* Command & Action List */}
        <div ref={listRef} className="overflow-y-auto p-2 space-y-1 flex-1 custom-scrollbar">
          {allActions.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-xs">
              {tMsg('No matching actions found.', 'Tidak ada aksi atau proyek yang cocok.')}
            </div>
          ) : (
            allActions.map((action, idx) => {
              const isSelected = idx === selectedIndex && !parsedTask;
              return (
                <div
                  key={action.id}
                  onClick={() => action.handler()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs font-semibold'
                      : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#162238]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected
                          ? 'bg-white/10 dark:bg-black/10'
                          : 'bg-neutral-100 dark:bg-neutral-800'
                      }`}
                    >
                      {action.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold truncate">
                        {action.title}
                      </div>
                      <div
                        className={`text-[11px] truncate ${
                          isSelected
                            ? 'text-neutral-300 dark:text-neutral-800'
                            : 'text-neutral-400 dark:text-neutral-500'
                        }`}
                      >
                        {action.subtitle}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider ${
                      isSelected
                        ? 'bg-white/20 text-white dark:bg-black/20 dark:text-[#111E38]'
                        : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                    }`}
                  >
                    {action.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Tips */}
        <div className="px-4 py-2 bg-[#F3F4F6] dark:bg-[#0d0f11] border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="bg-white dark:bg-[#121B2D] border border-neutral-300 dark:border-neutral-700 px-1.5 py-0.5 rounded text-[10px] font-bold">↑</kbd>
              <kbd className="bg-white dark:bg-[#121B2D] border border-neutral-300 dark:border-neutral-700 px-1.5 py-0.5 rounded text-[10px] font-bold">↓</kbd>
              <span>{tMsg('Navigate', 'Navigasi')}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white dark:bg-[#121B2D] border border-neutral-300 dark:border-neutral-700 px-1.5 py-0.5 rounded text-[10px] font-bold">↵</kbd>
              <span>{tMsg('Select / Run', 'Pilih / Jalankan')}</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <span className="font-semibold text-neutral-400">alurku.</span>
            <span className="text-[#FACC15] font-black">Quick Bar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
