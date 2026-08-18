import React from 'react';
import ChatMessage from '../../ChatMessage';
import { Avatar } from '../../SharedUI';

export default function ChatMessageList({
  scrollContainerRef,
  handleScroll,
  isLoadingMessages,
  messages = [],
  hasMoreMessages,
  loadMoreMessages,
  tMsg,
  formatDateMMM,
  currentUser,
  avatarsMap,
  firstUnreadId,
  setReplyingTo,
  deleteWorkspaceMessage,
  showNotification,
  toggleWorkspaceReaction,
  activeChat,
  isSuperAdmin,
  accountStatus,
  isAiReplying,
  messagesEndRef,
}) {
  const filteredMessages = (messages || []).filter(
    (c) =>
      c &&
      c.username !== 'System' &&
      c.username?.toLowerCase() !== 'system' &&
      !c?.text?.startsWith('[ACTIVITY]') &&
      !c?.text?.includes('[ACTIVITY]')
  );

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-neutral-50/50 dark:bg-neutral-900/30 relative z-10 flex flex-col"
    >
      <div className="relative z-10 flex flex-col gap-4 flex-1">
        {isLoadingMessages && filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center my-auto py-20 opacity-60">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#111E38] dark:border-[#FACC15] border-t-transparent mb-3"></div>
            <span className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
              {tMsg('Loading messages...', 'Memuat pesan...')}
            </span>
          </div>
        ) : (
          <>
            {hasMoreMessages && (
              <div className="flex justify-center my-2 relative">
                <button
                  type="button"
                  onClick={loadMoreMessages}
                  className="text-[11px] font-bold text-slate-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 px-4 py-2 rounded-full transition-colors border border-neutral-200 dark:border-neutral-700 shadow-2xs z-10"
                >
                  {tMsg('Load older messages', 'Muat pesan terdahulu')}
                </button>
              </div>
            )}

            {filteredMessages.map((c, index, arr) => {
              const currDate = new Date(c.timestamp.replace(/-/g, '/')).toDateString();
              const prevDate =
                index > 0 ? new Date(arr[index - 1].timestamp.replace(/-/g, '/')).toDateString() : null;
              const showDivider = currDate !== prevDate;

              let dividerDisplay = '';
              if (showDivider) {
                const today = new Date().toDateString();
                const yesterday = new Date(Date.now() - 86400000).toDateString();
                if (currDate === today) dividerDisplay = tMsg('Today', 'Hari Ini');
                else if (currDate === yesterday) dividerDisplay = tMsg('Yesterday', 'Kemarin');
                else dividerDisplay = formatDateMMM(c.timestamp);
              }

              return (
                <ChatMessage
                  key={c.id}
                  message={c}
                  currentUser={currentUser}
                  avatarsMap={avatarsMap}
                  showDivider={showDivider}
                  dividerDisplay={dividerDisplay}
                  isFirstUnread={c.id === firstUnreadId}
                  onReply={() => setReplyingTo(c)}
                  onDelete={() => deleteWorkspaceMessage(c.id)}
                  onCopy={() => {
                    let cleanText = (c.text || '')
                      .replace(/\*\*(.*?)\*\*/g, '$1')
                      .replace(/\*(.*?)\*/g, '$1')
                      .replace(/__(.*?)__/g, '$1');
                    const temp = document.createElement('textarea');
                    temp.innerHTML = cleanText;
                    navigator.clipboard.writeText(temp.value.trim());
                    if (showNotification)
                      showNotification(tMsg('Copied to clipboard!', 'Disalin ke papan klip!'), 'info');
                  }}
                  onReact={(emoji) => toggleWorkspaceReaction(c.id, emoji)}
                  canReply={
                    activeChat?.type !== 'dm' &&
                    (activeChat?.type === 'project' || activeChat?.is_involved !== false || isSuperAdmin)
                  }
                  canDelete={
                    (c.username === currentUser || isSuperAdmin) && accountStatus !== 'suspended'
                  }
                  canReact={
                    accountStatus !== 'suspended' &&
                    (activeChat?.type === 'dm' ||
                      activeChat?.type === 'project' ||
                      activeChat?.is_involved !== false ||
                      isSuperAdmin)
                  }
                  idPrefix="cw-msg-"
                  tMsg={tMsg}
                />
              );
            })}

            {isAiReplying && activeChat?.type === 'task' && (
              <div className="flex gap-3 w-full p-1.5 -mx-1.5 flex-row chat-animate group/bubble">
                <Avatar name="Luruka" url="" size="w-8 h-8 shrink-0" textClass="text-[10px]" />
                <div className="flex flex-col items-start min-w-0 max-w-[92%]">
                  <div className="flex items-baseline gap-2 mb-1 flex-row">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      @Luruka
                    </span>
                  </div>
                  <div className="p-3 text-sm font-medium leading-relaxed shadow-2xs shrink min-w-0 bg-white dark:bg-neutral-800 text-black dark:text-white border border-neutral-100 dark:border-neutral-700 rounded-2xl rounded-tl-xs flex gap-1.5 items-center h-10">
                    <span className="w-1.5 h-1.5 bg-[#111E38] dark:bg-[#FACC15] rounded-full animate-bounce"></span>
                    <span
                      className="w-1.5 h-1.5 bg-[#111E38] dark:bg-[#FACC15] rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    ></span>
                    <span
                      className="w-1.5 h-1.5 bg-[#111E38] dark:bg-[#FACC15] rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    ></span>
                  </div>
                </div>
              </div>
            )}

            {filteredMessages.length === 0 && !isLoadingMessages && (
              <div className="flex-1 flex flex-col items-center justify-center my-auto py-16 px-4 text-center select-none">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 flex items-center justify-center text-2xl shadow-2xs mb-3">
                  💬
                </div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-1">
                  {activeChat?.type === 'dm'
                    ? tMsg('No messages yet', 'Belum ada pesan')
                    : tMsg('Start the conversation', 'Mulai percakapan')}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm">
                  {activeChat?.type === 'dm'
                    ? tMsg(
                        `Send a direct message to start chatting with @${activeChat.partner || 'user'}.`,
                        `Kirim pesan langsung untuk mulai mengobrol dengan @${activeChat.partner || 'user'}.`
                      )
                    : tMsg(
                        'Collaborate, share task updates, and brainstorm with your workspace team.',
                        'Berkolaborasi, bagikan progres tugas, dan diskusikan rencana bersama tim.'
                      )}
                </p>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} className="h-6 shrink-0" />
      </div>
    </div>
  );
}
