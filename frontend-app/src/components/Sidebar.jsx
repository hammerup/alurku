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
    setIsSupportOpen,
    setIsProjectChatOpen,
    setDrawerTab,
    startTour,
    isInstallable,
    handleInstallClick,
    isSuperAdmin,
    openAdminModal,
    setBoardToDelete,
    workspaces,
    activeWorkspace,
    createWorkspace,
    switchWorkspace,
  } = useAppContext();

  const tMsg = (en, id) => (language === 'id' ? id : en);

  // Sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('alurku_sidebar_collapsed') === 'true';
    return false;
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
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

  const unreadInboxChatsCount = useMemo(() => {
    return (inboxChats || []).filter(chat => {
      if (chat.latest_sender === currentUser) return false;
      if (chat.is_dm) return (chat.unread_count || 0) > 0;
      if (chat.is_project_chat) {
        const lastRead = localStorage.getItem(`alurku_last_read_board_${chat.board_id}_${currentUser}`);
        const hasUnreadNotification = (notifications || []).some(
          n => !n.is_read && String(n.related_task_id) === String(chat.board_id) && 
          (n.type === 'team_chat' || n.type === 'team_chat_no_email' || n.type === 'mention' || n.type === 'mention_no_email')
        );
        if (!lastRead) return true;
        return chat.timestamp > lastRead || hasUnreadNotification;
      } else {
        const lastRead = localStorage.getItem(`alurku_last_read_task_${chat.task_id}_${currentUser}`);
        const hasUnreadNotification = (notifications || []).some(
          n => !n.is_read && String(n.related_task_id) === String(chat.task_id) && 
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
    return boards.find((b) => b.name.toLowerCase() === 'to-do list' && b.is_private);
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

  const matchedGlobalBoards = useMemo(() => {
    if (globalSearchQuery.trim().length < 2) return [];
    const keywords = globalSearchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    return boards.filter((b) => {
      const searchStr = `${b.name} ${b.owner_username}`.toLowerCase();
      return keywords.every((kw) => searchStr.includes(kw));
    });
  }, [globalSearchQuery, boards]);

  const renderBoardItem = (board, isFavoriteSection = false) => {
    const isActive = selectedBoard?.id === board.id;
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
          window.history.pushState({}, '', '/dashboard');
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
            window.history.pushState({}, '', '/dashboard');
            window.dispatchEvent(new CustomEvent('alurku-navigate'));
          }
        }}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all group relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          isActive
            ? 'bg-neutral-100 dark:bg-neutral-800/50 text-black dark:text-white'
            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-400'
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-black dark:bg-white rounded-r-md"></div>
        )}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-6 h-6 rounded-md bg-linear-to-br ${gradient} text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm opacity-90`}
          >
            {getInitials(board.name)}
          </div>
          {!isCollapsed && (
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className={`text-sm truncate font-medium ${isActive ? 'font-bold' : ''}`}>{board.name}</span>
              {!!board.is_private && (
                <span className="opacity-60 shrink-0" title={tMsg('Private Project', 'Proyek Privat')}>
                  <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (favoriteBoards.includes(board.id)) {
                    setFavoriteBoards(favoriteBoards.filter((id) => id !== board.id));
                  } else {
                    setFavoriteBoards([...favoriteBoards, board.id]);
                  }
                }}
                className={`p-1 rounded transition-opacity ${
                  favoriteBoards.includes(board.id)
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100'
                }`}
                title={
                  favoriteBoards.includes(board.id)
                    ? tMsg('Unpin Project', 'Lepas Sematan')
                    : tMsg('Pin Project', 'Sematkan Proyek')
                }
              >
                {favoriteBoards.includes(board.id) ? (
                  <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-neutral-300 hover:text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                )}
              </button>
              {(isSuperAdmin || board.owner_username === currentUser) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setBoardToDelete(board);
                  }}
                  className="p-1 rounded text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title={tMsg('Delete Project', 'Hapus Proyek')}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </button>
              )}
            </div>
          )}
          {unreadChats > 0 && <span className="w-2 h-2 rounded-full bg-red-500" title={`${unreadChats} unread`}></span>}
          {board.health_alert?.includes('Attention') && unreadChats === 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500" title="Attention Needed"></span>
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
        } ${isCollapsed ? 'w-16' : 'w-64 md:w-72'}`}
      >
        <div
          className={`hidden md:flex items-center shrink-0 border-b border-neutral-200/50 dark:border-neutral-800/50 ${
            isCollapsed ? 'h-auto py-3 flex-col gap-2 px-3 justify-center' : 'h-16 px-4 justify-between'
          } relative`}
        >
          {isCollapsed ? (
            <>
              {/* Compact Workspace Switcher when collapsed */}
              {workspaces && workspaces.length > 0 && (
                <div className="relative z-60">
                  <button
                    onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                    className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
                    title={`${tMsg('Workspace', 'Ruang Kerja')}: ${activeWorkspace?.name || ''}`}
                  >
                    {activeWorkspace?.name ? activeWorkspace.name.substring(0, 1).toUpperCase() : 'W'}
                  </button>
                  {isWorkspaceMenuOpen && (
                    <div className="absolute left-full top-0 ml-2 w-60 bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl shadow-xl z-60 p-1.5 animate-fadeIn">
                      <div className="max-h-48 overflow-y-auto space-y-0.5">
                        {workspaces.map((ws) => (
                          <button
                            key={`ws-opt-${ws.id}`}
                            onClick={() => {
                              switchWorkspace(ws);
                              setIsWorkspaceMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                              ws.id === activeWorkspace?.id
                                ? 'bg-[#111E38] dark:bg-[#FACC15]/15 text-white dark:text-[#FACC15] font-bold'
                                : 'hover:bg-slate-100 dark:hover:bg-neutral-900 text-slate-700 dark:text-neutral-400'
                            }`}
                          >
                            <span className="truncate">{ws.name}</span>
                            {ws.id === activeWorkspace?.id && (
                              <span className="text-xs text-white dark:text-[#FACC15]">✓</span>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="border-t border-slate-100 dark:border-neutral-800 mt-1.5 pt-1.5 px-1.5">
                        {isCreatingWs ? (
                          <form onSubmit={handleCreateWsSubmit} className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder={tMsg('New Workspace Name', 'Nama Workspace Baru')}
                              value={newWsName}
                              onChange={(e) => setNewWsName(e.target.value)}
                              className="flex-1 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-xs rounded-lg px-2.5 py-1.5 outline-none text-black dark:text-white"
                              autoFocus
                            />
                            <button
                              type="submit"
                              className="px-2.5 py-1.5 bg-[#111E38] dark:bg-[#FACC15] text-white dark:text-[#111E38] text-xs font-bold rounded-lg hover:bg-[#1a2d52] dark:hover:bg-yellow-400 transition-colors"
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsCreatingWs(false)}
                              className="px-2 py-1.5 bg-slate-100 dark:bg-neutral-800 text-neutral-500 text-xs rounded-lg hover:bg-slate-200 transition-colors"
                            >
                              ✕
                            </button>
                          </form>
                        ) : (
                          <button
                            onClick={() => setIsCreatingWs(true)}
                            className="w-full text-center py-1.5 bg-[#111E38]/8 hover:bg-[#111E38] text-[#111E38] hover:text-white dark:bg-[#FACC15]/10 dark:hover:bg-[#FACC15]/20 dark:text-[#FACC15] text-xs font-bold rounded-lg transition-all border border-[#111E38]/15 dark:border-transparent"
                          >
                            + {tMsg('Create Workspace', 'Buat Workspace')}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Expand Sidebar button under switcher when collapsed */}
              <button
                onClick={toggleCollapse}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                title="Expand sidebar"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <path d="M9 3v18" />
                  <path d="M14 9l3 3-3 3" />
                </svg>
              </button>
            </>
          ) : (
            <>
              {/* Workspace Switcher in Header */}
              {workspaces && workspaces.length > 0 && (
                <div className="relative flex-1 min-w-0 mr-2 z-60">
                  <button
                    onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                    className="flex items-center gap-1.5 w-full hover:bg-neutral-100 dark:hover:bg-neutral-800/50 p-1.5 rounded-lg transition-colors text-left min-w-0"
                  >
                    <div className="w-5 h-5 rounded bg-linear-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs">
                      {activeWorkspace?.name ? activeWorkspace.name.substring(0, 1).toUpperCase() : 'W'}
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-neutral-200 truncate flex-1 leading-none">
                      {activeWorkspace?.name || 'Workspace'}
                    </span>
                    <svg className="w-3.5 h-3.5 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isWorkspaceMenuOpen && (
                    <div className="absolute left-0 w-60 mt-2 bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl shadow-xl z-60 p-1.5">
                      <div className="max-h-48 overflow-y-auto space-y-0.5">
                        {workspaces.map((ws) => (
                          <button
                            key={`ws-opt-${ws.id}`}
                            onClick={() => {
                              switchWorkspace(ws);
                              setIsWorkspaceMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                              ws.id === activeWorkspace?.id
                                ? 'bg-[#111E38] dark:bg-[#FACC15]/15 text-white dark:text-[#FACC15] font-bold'
                                : 'hover:bg-slate-100 dark:hover:bg-neutral-900 text-slate-700 dark:text-neutral-400'
                            }`}
                          >
                            <span className="truncate">{ws.name}</span>
                            {ws.id === activeWorkspace?.id && (
                              <span className="text-xs text-white dark:text-[#FACC15]">✓</span>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="border-t border-slate-100 dark:border-neutral-800 mt-1.5 pt-1.5 px-1.5">
                        {isCreatingWs ? (
                          <form onSubmit={handleCreateWsSubmit} className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder={tMsg('New Workspace Name', 'Nama Workspace Baru')}
                              value={newWsName}
                              onChange={(e) => setNewWsName(e.target.value)}
                              className="flex-1 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-xs rounded-lg px-2.5 py-1.5 outline-none text-black dark:text-white"
                              autoFocus
                            />
                            <button
                              type="submit"
                              className="px-2.5 py-1.5 bg-[#111E38] dark:bg-[#FACC15] text-white dark:text-[#111E38] text-xs font-bold rounded-lg hover:bg-[#1a2d52] dark:hover:bg-yellow-400 transition-colors"
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsCreatingWs(false)}
                              className="px-2 py-1.5 bg-slate-100 dark:bg-neutral-800 text-neutral-500 text-xs rounded-lg hover:bg-slate-200 transition-colors"
                            >
                              ✕
                            </button>
                          </form>
                        ) : (
                          <button
                            onClick={() => setIsCreatingWs(true)}
                            className="w-full text-center py-1.5 bg-[#111E38]/8 hover:bg-[#111E38] text-[#111E38] hover:text-white dark:bg-[#FACC15]/10 dark:hover:bg-[#FACC15]/20 dark:text-[#FACC15] text-xs font-bold rounded-lg transition-all border border-[#111E38]/15 dark:border-transparent"
                          >
                            + {tMsg('Create Workspace', 'Buat Workspace')}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Collapse button aligned to the right */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCollapse();
                }}
                className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white transition-colors rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center shrink-0 ml-auto"
                title="Collapse sidebar"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <path d="M9 3v18" />
                  <path d="M16 15l-3-3 3-3" />
                </svg>
              </button>
            </>
          )}
        </div>

        {isCollapsed ? (
          <div className="flex flex-col items-center gap-4 py-4 border-b border-neutral-200/50 dark:border-neutral-800/50 shrink-0">
            {/* Collapsed Search Button */}
            <button
              onClick={() => {
                toggleCollapse();
                setTimeout(() => {
                  const inputEl = document.querySelector('input[placeholder*="Search"]');
                  if (inputEl) inputEl.focus();
                }, 150);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              title={tMsg('Search everywhere...', 'Cari dimana saja...')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* Collapsed Add New Project Button */}
            <button
              onClick={() => {
                setIsCreateBoardOpen(true);
                setIsMobileMenuOpen(false);
              }}
              disabled={accountStatus === 'suspended'}
              className="w-8 h-8 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black hover:opacity-80 font-bold rounded-lg transition-opacity disabled:opacity-50 shadow-xs"
              title={tMsg('New Project', 'Proyek Baru')}
            >
              <IconPlus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="px-4 pt-5 pb-2 shrink-0 relative">
            <div className="relative mb-3 group z-50">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder={tMsg('Search everywhere...', 'Cari dimana saja...')}
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                onFocus={() => {
                  if (globalSearchQuery.length > 0) setIsGlobalSearchOpen(true);
                }}
                className="w-full bg-neutral-100/50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 focus:bg-white dark:focus:bg-black text-black dark:text-white text-sm rounded-lg pl-9 pr-8 py-2 outline-none transition-all placeholder-neutral-400 shadow-inner"
              />
              {globalSearchQuery && (
                <button
                  onClick={() => {
                    setGlobalSearchQuery('');
                    closeGlobalSearch();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white flex items-center justify-center"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}

              {/* Global Search Results Overlay */}
              {isGlobalSearchOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={closeGlobalSearch}></div>
                  <div
                    className={`absolute top-full left-0 mt-3 w-full sm:w-87.5 bg-white/95 dark:bg-neutral-950/95 
                  backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-2xl overflow-hidden z-50 flex 
                  flex-col max-h-100 origin-top ${isGlobalSearchClosing ? 'mac-exit' : 'mac-animate'}`}
                  >
                    <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                        Global Search Results
                      </span>
                    </div>
                    {globalSearchResults.length > 0 || matchedGlobalBoards.length > 0 ? (
                      <div className="overflow-y-auto py-2">
                        {matchedGlobalBoards.length > 0 && (
                          <div className="mb-2">
                            <div className="px-5 py-1.5 text-[9px] font-bold text-black dark:text-white uppercase tracking-widest bg-neutral-100 dark:bg-neutral-900">
                              📁 Projects
                            </div>
                            {matchedGlobalBoards.map((b) => (
                              <div
                                key={`gb-${b.id}`}
                                onClick={() => {
                                  setSelectedBoard(b);
                                  setGlobalSearchQuery('');
                                  closeGlobalSearch();
                                }}
                                className="px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer border-b border-neutral-100 dark:border-neutral-800/50 transition-colors flex items-center gap-3"
                              >
                                <svg className="w-5 h-5 text-neutral-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                </svg>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-sm font-bold text-black dark:text-white truncate">
                                    <HighlightText text={b.name} query={globalSearchQuery} />
                                  </span>
                                  <span className="text-[10px] text-neutral-500 font-medium truncate">
                                    Owned by @<HighlightText text={b.owner_username} query={globalSearchQuery} />
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {globalSearchResults.length > 0 && (
                          <div className="mb-1">
                            <div className="px-5 py-1.5 text-[9px] font-bold text-black dark:text-white uppercase tracking-widest bg-neutral-100 dark:bg-neutral-900">
                              📋 Tasks
                            </div>
                            {globalSearchResults.map((t) => (
                              <div
                                key={t.id}
                                onClick={() => handleGlobalSearchSelect(t)}
                                className="px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer border-b border-neutral-100 dark:border-neutral-800/50 last:border-0 transition-colors flex flex-col gap-1.5"
                              >
                                <div className="flex justify-between items-start">
                                  <span className="text-sm font-bold text-black dark:text-white truncate mr-2">
                                    <HighlightText text={t.project_name} query={globalSearchQuery} />
                                  </span>
                                  <span
                                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shrink-0 ${
                                      t.status === 'Done'
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}
                                  >
                                    {t.status}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-neutral-500">
                                  <span
                                    className="truncate text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 hover:underline cursor-pointer transition-colors max-w-30 inline-flex items-center gap-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const board = boards.find((b) => b.id === t.board_id);
                                      if (board) {
                                        setSelectedBoard(board);
                                        setGlobalSearchQuery('');
                                        closeGlobalSearch();
                                      }
                                    }}
                                  >
                                    <svg className="w-3.5 h-3.5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                    </svg>
                                    <HighlightText text={t.board_name} query={globalSearchQuery} />
                                  </span>
                                  {t.category && (
                                    <>
                                      <span className="text-neutral-300 dark:text-neutral-700">&bull;</span>
                                      <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                                        {t.category}
                                      </span>
                                    </>
                                  )}
                                  {t.requester && (
                                    <>
                                      <span className="text-neutral-300 dark:text-neutral-700">&bull;</span>
                                      <span className="truncate flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                        <svg className="w-3 h-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                          <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        <HighlightText text={t.requester} query={globalSearchQuery} />
                                      </span>
                                    </>
                                  )}
                                  {t.deadline && (
                                    <>
                                      <span className="text-neutral-300 dark:text-neutral-700">&bull;</span>
                                      <span className="text-neutral-500 dark:text-slate-400 text-[10px] font-medium flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                          <line x1="16" y1="2" x2="16" y2="6" />
                                          <line x1="8" y1="2" x2="8" y2="6" />
                                          <line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                        {formatDateMMM(t.deadline)}
                                      </span>
                                    </>
                                  )}
                                  {t.priority_str && t.status !== 'Done' && t.status !== 'Rejected' && (
                                    <>
                                      <span className="text-neutral-300 dark:text-neutral-700">&bull;</span>
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                          t.priority_lvl === 'critical'
                                            ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                            : t.priority_lvl === 'warning'
                                            ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                            : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                        }`}
                                      >
                                        {t.priority_str}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-neutral-500">
                        {tMsg('No projects or tasks found.', 'Tidak ada proyek atau tugas ditemukan.')}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => {
                setIsCreateBoardOpen(true);
                setIsMobileMenuOpen(false);
              }}
              disabled={accountStatus === 'suspended'}
              className="w-full flex items-center gap-2 justify-center bg-black dark:bg-white text-white dark:text-black hover:opacity-80 font-bold py-2 px-4 rounded-lg transition-opacity disabled:opacity-50 text-sm shadow-sm"
            >
              <IconPlus className="w-4 h-4" /> {tMsg('New Project', 'Proyek Baru')}
            </button>
          </div>
        )}

        <div
          className={`flex-1 overflow-y-auto px-3 pb-2 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800 scrollbar-track-transparent ${
            isCollapsed ? 'pt-0' : 'pt-2'
          }`}
        >

          <div className="mb-2">
            <button
              onClick={() => {
                setSelectedBoard(null);
                setViewMode('overview');
                setIsMobileMenuOpen(false);
                setIsProactiveAIOpen(false);
                window.history.pushState({}, '', '/dashboard');
                window.dispatchEvent(new CustomEvent('alurku-navigate'));
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                window.location.pathname === '/dashboard' && !selectedBoard
                  ? 'bg-neutral-100 dark:bg-neutral-800/50 text-black dark:text-white font-bold'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-400 font-medium'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={tMsg('Personal Dashboard', 'Dasbor Pribadi')}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl text-slate-500 dark:text-slate-400">home</span>
              </div>
              {!isCollapsed && (
                <span className="text-sm truncate">{tMsg('Personal Dashboard', 'Dasbor Pribadi')}</span>
              )}
            </button>
          </div>

          <div className="mb-2">
            <button
              onClick={() => {
                setSelectedBoard(null);
                setViewMode('overview');
                setIsMobileMenuOpen(false);
                setIsProactiveAIOpen(false);
                const slug = activeWorkspace?.name 
                  ? activeWorkspace.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') 
                  : 'main';
                window.history.pushState({}, '', `/workspace/${slug}`);
                window.dispatchEvent(new CustomEvent('alurku-navigate'));
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                window.location.pathname.startsWith('/workspace') && !selectedBoard
                  ? 'bg-neutral-100 dark:bg-neutral-800/50 text-black dark:text-white font-bold'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-400 font-medium'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={tMsg('Workspace Overview', 'Ringkasan Ruang Kerja')}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl text-slate-500 dark:text-slate-400">dashboard</span>
              </div>
              {!isCollapsed && (
                <span className="text-sm truncate">{tMsg('Workspace Overview', 'Ringkasan Ruang Kerja')}</span>
              )}
            </button>
          </div>

          <div className="mb-2">
            <button
              onClick={() => {
                setSelectedBoard(null);
                setIsProactiveAIOpen(true);
                setIsMobileMenuOpen(false);
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new CustomEvent('alurku-navigate'));
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                window.location.pathname === '/' && !selectedBoard
                  ? 'bg-neutral-100 dark:bg-neutral-800/50 text-black dark:text-white font-bold'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-400 font-medium'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title="Chat Luruka"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl text-slate-500 dark:text-slate-400">bolt</span>
              </div>
              {!isCollapsed && (
                <span className="text-sm truncate">Chat Luruka</span>
              )}
            </button>
          </div>

          <div className={`mb-2 ${isCollapsed ? 'mt-0' : 'mt-2'}`}>
            <button
              onClick={() => {
                setSelectedBoard({
                  id: 'global',
                  name: `${tMsg('See the Big Picture', 'Lihat Gambaran Besar')}`,
                  owner_username: currentUser,
                  role: 'owner',
                  isVirtual: true,
                });
                setIsMobileMenuOpen(false);
                setIsProactiveAIOpen(false);
                window.history.pushState({}, '', '/dashboard');
                window.dispatchEvent(new CustomEvent('alurku-navigate'));
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all tour-global-board ${
                selectedBoard?.id === 'global'
                  ? 'bg-neutral-100 dark:bg-neutral-800/50 text-black dark:text-white font-bold'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-400 font-medium'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={tMsg('See the Big Picture', 'Lihat Gambaran Besar')}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              {!isCollapsed && (
                <span className="text-sm truncate">{tMsg('See the Big Picture', 'Lihat Gambaran Besar')}</span>
              )}
            </button>
          </div>

          {todoListBoard && (
            <div className="mb-6 pb-2 border-b border-neutral-100 dark:border-neutral-800/50 tour-my-todolist">
              <button
                onClick={() => {
                  setSelectedBoard(todoListBoard);
                  setIsMobileMenuOpen(false);
                  setIsProactiveAIOpen(false);
                  window.history.pushState({}, '', '/dashboard');
                  window.dispatchEvent(new CustomEvent('alurku-navigate'));
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  selectedBoard?.id === todoListBoard.id
                    ? 'bg-neutral-100 dark:bg-neutral-800/50 text-black dark:text-white font-bold'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-400 font-medium'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={tMsg('My To-Do List', 'Daftar Tugas Saya')}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                {!isCollapsed && <span className="text-sm truncate">{tMsg('My To-Do List', 'Daftar Tugas Saya')}</span>}
              </button>
            </div>
          )}

          {favorites.length > 0 && (
            <div className="mb-6">
              {!isCollapsed && (
                <h3 className="px-3 text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mb-2">
                  {tMsg('Pinned Projects', 'Proyek Disematkan')}
                </h3>
              )}
              <div className="flex flex-col gap-0.5">{favorites.map((b) => renderBoardItem(b, true))}</div>
            </div>
          )}

          <div className="mb-4">
            {!isCollapsed && (
              <div className="flex items-center justify-between px-3 mb-2">
                <h3 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em]">
                  {tMsg('All Projects', 'Semua Proyek')}
                </h3>
                <select
                  value={sortMode}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-transparent text-[10px] text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer outline-none font-bold uppercase tracking-wider text-right"
                  title={tMsg('Sort Projects', 'Urutkan Proyek')}
                >
                  <option value="recent" className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                    {tMsg('Recent', 'Terbaru')}
                  </option>
                  <option value="active" className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                    {tMsg('Active', 'Teraktif')}
                  </option>
                  <option value="alphabet" className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                    {tMsg('A-Z', 'A-Z')}
                  </option>
                </select>
              </div>
            )}
            <div className="flex flex-col gap-0.5 tour-project-card">
              {displayBoards.length === 0
                ? !isCollapsed && (
                    <div className="px-3 py-2 text-xs text-neutral-400 italic">
                      {tMsg('No projects yet', 'Belum ada proyek')}
                    </div>
                  )
                : displayBoards.map((b) => renderBoardItem(b))}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-neutral-200/50 dark:border-neutral-800/50 shrink-0 bg-white dark:bg-neutral-950 relative">
          <div
            className={`flex ${
              isCollapsed ? 'flex-col' : 'items-center justify-between'
            } gap-1 mb-2 tour-quick-actions`}
          >
            <button
              onClick={() => setIsChatWorkspaceOpen(true)}
              className="flex-1 flex justify-center items-center py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-400 transition-colors relative"
              title={tMsg('Chat', 'Obrolan')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              {totalUnreadChats > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white dark:border-black scale-90 min-w-4 text-center leading-none">
                  {totalUnreadChats}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setExportMode('global');
                setIsExportModalOpen(true);
              }}
              className="flex-1 flex justify-center items-center py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-400 transition-colors"
              title={tMsg('Get All My Data', 'Dapatkan Semua Data')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="flex-1 flex justify-center items-center py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-400 transition-colors relative"
              title={tMsg('Notifications', 'Notifikasi')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white dark:border-black scale-90 min-w-4 text-center leading-none">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex-1 flex justify-center items-center py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-400 transition-colors"
              title={tMsg('Settings', 'Pengaturan')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>

          {/* Notification dropdown panel - shown inline at bottom of sidebar (Desktop only) */}
          <div className="hidden md:block">
            {isNotifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
                <div className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl z-50 flex flex-col max-h-112.5 overflow-hidden">
                  <div className="p-3 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center sticky top-0 bg-white dark:bg-neutral-900">
                    <h3 className="font-bold text-sm text-black dark:text-white">
                      {tMsg('Notifications', 'Notifikasi')}
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleReadAllNotifications}
                        className="text-xs text-indigo-500 font-bold hover:underline"
                      >
                        {tMsg('Mark all read', 'Tandai semua dibaca')}
                      </button>
                    )}
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-neutral-400 text-sm">
                        <span className="text-3xl block mb-2">📭</span>
                        {tMsg('No notifications yet.', 'Belum ada notifikasi.')}
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.is_read) handleReadNotification(n.id);
                            if (
                              n.related_task_id &&
                              n.type !== 'team_chat' &&
                              n.type !== 'team_chat_no_email' &&
                              n.type !== 'team_invite' &&
                              n.type !== 'access_request'
                            ) {
                              handleNotificationTaskClick(n.related_task_id);
                            } else if (n.type === 'team_invite') {
                              setIsInvitesModalOpen(true);
                            }
                            setIsNotifOpen(false);
                          }}
                          className={`p-3 border-b border-neutral-100 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${
                            !n.is_read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                          }`}
                        >
                          <div className="flex gap-2.5 items-start">
                            <span className="text-lg shrink-0">
                              {n.type === 'task_assigned'
                                ? '👉'
                                : n.type === 'task_completed'
                                ? '✅'
                                : n.type === 'comment' || n.type === 'mention' || n.type === 'team_chat'
                                ? '💬'
                                : n.type === 'team_invite' || n.type === 'access_request'
                                ? '🤝'
                                : '🔔'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs leading-snug ${
                                  !n.is_read
                                    ? 'font-bold text-black dark:text-white'
                                    : 'text-neutral-600 dark:text-neutral-400'
                                }`}
                              >
                                {n.message?.replace(/<!--TASK_ID:\d+-->/g, '')}
                              </p>
                              <p className="text-[10px] text-neutral-400 mt-0.5">{formatDateMMM(n.timestamp)}</p>
                            </div>
                            {!n.is_read && <div className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-1"></div>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative hidden md:block">
            {isProfileMenuOpen && (
              <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsProfileMenuOpen(false)}></div>
            )}
            <div
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              onMouseEnter={() => setIsProfileMenuOpen(true)}
              className={`flex items-center gap-3 px-2 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors tour-account-menu ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <Avatar name={currentUser} url={avatarsMap[currentUser]} size="w-8 h-8" textClass="text-xs" />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-black dark:text-white truncate transition-colors">
                    {currentUser}
                  </div>
                  <div className="text-[10px] text-neutral-500 truncate transition-colors">
                    {tMsg('Workspace User', 'Pengguna Workspace')}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            {isProfileMenuOpen && (
              <div
                className="absolute bottom-full left-0 pb-2 w-56 z-50"
                onMouseLeave={() => setIsProfileMenuOpen(false)}
              >
                <div className="bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-xl border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden py-1">
                  {isSuperAdmin && (
                    <button
                      onClick={() => {
                        openAdminModal();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center gap-2 transition-colors"
                    >
                      <span>🔑</span> {tMsg('Manage Users', 'Kelola Pengguna')}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsSettingsOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-2 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <span>⚙️</span> {tMsg('Settings', 'Pengaturan')}
                  </button>
                  <button
                    onClick={() => {
                      setIsLeaveModalOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    disabled={accountStatus === 'suspended'}
                    className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <span>🌴</span> {tMsg('Time Off', 'Cuti')}
                  </button>
                  <button
                    onClick={() => {
                      setIsProjectChatOpen(true);
                      setDrawerTab('assistant');
                      setIsProfileMenuOpen(false);
                    }}
                    disabled={accountStatus === 'suspended'}
                    className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <span>✨</span> {tMsg('Smart Assistant', 'Asisten Pintar AI')}
                  </button>
                  <button
                    onClick={() => {
                      setIsMyTicketsOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    disabled={accountStatus === 'suspended'}
                    className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <span>🎫</span> {tMsg('My Tickets', 'Tiket Saya')}
                  </button>
                  <div className="border-t border-neutral-200 dark:border-neutral-800 my-1"></div>
                  <button
                    onClick={() => {
                      setIsDocsOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-2 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <span>📖</span> {tMsg('Documentation', 'Dokumentasi')}
                  </button>
                  <button
                    onClick={() => {
                      setIsFeedbackOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    disabled={accountStatus === 'suspended'}
                    className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <span>💡</span> {tMsg('Submit Idea', 'Kirim Masukan')}
                  </button>
                  <button
                    onClick={() => {
                      setIsSupportOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    disabled={accountStatus === 'suspended'}
                    className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <span>🎧</span> {tMsg('Contact Support', 'Hubungi Dukungan')}
                  </button>
                  <button
                    onClick={() => {
                      startTour();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-2 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <span>🧭</span> {tMsg('Replay Tour', 'Ulangi Tur')}
                  </button>
                  {isInstallable && (
                    <button
                      onClick={() => {
                        handleInstallClick();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-2 transition-colors mt-1 rounded-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-3 3m0 0l-3-3m3 3V4"
                        ></path>
                      </svg>
                      {tMsg('Install App', 'Instal Aplikasi')}
                    </button>
                  )}
                  <div className="border-t border-neutral-200 dark:border-neutral-800 my-1"></div>
                  <button
                    onClick={() => {
                      setIsLogoutConfirmOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2 transition-colors"
                  >
                    <span>🚪</span> {tMsg('Logout', 'Keluar')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
