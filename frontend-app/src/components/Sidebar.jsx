import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Avatar, IconPlus } from '../SharedUI';
import { HighlightText } from '../Utils';

export default function Sidebar() {
  const {
    currentUser,
    boards,
    selectedBoard,
    setSelectedBoard,
    favoriteBoards,
    setFavoriteBoards,
    notifications,
    dmConversations,
    inboxChats,
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
  } = useAppContext();

  const tMsg = (en, id) => (language === 'id' ? id : en);

  // Sidebar collapse & tree expansion states
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('alurku_sidebar_collapsed') === 'true';
    return false;
  });
  const [isMyTasksTreeOpen, setIsMyTasksTreeOpen] = useState(true);
  const [isSpacesTreeOpen, setIsSpacesTreeOpen] = useState(true);
  const [isAIAgentsTreeOpen, setIsAIAgentsTreeOpen] = useState(true);

  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [activeBoardMenuId, setActiveBoardMenuId] = useState(null);
  const [newWsName, setNewWsName] = useState('');
  const [isCreatingWs, setIsCreatingWs] = useState(false);

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

  // Total unread team chats
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

  const sortedBoards = useMemo(() => {
    let sorted = [...boards];
    if (sortMode === 'alphabet') {
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
  }, [boards, sortMode]);

  const displayBoards = useMemo(() => {
    return sortedBoards.filter((b) => b.id !== todoListBoard?.id);
  }, [sortedBoards, todoListBoard]);

  const favorites = useMemo(() => {
    return displayBoards.filter((b) => favoriteBoards.includes(b.id));
  }, [displayBoards, favoriteBoards]);

  const renderBoardItem = (board, isFavoriteSection = false) => {
    const isActive = selectedBoard?.id === board.id;
    const taskCount = getBoardTaskCount(board.id);
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
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
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
          }
        }}
        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all group relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#111E38] ${
          isActive
            ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-semibold'
            : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-600 dark:text-slate-400 font-medium'
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#111E38] dark:bg-[#FACC15] rounded-r-full"></div>
        )}
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-4.5 h-4.5 rounded bg-linear-to-br ${gradient} text-white flex items-center justify-center text-[8px] font-black shrink-0 shadow-2xs opacity-90`}
          >
            {getInitials(board.name)}
          </div>
          {!isCollapsed && (
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
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!isCollapsed && taskCount > 0 && (
            <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">{taskCount}</span>
          )}
          {unreadChats > 0 && (
            <span className="min-w-3.5 h-3.5 px-1 rounded-full bg-[#FACC15] text-[#111E38] text-[9px] font-black flex items-center justify-center leading-none" title={`${unreadChats} unread`}>
              {unreadChats > 9 ? '9+' : unreadChats}
            </span>
          )}
          {board.health_alert?.includes('Attention') && unreadChats === 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Attention Needed"></span>
          )}
          {!isCollapsed && (
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
                        if (favoriteBoards.includes(board.id)) {
                          setFavoriteBoards(favoriteBoards.filter((id) => id !== board.id));
                        } else {
                          setFavoriteBoards([...favoriteBoards, board.id]);
                        }
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                    >
                      <span className="material-symbols-outlined text-sm">{favoriteBoards.includes(board.id) ? 'star_half' : 'star'}</span>
                      {favoriteBoards.includes(board.id) ? tMsg('Unpin', 'Lepas Sematan') : tMsg('Pin Project', 'Sematkan')}
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
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-80 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-90 md:z-50 md:sticky md:top-20 md:h-[calc(100vh-5rem)] md:shrink-0 bg-[#FAFAFA]/95 dark:bg-[#121B2D]/95 backdrop-blur-xl border-r border-neutral-200/50 dark:border-neutral-800/50 flex flex-col transition-all duration-300 ease-in-out transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'w-16' : 'w-60 md:w-64'}`}
      >
        {/* ── ClickUp-Style Workspace Selector & Header Action ── */}
        <div
          className={`hidden md:flex items-center shrink-0 border-b border-neutral-200/50 dark:border-neutral-800/50 ${
            isCollapsed ? 'h-auto py-2.5 flex-col gap-2.5 px-2.5 justify-center' : 'h-14 px-3.5 justify-between gap-2'
          } relative`}
        >
          {isCollapsed ? (
            <>
              {/* Expand Sidebar button at top when collapsed */}
              <button
                onClick={toggleCollapse}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                title="Expand sidebar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <path d="M9 3v18" />
                  <path d="M14 9l3 3-3 3" />
                </svg>
              </button>

              <div className="w-7 h-px bg-neutral-200 dark:bg-neutral-800 my-0.5"></div>

              {workspaces && workspaces.length > 0 && (
                <div className="relative z-60">
                  <button
                    onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                    className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
                    title={`${tMsg('Workspace', 'Ruang Kerja')}: ${activeWorkspace?.name || ''}`}
                  >
                    {activeWorkspace?.name ? activeWorkspace.name.substring(0, 1).toUpperCase() : 'W'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Active Workspace Selector Dropdown (ClickUp Style Top Bar) */}
              <div className="relative flex-1 min-w-0">
                <button
                  onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                  className="w-full flex items-center justify-between gap-2 p-1.5 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 rounded-xl transition-all text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-2xs">
                      {activeWorkspace?.name ? activeWorkspace.name.substring(0, 1).toUpperCase() : 'W'}
                    </div>
                    <span className="font-extrabold text-xs text-[#111E38] dark:text-white truncate">
                      {activeWorkspace?.name || 'Workspace'}
                    </span>
                  </div>
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

              {/* ClickUp Style + Create Quick Button */}
              <button
                onClick={() => {
                  setIsCreateBoardOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="px-2 py-1 bg-[#111E38] dark:bg-[#FACC15] text-white dark:text-[#111E38] text-xs font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1 shrink-0"
                title={tMsg('Quick Create Task/Project', 'Buat Cepat')}
              >
                <IconPlus className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{tMsg('Create', 'Buat')}</span>
              </button>

              {/* Collapse Sidebar toggle button */}
              <button
                onClick={toggleCollapse}
                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors shrink-0 ml-1"
                title="Collapse sidebar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <path d="M9 3v18" />
                  <path d="M15 9l-3 3 3 3" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* ── Complete ClickUp-Grade Scrollable Navigation Menu ── */}
        <div className={`flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar ${isCollapsed ? 'pt-2' : 'pt-3'}`}>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* SECTION 1: HOME & PERSONAL TASKS                              */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="mb-3">
            {!isCollapsed && (
              <div className="px-2.5 mb-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {tMsg('Home', 'Utama')}
              </div>
            )}

            {/* Inbox & Notifications */}
            <button
              onClick={() => {
                setIsNotifOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all relative ${
                isNotifOpen
                  ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-bold'
                  : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-600 dark:text-slate-400 font-medium'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={tMsg('Inbox & Replies', 'Inbox & Notifikasi')}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">inbox</span>
                </div>
                {!isCollapsed && <span className="text-xs truncate">{tMsg('Inbox & Replies', 'Inbox & Notifikasi')}</span>}
              </div>
              {!isCollapsed && unreadCount > 0 && (
                <span className="min-w-4 h-4 px-1.5 rounded-full bg-[#FACC15] text-[#111E38] text-[9px] font-black flex items-center justify-center leading-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* My Tasks Tree (Expandable ClickUp Style Folder) */}
            <div>
              <div
                onClick={() => setIsMyTasksTreeOpen(!isMyTasksTreeOpen)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-600 dark:text-slate-400 font-medium ${
                  isCollapsed ? 'justify-center' : ''
                }`}
                title={tMsg('My Tasks', 'Tugas Saya')}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">task_alt</span>
                  </div>
                  {!isCollapsed && <span className="text-xs truncate font-semibold">{tMsg('My Tasks', 'Tugas Saya')}</span>}
                </div>
                {!isCollapsed && (
                  <span className="material-symbols-outlined text-[14px] text-neutral-400 transition-transform duration-200" style={{ transform: isMyTasksTreeOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    expand_more
                  </span>
                )}
              </div>

              {/* Sub-Items Tree */}
              {isMyTasksTreeOpen && !isCollapsed && (
                <div className="ml-4 pl-2 border-l border-neutral-200/70 dark:border-neutral-800 flex flex-col gap-0.5 mt-0.5">
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
                    className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-xs transition-colors ${
                      showMyTasks && !showOverdueOnly
                        ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-bold'
                        : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-600 dark:text-slate-400 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[15px]">person_check</span>
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
                    className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-xs transition-colors ${
                      showOverdueOnly
                        ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold'
                        : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-600 dark:text-slate-400 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[15px] text-rose-500">schedule</span>
                      <span className="truncate">{tMsg('Today & Overdue', 'Hari Ini & Terlambat')}</span>
                    </div>
                    {overdueCount > 0 && (
                      <span className="min-w-3.5 h-3.5 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center leading-none">
                        {overdueCount}
                      </span>
                    )}
                  </button>

                  {/* Personal List */}
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
                      className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-xs transition-colors ${
                        selectedBoard?.id === todoListBoard.id
                          ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-bold'
                          : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-600 dark:text-slate-400 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="material-symbols-outlined text-[15px] text-amber-500">lock</span>
                        <span className="truncate">{tMsg('Personal List', 'Catatan Pribadi')}</span>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Assigned Comments */}
            <button
              onClick={() => {
                setIsProjectChatOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-600 dark:text-slate-400 font-medium"
              title={tMsg('Assigned Comments & Chat', 'Komentar & Obrolan')}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">forum</span>
                </div>
                {!isCollapsed && <span className="text-xs truncate">{tMsg('Assigned Comments', 'Komentar & Sebutan')}</span>}
              </div>
              {!isCollapsed && totalUnreadChats > 0 && (
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
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-600 dark:text-slate-400 font-medium"
              title={tMsg('Meetings & Leaves', 'Pertemuan & Pengajuan Cuti')}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">event_upcoming</span>
              </div>
              {!isCollapsed && <span className="text-xs truncate">{tMsg('Meetings & Leaves', 'Pertemuan & Cuti')}</span>}
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* SECTION 2: SPACES & PROJECTS (PROYEK TIM)                     */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="mb-3">
            {!isCollapsed && (
              <div className="flex items-center justify-between px-2.5 mb-1">
                <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  {tMsg('Spaces', 'Proyek')}
                </span>
                <button
                  onClick={() => {
                    setIsCreateBoardOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={accountStatus === 'suspended'}
                  className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors p-0.5 rounded hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
                  title={tMsg('New Space', 'Proyek Baru')}
                >
                  <IconPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

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
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all tour-global-board relative ${
                selectedBoard?.id === 'global'
                  ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-bold'
                  : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-600 dark:text-slate-400 font-medium'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={tMsg('All Tasks & Projects (Master View)', 'Semua Tugas & Proyek')}
            >
              {selectedBoard?.id === 'global' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#111E38] dark:bg-[#FACC15] rounded-r-full"></div>
              )}
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">layers</span>
              </div>
              {!isCollapsed && <span className="text-xs truncate font-semibold">{tMsg('All Projects', 'Semua Proyek')}</span>}
            </button>

            {/* Expandable Team Spaces Tree */}
            <div>
              <div
                onClick={() => setIsSpacesTreeOpen(!isSpacesTreeOpen)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-600 dark:text-slate-400 font-medium"
                title={tMsg('Team Spaces', 'Ruang Kerja Tim')}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">folder_copy</span>
                  </div>
                  {!isCollapsed && <span className="text-xs truncate font-semibold">{tMsg('Team Spaces', 'Ruang Kerja Tim')}</span>}
                </div>
                {!isCollapsed && (
                  <span className="material-symbols-outlined text-[14px] text-neutral-400 transition-transform duration-200" style={{ transform: isSpacesTreeOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    expand_more
                  </span>
                )}
              </div>

              {isSpacesTreeOpen && !isCollapsed && (
                <div className="ml-4 pl-2 border-l border-neutral-200/70 dark:border-neutral-800 flex flex-col gap-0.5 mt-0.5">
                  {/* Pinned Projects */}
                  {favorites.length > 0 && (
                    <div className="mb-1">
                      <div className="px-2 py-0.5 text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                        {tMsg('Pinned', 'Disematkan')}
                      </div>
                      {favorites.map((b) => renderBoardItem(b, true))}
                    </div>
                  )}

                  {/* Project List */}
                  {displayBoards.length === 0 ? (
                    <div className="px-2 py-1 text-xs text-neutral-400 italic">{tMsg('No projects yet', 'Belum ada proyek')}</div>
                  ) : (
                    displayBoards.map((b) => renderBoardItem(b))
                  )}

                  {/* Team Docs */}
                  <button
                    onClick={() => {
                      setIsDocsOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-600 dark:text-slate-400 font-medium"
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
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-500 dark:text-slate-400 font-medium"
              title={tMsg('Archived Projects', 'Proyek Diarsipkan')}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              </div>
              {!isCollapsed && <span className="text-xs truncate">{tMsg('Archived Projects', 'Proyek Diarsipkan')}</span>}
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* SECTION 3: AI CHATS & SUPER AGENTS (ASISTEN AI)               */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="mb-3">
            {!isCollapsed && (
              <div className="px-2.5 mb-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {tMsg('AI & Agents', 'Asisten AI')}
              </div>
            )}

            {/* Tanya Luruka AI - Brand Yellow AI CTA */}
            <button
              onClick={() => {
                setSelectedBoard(null);
                setIsProactiveAIOpen(true);
                setIsMobileMenuOpen(false);
                window.history.pushState({}, '', '/proactive-ai');
                window.dispatchEvent(new CustomEvent('alurku-navigate'));
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all border ${
                window.location.pathname === '/proactive-ai' && !selectedBoard
                  ? 'bg-[#FACC15] border-[#FACC15] text-[#111E38] font-black shadow-2xs'
                  : 'bg-[#FACC15]/10 border-[#FACC15]/30 hover:bg-[#FACC15]/20 hover:border-[#FACC15]/60 text-[#111E38] dark:text-[#FACC15] font-bold'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title="Tanya Luruka AI"
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              {!isCollapsed && <span className="text-xs truncate">{tMsg('Ask Luruka AI', 'Tanya Luruka AI')}</span>}
            </button>

            {/* Super Agents Tree */}
            {!isCollapsed && (
              <div className="ml-3 pl-2 border-l border-neutral-200/70 dark:border-neutral-800 flex flex-col gap-0.5 mt-1">
                {/* Onboarding Agent */}
                <button
                  onClick={() => {
                    startTour();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-600 dark:text-slate-400 font-medium"
                >
                  <span className="material-symbols-outlined text-[15px] text-emerald-500">flag</span>
                  <span className="truncate">{tMsg('Onboarding Tour', 'Tur Workspace')}</span>
                </button>

                {/* Workload Analytics Agent */}
                <button
                  onClick={() => {
                    setViewMode('overview');
                    setSelectedBoard(null);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-600 dark:text-slate-400 font-medium"
                >
                  <span className="material-symbols-outlined text-[15px] text-indigo-500">insights</span>
                  <span className="truncate">{tMsg('Workload Analytics', 'Analisis Beban Kerja')}</span>
                </button>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* SECTION 4: DUKUNGAN & TIKET                                    */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="mb-2">
            {!isCollapsed && (
              <div className="px-2.5 mb-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {tMsg('Support', 'Dukungan')}
              </div>
            )}

            {/* My Tickets */}
            <button
              onClick={() => {
                setIsMyTicketsOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-600 dark:text-slate-400 font-medium"
              title={tMsg('My Support Tickets', 'Tiket Bantuan Saya')}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
              </div>
              {!isCollapsed && <span className="text-xs truncate">{tMsg('My Tickets', 'Tiket Saya')}</span>}
            </button>

            {/* Help & Support */}
            <button
              onClick={() => {
                setIsSupportOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-600 dark:text-slate-400 font-medium"
              title={tMsg('Help & Support', 'Bantuan & Dukungan')}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">help</span>
              </div>
              {!isCollapsed && <span className="text-xs truncate">{tMsg('Help & Support', 'Bantuan & Dukungan')}</span>}
            </button>
          </div>

        </div>

        {/* ── Pinned Bottom Footer ── */}
        <div className="shrink-0 border-t border-neutral-200/60 dark:border-neutral-800/60 p-2 flex flex-col gap-1">

          {/* User Profile Card */}
          <div className="pt-0.5">
            <div
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? `${currentUser} — ${accountStatus === 'free' ? tMsg('Free Plan', 'Paket Gratis') : tMsg('Pro Plan', 'Paket Pro')}` : undefined}
            >
              <div className="shrink-0">
                <Avatar username={currentUser} size={24} avatarUrl={avatarsMap?.[currentUser]} />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-neutral-200 truncate leading-tight">{currentUser}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {accountStatus === 'free' ? (
                      <>
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500">{tMsg('Free Plan', 'Paket Gratis')}</span>
                        <span className="text-neutral-300 dark:text-neutral-700 text-[10px]">·</span>
                        <button
                          onClick={() => {
                            window.history.pushState({}, '', '/billing');
                            window.dispatchEvent(new CustomEvent('alurku-navigate'));
                          }}
                          className="text-[10px] font-bold text-[#111E38] dark:text-[#FACC15] hover:underline transition-colors"
                        >
                          {tMsg('Upgrade', 'Upgrade')} ↑
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">{tMsg('Pro Plan', 'Paket Pro')} ✓</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </aside>
    </>
  );
}
