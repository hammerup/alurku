import React from 'react';

export default function ChatInputArea({
  activeChat,
  isSuperAdmin,
  accountStatus,
  chatBg,
  replyingTo,
  setReplyingTo,
  sendMessage,
  newMessage,
  setNewMessage,
  handleInputChange,
  boards,
  activeBoardMembers,
  isAiReplying,
  handleAskAITaskChat,
  messagesEndRef,
  setMessages,
  currentUser,
  getLocalTimestamp,
  isMentioning,
  setIsMentioning,
  mentionQuery,
  mentionIndex,
  setMentionIndex,
  insertMention,
  tMsg,
}) {
  return (
    <div
      className={`p-4 border-t border-neutral-200 dark:border-neutral-800 shrink-0 relative z-20 ${
        chatBg ? 'bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md' : 'bg-white dark:bg-neutral-950'
      }`}
    >
      {replyingTo && (
        <div className="mb-3 flex items-start justify-between bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl p-2.5 border border-indigo-100 dark:border-indigo-800/50">
          <div className="min-w-0 flex-1 border-l-2 border-indigo-400 pl-2">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">
              Replying to @{replyingTo.username}
            </span>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate pr-4">
              {replyingTo.text.replace(/^> .*?\n/gm, '').replace(/<[^>]*>?/gm, '')}
            </p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-neutral-400 hover:text-black dark:hover:text-white p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            ✖
          </button>
        </div>
      )}
      <form onSubmit={sendMessage} className="flex gap-2 relative items-end">
        {activeChat?.type === 'task' && (
          <>
            <button
              type="button"
              onClick={() => {
                if (!newMessage.trim() || !activeChat?.id) return;
                let finalComment = newMessage.trim();
                if (replyingTo) {
                  const cleanPreview = replyingTo.text
                    .replace(/^> .*?\n/gm, '')
                    .replace(/<[^>]*>?/gm, '')
                    .trim();
                  const truncated = cleanPreview.length > 80 ? cleanPreview.substring(0, 80) + '...' : cleanPreview;
                  finalComment = `> **@${replyingTo.username}**: ${truncated}\n${finalComment}`;
                }

                const tempId = Date.now();
                if (setMessages) {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: tempId,
                      username: currentUser,
                      text: finalComment,
                      timestamp: getLocalTimestamp ? getLocalTimestamp() : new Date().toISOString(),
                      reactions: {},
                      isPrivate: false,
                      privateUser: currentUser,
                    },
                  ]);
                }
                setTimeout(() => messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' }), 100);

                if (handleAskAITaskChat) {
                  handleAskAITaskChat(
                    activeChat.id,
                    finalComment,
                    newMessage.trim(),
                    () => {
                      setNewMessage('');
                      setReplyingTo(null);
                    },
                    false
                  );
                }
              }}
              disabled={accountStatus === 'suspended' || !newMessage.trim() || isAiReplying}
              className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 w-10 sm:w-12 h-[48px] rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
              title={tMsg ? tMsg('Ask AI (Team)', 'Tanya AI (Tim)') : 'Ask AI (Team)'}
            >
              ✨
            </button>
            <button
              type="button"
              onClick={() => {
                if (!newMessage.trim() || !activeChat?.id) return;
                let finalComment = newMessage.trim();
                if (replyingTo) {
                  const cleanPreview = replyingTo.text
                    .replace(/^> .*?\n/gm, '')
                    .replace(/<[^>]*>?/gm, '')
                    .trim();
                  const truncated = cleanPreview.length > 80 ? cleanPreview.substring(0, 80) + '...' : cleanPreview;
                  finalComment = `> **@${replyingTo.username}**: ${truncated}\n${finalComment}`;
                }

                const tempId = Date.now();
                if (setMessages) {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: tempId,
                      username: currentUser,
                      text: finalComment,
                      timestamp: getLocalTimestamp ? getLocalTimestamp() : new Date().toISOString(),
                      reactions: {},
                      isPrivate: true,
                      privateUser: currentUser,
                    },
                  ]);
                }
                setTimeout(() => messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' }), 100);

                if (handleAskAITaskChat) {
                  handleAskAITaskChat(
                    activeChat.id,
                    finalComment,
                    newMessage.trim(),
                    () => {
                      setNewMessage('');
                      setReplyingTo(null);
                    },
                    true
                  );
                }
              }}
              disabled={accountStatus === 'suspended' || !newMessage.trim() || isAiReplying}
              className="bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-slate-400 w-10 sm:w-12 h-[48px] rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
              title={tMsg ? tMsg('Ask AI (Private)', 'Tanya AI (Privat)') : 'Ask AI (Private)'}
            >
              🕵️
            </button>
          </>
        )}
        <textarea
          value={newMessage}
          onChange={handleInputChange || ((e) => setNewMessage && setNewMessage(e.target.value))}
          disabled={accountStatus === 'suspended'}
          placeholder={activeChat?.type === 'dm' ? 'Type a message...' : 'Write a comment... (@AI to ask)'}
          className="flex-1 py-3 px-4 bg-neutral-100 dark:bg-neutral-900 border border-transparent text-[#111E38] dark:text-white rounded-xl focus:bg-white dark:focus:bg-black focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs font-medium placeholder-neutral-400 transition-colors disabled:opacity-50 resize-none max-h-[120px]"
          style={{ minHeight: '44px' }}
          rows="1"
          onInput={(e) => {
            e.target.style.height = '44px';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
          onKeyDown={(e) => {
            if (isMentioning) {
              const activeBoardIsPrivate = boards?.find((b) => b.id === activeChat?.board_id)?.is_private;
              const allOps =
                activeChat?.type === 'task'
                  ? activeBoardIsPrivate
                    ? ['AI (Private)', 'AI (Team)']
                    : ['all', 'AI (Team)', 'AI (Private)', ...(activeBoardMembers || [])]
                  : activeChat?.type === 'project'
                  ? ['team', ...(activeBoardMembers || [])]
                  : [];
              const filtered = allOps.filter((m) => m.toLowerCase().includes(mentionQuery));
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (setMentionIndex) setMentionIndex((prev) => (prev + 1) % (filtered.length || 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (setMentionIndex) setMentionIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filtered.length > 0 && insertMention) {
                  insertMention(filtered[mentionIndex] || filtered[0]);
                }
              }
            } else if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (sendMessage) sendMessage(e);
              e.target.style.height = '44px';
            }
          }}
        />
        {isMentioning && accountStatus !== 'suspended' && activeChat?.type !== 'dm' && (
          <div className="absolute left-0 bottom-full mb-2 w-full min-w-[200px] bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-2xl z-50 max-h-40 overflow-y-auto py-2">
            {(() => {
              const activeBoardIsPrivate = boards?.find((b) => b.id === activeChat?.board_id)?.is_private;
              const allOptions =
                activeChat?.type === 'task'
                  ? activeBoardIsPrivate
                    ? ['AI (Private)', 'AI (Team)']
                    : ['all', 'AI (Team)', 'AI (Private)', ...(activeBoardMembers || [])]
                  : activeChat?.type === 'project'
                  ? ['team', ...(activeBoardMembers || [])]
                  : [];
              const filteredOptions = allOptions.filter((m) => m.toLowerCase().includes(mentionQuery));
              if (filteredOptions.length === 0) return null;
              return filteredOptions.map((opt, idx) => (
                <button
                  key={`mention-opt-${opt}`}
                  type="button"
                  onClick={() => insertMention && insertMention(opt)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-bold transition-colors flex items-center gap-2 ${
                    idx === mentionIndex
                      ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span className="text-indigo-500 font-extrabold">@</span>
                  <span>{opt}</span>
                </button>
              ));
            })()}
          </div>
        )}
        <button
          type="submit"
          disabled={accountStatus === 'suspended' || !newMessage.trim()}
          className="bg-[#FACC15] text-[#111E38] hover:bg-amber-400 w-12 h-[44px] rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 shrink-0 font-bold shadow-xs"
        >
          <span className="material-symbols-outlined text-lg">send</span>
        </button>
      </form>
    </div>
  );
}
