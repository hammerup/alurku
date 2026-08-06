import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { useAppContext } from '../hooks/useAppContext';
import { Avatar } from '../SharedUI';
import { renderChatMessageContent } from '../ChatMessage';

export default function InboxPage() {
  const context = useAppContext();
  const {
    notifications = [],
    unreadCount = 0,
    handleReadNotification,
    handleReadAllNotifications,
    handleNotificationTaskClick,
    setIsInvitesModalOpen,
    language = 'id',
    avatarsMap = {},
    currentUser,
    tasks = [],
    boards = [],
    setSelectedTask,
    setIsEditing,
    setWorkspaceChatTarget,
    setCurrentPath,
  } = context;

  const tMsg = (en, id) => (language === 'id' ? id : en);

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'mentions' | 'tasks' | 'invites'
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const formatDateMMM = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr.replace(/-/g, '/'));
      if (isNaN(d.getTime())) return dateStr;
      const today = new Date();
      if (d.toDateString() === today.toDateString()) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const filteredNotifications = useMemo(() => {
    return (notifications || []).filter((n) => {
      // Unread only check
      if (unreadOnly && n.is_read) return false;

      // Category tab check
      if (activeFilter === 'mentions') {
        if (!['comment', 'mention', 'team_chat', 'team_chat_no_email', 'mention_no_email'].includes(n.type)) return false;
      } else if (activeFilter === 'tasks') {
        if (!['task_assigned', 'task_completed', 'status_change', 'due_soon'].includes(n.type)) return false;
      } else if (activeFilter === 'invites') {
        if (!['team_invite', 'access_request'].includes(n.type)) return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const text = (n.message || '').toLowerCase();
        return text.includes(query);
      }

      return true;
    });
  }, [notifications, activeFilter, unreadOnly, searchQuery]);

  // Unread filter counters per category
  const filterCounts = useMemo(() => {
    const notifs = notifications || [];
    return {
      all: notifs.length,
      mentions: notifs.filter((n) => ['comment', 'mention', 'team_chat', 'team_chat_no_email', 'mention_no_email'].includes(n.type)).length,
      tasks: notifs.filter((n) => ['task_assigned', 'task_completed', 'status_change', 'due_soon'].includes(n.type)).length,
      invites: notifs.filter((n) => ['team_invite', 'access_request'].includes(n.type)).length,
      unreadMentions: notifs.filter((n) => !n.is_read && ['comment', 'mention', 'team_chat', 'team_chat_no_email', 'mention_no_email'].includes(n.type)).length,
      unreadTasks: notifs.filter((n) => !n.is_read && ['task_assigned', 'task_completed', 'status_change', 'due_soon'].includes(n.type)).length,
      unreadInvites: notifs.filter((n) => !n.is_read && ['team_invite', 'access_request'].includes(n.type)).length,
    };
  }, [notifications]);

  const [selectedNotifId, setSelectedNotifId] = useState(null);

  const selectedNotification = useMemo(() => {
    return (notifications || []).find((n) => n.id === selectedNotifId) || filteredNotifications[0] || null;
  }, [notifications, selectedNotifId, filteredNotifications]);

  const targetTask = useMemo(() => {
    if (!selectedNotification || !selectedNotification.related_task_id) return null;
    return (tasks || []).find((t) => String(t.id) === String(selectedNotification.related_task_id)) || null;
  }, [selectedNotification, tasks]);

  const [taskComments, setTaskComments] = useState([]);
  const [quickReplyText, setQuickReplyText] = useState('');
  const [isMentioning, setIsMentioning] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);

  const { lastWsMessage } = context;

  // Initial fetch of task comments when targetTask changes
  React.useEffect(() => {
    let isMounted = true;
    if (selectedNotification && !selectedNotification.is_read && handleReadNotification) {
      handleReadNotification(selectedNotification.id);
    }
    if (targetTask && targetTask.id) {
      const storageKey = `alurku_last_read_task_${targetTask.id}_${currentUser}`;
      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
      localStorage.setItem(storageKey, nowStr);
      if (context.fetchInboxChats) context.fetchInboxChats();

      axios
        .get(`/api/tasks/${targetTask.id}/comments`)
        .then((res) => {
          if (isMounted) {
            setTaskComments(res.data?.comments || []);
          }
        })
        .catch(() => {
          if (isMounted) setTaskComments([]);
        });
      return () => {
        isMounted = false;
      };
    } else {
      setTaskComments([]);
    }
  }, [targetTask, selectedNotification]);

  // Real-time WebSocket event listener for instant comment updates
  React.useEffect(() => {
    if (!lastWsMessage || !targetTask || !targetTask.id) return;
    
    // Check if the WebSocket message is a chat/comment event related to this task
    if (
      lastWsMessage.type === 'chat_message' &&
      (lastWsMessage.chat_type === 'task' || !lastWsMessage.chat_type) &&
      String(lastWsMessage.target_id) === String(targetTask.id)
    ) {
      const newMsg = {
        id: lastWsMessage.id || Date.now(),
        username: lastWsMessage.sender || lastWsMessage.username,
        text: lastWsMessage.text || lastWsMessage.comment,
        comment: lastWsMessage.text || lastWsMessage.comment,
        timestamp: lastWsMessage.timestamp || new Date().toISOString().replace('T', ' ').slice(0, 19),
      };
      setTaskComments((prev) => {
        if (prev.some((c) => c.id === newMsg.id || (c.username === newMsg.username && c.text === newMsg.text))) {
          return prev;
        }
        return [...prev, newMsg];
      });
    }
  }, [lastWsMessage, targetTask]);

  const globalMentionOptions = useMemo(() => {
    return (context.userDirectory || []).map((u) => u.username).filter((u) => u !== currentUser);
  }, [context.userDirectory, currentUser]);

  const handleTextChange = (val) => {
    setQuickReplyText(val);
    const lastWord = val.split(/\s+/).pop();
    if (lastWord && lastWord.startsWith('@')) {
      setIsMentioning(true);
      setMentionQuery(lastWord.slice(1).toLowerCase());
      setMentionIndex(0);
    } else {
      setIsMentioning(false);
    }
  };

  const insertMention = (username) => {
    const words = quickReplyText.split(/\s+/);
    words.pop();
    const newText = [...words, `@${username} `].join(' ');
    setQuickReplyText(newText);
    setIsMentioning(false);
  };

  const handleSendQuickReply = (e) => {
    e.preventDefault();
    const text = quickReplyText.trim();
    if (!text) return;

    if (targetTask) {
      const lowerText = text.toLowerCase();
      const isPrivateAI = lowerText.includes('@ai (private)') || lowerText.includes('🕵️') || lowerText.includes('@ai (privat)');
      const isAITarget = lowerText.includes('@smart assistant') || lowerText.includes('@ai') || lowerText.includes('@luruka');

      if (isAITarget && context.handleAskAITaskChat && !context.isAiReplying) {
        context.handleAskAITaskChat(
          targetTask.id,
          text,
          text,
          () => {
            setQuickReplyText('');
            setIsMentioning(false);
          },
          isPrivateAI
        );
        return;
      }

      axios
        .post(`/api/tasks/${targetTask.id}/comments`, {
          text: text,
        })
        .then((res) => {
          setQuickReplyText('');
          setIsMentioning(false);
          if (res.data?.comment) {
            setTaskComments((prev) => [...prev, res.data.comment]);
          }
          if (context.showNotification) {
            context.showNotification(tMsg('Reply sent successfully!', 'Balasan berhasil dikirim!'), 'success');
          }
        })
        .catch((err) => {
          console.error('Failed to send quick reply:', err);
        });
    } else {
      if (context.showNotification) {
        context.showNotification(tMsg('Navigating to full thread...', 'Membuka thread penuh...'), 'info');
      }
      handleOpenFullModal(selectedNotification);
    }
  };

  const handleItemClick = (n) => {
    setSelectedNotifId(n.id);
    if (!n.is_read && handleReadNotification) {
      handleReadNotification(n.id);
    }
  };

  const handleOpenFullModal = (n) => {
    if (!n) return;
    if (n.type === 'team_invite' || n.type === 'access_request') {
      if (setIsInvitesModalOpen) setIsInvitesModalOpen(true);
      return;
    }
    if (n.type === 'team_chat' || n.type === 'team_chat_no_email') {
      if (setWorkspaceChatTarget && n.related_task_id) {
        const targetBoard = (boards || []).find((b) => String(b.id) === String(n.related_task_id));
        if (targetBoard) {
          setWorkspaceChatTarget({
            type: 'project',
            id: targetBoard.id,
            name: `${targetBoard.name} (General)`,
            board_id: targetBoard.id,
          });
        }
      }
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', '/chat');
        window.dispatchEvent(new CustomEvent('alurku-navigate'));
      }
      return;
    }
    if (n.related_task_id && handleNotificationTaskClick) {
      handleNotificationTaskClick(n.related_task_id);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return (
          <div className="w-8 h-8 rounded-xl bg-[#111E38] text-[#FACC15] flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'task_completed':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'comment':
      case 'mention':
      case 'mention_no_email':
      case 'team_chat':
      case 'team_chat_no_email':
        return (
          <div className="w-8 h-8 rounded-xl bg-[#FACC15] text-[#111E38] flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      case 'team_invite':
      case 'access_request':
        return (
          <div className="w-8 h-8 rounded-xl bg-[#111E38] text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-[#111E38] dark:text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full max-h-full min-h-0 bg-[#F3F4F6] dark:bg-[#0d0f11] text-[#111E38] dark:text-white overflow-hidden p-4 md:p-6">
      {/* Page Header Bar */}
      <div className="bg-white dark:bg-[#121B2D] p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FACC15] text-[#111E38] flex items-center justify-center font-black shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-[#111E38] dark:text-white tracking-tight flex items-center gap-2">
              <span>{tMsg('Inbox & Notifications', 'Kotak Masuk & Notifikasi')}</span>
              {unreadCount > 0 && (
                <span className="bg-[#FACC15] text-[#111E38] text-xs px-2 py-0.5 rounded-full font-black shadow-xs animate-pulse">
                  {unreadCount} {tMsg('new', 'baru')}
                </span>
              )}
            </h1>
            <p className="text-xs text-neutral-500 font-medium">
              {tMsg('All your notifications, mentions, and updates in one place', 'Semua notifikasi, balasan pesan, dan pembaruan tugasmu dalam satu halaman')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleReadAllNotifications}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] hover:opacity-90 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{tMsg('Mark All as Read', 'Tandai Semua Dibaca')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#121B2D] p-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        {/* Category Tabs with Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'all'
                ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <span>{tMsg('All', 'Semua')} ({filterCounts.all})</span>
          </button>
          <button
            onClick={() => setActiveFilter('mentions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'mentions'
                ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{tMsg('Replies & Mentions', 'Balasan & Tag @')}</span>
            {filterCounts.unreadMentions > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#FACC15] text-[#111E38] text-[10px] font-black">
                {filterCounts.unreadMentions}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveFilter('tasks')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'tasks'
                ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>{tMsg('Task Updates', 'Tugas')}</span>
            {filterCounts.unreadTasks > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-500 text-white text-[10px] font-black">
                {filterCounts.unreadTasks}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveFilter('invites')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'invites'
                ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{tMsg('Invites', 'Undangan')}</span>
            {filterCounts.unreadInvites > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                {filterCounts.unreadInvites}
              </span>
            )}
          </button>
        </div>

        {/* Toggle Unread & Search Box */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold cursor-pointer select-none">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-[#FACC15]"
            />
            <span>{tMsg('Unread Only', 'Belum Dibaca Saja')}</span>
          </label>
          <div className="relative flex-1 md:w-60">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tMsg('Filter inbox...', 'Cari di inbox...')}
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 rounded-xl text-xs font-medium text-black dark:text-white focus:outline-none focus:border-[#FACC15]"
            />
          </div>
        </div>
      </div>

      {/* Main Dual-Panel Split View Container */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Left Column: Notification Feed List */}
        <div className="w-full md:w-1/2 lg:w-5/12 bg-white dark:bg-[#121B2D] rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs overflow-y-auto custom-scrollbar divide-y divide-neutral-100 dark:divide-neutral-800/60 min-h-0">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-neutral-400 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800/60 flex items-center justify-center mb-3 text-neutral-300 dark:text-neutral-600">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="font-bold text-sm text-[#111E38] dark:text-white mb-1">
                {tMsg('No notifications found', 'Tidak ada notifikasi')}
              </h3>
              <p className="text-xs max-w-xs">
                {unreadOnly
                  ? tMsg('All caught up! You have no unread notifications.', 'Semua sudah dibaca!')
                  : tMsg('Notifications about your assigned tasks and mentions will appear here.', 'Pembaruan tugas dan sebutan namamu akan muncul di sini.')}
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const isUnread = !n.is_read;
              const isSelected = selectedNotification?.id === n.id;
              const cleanText = (n.message || '')
                .replace(/<!--TASK_ID:\d+-->/g, '')
                .replace(/Smart Assistant 🤖/g, 'Luruka')
                .replace(/Smart Assistant/g, 'Luruka')
                .replace(/Luruka 🤖/g, 'Luruka')
                .replace(/🤖/g, '');

              return (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3.5 transition-all cursor-pointer flex items-start gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 relative ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-indigo-600 dark:border-[#FACC15]'
                      : isUnread
                      ? 'bg-amber-500/5 dark:bg-[#FACC15]/5 border-l-4 border-[#FACC15]'
                      : 'opacity-90'
                  }`}
                >
                  {getNotificationIcon(n.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className={`text-xs ${isUnread || isSelected ? 'font-black text-[#111E38] dark:text-white' : 'font-medium text-neutral-700 dark:text-neutral-300'} line-clamp-2`}>
                        {cleanText}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                        {n.type?.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-bold text-neutral-400 shrink-0">
                        {formatDateMMM(n.timestamp)}
                      </span>
                    </div>
                  </div>
                  {isUnread && (
                    <div className="w-2 h-2 rounded-full bg-[#FACC15] shrink-0 mt-1 shadow-[0_0_6px_rgba(250,204,21,0.8)] animate-pulse" title="Unread" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Split View Detail Preview Panel */}
        <div className="hidden md:flex flex-1 bg-white dark:bg-[#121B2D] rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs flex-col overflow-hidden p-5">
          {selectedNotification ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Header Preview */}
              <div className="pb-4 mb-4 border-b border-neutral-200/70 dark:border-neutral-800 flex items-start justify-between gap-4 shrink-0">
                <div className="flex items-start gap-3">
                  {getNotificationIcon(selectedNotification.type)}
                  <div>
                    <h2 className="text-sm md:text-base font-black text-[#111E38] dark:text-white leading-tight">
                      {(selectedNotification.message || '')
                        .replace(/<!--TASK_ID:\d+-->/g, '')
                        .replace(/Smart Assistant 🤖/g, 'Luruka')
                        .replace(/Smart Assistant/g, 'Luruka')
                        .replace(/Luruka 🤖/g, 'Luruka')
                        .replace(/🤖/g, '')}
                    </h2>
                    <span className="text-xs text-neutral-400 font-medium">
                      {formatDateMMM(selectedNotification.timestamp)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenFullModal(selectedNotification)}
                  className="px-3 py-1.5 rounded-xl bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                >
                  <span>{tMsg('Open Full Context', 'Buka Penuh')}</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>

              {/* Body Content Details & Conversation Thread */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                {targetTask ? (
                  <div className="bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-xl border border-neutral-200/60 dark:border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-indigo-600 dark:text-[#FACC15] uppercase tracking-wider">
                        {targetTask.category || 'Task Detail'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        targetTask.status === 'Done' || targetTask.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                        {targetTask.status}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-[#111E38] dark:text-white">
                      {targetTask.project_name}
                    </h3>

                    {targetTask.description && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                        {targetTask.description}
                      </p>
                    )}

                    <div className="pt-2 border-t border-neutral-200/50 dark:border-neutral-800 flex flex-wrap gap-4 text-xs font-semibold text-neutral-500">
                      <div>
                        <span className="text-neutral-400 block text-[10px]">{tMsg('Assignee', 'Tanggung Jawab')}</span>
                        <span className="text-[#111E38] dark:text-neutral-200">{targetTask.assignee || targetTask.requester || '-'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[10px]">{tMsg('Deadline', 'Tenggat Waktu')}</span>
                        <span className="text-[#111E38] dark:text-neutral-200">{targetTask.deadline ? formatDateMMM(targetTask.deadline) : '-'}</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Conversation Thread Messages */}
                {taskComments.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">
                      {tMsg('Conversation History', 'Riwayat Percakapan')} ({taskComments.length})
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                      {taskComments.map((c) => (
                        <div key={c.id} className="p-3 bg-white dark:bg-neutral-800/80 rounded-xl border border-neutral-200/70 dark:border-neutral-700/80 text-xs shadow-2xs">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-[#111E38] dark:text-[#FACC15]">@{c.username}</span>
                            <span className="text-[10px] text-neutral-400">{formatDateMMM(c.timestamp)}</span>
                          </div>
                          <div
                            className="text-neutral-700 dark:text-neutral-200 leading-normal overflow-hidden break-words text-xs space-y-1"
                            dangerouslySetInnerHTML={{
                              __html: renderChatMessageContent(c.comment || c.text || '', c.username === currentUser),
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Reply Box with Interactive Mention Suggestions */}
                {selectedNotification && (
                  <div className="bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-xl border border-neutral-200/60 dark:border-neutral-800 space-y-2 relative">
                    <h4 className="text-xs font-bold text-[#111E38] dark:text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-indigo-500">reply</span>
                      <span>{tMsg('Quick Reply / Comment', 'Balas Cepat / Komentar')}</span>
                    </h4>
                    <form onSubmit={handleSendQuickReply} className="flex flex-col gap-2 relative">
                      <textarea
                        value={quickReplyText}
                        onChange={(e) => handleTextChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (isMentioning) {
                            const filtered = ['all', 'AI (Team)', 'AI (Private)', ...globalMentionOptions].filter((m) =>
                              m.toLowerCase().includes(mentionQuery)
                            );
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setMentionIndex((prev) => (prev + 1) % (filtered.length || 1));
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setMentionIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
                            } else if (e.key === 'Enter' || e.key === 'Tab') {
                              if (filtered.length > 0) {
                                e.preventDefault();
                                insertMention(filtered[mentionIndex] || filtered[0]);
                              }
                            } else if (e.key === 'Escape') {
                              setIsMentioning(false);
                            }
                          }
                        }}
                        rows={2}
                        placeholder={tMsg('Write a quick reply... (type @ to mention)', 'Tulis balasan cepat... (ketik @ untuk tag)')}
                        className="w-full p-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-[#FACC15] resize-none"
                      />

                      {/* Mention Floating Suggestion Popup */}
                      {isMentioning && (
                        <div className="absolute left-0 bottom-full mb-2 w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto py-1">
                          {(() => {
                            const allOps = ['all', 'AI (Team)', 'AI (Private)', ...globalMentionOptions];
                            const filtered = allOps.filter((m) => m.toLowerCase().includes(mentionQuery));
                            if (filtered.length === 0) return <div className="px-3 py-1.5 text-xs text-neutral-400 italic">No user found</div>;
                            return filtered.map((m, idx) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => insertMention(m)}
                                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${
                                  idx === mentionIndex ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                }`}
                              >
                                <span>@{m}</span>
                                {m.startsWith('AI') && <span className="text-[10px] opacity-75">Assistant</span>}
                              </button>
                            ));
                          })()}
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 bg-[#FACC15] text-[#111E38] text-xs font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <span>{tMsg('Send Reply', 'Kirim Balasan')}</span>
                          <span className="material-symbols-outlined text-sm">send</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 p-8 text-center">
              <span className="material-symbols-outlined text-4xl mb-2 text-neutral-300 dark:text-neutral-700">mark_email_read</span>
              <p className="text-xs font-bold">{tMsg('Select a notification to view detail', 'Pilih notifikasi untuk melihat detail')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
