import { useState, useMemo, useRef, useEffect } from 'react';
import { Avatar } from '../../SharedUI';
import { useAppContext } from '../../contexts/AppContext';

const HighlightText = ({ text = '', query = '' }) => {
  if (!query) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-100 dark:bg-yellow-950 text-black dark:text-white px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export default function HeaderNavigation({
  isDarkMode,
  setIsDarkMode,
  language,
  setLanguage,
  currentUser,
  avatarsMap = {},
  onLogoClick,
}) {
  const { 
    setIsMobileMenuOpen, 
    selectedBoard, 
    boards, 
    setSelectedBoard, 
    setViewMode, 
    activeWorkspace, 
    isProactiveAIOpen, 
    setIsProactiveAIOpen,
    // Search context
    globalSearchQuery,
    setGlobalSearchQuery,
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    isGlobalSearchClosing,
    closeGlobalSearch,
    globalSearchResults,
    handleGlobalSearchSelect,
    forceSearchAll,
    setForceSearchAll,
    // Profile settings context
    isSuperAdmin,
    openAdminModal,
    setIsSettingsOpen,
    setIsLeaveModalOpen,
    accountStatus,
    isProjectChatOpen,
    setIsProjectChatOpen,
    drawerTab,
    setDrawerTab,
    setIsMyTicketsOpen,
    setIsDocsOpen,
    setIsFeedbackOpen,
    setIsSupportOpen,
    startTour,
    isInstallable,
    navigateTo,
    handleInstallClick,
    setIsLogoutConfirmOpen,
    unreadCount,
    setIsNotifOpen,
    notifications,
    handleReadNotification,
    handleReadAllNotifications,
    handleNotificationTaskClick,
    setIsInvitesModalOpen,
    isNotifOpen
  } = useAppContext();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScopeDropdownOpen, setIsScopeDropdownOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const scopeRef = useRef(null);

  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (scopeRef.current && !scopeRef.current.contains(event.target)) {
        setIsScopeDropdownOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const tMsg = (en, id) => (language === 'id' ? id : en);

  const matchedGlobalBoards = useMemo(() => {
    if (!globalSearchQuery) return [];
    const filtered = (boards || []).filter((b) =>
      b.name?.toLowerCase().includes(globalSearchQuery.toLowerCase())
    );
    if (!forceSearchAll && selectedBoard && selectedBoard.id !== 'global') {
      return filtered.filter(b => b.id === selectedBoard.id);
    }
    return filtered;
  }, [globalSearchQuery, boards, selectedBoard, forceSearchAll]);

  const formatDateMMM = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 flex justify-between items-center w-full px-4 md:px-12 h-20 z-40 border-b transition-colors duration-700 ease-in-out ${
        isDarkMode ? 'bg-[#090D16]/60 border-white/5' : 'bg-[#F3F4F6]/60 border-black/5'
      } backdrop-blur-md`}
    >
      <div className="flex items-center gap-3 md:gap-8 shrink-0">
        {/* Hamburger Menu on Mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden p-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        {/* Logo matching alurku. style */}
        <div
          onClick={onLogoClick}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity select-none"
        >
          <span className={`font-black text-2xl tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-[#001f3f]'}`}>
            alur<span className="text-[#FACC15]">ku</span>.
          </span>
        </div>

        {/* Breadcrumbs penunjuk lokasi aktif */}
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 select-none">
          <span
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            onClick={() => {
              setSelectedBoard(null);
              setViewMode('overview');
              setIsProactiveAIOpen(false);
              const slug = activeWorkspace?.name 
                ? activeWorkspace.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') 
                : 'main';
              window.history.pushState({}, '', `/workspace/${slug}/${activeWorkspace?.id}`);
              window.dispatchEvent(new CustomEvent('alurku-navigate'));
            }}
          >
            {activeWorkspace ? activeWorkspace.name : 'Workspace'}
          </span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-slate-900 dark:text-white font-extrabold">
            {(() => {
              const path = window.location.pathname;
              if (isProactiveAIOpen || path === '/proactive-ai') return 'Chat Luruka';
              if (path === '/chat' || path.endsWith('/chat')) return tMsg('Workspace Chat', 'Obrolan Ruang Kerja');
              if (path === '/inbox' || path.endsWith('/inbox')) return tMsg('Inbox & Notifications', 'Kotak Masuk & Notifikasi');
              if (path === '/leaves' || path.endsWith('/leaves') || path === '/cuti' || path === '/meetings-leaves' || path.endsWith('/meetings-leaves')) return tMsg('Leaves & Holidays', 'Cuti & Hari Libur');
              if (path === '/assigned-comments') return tMsg('Assigned Comments', 'Komentar & Sebutan');
              if (path === '/dashboard') return tMsg('Personal Dashboard', 'Dasbor Pribadi');
              if (selectedBoard) return selectedBoard.name;
              return tMsg('Overview', 'Ringkasan');
            })()}
          </span>
        </div>
      </div>

      {/* Sleek, Center-Aligned Search everywhere bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-6 relative group bg-white/40 dark:bg-neutral-900/50 hover:bg-white/80 dark:hover:bg-neutral-900 border border-neutral-300/40 dark:border-transparent focus-within:border-neutral-300 dark:focus-within:border-neutral-700 focus-within:bg-white dark:focus-within:bg-black rounded-full shadow-xs pl-1">
        
        {/* Scope Dropdown Selector */}
        {activeWorkspace && activeWorkspace.id ? (
          <div className="relative shrink-0 flex items-center" ref={scopeRef}>
            <button
              onClick={() => setIsScopeDropdownOpen(!isScopeDropdownOpen)}
              className="flex items-center gap-1.5 px-4 py-2 text-[#111E38] dark:text-neutral-200 text-xs font-bold transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-l-full select-none"
            >
              <span>
                {forceSearchAll 
                  ? tMsg('Semua Workspace', 'All Workspaces') 
                  : (activeWorkspace.name.length > 20 ? `${activeWorkspace.name.substring(0, 20)}...` : activeWorkspace.name)
                }
              </span>
              <span className="material-symbols-outlined text-sm font-bold transition-transform duration-200">
                {isScopeDropdownOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            
            {/* Vertical Divider */}
            <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-700 self-center"></div>

            {/* Floating Dropdown Options */}
            {isScopeDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden z-50 py-1 origin-top-left animate-in fade-in slide-in-from-top-1 duration-100">
                <button
                  onClick={() => {
                    setForceSearchAll(false);
                    setIsScopeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 ${
                    !forceSearchAll ? 'text-indigo-600 dark:text-indigo-400 bg-neutral-50/50 dark:bg-neutral-900/30' : 'text-[#111E38] dark:text-neutral-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">location_on</span>
                  {activeWorkspace.name}
                </button>
                <button
                  onClick={() => {
                    setForceSearchAll(true);
                    setIsScopeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 ${
                    forceSearchAll ? 'text-indigo-600 dark:text-indigo-400 bg-neutral-50/50 dark:bg-neutral-900/30' : 'text-[#111E38] dark:text-neutral-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">language</span>
                  {tMsg('Semua Workspace', 'All Workspaces')}
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* Search Icon & Input Field */}
        <div className="flex-1 flex items-center pl-3 pr-3 relative">
          <span className="text-neutral-400 mr-2 flex items-center shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            ref={searchInputRef}
            type="text"
            placeholder={
              activeWorkspace && activeWorkspace.id && !forceSearchAll
                ? tMsg(`Cari di ${activeWorkspace.name}...`, `Search in ${activeWorkspace.name}...`)
                : tMsg('Cari...', 'Search...')
            }
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            onFocus={() => {
              if (globalSearchQuery.length > 0) setIsGlobalSearchOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && globalSearchQuery.trim()) {
                closeGlobalSearch();
                setViewMode('search-results');
              }
            }}
            className="w-full bg-transparent text-black dark:text-white text-xs outline-none py-1 placeholder-neutral-400"
          />
          {!globalSearchQuery && (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-400 select-none border border-neutral-300/40 dark:border-neutral-700/50">
              ⌘K
            </kbd>
          )}
        </div>
        {globalSearchQuery && (
          <button
            onClick={() => {
              setGlobalSearchQuery('');
              setForceSearchAll(false);
              closeGlobalSearch();
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white flex items-center justify-center"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {/* Global Search Results Overlay under Header Input */}
        {isGlobalSearchOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={closeGlobalSearch}></div>
            <div
              className={`absolute top-full left-0 mt-1 w-full bg-white dark:bg-neutral-950 
            border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-2xl overflow-hidden z-50 flex 
            flex-col max-h-100 origin-top ${isGlobalSearchClosing ? 'mac-exit' : 'mac-animate'}`}
            >
              <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex justify-between items-center">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                  {activeWorkspace && activeWorkspace.id && !forceSearchAll
                    ? tMsg(`Hasil Pencarian di ${activeWorkspace.name}`, `Search Results in ${activeWorkspace.name}`)
                    : tMsg('Hasil Pencarian (Semua Workspace)', 'Search Results (All Workspaces)')
                  }
                </span>
              </div>
              {globalSearchResults.length > 0 || matchedGlobalBoards.length > 0 ? (
                <div className="overflow-y-auto py-2">
                  {matchedGlobalBoards.length > 0 && (
                    <div className="mb-2">
                      <div className="px-5 py-1.5 text-[9px] font-bold text-black dark:text-white uppercase tracking-widest bg-neutral-100 dark:bg-neutral-900">
                        📁 {tMsg('Projects', 'Proyek')}
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
                          <div className="flex flex-col min-w-0 text-left">
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
                        📋 {tMsg('Tasks', 'Tugas')}
                      </div>
                      {globalSearchResults.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => handleGlobalSearchSelect(t)}
                          className="px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer border-b border-neutral-100 dark:border-neutral-800/50 last:border-0 transition-colors flex flex-col gap-1.5 text-left"
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
                              <HighlightText text={t.workspace_name ? `${t.workspace_name} › ${t.board_name}` : t.board_name} query={globalSearchQuery} />
                            </span>
                            {t.category && (
                              <>
                                <span className="text-neutral-300 dark:text-neutral-700">&bull;</span>
                                <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                                  {t.category}
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

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Stylish Light/Dark Theme Switch Toggle */}
        <div className="flex items-center">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`relative w-12 h-7 rounded-full transition-all duration-300 ease-in-out p-0.5 flex items-center shadow-inner ${
              isDarkMode ? 'bg-neutral-800 border border-neutral-700/50' : 'bg-neutral-200 border border-neutral-300/60'
            }`}
            aria-label="Toggle theme"
            title={tMsg('Toggle Theme', 'Ganti Tema')}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out shadow-sm ${
                isDarkMode 
                  ? 'translate-x-5 bg-[#111E38] text-[#FACC15]' 
                  : 'translate-x-0 bg-white text-[#111E38]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px] select-none font-bold">
                {isDarkMode ? 'dark_mode' : 'light_mode'}
              </span>
            </div>
          </button>
        </div>

        <div className="flex items-center">
          <button
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all border ${
              isDarkMode
                ? 'border-neutral-800 hover:border-neutral-700 text-neutral-300 bg-neutral-900/60'
                : 'border-neutral-200 hover:border-neutral-300 text-slate-700 bg-white'
            }`}
            title={tMsg('Switch Language', 'Ganti Bahasa')}
          >
            {language}
          </button>
        </div>

        {/* Luruka AI Trigger (Toggle right drawer AI assistant) */}
        <button
          onClick={() => {
            if (isProjectChatOpen && drawerTab === 'assistant') {
              setIsProjectChatOpen(false);
            } else {
              setIsProjectChatOpen(true);
              setDrawerTab('assistant');
            }
          }}
          className={`p-2 rounded-xl transition-all border flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
            isProjectChatOpen && drawerTab === 'assistant'
              ? 'border-[#EAB308] dark:border-[#FACC15] bg-yellow-50 dark:bg-yellow-950/30'
              : (isDarkMode
                  ? 'border-neutral-800 text-neutral-300 bg-neutral-900/60'
                  : 'border-neutral-200 text-slate-700 bg-white')
          }`}
          title={isProjectChatOpen && drawerTab === 'assistant' ? tMsg('Tutup Luruka AI', 'Close Luruka AI') : tMsg('Buka Luruka AI', 'Open Luruka AI')}
        >
          <svg className="w-4.5 h-4.5 text-[#EAB308] dark:text-[#FACC15]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.187L15 15l-5.187.904zM18.007 7.007L17.5 10l-.507-2.993L14 6.5l2.993-.507L17.5 3l.507 2.993L21 6.5l-2.993.507z" />
          </svg>
        </button>

        {/* Direct Notification Bell Button with Modal Dropdown & Page Navigation */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative p-2 rounded-xl transition-all border flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
              isDarkMode
                ? 'border-neutral-800 text-neutral-300 bg-neutral-900/60'
                : 'border-neutral-200 text-slate-700 bg-white'
            }`}
            title={tMsg('Notifications', 'Notifikasi')}
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-[#FACC15] ring-2 ring-white dark:ring-neutral-900 shadow-[0_0_6px_rgba(250,204,21,0.8)] animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <>
              {/* Invisible overlay to close on click outside */}
              <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
              <div 
                className="absolute right-0 mt-3 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl z-50 flex flex-col max-h-128 overflow-hidden animate-fadeIn w-80 sm:w-96"
              >
                <div className="p-3.5 border-b border-neutral-100 dark:border-neutral-800/80 flex justify-between items-center bg-white/50 dark:bg-neutral-900/50">
                  <h3 className="font-black text-sm text-[#111E38] dark:text-white flex items-center gap-1.5">
                    <span>{tMsg('Notifications', 'Notifikasi')}</span>
                    {unreadCount > 0 && (
                      <span className="bg-[#FACC15] text-[#111E38] text-[9px] px-1.5 py-0.5 rounded-full font-black">
                        {unreadCount}
                      </span>
                    )}
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
                <div className="overflow-y-auto flex-1 max-h-80">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400 text-sm flex flex-col items-center">
                      <span className="material-symbols-outlined text-4xl text-neutral-300 dark:text-neutral-700 block mb-2">search_off</span>
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
                        className={`p-3 border-b border-neutral-100 dark:border-neutral-800/80 cursor-pointer text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors ${
                          !n.is_read ? 'bg-amber-500/5 dark:bg-[#FACC15]/5' : ''
                        }`}
                      >
                        <div className="flex gap-3 items-start">
                          <div className="shrink-0 mt-0.5">
                            {n.type === 'task_assigned' ? (
                              <div className="w-7 h-7 rounded-lg bg-[#111E38] text-[#FACC15] flex items-center justify-center">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                              </div>
                            ) : n.type === 'task_completed' ? (
                              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </div>
                            ) : n.type === 'comment' || n.type === 'mention' || n.type === 'team_chat' ? (
                              <div className="w-7 h-7 rounded-lg bg-[#FACC15] text-[#111E38] flex items-center justify-center">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-[#111E38] text-white flex items-center justify-center">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs leading-snug ${
                                !n.is_read
                                  ? 'font-bold text-[#111E38] dark:text-white'
                                  : 'text-neutral-600 dark:text-neutral-400'
                              }`}
                            >
                              {n.message?.replace(/<!--TASK_ID:\d+-->/g, '').replace(/Smart Assistant 🤖/g, 'Luruka').replace(/Smart Assistant/g, 'Luruka').replace(/Luruka 🤖/g, 'Luruka').replace(/🤖/g, '')}
                            </p>
                            <p className="text-[10px] font-bold text-neutral-400 mt-0.5">{formatDateMMM(n.timestamp)}</p>
                          </div>
                          {!n.is_read && <div className="w-2.5 h-2.5 bg-[#FACC15] rounded-full shrink-0 mt-1 shadow-[0_0_6px_rgba(250,204,21,0.8)] animate-pulse"></div>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/80 dark:bg-neutral-900/90 text-center">
                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      if (navigateTo) navigateTo('/inbox');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] font-bold text-xs shadow-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{tMsg('Go to Full Inbox Page', 'Buka Halaman Inbox Penuh')}</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Direct Setting Gear Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`p-2 rounded-xl transition-all border flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
            isDarkMode
              ? 'border-neutral-800 text-neutral-300 bg-neutral-900/60'
              : 'border-neutral-200 text-slate-700 bg-white'
          }`}
          title={tMsg('Settings', 'Pengaturan')}
        >
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        {/* User Account Menu Trigger & Dropdown */}
        <div 
          className="relative"
          ref={profileMenuRef}
        >
          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-9 h-9 rounded-full border border-neutral-300 dark:border-white/10 overflow-hidden cursor-pointer hover:border-neutral-500 dark:hover:border-white/30 transition-colors"
          >
            <Avatar
              name={currentUser}
              url={avatarsMap[currentUser]}
              size="w-9 h-9"
              textClass="text-xs"
            />
          </div>

          {isProfileMenuOpen && (
            <>
              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-xl overflow-hidden py-1 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-950/20 text-left">
                  <p className="text-xs font-bold text-black dark:text-white truncate">{currentUser}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{tMsg('Workspace User', 'Pengguna Workspace')}</p>
                </div>
                {isSuperAdmin && (
                  <button
                    onClick={() => {
                      openAdminModal();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-[#FACC15]/15 hover:text-[#111E38] dark:hover:text-[#FACC15] text-[#111E38] dark:text-[#FACC15] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0 text-[#111E38] dark:text-[#FACC15]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>{tMsg('Admin Dashboard', 'Dasbor Admin')}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-[#FACC15]/15 hover:text-[#111E38] dark:hover:text-[#FACC15] flex items-center gap-2.5 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{tMsg('Settings', 'Pengaturan')}</span>
                </button>
                <button
                  onClick={() => {
                    setIsLeaveModalOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  disabled={accountStatus === 'suspended'}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-[#FACC15]/15 hover:text-[#111E38] dark:hover:text-[#FACC15] flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v15m0 0a3 3 0 01-3 3m3-3a3 3 0 003 3M4 12a8 8 0 0116 0H4z" />
                  </svg>
                  <span>{tMsg('Time Off', 'Cuti')}</span>
                </button>
                <button
                  onClick={() => {
                    setIsProjectChatOpen(true);
                    setDrawerTab('assistant');
                    setIsProfileMenuOpen(false);
                  }}
                  disabled={accountStatus === 'suspended'}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-[#FACC15]/15 hover:text-[#111E38] dark:hover:text-[#FACC15] flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0 text-[#EAB308] dark:text-[#FACC15]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z" />
                  </svg>
                  <span>{tMsg('Smart Assistant', 'Asisten Pintar AI')}</span>
                </button>
                <button
                  onClick={() => {
                    setIsMyTicketsOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  disabled={accountStatus === 'suspended'}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-[#FACC15]/15 hover:text-[#111E38] dark:hover:text-[#FACC15] flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <span>{tMsg('My Tickets', 'Tiket Saya')}</span>
                </button>
                <div className="border-t border-neutral-150 dark:border-neutral-800 my-1"></div>
                <button
                  onClick={() => {
                    setIsDocsOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-[#FACC15]/15 hover:text-[#111E38] dark:hover:text-[#FACC15] flex items-center gap-2.5 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>{tMsg('Documentation', 'Dokumentasi')}</span>
                </button>
                <button
                  onClick={() => {
                    setIsFeedbackOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  disabled={accountStatus === 'suspended'}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-[#FACC15]/15 hover:text-[#111E38] dark:hover:text-[#FACC15] flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>{tMsg('Submit Idea', 'Kirim Masukan')}</span>
                </button>
                <button
                  onClick={() => {
                    setIsSupportOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  disabled={accountStatus === 'suspended'}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-[#FACC15]/15 hover:text-[#111E38] dark:hover:text-[#FACC15] flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 18v-6a9 9 0 0118 0v6M3 18a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5zm18 0a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5z" />
                  </svg>
                  <span>{tMsg('Contact Support', 'Hubungi Dukungan')}</span>
                </button>
                <button
                  onClick={() => {
                    startTour();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-[#FACC15]/15 hover:text-[#111E38] dark:hover:text-[#FACC15] flex items-center gap-2.5 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{tMsg('Replay Tour', 'Ulangi Tur')}</span>
                </button>
                {isInstallable && (
                  <button
                    onClick={() => {
                      handleInstallClick();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-[calc(100%-1rem)] mx-2 my-1 text-center py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center justify-center gap-2 transition-colors rounded-lg cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    <span>{tMsg('Install App', 'Instal Aplikasi')}</span>
                  </button>
                )}
                <div className="border-t border-neutral-150 dark:border-neutral-800 my-1"></div>
                <button
                  onClick={() => {
                    setIsLogoutConfirmOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>{tMsg('Logout', 'Keluar')}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
