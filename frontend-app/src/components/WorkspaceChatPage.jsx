import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useAppContext } from '../hooks/useAppContext';
import { Avatar, IconPlus } from '../SharedUI';
import { HighlightText, stripHtml } from '../Utils';
import ChatMessage from '../ChatMessage';
import ChatSidebar from './ChatWorkspace/ChatSidebar';
import ChatHeader from './ChatWorkspace/ChatHeader';
import ChatMessageList from './ChatWorkspace/ChatMessageList';
import ChatInputArea from './ChatWorkspace/ChatInputArea';

export default function WorkspaceChatPage() {
  const {
    currentUser,
    boards,
    tasks,
    avatarsMap,
    language,
    notifications,
    userDirectory,
    dmConversations,
    setDmConversations,
    fetchDmConversations,
    workspaceChatTarget,
    setWorkspaceChatTarget,
    inboxChats,
    isInboxLoading,
    fetchInboxChats,
    handleMarkAllInboxAsRead,
    showNotification,
    formatDateMMM,
    accountStatus,
    isSuperAdmin,
    setSelectedTask,
    handleAskAITaskChat,
    handleToggleReaction,
    handleDeleteComment,
    deleteProjectChatMessage,
    handleNotificationTaskClick,
    activeWorkspace,
  } = useAppContext();

  const tMsg = (en, id) => (language === 'id' ? id : en);

  const [boardSearchQuery, setBoardSearchQuery] = useState('');
  const [expandedBoards, setExpandedBoards] = useState({});
  const [boardTasks, setBoardTasks] = useState({});
  const [activeChat, setActiveChat] = useState({ type: 'inbox', id: 'inbox', name: 'Inbox & Activity' });

  useEffect(() => {
    if (workspaceChatTarget) {
      setActiveChat(workspaceChatTarget);
      setWorkspaceChatTarget(null);
    }
  }, [workspaceChatTarget, setWorkspaceChatTarget]);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Task Preview Sidebar Drawer State
  const [activeTaskPreview, setActiveTaskPreview] = useState(null);

  const handleOpenTaskPreview = useCallback((taskId) => {
    if (!taskId) {
      setActiveTaskPreview(null);
      return;
    }
    const found = (tasks || []).find((t) => String(t.id) === String(taskId));
    if (found) {
      setActiveTaskPreview(found);
    } else {
      axios.get(`/api/tasks/${taskId}`)
        .then((res) => {
          if (res.data) setActiveTaskPreview(res.data);
        })
        .catch(() => {
          if (handleNotificationTaskClick) handleNotificationTaskClick(taskId);
        });
    }
  }, [tasks, handleNotificationTaskClick]);

  // Advanced Chat Features
  const [replyingTo, setReplyingTo] = useState(null);
  const [isMentioning, setIsMentioning] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [msgToDelete, setMsgToDelete] = useState(null);
  const [activeBoardMembers, setActiveBoardMembers] = useState([]);

  // Filters State
  const [showMyTasksFilter, setShowMyTasksFilter] = useState(false);
  const [showUnreadFilter, setShowUnreadFilter] = useState(false);

  // DM State
  const [isNewDmOpen, setIsNewDmOpen] = useState(false);
  const [newDmSearch, setNewDmSearch] = useState('');
  const [newDmSearchIndex, setNewDmSearchIndex] = useState(0);
  const [dmConvToDelete, setDmConvToDelete] = useState(null);

  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(!activeChat);

  useEffect(() => {
    fetchDmConversations();
    fetchInboxChats();
  }, []);

  useEffect(() => {
    if (activeChat?.type === 'inbox') {
      fetchInboxChats();
    }
  }, [activeChat?.type]);

  useEffect(() => {
    if (activeChat && activeChat.board_id && activeChat.board_id !== 'global') {
      axios
        .get(`/api/boards/${activeChat.board_id}/members`)
        .then((res) => setActiveBoardMembers(res.data.members || []))
        .catch(console.error);
    }
  }, [activeChat?.board_id]);

  const padTime = (n) => String(n).padStart(2, '0');
  const getLocalTimestamp = () => {
    const now = new Date();
    return `${now.getFullYear()}-${padTime(now.getMonth() + 1)}-${padTime(now.getDate())} ${padTime(
      now.getHours()
    )}:${padTime(now.getMinutes())}:${padTime(now.getSeconds())}`;
  };

  const [firstUnreadId, setFirstUnreadId] = useState(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [latestMentionId, setLatestMentionId] = useState(null);
  const [dismissedMentions, setDismissedMentions] = useState(new Set());
  const sessionLastReadRef = useRef(null);
  const initialScrollDoneRef = useRef(false);

  const [sidebarWidth, setSidebarWidth] = useState(288);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);
  const resize = useCallback(
    (e) => {
      if (isResizing) {
        const newWidth = e.clientX;
        if (newWidth > 200 && newWidth < 450) {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  const toggleBoard = (boardId) => {
    setExpandedBoards((prev) => {
      const nextState = !prev[boardId];
      if (nextState && !boardTasks[boardId] && boardId !== 'global') {
        axios
          .get(`/api/boards/${boardId}/tasks/light`)
          .then((res) => {
            setBoardTasks((prevTasks) => ({ ...prevTasks, [boardId]: res.data.tasks || [] }));
          })
          .catch(console.error);
      }
      return { ...prev, [boardId]: nextState };
    });
  };

  const handleExpandAll = () => {
    const allExpanded = {};
    boards.forEach((b) => {
      allExpanded[b.id] = true;
      if (!boardTasks[b.id] && b.id !== 'global') {
        axios
          .get(`/api/boards/${b.id}/tasks/light`)
          .then((res) => {
            setBoardTasks((prevTasks) => ({ ...prevTasks, [b.id]: res.data.tasks || [] }));
          })
          .catch(console.error);
      }
    });
    setExpandedBoards(allExpanded);
  };

  const handleCollapseAll = () => setExpandedBoards({});

  const fetchMessages = (isInitial = false, isLoadMore = false) => {
    if (!activeChat || activeChat.type === 'inbox') return;
    if (isInitial) setIsLoadingMessages(true);

    let endpoint = '';
    let params = {};
    if (activeChat.type === 'project') {
      endpoint = `/api/boards/${activeChat.id}/comments`;
    } else if (activeChat.type === 'task') {
      endpoint = `/api/tasks/${activeChat.id}/comments`;
    } else if (activeChat.type === 'dm') {
      endpoint = `/api/dm/messages/${activeChat.partner}`;
    }

    if (isLoadMore && messages.length > 0) {
      params.before_id = messages[0].id;
    }

    axios
      .get(endpoint, { params })
      .then((res) => {
        const fetched = res.data.comments || res.data.messages || res.data || [];
        if (isLoadMore) {
          setMessages((prev) => [...fetched, ...prev]);
          setHasMoreMessages(fetched.length >= 30);
        } else {
          setMessages(fetched);
          setHasMoreMessages(fetched.length >= 30);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isInitial) setIsLoadingMessages(false);
      });
  };

  useEffect(() => {
    if (activeChat?.id && activeChat?.type !== 'inbox') {
      fetchMessages(true);
    }
  }, [activeChat?.id, activeChat?.type]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || activeChat.type === 'inbox') return;

    let finalComment = newMessage.trim();
    if (replyingTo) {
      const cleanPreview = replyingTo.text
        .replace(/^> .*?\n/gm, '')
        .replace(/<[^>]*>?/gm, '')
        .trim();
      const truncated = cleanPreview.length > 80 ? cleanPreview.substring(0, 80) + '...' : cleanPreview;
      finalComment = `> **@${replyingTo.username}**: ${truncated}\n${finalComment}`;
    }

    let endpoint = '';
    let body = { comment: finalComment };
    if (activeChat.type === 'project') {
      endpoint = `/api/boards/${activeChat.id}/comments`;
    } else if (activeChat.type === 'task') {
      endpoint = `/api/tasks/${activeChat.id}/comments`;
    } else if (activeChat.type === 'dm') {
      endpoint = `/api/dm/send`;
      body = { receiver: activeChat.partner, message: finalComment };
    }

    axios
      .post(endpoint, body)
      .then(() => {
        setNewMessage('');
        setReplyingTo(null);
        fetchMessages();
        if (activeChat.type === 'dm') fetchDmConversations();
      })
      .catch(console.error);
  };

  const filteredUsers = useMemo(() => {
    if (!newDmSearch.trim()) return userDirectory || [];
    return (userDirectory || []).filter(
      (u) =>
        u.username.toLowerCase().includes(newDmSearch.toLowerCase()) ||
        (u.name && u.name.toLowerCase().includes(newDmSearch.toLowerCase()))
    );
  }, [userDirectory, newDmSearch]);

  const handleNewDmSelect = (targetUser) => {
    setActiveChat({
      type: 'dm',
      id: targetUser.username,
      name: targetUser.username,
      partner: targetUser.username,
    });
    setIsNewDmOpen(false);
    setNewDmSearch('');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-5rem)] bg-[#F3F4F6] dark:bg-[#0d0f11] text-[#111E38] dark:text-white rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden shadow-xs m-2 md:m-4">
      {/* Sidebar Channels & DMs */}
      <ChatSidebar
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        isDesktopSidebarOpen={isDesktopSidebarOpen}
        sidebarWidth={sidebarWidth}
        boards={boards}
        boardSearchQuery={boardSearchQuery}
        setBoardSearchQuery={setBoardSearchQuery}
        expandedBoards={expandedBoards}
        toggleBoard={toggleBoard}
        unreadBoardTotal={0}
        notifications={notifications}
        showUnreadFilter={showUnreadFilter}
        setShowUnreadFilter={setShowUnreadFilter}
        showMyTasksFilter={showMyTasksFilter}
        setShowMyTasksFilter={setShowMyTasksFilter}
        handleExpandAll={handleExpandAll}
        handleCollapseAll={handleCollapseAll}
        boardTasks={boardTasks}
        dmConversations={dmConversations}
        isNewDmOpen={isNewDmOpen}
        setIsNewDmOpen={setIsNewDmOpen}
        newDmSearch={newDmSearch}
        setNewDmSearch={setNewDmSearch}
        filteredUsers={filteredUsers}
        newDmSearchIndex={newDmSearchIndex}
        handleNewDmSelect={handleNewDmSelect}
        setDmConvToDelete={setDmConvToDelete}
        avatarsMap={avatarsMap}
        tMsg={tMsg}
        inboxChats={inboxChats}
        currentUser={currentUser}
        tasks={tasks}
      />

      {/* Resize Handle */}
      {isDesktopSidebarOpen && (
        <div
          onMouseDown={startResizing}
          className="w-1 cursor-col-resize hover:bg-[#FACC15] transition-colors hidden md:block bg-neutral-200 dark:bg-neutral-800"
        />
      )}

      {/* Main Chat Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] dark:bg-[#121B2D] border-l border-neutral-200/60 dark:border-neutral-800/60">
        <ChatHeader
          activeChat={activeChat}
          isDesktopSidebarOpen={isDesktopSidebarOpen}
          setIsDesktopSidebarOpen={setIsDesktopSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          chatSearchQuery={chatSearchQuery}
          setChatSearchQuery={setChatSearchQuery}
          messages={messages}
          avatarsMap={avatarsMap}
          tMsg={tMsg}
          formatDateMMM={formatDateMMM}
          handleMeetNow={() => {}}
          handleNotificationTaskClick={handleOpenTaskPreview}
        />

        {/* Message List */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
          {activeChat.type === 'inbox' ? (
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="font-extrabold text-base text-[#111E38] dark:text-white">
                  📥 {tMsg('Workspace Activity Inbox', 'Inbox Aktivitas Ruang Kerja')}
                </h3>
                <button
                  onClick={handleMarkAllInboxAsRead}
                  className="px-3 py-1.5 bg-[#FACC15] text-[#111E38] font-bold text-xs rounded-lg hover:opacity-90 transition-all shadow-xs"
                >
                  {tMsg('Mark All Read', 'Tandai Semua Dibaca')}
                </button>
              </div>

              {(inboxChats || []).length === 0 ? (
                <div className="py-12 text-center text-neutral-400 text-sm">
                  <span className="material-symbols-outlined text-4xl block mb-2 opacity-40">mark_email_read</span>
                  {tMsg('All caught up! No unread activity.', 'Semua pesan sudah dibaca!')}
                </div>
              ) : (
                (inboxChats || []).map((chat, idx) => (
                  <div
                    key={`inbox-item-${chat.id || chat.board_id || chat.task_id || chat.partner || idx}`}
                    onClick={() => {
                      if (chat.is_dm) {
                        setActiveChat({ type: 'dm', id: chat.partner, name: chat.partner, partner: chat.partner });
                      } else if (chat.is_project_chat) {
                        setActiveChat({ type: 'project', id: chat.board_id, name: chat.board_name, board_id: chat.board_id });
                      } else {
                        setActiveChat({ type: 'task', id: chat.task_id, name: chat.task_name, board_id: chat.board_id });
                      }
                    }}
                    className="p-3 bg-white dark:bg-[#0d0f11] border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl hover:border-[#FACC15] cursor-pointer transition-all flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={chat.latest_sender || chat.partner} size="w-8 h-8" url={avatarsMap[chat.latest_sender]} />
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[#111E38] dark:text-white truncate">
                          {chat.is_dm ? `@${chat.partner}` : chat.title || chat.task_name || chat.board_name}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">{stripHtml(chat.latest_message || '')}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-400 shrink-0 font-medium">{chat.formatted_time || ''}</span>
                  </div>
                ))
              )}
            </div>
          ) : (
            <ChatMessageList
              messages={messages}
              isLoadingMessages={isLoadingMessages}
              hasMoreMessages={hasMoreMessages}
              loadMoreMessages={() => fetchMessages(false, true)}
              activeChat={activeChat}
              currentUser={currentUser}
              avatarsMap={avatarsMap}
              formatDateMMM={formatDateMMM}
              setReplyingTo={setReplyingTo}
              handleToggleReaction={handleToggleReaction}
              setMsgToDelete={setMsgToDelete}
              tMsg={tMsg}
              firstUnreadId={firstUnreadId}
              messagesEndRef={messagesEndRef}
            />
          )}
        </div>

        {/* Input Area (Visible for Channels & DMs) */}
        {activeChat?.type !== 'inbox' && (
          <ChatInputArea
            activeChat={activeChat}
            boards={boards}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sendMessage={sendMessage}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            isMentioning={isMentioning}
            setIsMentioning={setIsMentioning}
            mentionQuery={mentionQuery}
            mentionIndex={mentionIndex}
            setMentionIndex={setMentionIndex}
            activeBoardMembers={activeBoardMembers}
            userDirectory={userDirectory}
            tMsg={tMsg}
          />
        )}
      </div>

      {/* Right Side Task Details Sidebar Drawer (Non-Modal Inline Task View) */}
      {activeTaskPreview && (
        <div className="w-full md:w-96 lg:w-[400px] bg-white dark:bg-[#121B2D] border-l border-neutral-200/80 dark:border-neutral-800/80 flex flex-col h-full shrink-0 z-30 shadow-lg animate-fadeIn">
          {/* Drawer Header */}
          <div className="h-16 px-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-amber-500 text-lg">task</span>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-[#111E38] dark:text-white truncate">
                  {activeTaskPreview.project_name || activeTaskPreview.name || 'Task Details'}
                </h4>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  {tMsg('Task Sidebar View', 'Pratinjau Sidebar Tugas')}
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTaskPreview(null)}
              className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center"
              title={tMsg('Close', 'Tutup')}
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4 text-xs">
            {/* Status & Priority Badge Block */}
            <div className="p-3 bg-neutral-100/60 dark:bg-neutral-900/50 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{tMsg('Status', 'Status')}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FACC15] text-[#111E38]">
                  {activeTaskPreview.status || 'To Do'}
                </span>
              </div>
              {activeTaskPreview.priority && (
                <div className="flex items-center justify-between pt-1.5 border-t border-neutral-200/40 dark:border-neutral-800/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{tMsg('Priority', 'Prioritas')}</span>
                  <span className="text-[11px] font-bold text-[#111E38] dark:text-neutral-200">
                    {activeTaskPreview.priority}
                  </span>
                </div>
              )}
              {activeTaskPreview.due_date && (
                <div className="flex items-center justify-between pt-1.5 border-t border-neutral-200/40 dark:border-neutral-800/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{tMsg('Due Date', 'Tenggat Waktu')}</span>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    {activeTaskPreview.due_date}
                  </span>
                </div>
              )}
            </div>

            {/* Task Description */}
            {activeTaskPreview.description && (
              <div className="space-y-1">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{tMsg('Description', 'Deskripsi')}</h5>
                <div className="p-3 bg-neutral-50 dark:bg-[#0d0f11] rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 text-slate-700 dark:text-neutral-300 whitespace-pre-wrap font-sans leading-relaxed text-xs">
                  {stripHtml(activeTaskPreview.description)}
                </div>
              </div>
            )}

            {/* Subtasks Progress */}
            {activeTaskPreview.subtasks && activeTaskPreview.subtasks.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  {tMsg('Subtasks', 'Subtugas')} ({activeTaskPreview.subtasks.filter(s => s.completed).length}/{activeTaskPreview.subtasks.length})
                </h5>
                <div className="space-y-1">
                  {activeTaskPreview.subtasks.map((st, idx) => (
                    <div key={`st-${st.id || idx}`} className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-xs">
                      <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] font-bold ${st.completed ? 'bg-emerald-500 text-white' : 'border border-neutral-300 dark:border-neutral-700'}`}>
                        {st.completed ? '✓' : ''}
                      </span>
                      <span className={st.completed ? 'line-through opacity-60' : ''}>{st.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Handoff to full modal if requested */}
            <button
              onClick={() => {
                if (handleNotificationTaskClick) handleNotificationTaskClick(activeTaskPreview.id);
              }}
              className="w-full mt-4 py-2.5 px-3 bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-xs uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              <span>{tMsg('Open Full Modal', 'Buka Modal Lengkap')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
