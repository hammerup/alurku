import React from 'react';
import axios from 'axios';
import { HighlightText } from '../../Utils';
import { Avatar } from '../../SharedUI';

// Modern inline SVG icons conforming to alurku. Brand Book & Flat Design
const IconChat = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-.84-.962 4.024 4.024 0 00.32-1.39A8.064 8.064 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
);

const IconSearch = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const IconClose = ({ className = 'w-3 h-3' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconFolder = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);

const IconTask = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconMessageSquare = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.502 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v5.518z" />
  </svg>
);

const IconUser = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const IconBell = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const IconUnfoldMore = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
  </svg>
);

const IconUnfoldLess = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9L12 5.25 15.75 9m-7.5 6L12 18.75 15.75 15" />
  </svg>
);

const IconInboxEmpty = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.03v-6.78a2.25 2.25 0 012.25-2.25h15a2.25 2.25 0 012.25 2.25v6.78m-19.5 0A2.25 2.25 0 004.5 15.75h15a2.25 2.25 0 002.25-2.22m-19.5 0v3.72a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25v-3.72" />
  </svg>
);

const IconPlus = ({ className = 'w-3 h-3' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const IconTrash = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

export default function ChatSidebar({
  activeChat,
  setActiveChat,
  isDesktopSidebarOpen,
  sidebarWidth,
  boards,
  boardSearchQuery,
  setBoardSearchQuery,
  expandedBoards,
  toggleBoard,
  unreadBoardTotal,
  notifications,
  showUnreadFilter,
  setShowUnreadFilter,
  showMyTasksFilter,
  setShowMyTasksFilter,
  handleExpandAll,
  handleCollapseAll,
  boardTasks,
  dmConversations,
  isNewDmOpen,
  setIsNewDmOpen,
  newDmSearch,
  setNewDmSearch,
  filteredUsers,
  newDmSearchIndex,
  handleNewDmSelect,
  setDmConvToDelete,
  avatarsMap,
  tMsg,
  inboxChats,
  currentUser,
  tasks,
  onlineUsers,
}) {
  const unreadInboxChatsCount = React.useMemo(() => {
    return (inboxChats || []).filter(chat => {
      if (chat.latest_sender === currentUser) return false;
      if (chat.is_dm) return (chat.unread_count || 0) > 0;
      if (chat.is_project_chat) {
        const lastRead = localStorage.getItem(`alurku_last_read_board_${chat.board_id}_${currentUser}`);
        const hasUnreadNotification = (notifications || []).some(
          n => !n.is_read && (String(n.board_id) === String(chat.board_id) || String(n.related_task_id) === String(chat.board_id)) && 
          (n.type === 'team_chat' || n.type === 'team_chat_no_email' || n.type === 'mention' || n.type === 'mention_no_email')
        );
        if (lastRead && chat.timestamp) {
          const lastReadTime = new Date(lastRead.replace(' ', 'T')).getTime();
          const chatTime = new Date(chat.timestamp.replace(' ', 'T')).getTime();
          if (!isNaN(lastReadTime) && !isNaN(chatTime)) {
            return chatTime > lastReadTime || hasUnreadNotification;
          }
        }
        return hasUnreadNotification;
      } else {
        const lastRead = localStorage.getItem(`alurku_last_read_task_${chat.task_id}_${currentUser}`);
        const hasUnreadNotification = (notifications || []).some(
          n => !n.is_read && (String(n.related_task_id) === String(chat.task_id) || String(n.task_id) === String(chat.task_id)) && 
          (n.type === 'comment' || n.type === 'mention' || n.type === 'mention_no_email')
        );
        if (lastRead && chat.timestamp) {
          const lastReadTime = new Date(lastRead.replace(' ', 'T')).getTime();
          const chatTime = new Date(chat.timestamp.replace(' ', 'T')).getTime();
          if (!isNaN(lastReadTime) && !isNaN(chatTime)) {
            return chatTime > lastReadTime || hasUnreadNotification;
          }
        }
        return hasUnreadNotification;
      }
    }).length;
  }, [inboxChats, notifications, currentUser]);

  const availableDmUsers = React.useMemo(() => {
    return (filteredUsers || []).filter(
      (u) => u.username !== currentUser && u.username !== 'admin' && u.is_connected
    );
  }, [filteredUsers, currentUser]);

  return (
    <div
      className={`bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-full transition-all duration-300 ease-in-out ${
        isDesktopSidebarOpen ? 'w-[288px]' : 'w-0 overflow-hidden border-r-0'
      }`}
      style={isDesktopSidebarOpen ? { width: sidebarWidth } : {}}
    >
      {/* Search & Filters */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
        <h3 className="font-black text-base text-[#111E38] dark:text-white mb-3 flex items-center gap-2">
          <IconChat className="w-5 h-5 text-[#FACC15] shrink-0" />
          <span>{tMsg('Workspace Chat', 'Obrolan Ruang Kerja')}</span>
        </h3>
        <div className="relative mb-3">
          <IconSearch className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder={tMsg('Search workspace...', 'Cari ruang kerja...')}
            value={boardSearchQuery}
            onChange={(e) => setBoardSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 bg-neutral-100 dark:bg-neutral-800 border-transparent focus:border-[#FACC15] focus:bg-white dark:focus:bg-neutral-900 rounded-lg text-xs font-medium transition-all outline-none"
          />
          {boardSearchQuery && (
            <button
              onClick={() => setBoardSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white p-1 font-bold text-xs flex items-center justify-center transition-colors"
            >
              <IconClose className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Global Search Popup Overlay */}
          {boardSearchQuery.trim() && (() => {
            const keywords = boardSearchQuery.toLowerCase().split(/\s+/).filter(Boolean);
            if (keywords.length === 0) return null;
            
            // 1. Filter Projects (Boards)
            const matchingBoards = (boards || [])
              .filter(b => {
                if (b.id === 'global') return false;
                const combined = b.name.toLowerCase();
                return keywords.every(kw => combined.includes(kw));
              })
              .slice(0, 5);

            // 2. Filter Tasks
            const matchingTasks = (tasks || [])
              .filter(t => {
                const combined = (t.project_name || '').toLowerCase();
                return keywords.every(kw => combined.includes(kw));
              })
              .slice(0, 5);

            // 3. Filter Chat Messages (from recent inboxChats)
            const matchingChats = (inboxChats || [])
              .filter(c => {
                const combined = [c.latest_message || '', c.latest_sender || ''].join(' ').toLowerCase();
                return keywords.every(kw => combined.includes(kw));
              })
              .slice(0, 5);

            // 4. Filter Users (Workspace directory for new DMs)
            const matchingUsers = (availableDmUsers || [])
              .filter(u => {
                const combined = u.username.toLowerCase();
                return keywords.every(kw => combined.includes(kw));
              })
              .slice(0, 5);

            const hasAnyResult = matchingBoards.length > 0 || matchingTasks.length > 0 || matchingChats.length > 0 || matchingUsers.length > 0;

            return (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-xl z-50 max-h-87.5 overflow-y-auto custom-scrollbar p-2 space-y-3">
                
                {/* Projects Category */}
                {matchingBoards.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-2 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <IconFolder className="w-3 h-3 text-neutral-400" />
                        <span>{tMsg('Projects', 'Proyek')}</span>
                      </span>
                      <span className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-[8px]">{matchingBoards.length}</span>
                    </div>
                    {matchingBoards.map(b => (
                      <button
                        key={`global-search-proj-${b.id}`}
                        onClick={() => {
                          setActiveChat({ type: 'project', id: b.id, name: `${b.name} (General)`, board_id: b.id });
                          setBoardSearchQuery('');
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
                      >
                        <IconFolder className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate flex-1">
                          <HighlightText text={b.name} query={boardSearchQuery} />
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Tasks Category */}
                {matchingTasks.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-2 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <IconTask className="w-3 h-3 text-neutral-400" />
                        <span>{tMsg('Tasks', 'Tugas')}</span>
                      </span>
                      <span className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-[8px]">{matchingTasks.length}</span>
                    </div>
                    {matchingTasks.map(t => (
                      <button
                        key={`global-search-task-${t.id}`}
                        onClick={() => {
                          setActiveChat({ type: 'task', id: t.id, name: t.project_name, board_id: t.board_id, is_involved: t.is_involved });
                          setBoardSearchQuery('');
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
                      >
                        <IconTask className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate flex-1">
                          <HighlightText text={t.project_name} query={boardSearchQuery} />
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Chat Messages Category */}
                {matchingChats.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-2 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <IconMessageSquare className="w-3 h-3 text-neutral-400" />
                        <span>{tMsg('Chats', 'Obrolan')}</span>
                      </span>
                      <span className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-[8px]">{matchingChats.length}</span>
                    </div>
                    {matchingChats.map(c => {
                      let displayName = '';
                      if (c.is_dm) {
                        displayName = `@${c.partner_username}`;
                      } else if (c.is_project_chat) {
                        displayName = c.board_name;
                      } else {
                        displayName = c.project_name;
                      }
                      return (
                        <button
                          key={`global-search-msg-${c.timestamp}-${c.latest_sender}`}
                          onClick={() => {
                            if (c.is_dm) {
                              setActiveChat({ type: 'dm', id: c.partner_username, name: c.partner_username, partner: c.partner_username });
                            } else {
                              setActiveChat({
                                type: c.is_project_chat ? 'project' : 'task',
                                id: c.is_project_chat ? c.board_id : c.task_id,
                                name: c.is_project_chat ? `${c.board_name} (General)` : c.project_name,
                                board_id: c.board_id,
                              });
                            }
                            setBoardSearchQuery('');
                          }}
                          className="w-full text-left p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex flex-col gap-0.5 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-[9px] font-bold text-[#111E38] dark:text-[#FACC15] truncate max-w-37.5">
                              @<HighlightText text={c.latest_sender} query={boardSearchQuery} /> &middot; <HighlightText text={displayName} query={boardSearchQuery} />
                            </span>
                            <span className="text-[8px] bg-neutral-100 dark:bg-neutral-800 px-1 rounded text-neutral-400 font-medium">
                              {c.is_dm ? 'DM' : c.is_project_chat ? 'General' : 'Task'}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-300 line-clamp-1 leading-normal italic">
                            "<HighlightText text={c.latest_message} query={boardSearchQuery} />"
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Users Category */}
                {matchingUsers.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-2 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <IconUser className="w-3 h-3 text-neutral-400" />
                        <span>{tMsg('Users', 'Pengguna')}</span>
                      </span>
                      <span className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-[8px]">{matchingUsers.length}</span>
                    </div>
                    {matchingUsers.map(u => (
                      <button
                        key={`global-search-user-${u.username}`}
                        onClick={() => {
                          handleNewDmSelect(u);
                          setBoardSearchQuery('');
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
                      >
                        <Avatar name={u.username} url={avatarsMap[u.username]} size="w-4 h-4" />
                        <span className="truncate flex-1 font-bold">
                          @<HighlightText text={u.username} query={boardSearchQuery} />
                        </span>
                        <span className="text-[8px] bg-[#FACC15]/20 text-[#111E38] dark:text-[#FACC15] px-1.5 py-0.5 rounded font-bold shrink-0 font-sans">
                          Message
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {!hasAnyResult && (
                  <div className="p-4 text-center text-xs font-bold text-neutral-400 dark:text-neutral-500 flex flex-col items-center gap-1.5">
                    <IconInboxEmpty className="w-6 h-6 text-neutral-400" />
                    <span>{tMsg('No search results found.', 'Tidak ada hasil pencarian.')}</span>
                  </div>
                )}

              </div>
            );
          })()}
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => setShowMyTasksFilter(!showMyTasksFilter)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                showMyTasksFilter
                  ? 'bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
              }`}
              title={tMsg('My Tasks', 'Tugas Saya')}
            >
              <IconUser className="w-3.5 h-3.5 shrink-0" />
              <span>{tMsg('My Tasks', 'Tugas Saya')}</span>
            </button>
            <button
              onClick={() => setShowUnreadFilter(!showUnreadFilter)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                showUnreadFilter
                  ? 'bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
              }`}
              title={tMsg('Unread', 'Belum Dibaca')}
            >
              <IconBell className="w-3.5 h-3.5 shrink-0" />
              <span>{tMsg('Unread', 'Belum Dibaca')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Boards & Tasks */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        <div className="mb-2 px-2 flex justify-between items-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
          <span>{tMsg('Projects & Tasks', 'Proyek & Tugas')}</span>
          <div className="flex gap-2">
            <button
              onClick={handleExpandAll}
              className="hover:text-black dark:hover:text-white transition-colors text-xs font-black p-0.5 flex items-center justify-center cursor-pointer"
              title={tMsg('Expand All', 'Buka Semua')}
            >
              <IconUnfoldMore className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCollapseAll}
              className="hover:text-black dark:hover:text-white transition-colors text-xs font-black p-0.5 flex items-center justify-center cursor-pointer"
              title={tMsg('Collapse All', 'Tutup Semua')}
            >
              <IconUnfoldLess className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {boards
          .filter((b) => b.id !== 'global')
          .map((board) => {
            const unreadBoardTotal = notifications?.filter(
              (n) => !n.is_read && String(n.board_id) === String(board.id)
            ).length || 0;

            return (
              <div key={`tree-board-${board.id}`} className="mb-1 border-b border-neutral-100 dark:border-neutral-800/50 pb-1 last:border-0">
                <button
                  onClick={() => toggleBoard(board.id)}
                  className="w-full text-left flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2 overflow-hidden flex-1 text-left">
                    <span className="w-4 h-4 flex items-center justify-center text-neutral-400 group-hover:text-black dark:group-hover:text-white shrink-0 transition-colors">
                      {expandedBoards[board.id] ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                      )}
                    </span>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate flex-1" title={board.name}>
                      {board.name}
                    </span>
                  </div>
                  {unreadBoardTotal > 0 && (
                    <span className="bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm shrink-0 animate-pulse ml-2">
                      {unreadBoardTotal}
                    </span>
                  )}
                </button>
                {expandedBoards[board.id] && (
                  <div className="pl-6 pr-2 mt-1 space-y-0.5">
                    {!board.is_private && (() => {
                      const unreadProj = notifications?.filter(
                        (n) => !n.is_read && (n.type === 'team_chat' || n.type === 'team_chat_no_email') && String(n.related_task_id) === String(board.id)
                      ).length || 0;
                      if (showUnreadFilter && unreadProj === 0) return null;
                      if (showMyTasksFilter && !showUnreadFilter && unreadProj === 0) return null;

                      return (
                        <button
                          onClick={() => setActiveChat({ type: 'project', id: board.id, name: `${board.name} (General)`, board_id: board.id })}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                            activeChat?.type === 'project' && activeChat?.id === board.id
                              ? 'bg-[#FACC15]/20 text-[#111E38] dark:text-[#FACC15] font-bold border-l-2 border-[#FACC15]'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                          }`}
                        >
                          <span className="truncate flex-1 flex items-center gap-1.5">
                            <IconMessageSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>General Chat</span>
                          </span>
                          {unreadProj > 0 && (
                            <span className="bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] text-[9px] px-1.5 py-0.5 rounded-md font-black shrink-0 ml-2 shadow-[0_0_8px_rgba(250,204,21,0.6)] animate-pulse">
                              {unreadProj}
                            </span>
                          )}
                        </button>
                      );
                    })()}

                    {(boardTasks[board.id] || []).filter((t) => {
                      if (showMyTasksFilter && !t.is_involved) return false;
                      if (showUnreadFilter) {
                         // Match ANY unread notification for this task (consistent with board badge)
                        const unreadTask = notifications?.filter(
                           (n) => !n.is_read && String(n.related_task_id) === String(t.id)
                        ).length || 0;
                        if (unreadTask === 0) return false;
                      }
                      return true;
                    }).map((t) => {
                      const unreadTask = notifications?.filter(
                        (n) => !n.is_read && String(n.related_task_id) === String(t.id)
                      ).length || 0;
                      return (
                        <button
                          key={`tree-task-${t.id}`}
                          onClick={() => setActiveChat({ type: 'task', id: t.id, name: t.project_name, board_id: board.id, is_involved: t.is_involved })}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                            activeChat?.type === 'task' && activeChat?.id === t.id
                              ? 'bg-[#FACC15]/20 text-[#111E38] dark:text-[#FACC15] font-bold border-l-2 border-[#FACC15]'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                          }`}
                        >
                          <span className="truncate flex-1 flex items-center gap-1.5">
                            <IconTask className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>{t.project_name}</span>
                          </span>
                          {unreadTask > 0 && (
                            <span className="bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] text-[9px] px-1.5 py-0.5 rounded-md font-black shrink-0 ml-2 shadow-[0_0_8px_rgba(250,204,21,0.6)] animate-pulse">
                              {unreadTask}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Direct Messages Section */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <IconUser className="w-3.5 h-3.5 text-neutral-400" />
            <span>{tMsg('Direct Messages', 'Pesan Langsung')}</span>
          </h3>
          <button
            onClick={() => setIsNewDmOpen(!isNewDmOpen)}
            className="text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-[#111E38] hover:text-[#FACC15] dark:hover:bg-[#FACC15] dark:hover:text-[#111E38] px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <IconPlus className="w-2.5 h-2.5" />
            <span>{tMsg('New', 'Baru')}</span>
          </button>
        </div>
        {isNewDmOpen && (
          <div className="mb-3 relative">
            <input
              type="text"
              autoFocus
              placeholder={tMsg('Search user...', 'Cari pengguna...')}
              value={newDmSearch}
              onChange={(e) => { setNewDmSearch(e.target.value); }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); /* handle nav */ }
                if (e.key === 'ArrowUp') { e.preventDefault(); /* handle nav */ }
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const matches = availableDmUsers.filter(u =>
                    u.username.toLowerCase().includes(newDmSearch.toLowerCase())
                  );
                  if (matches.length > 0) {
                    handleNewDmSelect(matches[newDmSearchIndex] || matches[0]);
                  }
                }
              }}
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-1 px-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
            />
            {newDmSearch && (() => {
              const matches = availableDmUsers.filter(u =>
                u.username.toLowerCase().includes(newDmSearch.toLowerCase())
              );
              return (
                <div className="absolute left-0 right-0 bottom-full mb-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg max-h-48 overflow-y-auto z-50">
                  {matches.map((u, idx) => (
                    <button
                      key={u.username}
                      onClick={() => handleNewDmSelect(u)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 ${
                        idx === newDmSearchIndex ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
                      }`}
                    >
                      <Avatar name={u.username} url={avatarsMap[u.username]} size="w-5 h-5" />
                      <span>@{u.username}</span>
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
        <div className="space-y-0.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
          {dmConversations.map((dm) => (
            <div key={`dm-sidebar-${dm.partner}`} className="flex items-center group">
              <button
                onClick={() => setActiveChat({ type: 'dm', id: dm.partner, name: dm.partner, partner: dm.partner })}
                className={`flex-1 text-left px-2 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                  activeChat?.type === 'dm' && activeChat?.id === dm.partner
                    ? 'bg-[#FACC15]/20 text-[#111E38] dark:text-[#FACC15] font-bold border-l-2 border-[#FACC15]'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar name={dm.partner} url={avatarsMap[dm.partner]} size="w-5 h-5" />
                  {(Array.isArray(onlineUsers) ? onlineUsers.includes(dm.partner) : (onlineUsers?.has ? onlineUsers.has(dm.partner) : false)) && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900 shadow-[0_0_6px_rgba(16,185,129,0.8)]" title="Online" />
                  )}
                </div>
                <span className="truncate flex-1">@{dm.partner}</span>
                {dm.unread_count > 0 && (
                  <span className="bg-[#FACC15] text-[#111E38] text-[9px] px-1.5 py-0.5 rounded-md font-black shrink-0 shadow-[0_0_8px_rgba(250,204,21,0.6)] animate-pulse">
                    {dm.unread_count}
                  </span>
                )}
              </button>
              <button
                onClick={() => setDmConvToDelete(dm.partner)}
                className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 p-1 transition-opacity cursor-pointer flex items-center justify-center"
                title={tMsg('Delete conversation', 'Hapus percakapan')}
              >
                <IconClose className="w-3 h-3" />
              </button>
            </div>
          ))}
          {/* Inline matching users search results section has been removed to keep background lists clean */}
        </div>
      </div>
    </div>
  );
}
