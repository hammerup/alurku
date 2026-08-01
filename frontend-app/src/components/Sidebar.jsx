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
  } = useAppContext();

  const tMsg = (en, id) => (language === 'id' ? id : en);

  // Sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('alurku_sidebar_collapsed') === 'true';
    return false;
  });
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
          const slugify = (text) => text ? text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
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
            const slugify = (text) => text ? text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
            const wsSlug = slugify(activeWorkspace?.name);
            const boardSlug = slugify(board.name);
            const targetUrl = `/workspace/${wsSlug}/${activeWorkspace?.id}/project/${boardSlug}/${board.id}`;
            window.history.pushState({}, '', targetUrl);
            window.dispatchEvent(new CustomEvent('alurku-navigate'));
          }
        }}
        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl transition-all group relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#111E38] ${
          isActive
            ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-bold'
            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-400'
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#111E38] dark:bg-[#FACC15] rounded-r-full"></div>
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
          {unreadChats > 0 && (
            <span className="min-w-4 h-4 px-1 rounded-full bg-[#FACC15] text-[#111E38] text-[9px] font-black flex items-center justify-center leading-none" title={`${unreadChats} unread`}>
              {unreadChats > 9 ? '9+' : unreadChats}
            </span>
          )}
          {board.health_alert?.includes('Attention') && unreadChats === 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500" title="Attention Needed"></span>
          )}
          {!isCollapsed && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const menuKey = `${isFavoriteSection ? 'fav' : 'all'}-${board.id}`;
                  setActiveBoardMenuId(activeBoardMenuId === menuKey ? null : menuKey);
                }}
                className="p-1 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title={tMsg('Project Options', 'Opsi Proyek')}
              >
                <span className="material-symbols-outlined text-[16px]">more_vert</span>
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
        } ${isCollapsed ? 'w-16' : 'w-64 md:w-72'}`}
      >
        <div
          className={`hidden md:flex items-center shrink-0 border-b border-neutral-200/50 dark:border-neutral-800/50 ${
            isCollapsed ? 'h-auto py-3 flex-col gap-3 px-3 justify-center' : 'h-16 px-4 justify-between gap-2'
          } relative`}
        >
          {isCollapsed ? (
            <>
              {/* Expand Sidebar button at the very top when collapsed */}
              <button
                onClick={toggleCollapse}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-450 hover:text-neutral-900 dark:hover:text-white transition-colors"
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

              {/* Vertical divider line */}
              <div className="w-8 h-px bg-neutral-200 dark:bg-neutral-800 my-1"></div>

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

              {/* Vertical divider line */}
              <div className="w-8 h-px bg-neutral-200 dark:bg-neutral-800 my-1"></div>

              {/* Collapsed mode Quick Actions — individual icon buttons */}
              {/* Chat */}
              <button
                onClick={() => setIsChatWorkspaceOpen(true)}
                className={`w-8 h-8 flex justify-center items-center rounded-lg transition-colors relative ${
                  totalUnreadChats > 0
                    ? 'bg-[#FACC15]/20 text-[#111E38] dark:text-[#FACC15] hover:bg-[#FACC15]/30'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-400'
                }`}
                title={tMsg('Team Chat', 'Obrolan Tim')}
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                {totalUnreadChats > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#FACC15] text-[#111E38] text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {totalUnreadChats > 9 ? '9' : totalUnreadChats}
                  </span>
                )}
              </button>


              {/* Export */}
              <button
                onClick={() => { setExportMode('global'); setIsExportModalOpen(true); }}
                className="w-8 h-8 flex justify-center items-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-400 transition-colors"
                title={tMsg('Export Data', 'Ekspor Data')}
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>


            </>
          ) : (
            <>
              {/* Workspace Switcher in Header */}
              {workspaces && workspaces.length > 0 && (
                <div className="relative flex-1 min-w-0 z-60">
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
                        {workspaces.map((ws) => {
                          const wsProjectCount = (boards || []).filter(b => b.workspace_id === ws.id || (!b.workspace_id && ws.id === 1)).length;
                          return (
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
                              <div className="flex items-center gap-2 truncate">
                                <span className="truncate">{ws.name}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-200/50 dark:bg-neutral-800 text-neutral-500 font-semibold shrink-0">
                                  {wsProjectCount} proj
                                </span>
                              </div>
                              {ws.id === activeWorkspace?.id && (
                                <span className="text-xs text-white dark:text-[#FACC15]">✓</span>
                              )}
                            </button>
                          );
                        })}
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
                className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white transition-colors rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center shrink-0"
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

        {/* Quick actions row — expanded mode: Chat + Export */}
        {/* Note: Notifications is in the top HeaderNavigation — not duplicated here */}
        {!isCollapsed && (
          <div className="px-3 py-2 border-b border-neutral-200/50 dark:border-neutral-800/50 shrink-0">
            <div className="flex items-center gap-1 tour-quick-actions">

              {/* Chat */}
              <button
                onClick={() => setIsChatWorkspaceOpen(true)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl transition-all text-xs font-semibold relative ${
                  totalUnreadChats > 0
                    ? 'bg-[#FACC15]/15 text-[#111E38] dark:text-[#FACC15] hover:bg-[#FACC15]/25'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-400'
                }`}
                title={tMsg('Team Chat', 'Obrolan Tim')}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <span className="truncate">{tMsg('Chat', 'Obrolan')}</span>
                {totalUnreadChats > 0 && (
                  <span className="bg-[#FACC15] text-[#111E38] text-[9px] font-black px-1.5 rounded-full min-w-4 text-center leading-4 shrink-0">
                    {totalUnreadChats > 9 ? '9+' : totalUnreadChats}
                  </span>
                )}
              </button>

              {/* Export */}
              <button
                onClick={() => { setExportMode('global'); setIsExportModalOpen(true); }}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-500 dark:text-slate-400 transition-all"
                title={tMsg('Export Data', 'Ekspor Data')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>

            </div>
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
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all relative ${
                window.location.pathname === '/dashboard' && !selectedBoard
                  ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-bold'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-400 font-medium'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={tMsg('Personal Dashboard', 'Dasbor Pribadi')}
            >
              {(window.location.pathname === '/dashboard' && !selectedBoard) && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#111E38] dark:bg-[#FACC15] rounded-r-full"></div>
              )}
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">home</span>
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
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all relative ${
                window.location.pathname.startsWith('/workspace') && !selectedBoard
                  ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-bold'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-400 font-medium'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={tMsg('Workspace Overview', 'Ringkasan Ruang Kerja')}
            >
              {(window.location.pathname.startsWith('/workspace') && !selectedBoard) && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#111E38] dark:bg-[#FACC15] rounded-r-full"></div>
              )}
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
              </div>
              {!isCollapsed && (
                <span className="text-sm truncate">{tMsg('Workspace Overview', 'Ringkasan Ruang Kerja')}</span>
              )}
            </button>
          </div>


          <div className={`mb-2 ${isCollapsed ? 'mt-0' : 'mt-2'}`}>
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
                const slugify = (text) => text ? text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
                const wsSlug = slugify(activeWorkspace?.name);
                const targetUrl = `/workspace/${wsSlug}/${activeWorkspace?.id}/project/overall-project`;
                window.history.pushState({}, '', targetUrl);
                window.dispatchEvent(new CustomEvent('alurku-navigate'));
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all tour-global-board relative ${
                selectedBoard?.id === 'global'
                  ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-bold'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-400 font-medium'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={tMsg('All Projects (Master View)', 'Semua Proyek (Tampilan Gabungan)')}
            >
              {selectedBoard?.id === 'global' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#111E38] dark:bg-[#FACC15] rounded-r-full"></div>
              )}
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">layers</span>
              </div>
              {!isCollapsed && (
                <span className="text-sm truncate">{tMsg('All Projects', 'Semua Proyek')}</span>
              )}
            </button>
          </div>

          {todoListBoard && (
            <div className="mb-6 pb-2 border-b border-neutral-100 dark:border-neutral-800/50 tour-my-todolist">
              <button
                onClick={() => {
                  setSelectedBoard(todoListBoard);
                  setViewMode('kanban');
                  setIsMobileMenuOpen(false);
                  setIsProactiveAIOpen(false);
                  const slugify = (text) => text ? text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
                  const wsSlug = slugify(activeWorkspace?.name);
                  const targetUrl = `/workspace/${wsSlug}/${activeWorkspace?.id}/project/personal-tasks`;
                  window.history.pushState({}, '', targetUrl);
                  window.dispatchEvent(new CustomEvent('alurku-navigate'));
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all relative ${
                  selectedBoard?.id === todoListBoard.id
                    ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-bold'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-400 font-medium'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={tMsg('Personal Tasks (Private workspace visible only to you)', 'Tugas Pribadi (Ruang kerja pribadi khusus kamu)')}
              >
                {selectedBoard?.id === todoListBoard.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#111E38] dark:bg-[#FACC15] rounded-r-full"></div>
                )}
                <div className="w-6 h-6 flex items-center justify-center text-amber-500 dark:text-[#FACC15]">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col text-left truncate min-w-0">
                    <span className="text-sm font-extrabold truncate">{tMsg('Personal Tasks', 'Tugas Pribadi')}</span>
                  </div>
                )}
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
                <div className="flex items-center gap-1.5">
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
                  <button
                    onClick={() => {
                      setIsCreateBoardOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={accountStatus === 'suspended'}
                    className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors flex items-center justify-center p-0.5 rounded hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
                    title={tMsg('New Project', 'Proyek Baru')}
                  >
                    <IconPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
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

        {/* ── Pinned Bottom Footer ── */}
        <div className={`shrink-0 border-t border-neutral-200/60 dark:border-neutral-800/60 pt-1 pb-2 px-2 flex flex-col gap-0.5`}>

          {/* Archived Projects */}
          <button
            onClick={() => {
              setIsArchivedOpen(true);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-500 dark:text-slate-400 font-medium ${isCollapsed ? 'justify-center' : ''}`}
            title={tMsg('Archived Projects', 'Proyek Diarsipkan')}
          >
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            </div>
            {!isCollapsed && <span className="text-sm truncate">{tMsg('Archived Projects', 'Proyek Diarsipkan')}</span>}
          </button>

          {/* Chat Luruka — Brand Yellow AI CTA */}
          <button
            onClick={() => {
              setSelectedBoard(null);
              setIsProactiveAIOpen(true);
              setIsMobileMenuOpen(false);
              window.history.pushState({}, '', '/proactive-ai');
              window.dispatchEvent(new CustomEvent('alurku-navigate'));
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all border ${
              window.location.pathname === '/proactive-ai' && !selectedBoard
                ? 'bg-[#FACC15] border-[#FACC15] text-[#111E38] font-black shadow-sm'
                : 'bg-[#FACC15]/10 border-[#FACC15]/30 hover:bg-[#FACC15]/20 hover:border-[#FACC15]/60 text-[#111E38] dark:text-[#FACC15] font-bold'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="Chat Luruka"
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            {!isCollapsed && (
              <span className="text-sm truncate">
                {tMsg('Ask Luruka', 'Tanya Luruka')}
              </span>
            )}
          </button>

          {/* Help & Support */}
          <button
            onClick={() => setIsSupportOpen(true)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-500 dark:text-slate-400 font-medium ${isCollapsed ? 'justify-center' : ''}`}
            title={tMsg('Help & Support', 'Bantuan & Dukungan')}
          >
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">help</span>
            </div>
            {!isCollapsed && <span className="text-sm truncate">{tMsg('Help & Support', 'Bantuan & Dukungan')}</span>}
          </button>

          {/* ── User Profile Card — identity anchor, bukan shortcut settings ── */}
          {/* Settings sudah ada di HeaderNavigation (gear + avatar dropdown) */}
          <div className={`mt-1 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60`}>
            <div
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? `${currentUser} — ${accountStatus === 'free' ? tMsg('Free Plan', 'Paket Gratis') : tMsg('Pro Plan', 'Paket Pro')}` : undefined}
            >
              <div className="shrink-0">
                <Avatar username={currentUser} size={28} avatarUrl={avatarsMap?.[currentUser]} />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-neutral-200 truncate">{currentUser}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
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
