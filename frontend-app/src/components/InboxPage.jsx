import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Avatar } from '../SharedUI';

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

  const handleItemClick = (n) => {
    if (!n.is_read && handleReadNotification) {
      handleReadNotification(n.id);
    }

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
        window.history.pushState({}, '', '/workspace-chat');
      }
      if (setCurrentPath) setCurrentPath('/workspace-chat');
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
              <span>{tMsg('Inbox & Replies', 'Kotak Masuk & Notifikasi')}</span>
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
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'all'
                ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <span>{tMsg('All Notifications', 'Semua')} ({(notifications || []).length})</span>
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

      {/* Main Inbox Notification Feed */}
      <div className="flex-1 bg-white dark:bg-[#121B2D] rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs overflow-y-auto custom-scrollbar divide-y divide-neutral-100 dark:divide-neutral-800/60 min-h-0">
        {filteredNotifications.length === 0 ? (
          <div className="p-16 text-center text-neutral-400 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800/60 flex items-center justify-center mb-3 text-neutral-300 dark:text-neutral-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="font-bold text-base text-[#111E38] dark:text-white mb-1">
              {tMsg('No notifications found', 'Tidak ada notifikasi')}
            </h3>
            <p className="text-xs max-w-sm">
              {unreadOnly
                ? tMsg('All caught up! You have no unread notifications.', 'Semua sudah dibaca! Kamu tidak memiliki notifikasi baru.')
                : tMsg('Notifications about your assigned tasks and mentions will appear here.', 'Notifikasi tentang tugas, balasan pesan, dan sebutan namamu akan muncul di sini.')}
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isUnread = !n.is_read;
            const cleanText = (n.message || '')
              .replace(/<!--TASK_ID:\d+-->/g, '')
              .replace(/Smart Assistant 🤖/g, 'Luruka 🤖')
              .replace(/Smart Assistant/g, 'Luruka');

            return (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`p-4 transition-all cursor-pointer flex items-start gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 group relative ${
                  isUnread
                    ? 'bg-amber-500/5 dark:bg-[#FACC15]/5 border-l-4 border-[#FACC15]'
                    : 'opacity-90 hover:opacity-100'
                }`}
              >
                {getNotificationIcon(n.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={`text-xs md:text-sm ${isUnread ? 'font-black text-[#111E38] dark:text-white' : 'font-medium text-neutral-700 dark:text-neutral-300'}`}>
                      {cleanText}
                    </p>
                    <span className="text-[10px] font-bold text-neutral-400 shrink-0">
                      {formatDateMMM(n.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                      {n.type?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-bold text-[#111E38] dark:text-[#FACC15] group-hover:underline flex items-center gap-1">
                      <span>{tMsg('View detail', 'Lihat detail')}</span>
                      <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
                {isUnread && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FACC15] shrink-0 mt-1 shadow-[0_0_6px_rgba(250,204,21,0.8)] animate-pulse" title="Unread" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
