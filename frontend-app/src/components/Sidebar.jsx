import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Avatar, IconPlus } from '../SharedUI';
import { HighlightText } from '../Utils';

export default function Sidebar() {
  const {
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
  const [savedViews, setSavedViews] = useState(() => {
    if (typeof window !== 'undefined' && currentUser) {
      try {
        const saved = localStorage.getItem(`alurku_saved_views_${currentUser}`);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [
      { id: 'sv-assigned', nameEn: 'Assigned to Me', nameId: 'Ditugaskan ke Saya', icon: 'person_check', type: 'assigned' },
      { id: 'sv-overdue', nameEn: 'Overdue Tasks', nameId: 'Tugas Terlambat', icon: 'schedule', type: 'overdue' },
    ];
  });

  const handleSaveCurrentView = () => {
    const viewName = prompt(tMsg('Enter a name for this custom view:', 'Masukkan nama untuk filter tersimpan ini:'));
    if (!viewName || !viewName.trim()) return;
    const newView = {
      id: `sv-${Date.now()}`,
      nameEn: viewName.trim(),
      nameId: viewName.trim(),
      icon: 'bookmark',
      type: 'custom',
      filterStatus: filterStatus || 'All',
      filterCategory: filterCategory || 'All',
      filterAssignee: filterAssignee || 'All',
      showMyTasks: showMyTasks || false,
      showOverdueOnly: showOverdueOnly || false,
    };
    const updated = [...savedViews, newView];
    setSavedViews(updated);
    if (currentUser) {
      localStorage.setItem(`alurku_saved_views_${currentUser}`, JSON.stringify(updated));
    }
    if (showNotification) {
      showNotification(tMsg('Custom view saved!', 'Filter tersimpan berhasil ditambahkan!'));
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
        const hasUnreadNotification = (notifications || []).some(
          (n) =>
            !n.is_read &&
            String(n.related_task_id) === String(chat.board_id) &&
            (n.type === 'team_chat' || n.type === 'team_chat_no_email' || n.type === 'mention' || n.type === 'mention_no_email')
        );
        if (!lastRead) return true;
        return chat.timestamp > lastRead || hasUnreadNotification;
      } else {
        const lastRead = localStorage.getItem(`alurku_last_read_task_${chat.task_id}_${currentUser}`);
        const hasUnreadNotification = (notifications || []).some(
          (n) =>
            !n.is_read &&
            String(n.related_task_id) === String(chat.task_id) &&
            (n.type === 'comment' || n.type === 'mention' || n.type === 'mention_no_email')
        );
        if (!lastRead) return true;
        return chat.timestamp > lastRead || hasUnreadNotification;
      }
    }).length;
  }, [inboxChats, notifications, currentUser]);

  const totalUnreadChats = useMemo(() => {
    const unreadDms = (dmConversations || []).reduce((sum, convo) => sum + (convo.unread_count || 0), 0);
    const unreadMentionsAndComments = (notifications || []).filter(
      (n) =>
        !n.is_read &&
        (n.type === 'comment' ||
          n.type === 'mention' ||
          n.type === 'mention_no_email' ||
          n.type === 'team_chat' ||
          n.type === 'team_chat_no_email')
    ).length;
    return Math.max(unreadInboxChatsCount, unreadDms + unreadMentionsAndComments);
  }, [unreadInboxChatsCount, notifications, dmConversations]);

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
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#111E38] dark:bg-[#FACC15] rounded-r-full"></div>
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
      {/* TRUE 1:1 CLICKUP DUAL SIDEBAR: ICON RAIL (COLUMN 1) + CONTENT PANEL (COLUMN 2) */}
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

            {/* ClickUp Style Multi-Function + Create Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                className="px-2 py-0.5 bg-white dark:bg-neutral-800 hover:bg-[#111E38] hover:text-white dark:hover:bg-[#FACC15] dark:hover:text-[#111E38] border border-neutral-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 shadow-2xs"
                title={tMsg('Create Task or Project', 'Buat Tugas atau Proyek')}
              >
                <IconPlus className="w-3 h-3" />
                <span>{tMsg('Create', 'Buat')}</span>
                <span className="material-symbols-outlined text-[12px] opacity-70">expand_more</span>
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
                      if (typeof window !== 'undefined') {
                        window.history.pushState({}, '', '/inbox');
                      }
                      if (setCurrentPath) setCurrentPath('/inbox');
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
                      <span className="truncate">{tMsg('Inbox & Replies', 'Inbox & Notifikasi')}</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="min-w-4 h-4 px-1 rounded-full bg-[#FACC15] text-[#111E38] text-[9px] font-black flex items-center justify-center leading-none">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Assigned Comments */}
                  <button
                    onClick={() => {
                      setIsProjectChatOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-all hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-[18px]">forum</span>
                      <span className="truncate">{tMsg('Assigned Comments', 'Komentar & Sebutan')}</span>
                    </div>
                    {totalUnreadChats > 0 && (
                      <span className="min-w-4 h-4 px-1 rounded-full bg-[#FACC15] text-[#111E38] text-[9px] font-black flex items-center justify-center leading-none">
                        {totalUnreadChats}
                      </span>
                    )}
                  </button>

                  {/* Meetings & Leaves */}
                  <button
                    onClick={() => {
                      setIsLeaveModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium text-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">event_upcoming</span>
                    <span className="truncate">{tMsg('Meetings & Leaves', 'Pertemuan & Cuti')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: MY TASKS */}
            {activeRailTab === 'tasks' && (
              <div className="space-y-3">
                <div className="space-y-0.5">
                  {/* Quick Add Task Button */}
                  <button
                    onClick={() => {
                      setIsFormOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-[#FACC15] font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all mb-1 border border-indigo-200/50 dark:border-indigo-800/40"
                  >
                    <IconPlus className="w-3.5 h-3.5" />
                    <span>{tMsg('Add New Task', 'Tambah Tugas Baru')}</span>
                  </button>

                  {/* Assigned to Me */}
                  <button
                    onClick={() => {
                      setSelectedBoard(null);
                      setShowMyTasks(true);
                      setShowOverdueOnly(false);
                      setShowDueTodayOnly(false);
                      setViewMode('kanban');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                      showMyTasks && !showOverdueOnly
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

                  {/* Today & Overdue */}
                  <button
                    onClick={() => {
                      setSelectedBoard(null);
                      setShowMyTasks(true);
                      setShowOverdueOnly(true);
                      setViewMode('kanban');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                      showOverdueOnly
                        ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold'
                        : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-[18px] text-rose-500">schedule</span>
                      <span className="truncate">{tMsg('Today & Overdue', 'Hari Ini & Terlambat')}</span>
                    </div>
                    {overdueCount > 0 && (
                      <span className="min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center leading-none">
                        {overdueCount}
                      </span>
                    )}
                  </button>

                  {/* Personal Tasks */}
                  {todoListBoard && (
                    <button
                      onClick={() => {
                        setSelectedBoard(todoListBoard);
                        setShowMyTasks(false);
                        setShowOverdueOnly(false);
                        setViewMode('kanban');
                        setIsMobileMenuOpen(false);
                        const slugify = (text) => (text ? text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '');
                        const wsSlug = slugify(activeWorkspace?.name);
                        const targetUrl = `/workspace/${wsSlug}/${activeWorkspace?.id}/project/personal-tasks`;
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
                        <span className="material-symbols-outlined text-[18px] text-amber-500">lock</span>
                        <span className="truncate">{tMsg('Personal Tasks', 'Tugas Pribadi')}</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: SPACES / PROJECTS */}
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
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#111E38] dark:bg-[#FACC15] rounded-r-full"></div>
                  )}
                  <span className="material-symbols-outlined text-[18px]">layers</span>
                  <span className="text-xs truncate font-semibold">{tMsg('All Projects', 'Semua Proyek')}</span>
                </button>

                {/* Team Spaces Tree */}
                <div>
                  <div
                    onClick={() => setIsSpacesTreeOpen(!isSpacesTreeOpen)}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-lg cursor-pointer transition-all hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-[18px]">folder_copy</span>
                      <span className="text-xs truncate font-semibold">{tMsg('Team Spaces', 'Ruang Kerja Tim')}</span>
                    </div>
                    <span
                      className="material-symbols-outlined text-[14px] text-neutral-400 transition-transform duration-200"
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
                    setViewMode('overview');
                    setIsMobileMenuOpen(false);
                    window.history.pushState({}, '', '/dashboard');
                    window.dispatchEvent(new CustomEvent('alurku-navigate'));
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium"
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
                    onClick={handleSaveCurrentView}
                    className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors p-0.5 rounded hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
                    title={tMsg('Save Current Active Filter', 'Simpan Filter Saat Ini')}
                  >
                    <IconPlus className="w-3 h-3" />
                  </button>
                </div>

                {isSavedViewsOpen && (
                  <div className="flex flex-col gap-0.5">
                    {savedViews.map((sv) => (
                      <button
                        key={sv.id}
                        onClick={() => {
                          setSelectedBoard(null);
                          if (sv.type === 'assigned') {
                            setShowMyTasks(true);
                            setShowOverdueOnly(false);
                          } else if (sv.type === 'overdue') {
                            setShowMyTasks(true);
                            setShowOverdueOnly(true);
                          } else if (sv.type === 'custom') {
                            if (sv.filterStatus && setFilterStatus) setFilterStatus(sv.filterStatus);
                            if (sv.filterCategory && setFilterCategory) setFilterCategory(sv.filterCategory);
                            if (sv.filterAssignee && setFilterAssignee) setFilterAssignee(sv.filterAssignee);
                            if (setShowMyTasks) setShowMyTasks(sv.showMyTasks || false);
                            if (setShowOverdueOnly) setShowOverdueOnly(sv.showOverdueOnly || false);
                          }
                          setViewMode('kanban');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[15px] text-indigo-500 dark:text-[#FACC15]">{sv.icon}</span>
                        <span className="truncate">{language === 'id' ? sv.nameId : sv.nameEn}</span>
                      </button>
                    ))}
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
    </>
  );
}
