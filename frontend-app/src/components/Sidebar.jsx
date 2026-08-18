import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Avatar, IconPlus } from '../SharedUI';
import { HighlightText } from '../Utils';

export default function Sidebar() {
  const {
    navigateTo,
    currentPath,
    setCurrentPath,
    currentUser,
    boards,
    selectedBoard,
    setSelectedBoard,
    favoriteBoards,
    setFavoriteBoards,
    notifications,
    dmConversations,
    inboxChats,
    setIsFormOpen,
    setIsCreateBoardOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    language,
    setIsSettingsOpen,
    setIsNotifOpen,
    isNotifOpen,
    unreadCount,
    setIsChatWorkspaceOpen,
    setIsProactiveAIOpen,
    viewMode,
    setViewMode,
    globalSearchQuery,
    setGlobalSearchQuery,
    setIsGlobalSearchOpen,
    globalSearchResults,
    isGlobalSearchOpen,
    isGlobalSearchClosing,
    closeGlobalSearch,
    handleGlobalSearchSelect,
    avatarsMap,
    accountStatus,
    setIsLogoutConfirmOpen,
    setIsDocsOpen,
    setIsExportModalOpen,
    setExportMode,
    handleReadNotification,
    handleReadAllNotifications,
    handleNotificationTaskClick,
    setIsInvitesModalOpen,
    showNotification,
    formatDateMMM,
    setIsLeaveModalOpen,
    setIsMyTicketsOpen,
    setIsFeedbackOpen,
    setIsArchivedOpen,
    setIsSupportOpen,
    setIsProjectChatOpen,
    setDrawerTab,
    startTour,
    isInstallable,
    handleInstallClick,
    isSuperAdmin,
    openAdminModal,
    setBoardToDelete,
    archiveBoard,
    workspaces,
    activeWorkspace,
    createWorkspace,
    switchWorkspace,
    tasks,
    showMyTasks,
    setShowMyTasks,
    showOverdueOnly,
    setShowOverdueOnly,
    showDueTodayOnly,
    setShowDueTodayOnly,
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    filterAssignee,
    setFilterAssignee,
    groupBy,
    setGroupBy,
  } = useAppContext();

  const tMsg = (en, id) => (language === 'id' ? id : en);

  // Active Rail Tab State ('home' | 'tasks' | 'spaces' | 'ai' | 'dashboard' | 'support')
  const [activeRailTab, setActiveRailTab] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('alurku_active_rail_tab') || 'spaces';
    return 'spaces';
  });

  const activePath = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '');

  const handleRailTabChange = (tab) => {
    setActiveRailTab(tab);
    localStorage.setItem('alurku_active_rail_tab', tab);
    if (isCollapsed) {
      setIsCollapsed(false);
      localStorage.setItem('alurku_sidebar_collapsed', 'false');
    }
  };

  // Sidebar collapse & tree expansion states
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('alurku_sidebar_collapsed') === 'true';
    return false;
  });
  const [isMyTasksTreeOpen, setIsMyTasksTreeOpen] = useState(true);
  const [isSpacesTreeOpen, setIsSpacesTreeOpen] = useState(true);
  const [isSavedViewsOpen, setIsSavedViewsOpen] = useState(true);

  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [activeBoardMenuId, setActiveBoardMenuId] = useState(null);
  const [newWsName, setNewWsName] = useState('');
  const [isCreatingWs, setIsCreatingWs] = useState(false);

  // Drag & Drop reorder state
  const [draggedBoardId, setDraggedBoardId] = useState(null);
  const [customBoardOrder, setCustomBoardOrder] = useState(() => {
    if (typeof window !== 'undefined' && currentUser) {
      try {
        const saved = localStorage.getItem(`alurku_custom_board_order_${currentUser}`);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Saved Views State
  const [activeSavedViewId, setActiveSavedViewId] = useState(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveViewName, setSaveViewName] = useState('');
  const [saveViewIcon, setSaveViewIcon] = useState('bookmark');
  const [pendingSnapshot, setPendingSnapshot] = useState(null);

  const [savedViews, setSavedViews] = useState(() => {
    if (typeof window !== 'undefined' && currentUser) {
      try {
        const saved = localStorage.getItem(`alurku_saved_views_${currentUser}`);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [
      { id: 'sv-assigned', nameEn: 'Assigned to Me', nameId: 'Ditugaskan ke Saya', icon: 'person_check', type: 'assigned', targetUrl: '/my-tasks' },
      { id: 'sv-overdue', nameEn: 'Overdue Tasks', nameId: 'Tugas Terlambat', icon: 'schedule', type: 'overdue', targetUrl: '/my-tasks?filter=overdue' },
    ];
  });

  const handleOpenSaveModal = () => {
    const currentPathname = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
    
    // Auto-suggest a descriptive default name based on what's active
    let defaultName = '';
    let defaultIcon = 'bookmark';

    if (selectedBoard && selectedBoard.id !== 'global') {
      defaultName = `${selectedBoard.name} (${viewMode || 'kanban'})`;
      defaultIcon = viewMode === 'timeline' ? 'timeline' : viewMode === 'list' ? 'view_list' : viewMode === 'calendar' ? 'calendar_month' : 'view_kanban';
    } else if (currentPathname.includes('/my-tasks')) {
      const urlParams = new URLSearchParams(window.location.search);
      const filter = urlParams.get('filter') || 'all';
      defaultName = `My Tasks - ${filter.charAt(0).toUpperCase() + filter.slice(1)}`;
      defaultIcon = 'task_alt';
    } else if (currentPathname.includes('/assigned-comments')) {
      defaultName = 'Comments & Mentions';
      defaultIcon = 'comment';
    } else if (currentPathname.includes('/meetings-leaves')) {
      defaultName = 'Team Leaves & Schedule';
      defaultIcon = 'event_available';
    } else if (currentPathname.includes('/inbox')) {
      defaultName = 'Inbox Feed';
      defaultIcon = 'inbox';
    } else if (currentPathname.includes('/dashboard')) {
      defaultName = 'Personal Dashboard';
      defaultIcon = 'home';
    } else {
      defaultName = selectedBoard?.name || 'Custom View';
      defaultIcon = 'bookmark';
    }

    setSaveViewName(defaultName);
    setSaveViewIcon(defaultIcon);
    setPendingSnapshot({
      targetUrl: currentPathname || (selectedBoard ? `/workspace/${activeWorkspace?.id || 'main'}/project/${selectedBoard.id}` : '/my-tasks'),
      boardId: selectedBoard?.id || null,
      board: selectedBoard || null,
      viewMode: viewMode || 'kanban',
      groupBy: groupBy || 'Status',
      filterStatus: filterStatus || 'All',
      filterCategory: filterCategory || 'All',
      filterAssignee: filterAssignee || 'All',
      showMyTasks: showMyTasks || false,
      showOverdueOnly: showOverdueOnly || false,
    });
    setIsSaveModalOpen(true);
  };

  const handleSaveModalSubmit = (e) => {
    e.preventDefault();
    if (!saveViewName.trim() || !pendingSnapshot) return;

    const newView = {
      id: `sv-${Date.now()}`,
      nameEn: saveViewName.trim(),
      nameId: saveViewName.trim(),
      icon: saveViewIcon || 'bookmark',
      type: 'custom',
      ...pendingSnapshot,
    };
    const updated = [...savedViews, newView];
    setSavedViews(updated);
    if (currentUser) {
      localStorage.setItem(`alurku_saved_views_${currentUser}`, JSON.stringify(updated));
    }
    if (showNotification) {
      showNotification(tMsg('Shortcut view saved to sidebar!', 'Shortcut tampilan berhasil disimpan ke sidebar!'));
    }
    setIsSaveModalOpen(false);
    setPendingSnapshot(null);
  };

  const handleDeleteSavedView = (e, viewId) => {
    e.stopPropagation();
    const updated = savedViews.filter((v) => v.id !== viewId);
    setSavedViews(updated);
    if (currentUser) {
      localStorage.setItem(`alurku_saved_views_${currentUser}`, JSON.stringify(updated));
    }
    if (activeSavedViewId === viewId) {
      setActiveSavedViewId(null);
    }
    if (showNotification) {
      showNotification(tMsg('Saved view removed', 'Filter tersimpan berhasil dihapus'));
    }
  };

  const handleCreateWsSubmit = (e) => {
    e.preventDefault();
    if (newWsName.trim()) {
      createWorkspace(newWsName);
      setNewWsName('');
      setIsCreatingWs(false);
      setIsWorkspaceMenuOpen(false);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('alurku_sidebar_collapsed', String(next));
      return next;
    });
  };

  const todoListBoard = useMemo(() => {
    return (
      boards.find((b) => {
        const name = (b.name || '').toLowerCase();
        return (name === 'personal tasks' || name === 'to-do list' || name === 'tugas pribadi') && b.is_private === 1;
      }) ||
      boards.find((b) => {
        const name = (b.name || '').toLowerCase();
        return name === 'personal tasks' || name === 'to-do list' || name === 'tugas pribadi';
      })
    );
  }, [boards]);

  // Keyboard Shortcuts Navigation
  useEffect(() => {
    let pendingG = false;
    let timer = null;

    const handleKeyDown = (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapse();
        return;
      }

      if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey) {
        pendingG = true;
        clearTimeout(timer);
        timer = setTimeout(() => {
          pendingG = false;
        }, 1200);
        return;
      }

      if (pendingG) {
        const key = e.key.toLowerCase();
        if (key === 'h') {
          e.preventDefault();
          pendingG = false;
          setActiveRailTab('home');
          setSelectedBoard(null);
          setViewMode('overview');
          window.history.pushState({}, '', '/dashboard');
          window.dispatchEvent(new CustomEvent('alurku-navigate'));
        } else if (key === 'p') {
          e.preventDefault();
          pendingG = false;
          setActiveRailTab('tasks');
          if (todoListBoard) {
            setSelectedBoard(todoListBoard);
            setViewMode('kanban');
          }
        } else if (key === 'a') {
          e.preventDefault();
          pendingG = false;
          setActiveRailTab('spaces');
          setSelectedBoard({ id: 'global', name: tMsg('All Projects', 'Semua Proyek'), role: 'owner', isVirtual: true });
          setViewMode('kanban');
        } else if (key === 'i') {
          e.preventDefault();
          pendingG = false;
          setIsNotifOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [todoListBoard, language]);

  // Task Counts for Badges
  const assignedToMeCount = useMemo(() => {
    return (tasks || []).filter((t) => {
      const isMyTask = (t.assignee && t.assignee.toLowerCase() === currentUser?.toLowerCase()) || t.owner_username === currentUser;
      const isDone = t.status === 'Done' || t.status === 'Completed' || t.status === 'Rejected';
      return isMyTask && !isDone;
    }).length;
  }, [tasks, currentUser]);

  const overdueCount = useMemo(() => {
    const nowStr = new Date().toISOString().split('T')[0];
    return (tasks || []).filter((t) => {
      const isMyTask = (t.assignee && t.assignee.toLowerCase() === currentUser?.toLowerCase()) || t.owner_username === currentUser;
      const isDone = t.status === 'Done' || t.status === 'Completed' || t.status === 'Rejected';
      const deadlineStr = t.deadline ? String(t.deadline).split('T')[0] : '';
      return isMyTask && !isDone && deadlineStr && deadlineStr < nowStr;
    }).length;
  }, [tasks, currentUser]);

  const dueTodayCount = useMemo(() => {
    const nowStr = new Date().toISOString().split('T')[0];
    return (tasks || []).filter((t) => {
      const isMyTask = (t.assignee && t.assignee.toLowerCase() === currentUser?.toLowerCase()) || t.owner_username === currentUser;
      const isDone = t.status === 'Done' || t.status === 'Completed' || t.status === 'Rejected';
      const deadlineStr = t.deadline ? String(t.deadline).split('T')[0] : '';
      return isMyTask && !isDone && deadlineStr === nowStr;
    }).length;
  }, [tasks, currentUser]);

  const dueThisWeekCount = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);

    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    saturday.setHours(23, 59, 59, 999);

    const sunStr = sunday.toISOString().split('T')[0];
    const satStr = saturday.toISOString().split('T')[0];

    return (tasks || []).filter((t) => {
      const isMyTask = (t.assignee && t.assignee.toLowerCase() === currentUser?.toLowerCase()) || t.owner_username === currentUser;
      const isDone = t.status === 'Done' || t.status === 'Completed' || t.status === 'Rejected';
      const deadlineStr = t.deadline ? String(t.deadline).split('T')[0] : '';
      return isMyTask && !isDone && deadlineStr >= sunStr && deadlineStr <= satStr;
    }).length;
  }, [tasks, currentUser]);

  const getBoardTaskCount = (boardId) => {
    return (tasks || []).filter(
      (t) => parseInt(t.board_id) === parseInt(boardId) && t.status !== 'Done' && t.status !== 'Completed' && t.status !== 'Rejected'
    ).length;
  };

  const unreadInboxChatsCount = useMemo(() => {
    return (inboxChats || []).filter((chat) => {
      if (chat.latest_sender === currentUser) return false;
      if (chat.is_dm) return (chat.unread_count || 0) > 0;
      if (chat.is_project_chat) {
        const lastRead = localStorage.getItem(`alurku_last_read_board_${chat.board_id}_${currentUser}`);
        if (!lastRead) return false; // Jangan fallback true tanpa interaksi
        return chat.timestamp > lastRead;
      } else {
        const lastRead = localStorage.getItem(`alurku_last_read_task_${chat.task_id}_${currentUser}`);
        if (!lastRead) return false;
        return chat.timestamp > lastRead;
      }
    }).length;
  }, [inboxChats, currentUser]);

  const totalUnreadChats = useMemo(() => {
    const unreadDms = (dmConversations || []).reduce((sum, convo) => sum + (convo.unread_count || 0), 0);
    return unreadDms + unreadInboxChatsCount;
  }, [unreadInboxChatsCount, dmConversations]);

  const [sortMode, setSortMode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('alurku_board_sort') || 'recent';
    return 'recent';
  });

  const handleSortChange = (mode) => {
    setSortMode(mode);
    localStorage.setItem('alurku_board_sort', mode);
  };

  // Sorted Boards & Filtering
  const sortedBoards = useMemo(() => {
    let sorted = [...boards];
    if (customBoardOrder.length > 0 && sortMode === 'custom') {
      sorted.sort((a, b) => {
        const idxA = customBoardOrder.indexOf(a.id);
        const idxB = customBoardOrder.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return b.id - a.id;
      });
    } else if (sortMode === 'alphabet') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMode === 'active') {
      sorted.sort((a, b) => {
        const aScore = a.health_alert?.includes('Attention') ? 1 : 0;
        const bScore = b.health_alert?.includes('Attention') ? 1 : 0;
        if (bScore !== aScore) return bScore - aScore;
        return b.id - a.id;
      });
    } else {
      sorted.sort((a, b) => b.id - a.id);
    }
    return sorted;
  }, [boards, sortMode, customBoardOrder]);

  const displayBoards = useMemo(() => {
    return sortedBoards.filter((b) => b.id !== todoListBoard?.id);
  }, [sortedBoards, todoListBoard]);

  const favorites = useMemo(() => {
    return displayBoards.filter((b) => favoriteBoards.includes(b.id));
  }, [displayBoards, favoriteBoards]);

  // Filter out pinned projects from main Project List so they don't duplicate!
  const unpinnedDisplayBoards = useMemo(() => {
    return displayBoards.filter((b) => !favoriteBoards.includes(b.id));
  }, [displayBoards, favoriteBoards]);

  const handleDropBoard = (targetBoardId) => {
    if (!draggedBoardId || draggedBoardId === targetBoardId) return;
    const currentList = displayBoards.map((b) => b.id);
    const fromIndex = currentList.indexOf(draggedBoardId);
    const toIndex = currentList.indexOf(targetBoardId);
    if (fromIndex === -1 || toIndex === -1) return;

    const newList = [...currentList];
    const [moved] = newList.splice(fromIndex, 1);
    newList.splice(toIndex, 0, moved);

    setCustomBoardOrder(newList);
    setSortMode('custom');
    localStorage.setItem('alurku_board_sort', 'custom');
    if (currentUser) {
      localStorage.setItem(`alurku_custom_board_order_${currentUser}`, JSON.stringify(newList));
    }
    setDraggedBoardId(null);
  };

  const renderBoardItem = (board, isFavoriteSection = false) => {
    const isActive = selectedBoard?.id === board.id;
    const taskCount = getBoardTaskCount(board.id);
    const isPinned = favoriteBoards.includes(board.id);
    const unreadChats = notifications.filter(
      (n) =>
        !n.is_read &&
        (n.type === 'team_chat' ||
          n.type === 'team_chat_no_email' ||
          n.type === 'comment' ||
          n.type === 'mention' ||
          n.type === 'mention_no_email') &&
        (n.board_id ? parseInt(n.board_id) === parseInt(board.id) : parseInt(n.related_task_id) === parseInt(board.id))
    ).length;

    const getInitials = (name) => name.substring(0, 2).toUpperCase();
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-emerald-400 to-teal-500',
      'from-rose-400 to-red-500',
      'from-amber-400 to-orange-500',
      'from-fuchsia-500 to-purple-600',
      'from-cyan-400 to-blue-500',
    ];
    const colorIndex = board.id % colors.length;
    const gradient = colors[colorIndex];

    return (
      <div
        role="button"
        tabIndex={0}
        key={`sb-${isFavoriteSection ? 'fav' : 'all'}-${board.id}`}
        title={isCollapsed ? board.name : undefined}
        draggable
        onDragStart={() => setDraggedBoardId(board.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDropBoard(board.id)}
        onClick={() => {
          setSelectedBoard(board);
          setIsMobileMenuOpen(false);
          setIsProactiveAIOpen(false);
          if (viewMode === 'overview') {
            setViewMode('kanban');
          }
          const slugify = (text) => (text ? text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '');
          const wsSlug = slugify(activeWorkspace?.name);
          const boardSlug = slugify(board.name);
          const targetUrl = `/workspace/${wsSlug}/${activeWorkspace?.id}/project/${boardSlug}/${board.id}`;
          window.history.pushState({}, '', targetUrl);
          window.dispatchEvent(new CustomEvent('alurku-navigate'));
        }}
        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-all group relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#111E38] ${
          isActive
            ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-semibold'
            : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-600 dark:text-slate-400 font-medium'
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 bg-[#111E38] dark:bg-[#FACC15] rounded-r-full"></div>
        )}
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="material-symbols-outlined text-[15px] text-neutral-400 dark:text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab shrink-0 -ml-0.5"
            title={tMsg('Drag to reorder', 'Geser untuk menata ulang')}
          >
            drag_indicator
          </span>
          <div
            className={`w-4.5 h-4.5 rounded bg-linear-to-br ${gradient} text-white flex items-center justify-center text-[8px] font-black shrink-0 shadow-2xs opacity-90`}
          >
            {getInitials(board.name)}
          </div>
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className={`text-xs truncate ${isActive ? 'font-bold text-[#111E38] dark:text-[#FACC15]' : 'font-medium'}`}>
              {board.name}
            </span>
            {!!board.is_private && (
              <span className="opacity-60 shrink-0" title={tMsg('Private Project', 'Proyek Privat')}>
                <svg className="w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isPinned) {
                setFavoriteBoards(favoriteBoards.filter((id) => id !== board.id));
              } else {
                setFavoriteBoards([...favoriteBoards, board.id]);
              }
            }}
            className={`p-0.5 rounded transition-all ${
              isPinned
                ? 'text-amber-400 opacity-100'
                : 'text-neutral-400 hover:text-amber-400 opacity-0 group-hover:opacity-100'
            }`}
            title={isPinned ? tMsg('Unpin Project', 'Lepas Sematan') : tMsg('Pin Project', 'Sematkan')}
          >
            <span className="material-symbols-outlined text-[15px]">{isPinned ? 'star' : 'star_border'}</span>
          </button>

          {taskCount > 0 && (
            <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 ml-0.5">{taskCount}</span>
          )}
          {unreadChats > 0 && (
            <span className="min-w-3.5 h-3.5 px-1 rounded-full bg-[#FACC15] text-[#111E38] text-[9px] font-black flex items-center justify-center leading-none" title={`${unreadChats} unread`}>
              {unreadChats > 9 ? '9+' : unreadChats}
            </span>
          )}
          {board.health_alert?.includes('Attention') && unreadChats === 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Attention Needed"></span>
          )}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const menuKey = `${isFavoriteSection ? 'fav' : 'all'}-${board.id}`;
                setActiveBoardMenuId(activeBoardMenuId === menuKey ? null : menuKey);
              }}
              className="p-0.5 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
              title={tMsg('Project Options', 'Opsi Proyek')}
            >
              <span className="material-symbols-outlined text-[15px]">more_vert</span>
            </button>
            {activeBoardMenuId === `${isFavoriteSection ? 'fav' : 'all'}-${board.id}` && (
              <>
                <div className="fixed inset-0 z-45" onClick={(e) => { e.stopPropagation(); setActiveBoardMenuId(null); }}></div>
                <div className="absolute right-0 bottom-0 mb-6 w-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-50 py-1 text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveBoardMenuId(null);
                      if (isPinned) {
                        setFavoriteBoards(favoriteBoards.filter((id) => id !== board.id));
                      } else {
                        setFavoriteBoards([...favoriteBoards, board.id]);
                      }
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                  >
                    <span className="material-symbols-outlined text-sm">{isPinned ? 'star_half' : 'star'}</span>
                    {isPinned ? tMsg('Unpin', 'Lepas Sematan') : tMsg('Pin Project', 'Sematkan')}
                  </button>
                  {(isSuperAdmin || board.owner_username === currentUser) && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveBoardMenuId(null);
                          archiveBoard(board);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                      >
                        <span className="material-symbols-outlined text-sm">inventory_2</span>
                        {tMsg('Archive', 'Arsipkan')}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveBoardMenuId(null);
                          setBoardToDelete(board);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        {tMsg('Delete', 'Hapus')}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getCategoryTitle = () => {
    switch (activeRailTab) {
      case 'home': return tMsg('Home', 'Beranda');
      case 'tasks': return tMsg('My Tasks', 'Tugas Saya');
      case 'spaces': return tMsg('Spaces', 'Proyek');
      case 'ai': return tMsg('AI Agents', 'Asisten AI');
      case 'dashboard': return tMsg('Dashboards', 'Dasbor');
      case 'support': return tMsg('Support & Tickets', 'Dukungan & Tiket');
      default: return tMsg('Spaces', 'Proyek');
    }
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-80 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ALURKU DUAL SIDEBAR: DOCK RAIL (COLUMN 1) + CONTENT PANEL (COLUMN 2) */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <div className="flex md:sticky md:top-20 md:h-[calc(100vh-5rem)] md:shrink-0 z-90 md:z-50 select-none">
        
        {/* ── COLUMN 1: MASTER BIG CATEGORY ICON DOCK RAIL (~56PX) ── */}
        <aside className="w-14 bg-[#EBECEF] dark:bg-[#090b0d] border-r border-neutral-300/60 dark:border-neutral-800/80 flex flex-col items-center py-3 gap-2 shrink-0">
          
          {/* Top Workspace Avatar Logo (Compact w-7 h-7) */}
          <button
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center text-[10px] font-black shadow-xs hover:opacity-90 transition-all mb-1 shrink-0"
            title={`${tMsg('Workspace', 'Ruang Kerja')}: ${activeWorkspace?.name || ''}`}
          >
            {activeWorkspace?.name ? activeWorkspace.name.substring(0, 1).toUpperCase() : 'W'}
          </button>

          <div className="w-6 h-px bg-neutral-300 dark:bg-neutral-800 my-0.5"></div>

          {/* 1. Home */}
          <button
            onClick={() => handleRailTabChange('home')}
            className={`w-9 h-9 flex flex-col items-center justify-center rounded-xl transition-all ${
              activeRailTab === 'home'
                ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold shadow-xs'
                : 'text-slate-600 dark:text-neutral-400 hover:bg-neutral-300/60 dark:hover:bg-neutral-800/60'
            }`}
            title={tMsg('Home (G+H)', 'Beranda (G+H)')}
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            <span className="text-[9px] font-semibold leading-none mt-0.5">Home</span>
          </button>

          {/* 2. My Tasks */}
          <button
            onClick={() => handleRailTabChange('tasks')}
            className={`w-9 h-9 flex flex-col items-center justify-center rounded-xl transition-all relative ${
              activeRailTab === 'tasks'
                ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold shadow-xs'
                : 'text-slate-600 dark:text-neutral-400 hover:bg-neutral-300/60 dark:hover:bg-neutral-800/60'
            }`}
            title={tMsg('My Tasks (G+P)', 'Tugas Saya (G+P)')}
          >
            <span className="material-symbols-outlined text-[20px]">task_alt</span>
            <span className="text-[9px] font-semibold leading-none mt-0.5">Tasks</span>
            {overdueCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center leading-none">
                {overdueCount}
              </span>
            )}
          </button>

          {/* 3. Spaces / Projects */}
          <button
            onClick={() => handleRailTabChange('spaces')}
            className={`w-9 h-9 flex flex-col items-center justify-center rounded-xl transition-all ${
              activeRailTab === 'spaces'
                ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold shadow-xs'
                : 'text-slate-600 dark:text-neutral-400 hover:bg-neutral-300/60 dark:hover:bg-neutral-800/60'
            }`}
            title={tMsg('Spaces / Projects (G+A)', 'Proyek / Spaces (G+A)')}
          >
            <span className="material-symbols-outlined text-[20px]">folder_copy</span>
            <span className="text-[9px] font-semibold leading-none mt-0.5">Spaces</span>
          </button>

          {/* 4. Luruka AI */}
          <button
            onClick={() => handleRailTabChange('ai')}
            className={`w-9 h-9 flex flex-col items-center justify-center rounded-xl transition-all ${
              activeRailTab === 'ai'
                ? 'bg-[#FACC15] text-[#111E38] font-black shadow-xs'
                : 'text-slate-600 dark:text-neutral-400 hover:bg-neutral-300/60 dark:hover:bg-neutral-800/60'
            }`}
            title="Luruka AI Agents"
          >
            <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="text-[9px] font-semibold leading-none mt-0.5">AI</span>
          </button>

          {/* 5. Dashboards */}
          <button
            onClick={() => handleRailTabChange('dashboard')}
            className={`w-9 h-9 flex flex-col items-center justify-center rounded-xl transition-all ${
              activeRailTab === 'dashboard'
                ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold shadow-xs'
                : 'text-slate-600 dark:text-neutral-400 hover:bg-neutral-300/60 dark:hover:bg-neutral-800/60'
            }`}
            title={tMsg('Dashboards', 'Dasbor')}
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span className="text-[9px] font-semibold leading-none mt-0.5">Board</span>
          </button>

          {/* 6. Support */}
          <button
            onClick={() => handleRailTabChange('support')}
            className={`w-9 h-9 flex flex-col items-center justify-center rounded-xl transition-all ${
              activeRailTab === 'support'
                ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold shadow-xs'
                : 'text-slate-600 dark:text-neutral-400 hover:bg-neutral-300/60 dark:hover:bg-neutral-800/60'
            }`}
            title={tMsg('Support', 'Dukungan')}
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
            <span className="text-[9px] font-semibold leading-none mt-0.5">Help</span>
          </button>

          {/* Bottom Actions */}
          <div className="mt-auto flex flex-col items-center gap-2">
            {/* Invite */}
            <button
              onClick={() => setIsInvitesModalOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-black dark:hover:text-white hover:bg-neutral-300/60 dark:hover:bg-neutral-800 transition-colors"
              title={tMsg('Invite Members', 'Undang Anggota')}
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
            </button>

            {/* Upgrade */}
            <button
              onClick={() => {
                window.history.pushState({}, '', '/billing');
                window.dispatchEvent(new CustomEvent('alurku-navigate'));
              }}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-amber-500 hover:bg-amber-500/15 transition-colors"
              title={tMsg('Upgrade Plan', 'Upgrade Paket')}
            >
              <span className="material-symbols-outlined text-[18px]">upgrade</span>
            </button>

            {/* EXPLICIT EXPAND / COLLAPSE BUTTON WITH SMOOTH ROTATION */}
            <button
              onClick={toggleCollapse}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-neutral-300/60 dark:bg-neutral-800/80 text-slate-700 dark:text-neutral-200 hover:bg-neutral-400/60 dark:hover:bg-neutral-700 transition-all shadow-2xs mt-1"
              title={isCollapsed ? tMsg('Expand Panel (Ctrl+B)', 'Buka Panel Sidebar (Ctrl+B)') : tMsg('Collapse Panel (Ctrl+B)', 'Tutup Panel Sidebar (Ctrl+B)')}
            >
              <span
                className="material-symbols-outlined text-[18px] transition-transform duration-300"
                style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                chevron_left
              </span>
            </button>
          </div>
        </aside>

        {/* ── COLUMN 2: DYNAMIC CONTENT DRAWER PANEL (~210PX) WITH SMOOTH ANIMATION ── */}
        <aside
          className={`bg-[#FAFAFA]/95 dark:bg-[#121B2D]/95 backdrop-blur-xl flex flex-col border-r border-neutral-200/50 dark:border-neutral-800/50 transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
            isCollapsed
              ? 'w-0 opacity-0 pointer-events-none border-r-0 border-transparent'
              : 'w-56 md:w-60 opacity-100'
          } ${
            isMobileMenuOpen ? 'fixed inset-y-0 left-14 z-90 translate-x-0' : ''
          }`}
        >
          {/* ── HEADER ROW 1: WORKSPACE SELECTOR DROPDOWN + WORKSPACE CHAT BUTTON ── */}
          <div className="h-11 px-3 flex items-center justify-between shrink-0 border-b border-neutral-200/50 dark:border-neutral-800/50 relative gap-1">
            <div className="relative flex-1 min-w-0">
              <button
                onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                className="w-full flex items-center justify-between gap-1.5 p-1 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 rounded-xl transition-all text-left"
              >
                <span className="font-extrabold text-xs text-[#111E38] dark:text-white truncate flex-1">
                  {activeWorkspace?.name || 'Workspace'}
                </span>
                <span className="material-symbols-outlined text-[16px] text-neutral-400 shrink-0">
                  expand_more
                </span>
              </button>

              {isWorkspaceMenuOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-64 bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-60 p-1.5 animate-fadeIn">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 py-1">
                    {tMsg('Workspaces', 'Ruang Kerja')}
                  </div>
                  <div className="max-h-52 overflow-y-auto space-y-0.5 custom-scrollbar">
                    {(workspaces || []).map((ws) => (
                      <button
                        key={`ws-menu-${ws.id}`}
                        onClick={() => {
                          switchWorkspace(ws);
                          setIsWorkspaceMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          ws.id === activeWorkspace?.id
                            ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium'
                        }`}
                      >
                        <span className="truncate">{ws.name}</span>
                        {ws.id === activeWorkspace?.id && <span>✓</span>}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-neutral-100 dark:border-neutral-800 mt-1.5 pt-1.5">
                    {isCreatingWs ? (
                      <form onSubmit={handleCreateWsSubmit} className="flex gap-1.5 p-1">
                        <input
                          type="text"
                          placeholder={tMsg('Workspace Name', 'Nama Workspace')}
                          value={newWsName}
                          onChange={(e) => setNewWsName(e.target.value)}
                          className="flex-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs rounded-lg px-2.5 py-1 outline-none text-black dark:text-white"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="bg-[#FACC15] text-[#111E38] text-xs px-2.5 py-1 rounded-lg font-bold"
                        >
                          +
                        </button>
                      </form>
                    ) : (
                      <button
                        onClick={() => setIsCreatingWs(true)}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-indigo-600 dark:text-[#FACC15] hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg font-bold flex items-center gap-1.5"
                      >
                        <IconPlus className="w-3.5 h-3.5" />
                        {tMsg('Create Workspace', 'Buat Workspace Baru')}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dedicated Workspace Chat Icon Button in Header Row 1 */}
            <button
              onClick={() => {
                setSelectedBoard(null);
                setIsMobileMenuOpen(false);
                window.history.pushState({}, '', '/chat');
                window.dispatchEvent(new CustomEvent('alurku-navigate'));
              }}
              className={`p-1.5 rounded-lg transition-colors relative shrink-0 ${
                typeof window !== 'undefined' && (window.location.pathname === '/chat' || window.location.pathname.endsWith('/chat'))
                  ? 'bg-[#111E38] text-[#FACC15] font-bold'
                  : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 text-slate-600 dark:text-neutral-300'
              }`}
              title={tMsg('Workspace Chat', 'Obrolan Ruang Kerja')}
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              {totalUnreadChats > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FACC15] ring-2 ring-[#FAFAFA] dark:ring-[#121B2D]"></span>
              )}
            </button>
          </div>

          {/* ── HEADER ROW 2: CATEGORY TITLE + DYNAMIC MULTI-FUNCTION +CREATE BUTTON ── */}
          <div className="px-3 py-1.5 flex items-center justify-between shrink-0 border-b border-neutral-200/40 dark:border-neutral-800/40 bg-neutral-100/40 dark:bg-neutral-900/30 relative">
            <h2 className="text-xs font-extrabold text-slate-800 dark:text-white tracking-tight uppercase">
              {getCategoryTitle()}
            </h2>

            {/* Multi-Function + Create Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                className="px-2.5 py-1 bg-white hover:bg-[#111E38] text-[#111E38] hover:text-white dark:bg-neutral-800 dark:hover:bg-[#FACC15] dark:text-neutral-200 dark:hover:text-[#111E38] border border-neutral-300 dark:border-neutral-700 text-[11px] font-extrabold rounded-lg transition-all flex items-center gap-1 shadow-2xs cursor-pointer group"
                title={tMsg('Create Task or Project', 'Buat Tugas atau Proyek')}
              >
                <IconPlus className="w-3 h-3 text-current transition-colors" />
                <span className="text-current transition-colors">{tMsg('Create', 'Buat')}</span>
                <span className="material-symbols-outlined text-[12px] text-current opacity-70 group-hover:opacity-100 transition-opacity">expand_more</span>
              </button>

              {isCreateMenuOpen && (
                <>
                  <div className="fixed inset-0 z-55" onClick={() => setIsCreateMenuOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-60 py-1 text-xs animate-fadeIn">
                    <button
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        setIsFormOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium"
                    >
                      <span className="material-symbols-outlined text-sm text-indigo-500">add_task</span>
                      <span>{tMsg('New Task', 'Tugas Baru')}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        setIsCreateBoardOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium border-t border-neutral-100 dark:border-neutral-800"
                    >
                      <span className="material-symbols-outlined text-sm text-amber-500">create_new_folder</span>
                      <span>{tMsg('New Project', 'Proyek Baru')}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── DYNAMIC SCROLLABLE CONTENT BASED ON ACTIVE RAIL TAB ── */}
          <div className="flex-1 overflow-y-auto px-1.5 pt-2 pb-2 custom-scrollbar">

            {/* TAB 1: HOME */}
            {activeRailTab === 'home' && (
              <div className="space-y-3">
                <div className="space-y-0.5">
                  {/* Workspace Chat */}
                  <button
                    onClick={() => {
                      setSelectedBoard(null);
                      setIsMobileMenuOpen(false);
                      window.history.pushState({}, '', '/chat');
                      window.dispatchEvent(new CustomEvent('alurku-navigate'));
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-all text-xs ${
                      typeof window !== 'undefined' && (window.location.pathname === '/chat' || window.location.pathname.endsWith('/chat'))
                        ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-bold'
                        : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-[18px] text-indigo-500 dark:text-[#FACC15]">chat</span>
                      <span className="truncate">{tMsg('Workspace Chat', 'Obrolan Ruang Kerja')}</span>
                    </div>
                    {totalUnreadChats > 0 && (
                      <span className="min-w-4 h-4 px-1 rounded-full bg-[#FACC15] text-[#111E38] text-[9px] font-black flex items-center justify-center leading-none">
                        {totalUnreadChats}
                      </span>
                    )}
                  </button>

                  {/* Inbox & Notifications */}
                  <button
                    onClick={() => {
                      if (navigateTo) {
                        navigateTo('/inbox');
                      } else if (typeof window !== 'undefined') {
                        window.history.pushState({}, '', '/inbox');
                        window.dispatchEvent(new CustomEvent('alurku-navigate'));
                      }
                      if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-all text-xs ${
                      activePath === '/inbox' || activePath?.endsWith('/inbox')
                        ? 'bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] font-bold shadow-xs'
                        : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-[18px]">inbox</span>
                      <span className="truncate">{tMsg('Inbox & Notifications', 'Kotak Masuk & Notifikasi')}</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="min-w-4 h-4 px-1 rounded-full bg-[#FACC15] text-[#111E38] text-[9px] font-black flex items-center justify-center leading-none">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Meetings & Leaves */}
                  <button
                    onClick={() => {
                      if (navigateTo) {
                        navigateTo('/meetings-leaves');
                      } else if (typeof window !== 'undefined') {
                        window.history.pushState({}, '', '/meetings-leaves');
                        window.dispatchEvent(new CustomEvent('alurku-navigate'));
                      }
                      if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-all text-xs ${
                      activePath === '/meetings-leaves' || activePath?.endsWith('/meetings-leaves') || activePath === '/calendar'
                        ? 'bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] font-bold shadow-xs'
                        : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-[18px]">event_upcoming</span>
                      <span className="truncate">{tMsg('Meetings & Leaves', 'Pertemuan & Cuti')}</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: MY TASKS */}
            {activeRailTab === 'tasks' && (
              <div className="space-y-3">
                {/* Brand-compliant Quick Add Task Button */}
                <button
                  onClick={() => {
                    setIsFormOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold text-xs hover:opacity-90 transition-all mb-2 shadow-2xs"
                >
                  <IconPlus className="w-3.5 h-3.5" />
                  <span>{tMsg('Add New Task', 'Tambah Tugas Baru')}</span>
                </button>

                {/* Section 1: Smart Views */}
                <div>
                  <div className="px-2 py-1 text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider select-none">
                    {tMsg('Smart Views', 'Tampilan Cerdas')}
                  </div>
                  <div className="space-y-0.5 mt-0.5">
                    {/* All Assigned Tasks */}
                    <button
                      onClick={() => {
                        setSelectedBoard(null);
                        setIsMobileMenuOpen(false);
                        window.history.pushState({}, '', '/my-tasks');
                        window.dispatchEvent(new CustomEvent('alurku-navigate'));
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        activePath === '/my-tasks' && !activePath?.includes('filter=')
                          ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-bold'
                          : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-[18px]">person_check</span>
                        <span className="truncate">{tMsg('Assigned to me', 'Ditugaskan ke saya')}</span>
                      </div>
                      {assignedToMeCount > 0 && (
                        <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">{assignedToMeCount}</span>
                      )}
                    </button>

                    {/* Today */}
                    <button
                      onClick={() => {
                        setSelectedBoard(null);
                        setIsMobileMenuOpen(false);
                        window.history.pushState({}, '', '/my-tasks?filter=today');
                        window.dispatchEvent(new CustomEvent('alurku-navigate'));
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        activePath?.includes('filter=today')
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-bold'
                          : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-[18px] text-amber-500">today</span>
                        <span className="truncate">{tMsg('Due Today', 'Tenggat Hari Ini')}</span>
                      </div>
                      {dueTodayCount > 0 && (
                        <span className="min-w-4 h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center leading-none">
                          {dueTodayCount}
                        </span>
                      )}
                    </button>

                    {/* This Week (Minggu - Sabtu) */}
                    <button
                      onClick={() => {
                        setSelectedBoard(null);
                        setIsMobileMenuOpen(false);
                        window.history.pushState({}, '', '/my-tasks?filter=this-week');
                        window.dispatchEvent(new CustomEvent('alurku-navigate'));
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        activePath?.includes('filter=this-week')
                          ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-[18px] text-indigo-500">date_range</span>
                        <span className="truncate">{tMsg('This Week', 'Minggu Ini')}</span>
                      </div>
                      {dueThisWeekCount > 0 && (
                        <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">{dueThisWeekCount}</span>
                      )}
                    </button>

                    {/* Overdue */}
                    <button
                      onClick={() => {
                        setSelectedBoard(null);
                        setIsMobileMenuOpen(false);
                        window.history.pushState({}, '', '/my-tasks?filter=overdue');
                        window.dispatchEvent(new CustomEvent('alurku-navigate'));
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        activePath?.includes('filter=overdue') || showOverdueOnly
                          ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold'
                          : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-[18px] text-rose-500">warning</span>
                        <span className="truncate">{tMsg('Overdue', 'Terlambat')}</span>
                      </div>
                      {overdueCount > 0 && (
                        <span className="min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center leading-none">
                          {overdueCount}
                        </span>
                      )}
                    </button>

                    {/* Completed */}
                    <button
                      onClick={() => {
                        setSelectedBoard(null);
                        setIsMobileMenuOpen(false);
                        window.history.pushState({}, '', '/my-tasks?filter=completed');
                        window.dispatchEvent(new CustomEvent('alurku-navigate'));
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        activePath?.includes('filter=completed')
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-[18px] text-emerald-500">task_alt</span>
                        <span className="truncate">{tMsg('Completed', 'Selesai')}</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Section 2: Personal Space */}
                <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
                  <div className="px-2 py-1 text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider select-none">
                    {tMsg('Personal Space', 'Ruang Pribadi')}
                  </div>
                  <div className="space-y-0.5 mt-0.5">
                    {todoListBoard ? (
                      <button
                        onClick={() => {
                          setSelectedBoard(todoListBoard);
                          setShowMyTasks(false);
                          setShowOverdueOnly(false);
                          setViewMode('kanban');
                          setIsMobileMenuOpen(false);
                          const slugify = (text) => (text ? text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '');
                          const wsSlug = slugify(activeWorkspace?.name);
                          const targetUrl = `/workspace/${wsSlug}/${activeWorkspace?.id}/project/personal-tasks/${todoListBoard.id}`;
                          window.history.pushState({}, '', targetUrl);
                          window.dispatchEvent(new CustomEvent('alurku-navigate'));
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                          selectedBoard?.id === todoListBoard.id
                            ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-bold'
                            : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="material-symbols-outlined text-[18px] text-amber-500">folder_special</span>
                          <span className="truncate">{tMsg('Personal Tasks', 'Tugas Pribadi')}</span>
                        </div>
                        {getBoardTaskCount(todoListBoard.id) > 0 && (
                          <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">
                            {getBoardTaskCount(todoListBoard.id)}
                          </span>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsCreateBoardOpen(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-500 dark:text-slate-400 italic"
                      >
                        <span className="material-symbols-outlined text-[18px]">add_circle_outline</span>
                        <span className="truncate">{tMsg('+ Create Personal Board', '+ Buat Board Pribadi')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SPACES / PROJECTS TREE */}
            {activeRailTab === 'spaces' && (
              <div className="space-y-3">
                {/* All Tasks & Projects (Master View) */}
                <button
                  onClick={() => {
                    setSelectedBoard({
                      id: 'global',
                      name: `${tMsg('All Projects', 'Semua Proyek')}`,
                      owner_username: currentUser,
                      role: 'owner',
                      isVirtual: true,
                    });
                    setViewMode('kanban');
                    setIsMobileMenuOpen(false);
                    setIsProactiveAIOpen(false);
                    const slugify = (text) => (text ? text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '');
                    const wsSlug = slugify(activeWorkspace?.name);
                    const targetUrl = `/workspace/${wsSlug}/${activeWorkspace?.id}/project/overall-project`;
                    window.history.pushState({}, '', targetUrl);
                    window.dispatchEvent(new CustomEvent('alurku-navigate'));
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all tour-global-board relative ${
                    selectedBoard?.id === 'global'
                      ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-bold'
                      : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                  }`}
                >
                  {selectedBoard?.id === 'global' && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 bg-[#111E38] dark:bg-[#FACC15] rounded-r-full"></div>
                  )}
                  <span className="material-symbols-outlined text-[18px]">layers</span>
                  <span className="text-xs truncate font-semibold">{tMsg('All Projects', 'Semua Proyek')}</span>
                </button>

                {/* Brand-compliant Quick Add Project Button */}
                <button
                  onClick={() => {
                    setIsCreateBoardOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold text-xs hover:opacity-90 transition-all mb-2 shadow-2xs"
                >
                  <IconPlus className="w-3.5 h-3.5" />
                  <span>{tMsg('Add New Project', 'Tambah Proyek Baru')}</span>
                </button>

                {/* Section: Spaces & Projects Tree */}
                <div>
                  <div className="flex items-center justify-between px-2 py-1 select-none">
                    <span
                      onClick={() => setIsSpacesTreeOpen(!isSpacesTreeOpen)}
                      className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider cursor-pointer flex items-center gap-1"
                    >
                      {tMsg('Projects', 'Daftar Proyek')} ({displayBoards.length})
                    </span>
                    <span
                      onClick={() => setIsSpacesTreeOpen(!isSpacesTreeOpen)}
                      className="material-symbols-outlined text-[14px] text-neutral-400 cursor-pointer transition-transform duration-200"
                      style={{ transform: isSpacesTreeOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      expand_more
                    </span>
                  </div>

                  {isSpacesTreeOpen && (
                    <div className="ml-2.5 pl-2 border-l border-neutral-200/70 dark:border-neutral-800 flex flex-col gap-0.5 mt-1">
                      {/* Pinned Projects Section */}
                      {favorites.length > 0 && (
                        <div className="mb-1">
                          <div className="px-2 py-0.5 text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                            {tMsg('Pinned', 'Disematkan')}
                          </div>
                          {favorites.map((b) => renderBoardItem(b, true))}
                        </div>
                      )}

                      {/* Unpinned Projects List */}
                      {unpinnedDisplayBoards.length === 0 ? (
                        <div className="px-2 py-1 text-xs text-neutral-400 italic">{tMsg('No other projects', 'Tidak ada proyek lain')}</div>
                      ) : (
                        unpinnedDisplayBoards.map((b) => renderBoardItem(b))
                      )}

                      {/* Team Docs */}
                      <button
                        onClick={() => {
                          setIsDocsOpen(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        <span className="material-symbols-outlined text-[15px] text-sky-500">description</span>
                        <span className="truncate">{tMsg('Team Docs', 'Dokumentasi Tim')}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Archived Projects */}
                <button
                  onClick={() => {
                    setIsArchivedOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-500 dark:text-slate-400 font-medium text-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                  <span className="truncate">{tMsg('Archived Projects', 'Proyek Diarsipkan')}</span>
                </button>
              </div>
            )}

            {/* TAB 4: AI AGENTS */}
            {activeRailTab === 'ai' && (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedBoard(null);
                    setIsProactiveAIOpen(true);
                    setIsMobileMenuOpen(false);
                    window.history.pushState({}, '', '/proactive-ai');
                    window.dispatchEvent(new CustomEvent('alurku-navigate'));
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all border ${
                    window.location.pathname === '/proactive-ai' && !selectedBoard
                      ? 'bg-[#FACC15] border-[#FACC15] text-[#111E38] font-black shadow-2xs'
                      : 'bg-[#FACC15]/10 border-[#FACC15]/30 hover:bg-[#FACC15]/20 hover:border-[#FACC15]/60 text-[#111E38] dark:text-[#FACC15] font-bold'
                  }`}
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  <span className="text-xs truncate">{tMsg('Ask Luruka AI', 'Tanya Luruka AI')}</span>
                </button>

                <div className="space-y-0.5 pt-1">
                  <button
                    onClick={() => {
                      startTour();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    <span className="material-symbols-outlined text-[18px] text-emerald-500">flag</span>
                    <span className="truncate">{tMsg('Onboarding Assistant', 'Asisten Onboarding')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setViewMode('overview');
                      setSelectedBoard(null);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    <span className="material-symbols-outlined text-[18px] text-indigo-500">insights</span>
                    <span className="truncate">{tMsg('Workload Analytics Agent', 'Asisten Beban Kerja')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: DASHBOARD */}
            {activeRailTab === 'dashboard' && (
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedBoard(null);
                    setIsMobileMenuOpen(false);
                    window.history.pushState({}, '', '/dashboard');
                    window.dispatchEvent(new CustomEvent('alurku-navigate'));
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                    activePath === '/dashboard' || activePath?.endsWith('/dashboard')
                      ? 'bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] font-bold shadow-xs'
                      : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">home</span>
                  <span className="truncate">{tMsg('Personal Dashboard', 'Dasbor Utama')}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedBoard(null);
                    setViewMode('overview');
                    setIsMobileMenuOpen(false);
                    const slug = activeWorkspace?.name 
                      ? activeWorkspace.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') 
                      : 'main';
                    window.history.pushState({}, '', `/workspace/${slug}`);
                    window.dispatchEvent(new CustomEvent('alurku-navigate'));
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium"
                >
                  <span className="material-symbols-outlined text-[18px]">dashboard</span>
                  <span className="truncate">{tMsg('Workspace Overview', 'Ringkasan Ruang Kerja')}</span>
                </button>
              </div>
            )}

            {/* TAB 6: SUPPORT */}
            {activeRailTab === 'support' && (
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setIsMyTicketsOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium"
                >
                  <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                  <span className="truncate">{tMsg('My Tickets', 'Tiket Bantuan Saya')}</span>
                </button>

                <button
                  onClick={() => {
                    setIsSupportOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium"
                >
                  <span className="material-symbols-outlined text-[18px]">help</span>
                  <span className="truncate">{tMsg('Help & Support', 'Bantuan & Support')}</span>
                </button>
              </div>
            )}

            {/* SAVED VIEWS SECTION (AVAILABLE ACROSS TABS) */}
            {savedViews.length > 0 && (
              <div className="mt-4 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
                <div className="flex items-center justify-between px-2 mb-1 select-none">
                  <span
                    onClick={() => setIsSavedViewsOpen(!isSavedViewsOpen)}
                    className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider cursor-pointer flex items-center gap-1"
                  >
                    {tMsg('Saved Views', 'Filter Tersimpan')}
                    <span
                      className="material-symbols-outlined text-[12px] text-neutral-400 transition-transform duration-200"
                      style={{ transform: isSavedViewsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      expand_more
                    </span>
                  </span>
                  <button
                    onClick={handleOpenSaveModal}
                    className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors p-0.5 rounded hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 cursor-pointer"
                    title={tMsg('Save Current Active Filter', 'Simpan Filter Saat Ini')}
                  >
                    <IconPlus className="w-3 h-3" />
                  </button>
                </div>

                {isSavedViewsOpen && (
                  <div className="flex flex-col gap-0.5">
                    {savedViews.map((sv) => {
                      const isActive = activeSavedViewId === sv.id;
                      return (
                        <div
                          key={sv.id}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-xs font-medium group transition-colors ${
                            isActive
                              ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-bold'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60'
                          }`}
                        >
                          <button
                            onClick={() => {
                              setActiveSavedViewId(sv.id);
                              setIsMobileMenuOpen(false);

                              // 1. Restore Board / Project
                              if (sv.boardId) {
                                if (sv.boardId === 'global') {
                                  setSelectedBoard({
                                    id: 'global',
                                    name: tMsg('All Projects', 'Semua Proyek'),
                                    owner_username: currentUser,
                                    role: 'owner',
                                    isVirtual: true,
                                  });
                                } else {
                                  const targetBoard = (boards || []).find((b) => String(b.id) === String(sv.boardId)) || sv.board;
                                  if (targetBoard) setSelectedBoard(targetBoard);
                                }
                              } else if (sv.type === 'assigned' || sv.type === 'overdue' || sv.targetUrl?.includes('/my-tasks') || sv.targetUrl?.includes('/inbox') || sv.targetUrl?.includes('/meetings') || sv.targetUrl?.includes('/dashboard')) {
                                setSelectedBoard(null);
                              }

                              // 2. Restore View Mode & Grouping
                              if (sv.viewMode && setViewMode) setViewMode(sv.viewMode);
                              if (sv.groupBy && setGroupBy) setGroupBy(sv.groupBy);

                              // 3. Restore Filters
                              if (sv.filterStatus && setFilterStatus) setFilterStatus(sv.filterStatus);
                              if (sv.filterCategory && setFilterCategory) setFilterCategory(sv.filterCategory);
                              if (sv.filterAssignee && setFilterAssignee) setFilterAssignee(sv.filterAssignee);
                              if (sv.showMyTasks !== undefined && setShowMyTasks) setShowMyTasks(sv.showMyTasks);
                              if (sv.showOverdueOnly !== undefined && setShowOverdueOnly) setShowOverdueOnly(sv.showOverdueOnly);

                              // 4. Restore URL
                              const targetUrl = sv.targetUrl || (sv.type === 'overdue' ? '/my-tasks?filter=overdue' : '/my-tasks');
                              window.history.pushState({}, '', targetUrl);
                              window.dispatchEvent(new CustomEvent('alurku-navigate'));
                            }}
                            className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                            title={tMsg(`Filter: ${sv.nameEn}`, `Filter: ${sv.nameId}`)}
                          >
                            <span className="material-symbols-outlined text-[15px] text-indigo-500 dark:text-[#FACC15] shrink-0">{sv.icon}</span>
                            <span className="truncate">{language === 'id' ? sv.nameId : sv.nameEn}</span>
                          </button>

                          {sv.type === 'custom' && (
                            <button
                              onClick={(e) => handleDeleteSavedView(e, sv.id)}
                              className="text-neutral-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer shrink-0"
                              title={tMsg('Delete saved view', 'Hapus filter tersimpan')}
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* ── FOOTER USER PROFILE CARD (REFINED COMPACT AVATAR SIZE 20PX) ── */}
          <div className="shrink-0 border-t border-neutral-200/60 dark:border-neutral-800/60 p-2 bg-[#FAFAFA]/95 dark:bg-[#121B2D]/95">
            <div className="flex items-center gap-2 px-1 py-0.5">
              <Avatar username={currentUser} size={20} avatarUrl={avatarsMap?.[currentUser]} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-800 dark:text-neutral-200 truncate leading-tight">{currentUser}</p>
                <p className="text-[9px] text-neutral-400 truncate">{accountStatus === 'free' ? tMsg('Free Plan', 'Paket Gratis') : tMsg('Pro Plan', 'Paket Pro')}</p>
              </div>
            </div>
          </div>

        </aside>

      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* CUSTOM MODAL: SAVE CURRENT VIEW / SMART BOOKMARK */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-99 animate-fade-in">
          <div 
            className="bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FACC15]/15 text-[#111E38] dark:text-[#FACC15] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">bookmark_add</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#111E38] dark:text-white">
                    {tMsg('Save Current View', 'Simpan Tampilan Saat Ini')}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {tMsg('Create a personal sidebar shortcut for this view', 'Buat shortcut personal di sidebar untuk tampilan ini')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSaveModalOpen(false);
                  setPendingSnapshot(null);
                }}
                className="text-neutral-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModalSubmit} className="space-y-4">
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {tMsg('View Name', 'Nama Tampilan')}
                </label>
                <input
                  type="text"
                  value={saveViewName}
                  onChange={(e) => setSaveViewName(e.target.value)}
                  placeholder={tMsg('e.g. Sprint 2 - High Impact', 'Contoh: Sprint 2 - Tugas Kritis')}
                  autoFocus
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/60 text-slate-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all"
                />
              </div>

              {/* Icon Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {tMsg('Choose Icon', 'Pilih Ikon')}
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { id: 'bookmark', icon: 'bookmark' },
                    { id: 'view_kanban', icon: 'view_kanban' },
                    { id: 'view_list', icon: 'view_list' },
                    { id: 'timeline', icon: 'timeline' },
                    { id: 'calendar_month', icon: 'calendar_month' },
                    { id: 'task_alt', icon: 'task_alt' },
                    { id: 'flag', icon: 'flag' },
                    { id: 'star', icon: 'star' },
                    { id: 'bolt', icon: 'bolt' },
                    { id: 'folder', icon: 'folder' },
                    { id: 'insights', icon: 'insights' },
                    { id: 'inbox', icon: 'inbox' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSaveViewIcon(item.icon)}
                      className={`h-9 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${
                        saveViewIcon === item.icon
                          ? 'border-[#111E38] dark:border-[#FACC15] bg-[#111E38]/10 dark:bg-[#FACC15]/20 text-[#111E38] dark:text-[#FACC15] font-bold shadow-xs'
                          : 'border-neutral-200 dark:border-neutral-800 text-slate-600 dark:text-slate-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Snapshot Summary Pill */}
              {pendingSnapshot && (
                <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-emerald-500">check_circle</span>
                    <span>{tMsg('Captured Settings', 'Pengaturan yang Direkam')}:</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-2 gap-y-0.5">
                    <span>• {tMsg('Mode', 'Mode')}: <strong>{pendingSnapshot.viewMode}</strong></span>
                    {pendingSnapshot.board?.name && <span>• {tMsg('Project', 'Proyek')}: <strong>{pendingSnapshot.board.name}</strong></span>}
                    {pendingSnapshot.filterStatus !== 'All' && <span>• {tMsg('Status', 'Status')}: <strong>{pendingSnapshot.filterStatus}</strong></span>}
                    {pendingSnapshot.filterCategory !== 'All' && <span>• {tMsg('Category', 'Kategori')}: <strong>{pendingSnapshot.filterCategory}</strong></span>}
                    {pendingSnapshot.showOverdueOnly && <span>• <strong>{tMsg('Overdue Only', 'Hanya Terlambat')}</strong></span>}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsSaveModalOpen(false);
                    setPendingSnapshot(null);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                >
                  {tMsg('Cancel', 'Batal')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#FACC15] text-[#111E38] hover:bg-[#EAB308] rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>{tMsg('Save View', 'Simpan Tampilan')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
