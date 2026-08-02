import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';

export default function AssignedCommentsPage() {
  const {
    tMsg,
    tasks,
    comments,
    currentUser,
    avatarsMap,
    setSelectedTask,
    setIsTaskDetailOpen,
    handleAddComment,
    navigateTo,
    formatDateMMM,
  } = useAppContext();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'mentions'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskCommentId, setSelectedTaskCommentId] = useState(null);
  const [newReplyText, setNewReplyText] = useState('');

  // Extract all task comment threads where user is assigned, mentioned, or involved
  const commentThreads = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    const result = [];
    tasks.forEach((task) => {
      const taskComments = (comments && comments[task.id]) || task.comments || [];
      if (!taskComments || taskComments.length === 0) return;

      // Check if user is mentioned (@currentUser) or involved
      const hasMention = taskComments.some((c) =>
        (c.text || '').toLowerCase().includes(`@${(currentUser || '').toLowerCase()}`) ||
        (c.text || '').toLowerCase().includes('@all') ||
        (c.text || '').toLowerCase().includes('@team')
      );

      const isAssignee = (task.assignees || []).some(
        (a) => (typeof a === 'string' ? a : a.username || a.name) === currentUser
      );

      if (hasMention || isAssignee || taskComments.length > 0) {
        const lastComment = taskComments[taskComments.length - 1];
        const unreadCount = taskComments.filter((c) => !c.is_read && c.username !== currentUser).length;

        result.push({
          taskId: task.id,
          taskTitle: task.title,
          projectName: task.project_name || 'General',
          taskComments,
          lastComment,
          hasMention,
          unreadCount,
          updatedAt: lastComment?.timestamp || task.updated_at || task.created_at,
        });
      }
    });

    // Sort by latest comment timestamp descending
    return result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [tasks, comments, currentUser]);

  // Filtered threads based on tab & search
  const filteredThreads = useMemo(() => {
    return commentThreads.filter((thread) => {
      if (activeFilter === 'unread' && thread.unreadCount === 0) return false;
      if (activeFilter === 'mentions' && !thread.hasMention) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = thread.taskTitle.toLowerCase().includes(q);
        const matchesProject = thread.projectName.toLowerCase().includes(q);
        const matchesComment = thread.taskComments.some((c) =>
          (c.text || '').toLowerCase().includes(q)
        );
        return matchesTitle || matchesProject || matchesComment;
      }
      return true;
    });
  }, [commentThreads, activeFilter, searchQuery]);

  // Set initial selected thread
  const activeThread = useMemo(() => {
    if (selectedTaskCommentId) {
      const found = commentThreads.find((t) => t.taskId === selectedTaskCommentId);
      if (found) return found;
    }
    return filteredThreads[0] || null;
  }, [selectedTaskCommentId, commentThreads, filteredThreads]);

  const handleSendReply = async (e) => {
    e?.preventDefault();
    if (!newReplyText.trim() || !activeThread) return;

    const textToSend = newReplyText.trim();
    setNewReplyText('');

    if (handleAddComment) {
      await handleAddComment(activeThread.taskId, textToSend);
    }
  };

  const openTaskDetail = (taskId) => {
    const task = tasks?.find((t) => t.id === taskId);
    if (task) {
      if (setSelectedTask) setSelectedTask(task);
      if (setIsTaskDetailOpen) setIsTaskDetailOpen(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full max-h-full min-h-0 bg-[#F3F4F6] dark:bg-[#0d0f11] text-[#111E38] dark:text-white overflow-hidden p-4 md:p-6">
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-[#121B2D] p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FACC15] text-[#111E38] flex items-center justify-center font-black shadow-sm shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-[#111E38] dark:text-white tracking-tight flex items-center gap-2">
              <span>{tMsg('Assigned Comments & Discussions', 'Komentar & Diskusi Tugas')}</span>
              <span className="bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] text-xs px-2.5 py-0.5 rounded-full font-black shadow-xs">
                {commentThreads.length}
              </span>
            </h1>
            <p className="text-xs text-neutral-500 font-medium">
              {tMsg('All task comment threads and @mentions assigned to you in one place', 'Semua utas komentar dan sebutan @namamu dalam satu tampilan terpusat')}
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split Workspace */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 overflow-hidden">
        {/* Left Column: Thread List & Filters */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl shadow-xs overflow-hidden shrink-0">
          {/* Filter Tabs & Search */}
          <div className="p-3 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-2.5">
            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tMsg('Search comments & tasks...', 'Cari komentar atau tugas...')}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 rounded-xl text-xs font-medium text-[#111E38] dark:text-white placeholder-neutral-400 outline-none focus:border-[#FACC15]"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
                }`}
              >
                {tMsg('All', 'Semua')} ({commentThreads.length})
              </button>
              <button
                onClick={() => setActiveFilter('unread')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeFilter === 'unread'
                    ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
                }`}
              >
                {tMsg('Unread', 'Belum Dibaca')}
              </button>
              <button
                onClick={() => setActiveFilter('mentions')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeFilter === 'mentions'
                    ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
                }`}
              >
                {tMsg('Mentions @', 'Sebutan @')}
              </button>
            </div>
          </div>

          {/* List of Comment Threads */}
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-xs flex flex-col items-center justify-center h-full">
                <span className="material-symbols-outlined text-4xl text-neutral-300 dark:text-neutral-700 mb-2">forum</span>
                <p className="font-bold text-neutral-500 dark:text-neutral-400">
                  {tMsg('No comment threads found', 'Tidak ada utas komentar ditemukan')}
                </p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  {tMsg('Discussions and @mentions on tasks will appear here.', 'Diskusi dan sebutan @namamu pada tugas akan muncul di sini.')}
                </p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = activeThread?.taskId === thread.taskId;

                return (
                  <div
                    key={thread.taskId}
                    onClick={() => setSelectedTaskCommentId(thread.taskId)}
                    className={`p-3.5 cursor-pointer transition-all border-l-4 text-left ${
                      isSelected
                        ? 'border-[#FACC15] bg-amber-500/10 dark:bg-[#FACC15]/10'
                        : 'border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 truncate max-w-32">
                        {thread.projectName}
                      </span>
                      <span className="text-[10px] font-semibold text-neutral-400 shrink-0">
                        {formatDateMMM(thread.updatedAt)}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-[#111E38] dark:text-white line-clamp-1 mb-1.5">
                      {thread.taskTitle}
                    </h4>

                    {thread.lastComment && (
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#111E38] text-[#FACC15] text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          {thread.lastComment.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed flex-1">
                          <span className="font-bold text-[#111E38] dark:text-white mr-1">
                            @{thread.lastComment.username}:
                          </span>
                          {(thread.lastComment.text || '')
                            .replace(/<!--TASK_ID:\d+-->/g, '')
                            .replace(/Smart Assistant 🤖/g, 'Luruka')
                            .replace(/Smart Assistant/g, 'Luruka')
                            .replace(/🤖/g, '')}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/40">
                      <span className="text-[10px] font-bold text-neutral-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {thread.taskComments.length} {tMsg('comments', 'komentar')}
                      </span>
                      {thread.hasMention && (
                        <span className="bg-[#FACC15] text-[#111E38] text-[9px] px-1.5 py-0.5 rounded-full font-black shadow-2xs">
                          @Mentioned
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Thread Detail & Reply Input Box */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl shadow-xs overflow-hidden min-w-0">
          {activeThread ? (
            <>
              {/* Thread Header Bar */}
              <div className="p-4 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black uppercase tracking-wider text-[#FACC15] bg-[#111E38] px-2.5 py-0.5 rounded-md">
                      {activeThread.projectName}
                    </span>
                    <span className="text-xs text-neutral-400 font-medium">
                      {activeThread.taskComments.length} {tMsg('messages', 'pesan')}
                    </span>
                  </div>
                  <h2 className="text-base font-black text-[#111E38] dark:text-white">
                    {activeThread.taskTitle}
                  </h2>
                </div>

                <button
                  onClick={() => openTaskDetail(activeThread.taskId)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] text-xs font-extrabold hover:opacity-90 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <span>{tMsg('View Task Modal', 'Buka Modal Tugas')}</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>

              {/* Conversation Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-neutral-50/30 dark:bg-neutral-900/20">
                {activeThread.taskComments.map((c, idx) => {
                  const isMe = c.username === currentUser;
                  const formattedText = (c.text || '')
                    .replace(/<!--TASK_ID:\d+-->/g, '')
                    .replace(/Smart Assistant 🤖/g, 'Luruka')
                    .replace(/Smart Assistant/g, 'Luruka')
                    .replace(/🤖/g, '');

                  return (
                    <div
                      key={c.id || idx}
                      className={`flex gap-3 items-start ${isMe ? 'flex-row-reverse' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#111E38] text-[#FACC15] font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {c.username?.[0]?.toUpperCase() || 'U'}
                      </div>

                      <div
                        className={`max-w-[80%] p-3.5 rounded-2xl text-xs space-y-1 ${
                          isMe
                            ? 'bg-[#111E38] text-white dark:bg-[#121B2D] dark:border dark:border-neutral-700/80 rounded-tr-xs'
                            : 'bg-white dark:bg-neutral-800 text-[#111E38] dark:text-white border border-neutral-200/80 dark:border-neutral-700/80 rounded-tl-xs shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 border-b border-white/10 dark:border-neutral-700/60 pb-1 mb-1">
                          <span className="font-bold">@{c.username || 'User'}</span>
                          <span>{formatDateMMM(c.timestamp)}</span>
                        </div>
                        <p className="leading-relaxed font-medium whitespace-pre-wrap">
                          {formattedText}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Interactive Reply Input Box */}
              <form
                onSubmit={handleSendReply}
                className="p-3 border-t border-neutral-100 dark:border-neutral-800/80 bg-white dark:bg-[#121B2D] flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={newReplyText}
                  onChange={(e) => setNewReplyText(e.target.value)}
                  placeholder={tMsg('Write a reply... (@mention to notify)', 'Tulis balasan... (@namateman untuk men-tag)')}
                  className="flex-1 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl text-xs font-medium text-[#111E38] dark:text-white placeholder-neutral-400 outline-none focus:bg-white dark:focus:bg-black focus:border-[#FACC15] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newReplyText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#FACC15] text-[#111E38] font-black text-xs hover:bg-amber-400 transition-all disabled:opacity-50 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>{tMsg('Reply', 'Kirim')}</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-400 text-center">
              <span className="material-symbols-outlined text-5xl text-neutral-300 dark:text-neutral-700 mb-2">forum</span>
              <p className="text-sm font-bold text-neutral-600 dark:text-neutral-300">
                {tMsg('Select a comment thread from the left', 'Pilih utas komentar dari daftar di sebelah kiri')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
