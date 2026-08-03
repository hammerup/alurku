import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { IconPlus } from '../../SharedUI';
import BoardFilterSort from '../BoardFilterSort';
import { LiveClock } from '../../Widgets';

export default function MainToolbar() {
  const {
    language,
    selectedBoard,
    setSelectedBoard,
    setIsProactiveAIOpen,
    viewMode,
    showLiveClock,
    showLiveClockDate,
    invitations,
    setIsInvitesModalOpen,
    openTeamModal,
    accountStatus,
    setIsProjectChatOpen,
    setDrawerTab,
    showNotification,
    setExportMode,
    setIsExportModalOpen,
    setIsCreateBoardOpen,
    searchQuery,
    setSearchQuery,
    handleOpenNewTaskForm,
    groupBy,
    setGroupBy,
    setViewMode,
    showMyTasks,
    setShowMyTasks,
    showOverdueOnly,
    setShowOverdueOnly,
    showDueTodayOnly,
    setShowDueTodayOnly,
    showUnreadOnly,
    setShowUnreadOnly,
    showHasSubtasks,
    setShowHasSubtasks,
    hideCompleted,
    setHideCompleted,
    sortBy,
    setSortBy,
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    filterAssignee,
    setFilterAssignee,
    columns,
    categories,
    assigneeOptions,
    teamMembers,
    setColModal,
  } = useAppContext();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);
  const tMsg = (en, id) => (language === 'id' ? id : en);

  // Check if any filters are active to highlight the filter toggle button
  const hasActiveFilters =
    showMyTasks ||
    showOverdueOnly ||
    showUnreadOnly ||
    showHasSubtasks ||
    hideCompleted ||
    filterStatus ||
    filterCategory ||
    filterAssignee;

  return (
    <header className="px-4 py-3 md:px-6 md:py-4 flex flex-col gap-3 shrink-0 border-b border-neutral-200/70 dark:border-neutral-800/80 bg-white/60 dark:bg-[#0d0f11]/60 backdrop-blur-md select-none">
      {/* =========================================================================
          ROW 1: Title, View Switcher Tabs, Live Clock & Primary CTA
         ========================================================================= */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        {/* Title + Segmented View Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-black text-[#111E38] dark:text-white capitalize tracking-tight">
                {selectedBoard?.name || (viewMode === 'kanban' ? 'Kanban Board' : viewMode === 'list' ? 'Table List' : viewMode)}
              </h2>
              {selectedBoard && selectedBoard.name && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {viewMode.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Segmented View Mode Tabs */}
          <div className="flex flex-nowrap items-center bg-neutral-200/60 dark:bg-neutral-800/80 p-1 rounded-xl shrink-0 tour-views gap-0.5 border border-neutral-200/50 dark:border-neutral-700/50 shadow-inner overflow-x-auto custom-scrollbar">
            {['kanban', 'list', 'analytics', 'timeline', 'calendar'].map((v) => {
              const icons = {
                kanban: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <path d="M9 3v18"></path>
                    <path d="M15 3v18"></path>
                  </svg>
                ),
                list: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                ),
                analytics: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                    <line x1="2" y1="20" x2="22" y2="20"></line>
                  </svg>
                ),
                timeline: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18"></path>
                    <rect x="7" y="7" width="5" height="4" rx="1"></rect>
                    <rect x="14" y="13" width="6" height="4" rx="1"></rect>
                  </svg>
                ),
                calendar: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                ),
              };
              const labels = {
                kanban: 'Board',
                list: 'List',
                analytics: 'Analytics',
                timeline: 'Timeline',
                calendar: 'Calendar',
              };
              const isActive = viewMode === v;
              return (
                <button
                  key={v}
                  onClick={() => {
                    if (v === 'timeline' && groupBy === 'Status') setGroupBy('Project');
                    else if (v === 'kanban' && groupBy === 'Project') setGroupBy('Status');
                    setViewMode(v);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all capitalize whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#121B2D] text-[#111E38] dark:text-white shadow-xs border border-neutral-200/80 dark:border-neutral-700 font-extrabold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-[#111E38] dark:hover:text-white'
                  }`}
                >
                  <span className={isActive ? 'text-amber-500 dark:text-[#FACC15]' : ''}>
                    {icons[v]}
                  </span>
                  <span>{labels[v]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 1 Right: Live Clock & Primary Action CTA */}
        <div className="flex items-center gap-2 justify-between md:justify-end shrink-0">
          <div className="hidden md:block">
            {showLiveClock && (
              <LiveClock showLiveClockDate={showLiveClockDate} language={language} />
            )}
          </div>

          {/* Mobile Filters Toggle Button */}
          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className={`md:hidden p-2 rounded-xl border transition-all flex items-center justify-center gap-1.5 text-xs font-extrabold shrink-0 ${
              isMobileFiltersOpen || hasActiveFilters
                ? 'bg-[#FACC15] text-[#111E38] border-amber-400'
                : 'bg-white dark:bg-[#121B2D] border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
            }`}
            title={tMsg('Toggle Views & Filters', 'Tampilkan Tampilan & Filter')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            <span>{tMsg('Filters', 'Filter')}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-[#111E38] dark:bg-white rounded-full animate-pulse"></span>
            )}
          </button>

          {/* Primary Action CTA: Brand Flat Yellow Accent Button */}
          <button
            onClick={handleOpenNewTaskForm}
            disabled={accountStatus === 'suspended' || selectedBoard.id === 'global'}
            className="bg-[#FACC15] hover:bg-amber-400 text-[#111E38] font-black py-2 px-3.5 sm:px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 text-xs shrink-0 tour-new-task disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 border border-amber-300 cursor-pointer"
          >
            <IconPlus className="w-4 h-4" />
            <span className="font-extrabold">{tMsg('New Request', 'Permintaan Baru')}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          ROW 2: Search Bar + Filter Pills (Left) & GroupBy/SortBy + Project Tools (Right)
         ========================================================================= */}
      <div className={`${isMobileFiltersOpen ? 'flex' : 'hidden md:flex'} flex-col md:flex-row md:items-center md:justify-between gap-2.5 w-full pt-1 border-t border-neutral-100 dark:border-neutral-800/80 md:border-0 md:pt-0`}>
        
        {/* Row 2 Left: Search Input & Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {/* Search Input Bar (No duplicate ⌘K badge) */}
          <div className="relative w-full md:w-52 shrink-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10 pointer-events-none">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder={tMsg('Search tasks...', 'Cari tugas...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-7 py-1.5 bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-700/80 text-[#111E38] dark:text-white placeholder-neutral-400 rounded-xl shadow-2xs focus:ring-2 focus:ring-[#FACC15]/40 focus:border-[#FACC15] focus:outline-none w-full transition-all text-xs font-semibold"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white text-xs font-bold z-10 p-0.5"
                title="Clear Search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-nowrap lg:flex-wrap items-center gap-1.5 shrink-0 tour-filters overflow-x-auto custom-scrollbar pb-1 md:pb-0">
            <button
              onClick={() => setShowMyTasks(!showMyTasks)}
              disabled={accountStatus === 'suspended'}
              className={`py-1.5 px-3 rounded-xl shadow-2xs focus:outline-none text-xs font-extrabold transition-all border flex justify-center items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                showMyTasks
                  ? 'bg-[#111E38] text-white border-[#111E38] dark:bg-white dark:text-[#111E38] dark:border-white'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-[#121B2D] dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              My Tasks
            </button>

            <button
              onClick={() => setShowOverdueOnly(!showOverdueOnly)}
              className={`py-1.5 px-3 rounded-xl shadow-2xs focus:outline-none text-xs font-extrabold transition-all border flex justify-center items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                showOverdueOnly
                  ? 'bg-rose-600 text-white border-rose-600 dark:bg-rose-500 dark:border-rose-500'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-[#121B2D] dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              {language === 'id' ? 'Terlambat' : 'Overdue'}
            </button>

            <button
              onClick={() => setShowDueTodayOnly(!showDueTodayOnly)}
              className={`py-1.5 px-3 rounded-xl shadow-2xs focus:outline-none text-xs font-extrabold transition-all border flex justify-center items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                showDueTodayOnly
                  ? 'bg-[#FACC15] text-[#111E38] border-amber-400'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-[#121B2D] dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {language === 'id' ? 'Hari Ini' : 'Due Today'}
            </button>

            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`py-1.5 px-3 rounded-xl shadow-2xs focus:outline-none text-xs font-extrabold transition-all border flex justify-center items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                showUnreadOnly
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-[#121B2D] dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              {tMsg('Unread', 'Belum Dibaca')}
            </button>

            <button
              onClick={() => setShowHasSubtasks(!showHasSubtasks)}
              className={`py-1.5 px-3 rounded-xl shadow-2xs focus:outline-none text-xs font-extrabold transition-all border flex justify-center items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                showHasSubtasks
                  ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-[#121B2D] dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              {tMsg('Has Subtasks', 'Ada Sub-tugas')}
            </button>

            {(viewMode === 'kanban' ||
              viewMode === 'list' ||
              viewMode === 'timeline' ||
              viewMode === 'calendar') && (
              <button
                onClick={() => setHideCompleted(!hideCompleted)}
                className={`py-1.5 px-3 rounded-xl shadow-2xs focus:outline-none text-xs font-extrabold transition-all border flex justify-center items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                  hideCompleted
                    ? 'bg-slate-200 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-[#121B2D] dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800'
                }`}
                title={tMsg('Hide Done & Rejected tasks to declutter the view', 'Sembunyikan tugas Selesai & Ditolak agar tampilan lebih bersih')}
              >
                {hideCompleted ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    {tMsg('Completed Hidden', 'Selesai Disembunyikan')}
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    {tMsg('Show Completed', 'Tampilkan Selesai')}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Row 2 Right: GroupBy / SortBy Dropdowns & Project Quick Action Tools */}
        <div className="flex items-center gap-2 shrink-0 justify-between md:justify-end border-t border-neutral-100 dark:border-neutral-800 md:border-0 pt-2 md:pt-0">
          <BoardFilterSort
            columns={columns}
            categories={categories}
            assigneeOptions={assigneeOptions}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterAssignee={filterAssignee}
            setFilterAssignee={setFilterAssignee}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          {/* Project Quick Action Tools Group (Team, Chat, Share, Export) */}
          <div className="flex items-center gap-1 shrink-0">
            {invitations && invitations.length > 0 && (
              <button
                onClick={() => setIsInvitesModalOpen(true)}
                className="p-1.5 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors relative"
                title={tMsg('Team Invitations', 'Undangan Tim')}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
              </button>
            )}

            <div className="flex items-center gap-0.5 tour-team-menu bg-neutral-100 dark:bg-neutral-800/60 p-1 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60">
              {/* Manage Team (only for specific project boards) */}
              {selectedBoard && selectedBoard.id !== 'global' && !selectedBoard.is_private && (
                <button
                  onClick={() => openTeamModal(selectedBoard.id)}
                  disabled={accountStatus === 'suspended'}
                  className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-[#111E38] dark:hover:text-white hover:bg-white dark:hover:bg-[#121B2D] rounded-lg transition-all relative"
                  title={tMsg('Manage Team', 'Kelola Tim')}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  {selectedBoard.access_requests_count > 0 && selectedBoard.role === 'owner' && (
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                  )}
                </button>
              )}

              {/* Team Chat */}
              <button
                onClick={() => {
                  setIsProjectChatOpen(true);
                  setDrawerTab('team');
                }}
                className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-[#111E38] dark:hover:text-white hover:bg-white dark:hover:bg-[#121B2D] rounded-lg transition-all"
                title={tMsg('Team Chat', 'Obrolan Tim')}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-.812-.916 5.86 5.86 0 011.08-1.92A8.672 8.672 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </button>

              {/* Share Link */}
              <button
                onClick={() => {
                  const bName = selectedBoard?.name || 'board';
                  const slug = bName
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)+/g, '');
                  const url = `${window.location.origin}/project/${selectedBoard?.id || 'global'}-${slug}`;
                  navigator.clipboard.writeText(url).catch(() => {
                    const temp = document.createElement('textarea');
                    temp.value = url;
                    document.body.appendChild(temp);
                    temp.select();
                    document.execCommand('copy');
                    document.body.removeChild(temp);
                  });
                  showNotification(tMsg('Project link copied!', 'Tautan proyek disalin!'), 'success');
                }}
                className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-[#111E38] dark:hover:text-white hover:bg-white dark:hover:bg-[#121B2D] rounded-lg transition-all"
                title={tMsg('Share Project', 'Bagikan Proyek')}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              </button>

              {/* Export CSV (Board) */}
              <button
                onClick={() => {
                  setExportMode('board');
                  setIsExportModalOpen(true);
                }}
                className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-[#111E38] dark:hover:text-white hover:bg-white dark:hover:bg-[#121B2D] rounded-lg transition-all"
                title={tMsg('Export CSV', 'Ekspor CSV')}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </button>

              {/* Get All My Data (Global) */}
              <button
                onClick={() => {
                  setExportMode('global');
                  setIsExportModalOpen(true);
                }}
                className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-[#111E38] dark:hover:text-white hover:bg-white dark:hover:bg-[#121B2D] rounded-lg transition-all"
                title={tMsg('Get All My Data', 'Dapatkan Semua Data')}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m-18.432-4.5a8.958 8.958 0 00-.284 2.253c0 .778.099 1.533.284 2.253" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
