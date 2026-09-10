import { Avatar } from '../../SharedUI';
import { useAppContext } from '../../contexts/AppContext';

export default function MobileTopBar() {
  const {
    language,
    setIsMobileMenuOpen,
    setSelectedBoard,
    setIsProactiveAIOpen,
    unreadCount,
    isNotifOpen,
    setIsNotifOpen,
    handleReadAllNotifications,
    notifications,
    handleReadNotification,
    handleNotificationTaskClick,
    setIsInvitesModalOpen,
    formatDateMMM,
    isMobileProfileOpen,
    setIsMobileProfileOpen,
    currentUser,
    avatarsMap,
    setIsSettingsOpen,
    setIsLeaveModalOpen,
    accountStatus,
    setIsMyTicketsOpen,
    setIsDocsOpen,
    setIsFeedbackOpen,
    setIsSupportOpen,
    setIsProjectChatOpen,
    setDrawerTab,
    startTour,
    isInstallable,
    handleInstallClick,
    setIsLogoutConfirmOpen,
    isSuperAdmin,
    openAdminModal,
  } = useAppContext();

  const tMsg = (en, id) => (language === 'id' ? id : en);

  return (
    <div className="md:hidden flex items-center justify-between bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md px-4 py-3 border-b border-neutral-200/50 dark:border-neutral-800/50 shrink-0 z-45">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-1.5 -ml-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <div
          className="cursor-pointer hover:opacity-80 transition-opacity tour-board-title-mobile font-sans font-extrabold text-2xl tracking-tight select-none"
          onClick={() => {
            setSelectedBoard(null);
            setIsProactiveAIOpen(true);
            window.history.pushState({}, '', '/proactive-ai');
            window.dispatchEvent(new CustomEvent('alurku-navigate'));
          }}
        >
          <span className="text-black dark:text-white">alur</span>
          <span className="text-[#FACC15]">ku</span>
          <span className="text-black dark:text-white">.</span>
        </div>
      </div>

      <div className="flex items-center gap-4 relative">
        <div className="relative">
          {unreadCount > 0 ? (
            <button
              onClick={() => setIsNotifOpen(true)}
              className="text-xl relative p-1 text-neutral-600 dark:text-neutral-300"
            >
              🔔
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
            </button>
          ) : (
            <button
              onClick={() => setIsNotifOpen(true)}
              className="text-xl p-1 text-neutral-600 dark:text-neutral-300"
            >
              🔔
            </button>
          )}
          {isNotifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
              <div className="absolute top-full right-0 mt-2 w-[85vw] sm:w-80 max-w-[320px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl z-50 flex flex-col max-h-[60vh] sm:max-h-112.5 overflow-hidden">
                <div className="p-3 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center sticky top-0 bg-white dark:bg-neutral-900">
                  <h3 className="font-bold text-sm text-black dark:text-white">
                    {tMsg('Notifications', 'Notifikasi')}
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
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400 text-sm">
                      <span className="text-3xl block mb-2">📭</span>
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
                        className={`p-3 border-b border-neutral-100 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${
                          !n.is_read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                        }`}
                      >
                        <div className="flex gap-2.5 items-start text-left">
                          <span className="text-lg shrink-0">
                            {n.type === 'task_assigned'
                              ? '👉'
                              : n.type === 'task_completed'
                              ? '✅'
                              : n.type === 'comment' || n.type === 'mention' || n.type === 'team_chat'
                              ? '💬'
                              : n.type === 'team_invite' || n.type === 'access_request'
                              ? '🤝'
                              : '🔔'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs leading-snug ${
                                !n.is_read
                                  ? 'font-bold text-black dark:text-white'
                                  : 'text-neutral-600 dark:text-neutral-400'
                              }`}
                            >
                              {n.message?.replace(/<!--TASK_ID:\d+-->/g, '').replace(/Smart Assistant 🤖/g, 'Luruka').replace(/Smart Assistant/g, 'Luruka').replace(/Luruka 🤖/g, 'Luruka').replace(/🤖/g, '')}
                            </p>
                            <p className="text-[10px] text-neutral-400 mt-0.5">
                              {formatDateMMM(n.timestamp)}
                            </p>
                          </div>
                          {!n.is_read && (
                            <div className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          {isMobileProfileOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsMobileProfileOpen(false)}
            ></div>
          )}
          <button
            onClick={() => setIsMobileProfileOpen(!isMobileProfileOpen)}
            className="p-1 -mr-1 tour-account-menu-mobile"
          >
            <Avatar name={currentUser} url={avatarsMap[currentUser]} size="w-8 h-8" textClass="text-xs" />
          </button>
          {isMobileProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 z-50">
              <div className="bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-xl border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden py-1">
                {isSuperAdmin && (
                  <button
                    onClick={() => {
                      openAdminModal();
                      setIsMobileProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-[#FACC15]/15 hover:text-[#111E38] dark:hover:text-[#FACC15] text-[#111E38] dark:text-[#FACC15] flex items-center gap-2.5 transition-colors cursor-pointer"
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
                    setIsMobileProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-[#FACC15]/15 hover:text-[#111E38] dark:hover:text-[#FACC15] flex items-center gap-2.5 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
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
                    setIsMobileProfileOpen(false);
                  }}
                  disabled={accountStatus === 'suspended'}
                  className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-[#FACC15]/15 hover:text-[#111E38] dark:hover:text-[#FACC15] flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
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
                    setIsMobileProfileOpen(false);
                  }}
                  disabled={accountStatus === 'suspended'}
                  className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-[#FACC15]/15 hover:text-[#111E38] dark:hover:text-[#FACC15] flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0 text-[#EAB308] dark:text-[#FACC15]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z" />
                  </svg>
                  <span>{tMsg('Smart Assistant', 'Asisten Pintar AI')}</span>
                </button>
                <button
                  onClick={() => {
                    setIsMyTicketsOpen(true);
                    setIsMobileProfileOpen(false);
                  }}
                  disabled={accountStatus === 'suspended'}
                  className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-[#FACC15]/15 hover:text-[#111E38] dark:hover:text-[#FACC15] flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <span>{tMsg('My Tickets', 'Tiket Saya')}</span>
                </button>
                <div className="border-t border-neutral-200 dark:border-neutral-800 my-1"></div>
                <button
                  onClick={() => {
                    setIsDocsOpen(true);
                    setIsMobileProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-[#FACC15]/15 hover:text-[#111E38] dark:hover:text-[#FACC15] flex items-center gap-2.5 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>{tMsg('Documentation', 'Dokumentasi')}</span>
                </button>
                <button
                  onClick={() => {
                    setIsFeedbackOpen(true);
                    setIsMobileProfileOpen(false);
                  }}
                  disabled={accountStatus === 'suspended'}
                  className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-[#FACC15]/15 hover:text-[#111E38] dark:hover:text-[#FACC15] flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>{tMsg('Submit Idea', 'Kirim Masukan')}</span>
                </button>
                <button
                  onClick={() => {
                    setIsSupportOpen(true);
                    setIsMobileProfileOpen(false);
                  }}
                  disabled={accountStatus === 'suspended'}
                  className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-[#FACC15]/15 hover:text-[#111E38] dark:hover:text-[#FACC15] flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 18v-6a9 9 0 0118 0v6M3 18a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5zm18 0a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5z" />
                  </svg>
                  <span>{tMsg('Contact Support', 'Hubungi Dukungan')}</span>
                </button>
                <button
                  onClick={() => {
                    startTour();
                    setIsMobileProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-[#FACC15]/15 hover:text-[#111E38] dark:hover:text-[#FACC15] flex items-center gap-2.5 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
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
                      setIsMobileProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-2 transition-colors mt-1 rounded-lg cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-3 3m0 0l-3-3m3 3V4"></path>
                    </svg>
                    <span>{tMsg('Install App', 'Instal Aplikasi')}</span>
                  </button>
                )}
                <div className="border-t border-neutral-200 dark:border-neutral-800 my-1"></div>
                <button
                  onClick={() => {
                    setIsLogoutConfirmOpen(true);
                    setIsMobileProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>{tMsg('Logout', 'Keluar')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
