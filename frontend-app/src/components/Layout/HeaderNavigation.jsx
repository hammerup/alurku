import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Avatar } from '../../SharedUI';
import { useAppContext } from '../../contexts/AppContext';

const HighlightText = ({ text = '', query = '' }) => {
  if (!query) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
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
  currentPath = '',
  isDarkMode,
  setIsDarkMode,
  language,
  setLanguage,
  currentUser,
  avatarsMap = {},
  onLogoClick,
  onNavClick,
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
    // Profile settings context
    isSuperAdmin,
    openAdminModal,
    setIsSettingsOpen,
    setIsLeaveModalOpen,
    accountStatus,
    setIsProjectChatOpen,
    setDrawerTab,
    setIsMyTicketsOpen,
    setIsDocsOpen,
    setIsFeedbackOpen,
    setIsSupportOpen,
    startTour,
    isInstallable,
    handleInstallClick,
    setIsLogoutConfirmOpen
  } = useAppContext();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const tMsg = (en, id) => (language === 'id' ? id : en);

  const matchedGlobalBoards = useMemo(() => {
    if (!globalSearchQuery) return [];
    return (boards || []).filter((b) =>
      b.name?.toLowerCase().includes(globalSearchQuery.toLowerCase())
    );
  }, [globalSearchQuery, boards]);

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
            {isProactiveAIOpen
              ? 'Chat Luruka'
              : (window.location.pathname === '/dashboard'
                  ? tMsg('Personal Dashboard', 'Dasbor Pribadi')
                  : (selectedBoard ? selectedBoard.name : tMsg('Overview', 'Ringkasan'))
                )
            }
          </span>
        </div>
      </div>

      {/* Sleek, Center-Aligned Search everywhere bar */}
      <div className="hidden lg:flex items-center justify-center flex-1 max-w-md mx-6 relative group">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          placeholder={tMsg('Search everywhere...', 'Cari dimana saja...')}
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
          className="w-full bg-white/40 dark:bg-neutral-900/50 hover:bg-white/80 dark:hover:bg-neutral-900 border border-neutral-300/40 dark:border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 focus:bg-white dark:focus:bg-black text-black dark:text-white text-xs rounded-full pl-9 pr-8 py-2 outline-none transition-all placeholder-neutral-400 shadow-xs"
        />
        {globalSearchQuery && (
          <button
            onClick={() => {
              setGlobalSearchQuery('');
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
              <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                  {tMsg('Global Search Results', 'Hasil Pencarian')}
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
                              <HighlightText text={t.board_name} query={globalSearchQuery} />
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

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Stylish Light/Dark Theme Switch Toggle */}
        <div className="flex items-center">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`relative w-14 h-8 rounded-full transition-all duration-500 ease-in-out p-1 flex items-center shadow-inner ${
              isDarkMode ? 'bg-neutral-800 border border-white/5' : 'bg-neutral-200 border border-black/5'
            }`}
            aria-label="Toggle theme"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out shadow-md ${
                isDarkMode 
                  ? 'translate-x-6 bg-[#001f3f] text-[#FACC15]' 
                  : 'translate-x-0 bg-white text-[#FACC15]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] select-none font-bold">
                {isDarkMode ? 'dark_mode' : 'light_mode'}
              </span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${
              isDarkMode
                ? 'border-white/10 hover:border-white/30 text-white bg-white/5'
                : 'border-[#0b1c30]/10 hover:border-[#0b1c30]/30 text-[#001f3f] bg-black/5'
            }`}
          >
            {language}
          </button>
        </div>

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
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center gap-2 transition-colors"
                  >
                    <span>🔑</span> {tMsg('Manage Users', 'Kelola Pengguna')}
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-2 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <span>⚙️</span> {tMsg('Settings', 'Pengaturan')}
                </button>
                <button
                  onClick={() => {
                    setIsLeaveModalOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  disabled={accountStatus === 'suspended'}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <span>🌴</span> {tMsg('Time Off', 'Cuti')}
                </button>
                <button
                  onClick={() => {
                    setIsProjectChatOpen(true);
                    setDrawerTab('assistant');
                    setIsProfileMenuOpen(false);
                  }}
                  disabled={accountStatus === 'suspended'}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <span>✨</span> {tMsg('Smart Assistant', 'Asisten Pintar AI')}
                </button>
                <button
                  onClick={() => {
                    setIsMyTicketsOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  disabled={accountStatus === 'suspended'}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <span>🎫</span> {tMsg('My Tickets', 'Tiket Saya')}
                </button>
                <div className="border-t border-neutral-150 dark:border-neutral-800 my-1"></div>
                <button
                  onClick={() => {
                    setIsDocsOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-2 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <span>📖</span> {tMsg('Documentation', 'Dokumentasi')}
                </button>
                <button
                  onClick={() => {
                    setIsFeedbackOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  disabled={accountStatus === 'suspended'}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <span>💡</span> {tMsg('Submit Idea', 'Kirim Masukan')}
                </button>
                <button
                  onClick={() => {
                    setIsSupportOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  disabled={accountStatus === 'suspended'}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <span>🎧</span> {tMsg('Contact Support', 'Hubungi Dukungan')}
                </button>
                <button
                  onClick={() => {
                    startTour();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-2 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <span>🧭</span> {tMsg('Replay Tour', 'Ulangi Tur')}
                </button>
                {isInstallable && (
                  <button
                    onClick={() => {
                      handleInstallClick();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-[calc(100%-1rem)] mx-2 my-1 text-center py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center justify-center gap-2 transition-colors rounded-lg"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    {tMsg('Install App', 'Instal Aplikasi')}
                  </button>
                )}
                <div className="border-t border-neutral-150 dark:border-neutral-800 my-1"></div>
                <button
                  onClick={() => {
                    setIsLogoutConfirmOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 transition-colors"
                >
                  <span>🚪</span> {tMsg('Logout', 'Keluar')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
