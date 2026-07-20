import React from 'react';
import ChatMessage from '../../ChatMessage';
import { LoadingSpinner } from '../../Utils';

const getOptionIcon = (opt) => {
  const text = opt.toLowerCase();
  
  if (text.includes('create task') || text.includes('tugas baru') || text.includes('add task') || text.includes('buat tugas')) {
    return (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    );
  }
  if (text.includes('analysis') || text.includes('analisis') || text.includes('report') || text.includes('ringkasan')) {
    return (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
      </svg>
    );
  }
  if (text.includes('meeting') || text.includes('catatan rapat') || text.includes('notulensi') || text.includes('notes')) {
    return (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    );
  }
  if (text.includes('more') || text.includes('opsi lain') || text.includes('lainnya')) {
    return (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    );
  }
  if (text.includes('team') || text.includes('tim')) {
    return (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 20c-2.202 0-4.277-.627-6.034-1.714m16.33 1.282A11.36 11.36 0 0022.5 15c0-2.338-1.09-4.42-2.795-5.787M12 14.25a3 3 0 110-6 3 3 0 010 6zm5-2.25a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5zM12 14.25c-1.907 0-3.61.9-4.705 2.295a1.125 1.125 0 00.846 1.77h7.718a1.125 1.125 0 00.847-1.77c-1.096-1.396-2.8-2.295-4.706-2.295z" />
      </svg>
    );
  }
  if (text.includes('time off') || text.includes('cuti') || text.includes('libur')) {
    return (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h12.75A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h12.75A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
      </svg>
    );
  }
  if (text.includes('doc') || text.includes('help') || text.includes('bantuan') || text.includes('panduan')) {
    return (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    );
  }
  if (text.includes('reset') || text.includes('ulang') || text.includes('start over')) {
    return (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    );
  }
  if (text.includes('yes') || text.includes('ya') || text.includes('proceed') || text.includes('lanjut')) {
    return (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    );
  }
  if (text.includes('cancel') || text.includes('batal') || text.includes('close') || text.includes('tutup') || text.includes('tidak') || text.includes('no')) {
    return (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  if (text.includes('auto') || text.includes('otomatis') || text.includes('magic') || text.includes('draft')) {
    return (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21L14.907 13.913M9.813 15.904L14.5 11.5M9.813 15.904L5 11.5M14.907 13.913L18 9L12.093 11.087M14.907 13.913L12.5 7.5" />
      </svg>
    );
  }
  return null;
};

export default function SmartAssistantChat({
  messages,
  setDiscardConfirmAction,
  setMessages,
  setAssistantMode,
  tMsg,
  selectedModel,
  setSelectedModel,
  language,
  aiProvider,
  startConversation,
  chatBg,
  scrollContainerRef,
  currentUser,
  getLocalTimestamp,
  avatarsMap,
  showNotification,
  handleUserReply,
  step,
  currentBotMessage,
  optCancel,
  noteSuggestions,
  setInputValue,
  inputValue,
  handleInputChange,
  isMentioning,
  globalMentionOptions,
  mentionQuery,
  mentionIndex,
  setMentionIndex,
  insertMention,
  setIsMentioning,
  accountStatus,
  teamMembers,
  messagesEndRef,
  renderDiscardModal,
}) {
  return (
    <div className="flex-1 flex flex-col w-full h-full bg-white dark:bg-neutral-950 relative z-20">
      <style>{`
        @keyframes chat-bubble-up {
          0% { opacity: 0; transform: translateY(15px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .chat-animate {
          animation: chat-bubble-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      {/* Redesigned Premium Chat Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-[#FAFAFA] dark:bg-[#121B2D] z-30 shrink-0 select-none">
        <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
          <span>{tMsg('AI Chat', 'Obrolan AI')}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (messages.length > 2) {
                setDiscardConfirmAction(() => () => {
                  setMessages([]);
                  setAssistantMode('landing');
                });
                return;
              }
              setMessages([]);
              setAssistantMode('landing');
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:text-[#111E38] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg transition-all active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span>{tMsg('Menu', 'Menu')}</span>
          </button>
          
          <button
            onClick={() => {
              if (messages.length > 2) {
                setDiscardConfirmAction(() => () => {
                  startConversation();
                });
                return;
              }
              startConversation();
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:text-[#111E38] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg transition-all active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>{tMsg('Reset', 'Ulang')}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
        {/* Static Background Layer */}
        {chatBg && (
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={
              chatBg.startsWith('data:image')
                ? { backgroundImage: `url(${chatBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: chatBg }
            }
          />
        )}
        {chatBg && (
          <div className="absolute inset-0 bg-white/40 dark:bg-black/60 backdrop-blur-[2px] z-0 pointer-events-none"></div>
        )}

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar relative z-10">
          {messages.map((msg, index, arr) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="flex justify-center my-4 chat-animate">
                  <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                </div>
              );
            }

            const isMe = msg.sender === 'user';
            const chatMsgData = {
              id: msg.id,
              username: isMe ? currentUser : 'Luruka',
              text: msg.text,
              timestamp: msg.timestamp || getLocalTimestamp(),
              reactions: {},
            };

            const currDate = new Date(chatMsgData.timestamp.replace(/-/g, '/')).toDateString();
            const prevDate =
              index > 0
                ? new Date((arr[index - 1].timestamp || getLocalTimestamp()).replace(/-/g, '/')).toDateString()
                : null;
            const showDivider = currDate !== prevDate;
            let dividerDisplay = '';
            if (showDivider) {
              const today = new Date().toDateString();
              const yesterday = new Date(Date.now() - 86400000).toDateString();
              if (currDate === today) dividerDisplay = tMsg('Today', 'Hari Ini');
              else if (currDate === yesterday) dividerDisplay = tMsg('Yesterday', 'Kemarin');
              else dividerDisplay = chatMsgData.timestamp.split(' ')[0];
            }

            return (
              <ChatMessage
                key={msg.id}
                message={chatMsgData}
                currentUser={currentUser}
                avatarsMap={{ ...avatarsMap, 'Luruka': '' }}
                showDivider={showDivider}
                dividerDisplay={dividerDisplay}
                isFirstUnread={false}
                onReply={() => {}}
                onDelete={() => {}}
                onCopy={() => {
                  let cleanText = msg.text
                    .replace(/<[^>]*>?/gm, '')
                    .replace(/\*\*(.*?)\*\*/g, '$1')
                    .replace(/\*(.*?)\*/g, '$1');
                  const temp = document.createElement('textarea');
                  temp.innerHTML = cleanText;
                  navigator.clipboard.writeText(temp.value.trim());
                  showNotification(tMsg('Copied to clipboard!', 'Disalin ke papan klip!'), 'info');
                }}
                onReact={() => {}}
                canReply={false}
                canDelete={false}
                canReact={false}
                idPrefix="ai-msg-"
                tMsg={tMsg}
              >
                {msg.options && msg.sender === 'bot' && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-indigo-200/30 dark:border-neutral-700/50">
                    {msg.options.map((opt) => {
                      const isActionYes = opt.toLowerCase().includes('yes') || 
                                          opt.toLowerCase().includes('ya') || 
                                          opt.toLowerCase().includes('proceed') || 
                                          opt.toLowerCase().includes('lanjut') ||
                                          opt.toLowerCase().includes('create task') ||
                                          opt.toLowerCase().includes('tugas baru');
                      const isActionCancel = opt.toLowerCase().includes('cancel') || 
                                             opt.toLowerCase().includes('batal');
                      
                      let btnStyle = "bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-400";
                      if (isActionYes) {
                        btnStyle = "bg-[#FACC15] text-[#111E38] border border-transparent shadow-sm hover:bg-[#EAB308]";
                      } else if (isActionCancel) {
                        btnStyle = "bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20";
                      }
                      
                      return (
                        <button
                          key={opt}
                          onClick={() => handleUserReply(opt)}
                          disabled={step === 'end' && currentBotMessage?.id !== msg.id}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 active:scale-95 ${btnStyle}`}
                        >
                          {getOptionIcon(opt)}
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </ChatMessage>
            );
          })}

          {step === 'taking_notes' && (
            <div className="sticky bottom-2 w-full flex justify-end gap-2 pointer-events-none mt-4 z-50">
              <button
                onClick={() => handleUserReply(optCancel)}
                className="bg-white dark:bg-neutral-900 text-red-500 border border-neutral-300 dark:border-neutral-800 p-3.5 rounded-full shadow-lg font-bold hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 transition-all pointer-events-auto flex items-center justify-center"
                title={optCancel}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button
                onClick={() => handleUserReply(tMsg('Process Notes', 'Proses Catatan'))}
                className="bg-[#FACC15] text-[#111E38] px-5 py-3.5 rounded-full shadow-md font-bold text-xs hover:bg-[#EAB308] hover:scale-105 transition-all pointer-events-auto flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{tMsg('Process Notes', 'Proses Catatan')}</span>
              </button>
            </div>
          )}

          <div ref={messagesEndRef} className="h-32 shrink-0" />
        </div>
      </div>

      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl shrink-0 relative z-20">
        {step === 'taking_notes' && noteSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 max-h-24 overflow-y-auto custom-scrollbar items-end">
            {noteSuggestions.map((s) =>
              s.id === 'loading' ? (
                <span key={s.id} className="text-[10px] text-neutral-400 italic flex items-center gap-1.5 py-1 px-2">
                  <LoadingSpinner /> {s.text}
                </span>
              ) : (
                <button
                  key={s.id}
                  onClick={() => {
                    setInputValue(s.text);
                    document.getElementById('ai-chat-input')?.focus();
                  }}
                  className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400 text-[11px] font-medium px-3 py-1.5 rounded-xl text-left hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors shadow-sm"
                >
                  {s.text}
                </button>
              )
            )}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUserReply(inputValue);
            const ta = e.target.querySelector('textarea');
            if (ta) ta.style.height = '44px';
          }}
          className="flex gap-2 relative items-end"
        >
          {currentBotMessage?.isDate ? (
            <input
              type="date"
              value={inputValue}
              onChange={handleInputChange}
              className="flex-1 p-3.5 bg-neutral-100 dark:bg-neutral-900 border border-transparent rounded-xl text-sm font-medium text-black dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
              autoFocus
            />
          ) : (
            <textarea
              id="ai-chat-input"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (isMentioning) {
                  const allOptions = [...globalMentionOptions];
                  const filteredOptions = allOptions.filter((m) => m.toLowerCase().includes(mentionQuery));
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setMentionIndex((prev) => (prev + 1) % (filteredOptions.length || 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setMentionIndex((prev) => (prev - 1 + filteredOptions.length) % (filteredOptions.length || 1));
                  } else if (e.key === 'Enter' || e.key === 'Tab') {
                    e.preventDefault();
                    if (filteredOptions.length > 0) insertMention(filteredOptions[mentionIndex] || filteredOptions[0]);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setIsMentioning(false);
                  }
                } else if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleUserReply(inputValue);
                  e.target.style.height = '44px';
                }
              }}
              placeholder={language === 'id' ? 'Ketik pesan...' : 'Type a message...'}
              className="flex-1 py-3 px-4 bg-neutral-100 dark:bg-neutral-900 border border-transparent rounded-xl text-sm font-medium text-black dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50 resize-none max-h-75 custom-scrollbar"
              style={{ minHeight: '44px' }}
              rows="1"
              onInput={(e) => {
                e.target.style.height = '44px';
                e.target.style.height = Math.min(e.target.scrollHeight, 300) + 'px';
              }}
              autoFocus
            />
          )}
          {isMentioning && accountStatus !== 'suspended' && (
            <div className="absolute left-0 bottom-full mb-2 w-full min-w-50 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-2xl z-50 max-h-40 overflow-y-auto py-2 mac-animate">
              {(() => {
                const allOptions = [...globalMentionOptions];
                const filteredOptions = allOptions.filter((m) => m.toLowerCase().includes(mentionQuery));
                if (filteredOptions.length > 0) {
                  return filteredOptions.map((m, idx) => (
                    <div
                      key={m}
                      className={`px-4 py-2.5 cursor-pointer text-sm text-black dark:text-white font-medium border-b border-neutral-100 dark:border-neutral-800/50 last:border-0 flex items-center gap-2 ${
                        mentionIndex === idx
                          ? 'bg-neutral-100 dark:bg-neutral-800'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                      onClick={() => insertMention(m)}
                    >
                      <span>@{m}</span>
                      {!teamMembers.includes(m) && (
                        <span className="text-[8px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest ml-auto">
                          + Auto-Invite
                        </span>
                      )}
                    </div>
                  ));
                }
                return (
                  <div className="px-4 py-3 text-sm text-neutral-500 italic">
                    {tMsg('No members found', 'Tidak ada anggota ditemukan')}
                  </div>
                );
              })()}
            </div>
          )}
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="w-12 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              ></path>
            </svg>
          </button>
        </form>
      </div>

      {renderDiscardModal()}
    </div>
  );
}
