import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAppContext } from '../contexts/AppContext';
import { isUserAssigned, getTaskAssignee } from '../useAppLogic';
import { Avatar } from '../SharedUI';

const cleanMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/<!--.*?-->/g, '')
    .replace(/&lt;!--.*?--&gt;/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/```/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*#+\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
};

export default function HomeDashboard() {
  const {
    activeWorkspace,
    currentUser,
    boards,
    tasks,
    filteredTasks,
    notifications,
    language,
    setIsCreateBoardOpen,
    setSelectedBoard,
    accountStatus,
    setShowMyTasks,
    setShowOverdueOnly,
    setShowDueTodayOnly,
    isLoading,
    isTasksLoading,
    isBoardsLoading,
    handleNotificationTaskClick,
    avatarsMap,
    setSelectedTask,
    formatDateMMM,
    setIsChatWorkspaceOpen,
    setWorkspaceChatTarget,
    teamWorkloadStats,
    inboxChats,
    isInboxLoading,
    fetchInboxChats,
    sortBy,
  } = useAppContext();

  // Refs to manage API call state and caching to prevent race conditions and spamming.
  const isFetchPending = useRef(false);
  const lastActiveDataKeyRef = useRef('');

  useEffect(() => {
    fetchInboxChats();
  }, []);

  const openTaskInGlobal = (task) => {
    setSelectedBoard({ id: 'global', name: `${tMsg('See the Big Picture', 'Lihat Gambaran Besar')}`, role: 'owner', isVirtual: true });
    setShowMyTasks(false);
    setShowOverdueOnly(false);
    setTimeout(() => {
      setSelectedTask(task);
    }, 100);
  };

  // Urutkan tugas aktif user berdasarkan aturan Master View secara global (semua project)
  const sortedUserTasks = React.useMemo(() => {
    const userActiveTasks = (tasks || []).filter(t => {
      const status = (t.status || '').toLowerCase();
      return status !== 'done' && status !== 'rejected' && isUserAssigned(t, currentUser);
    });

    const prioWeight = { critical: 1, warning: 2, normal: 3 };
    const impactWeightDefault = { High: 1, Medium: 2, Low: 3 };
    const impactWeightCustom = { High: 3, Medium: 2, Low: 1 };

    return [...userActiveTasks].sort((a, b) => {
      // Urutkan berdasarkan nomor antrean global terlebih dahulu (agar sesuai dengan definisi "My Top Queue")
      const qa = a.queue_global_number || 999999;
      const qb = b.queue_global_number || 999999;
      if (qa !== qb) return qa - qb;

      const currentSort = sortBy || 'Default';
      if (currentSort === 'Default') {
        const wa = prioWeight[a.priority_lvl || 'normal'] || 3;
        const wb = prioWeight[b.priority_lvl || 'normal'] || 3;
        if (wa !== wb) return wa - wb;

        const impA = impactWeightDefault[a.impact || 'Medium'] || 2;
        const impB = impactWeightDefault[b.impact || 'Medium'] || 2;
        if (impA !== impB) return impA - impB;

        const da = a.deadline
          ? new Date(a.deadline.replace(/-/g, '/')).getTime()
          : new Date(a.timestamp.replace(/-/g, '/')).getTime();
        const db = b.deadline
          ? new Date(b.deadline.replace(/-/g, '/')).getTime()
          : new Date(b.timestamp.replace(/-/g, '/')).getTime();
        if (da !== db) return da - db;
        return a.id - b.id;
      }
      if (currentSort === 'Impact') {
        const wa = impactWeightCustom[a.impact || 'Medium'] || 0;
        const wb = impactWeightCustom[b.impact || 'Medium'] || 0;
        if (wa !== wb) return wb - wa;
        if (a.etc !== b.etc) return (b.etc || 2) - (a.etc || 2);
        const da = a.deadline ? new Date(a.deadline.replace(/-/g, '/')).getTime() : Infinity;
        const db = b.deadline ? new Date(b.deadline.replace(/-/g, '/')).getTime() : Infinity;
        if (da !== db) return da - db;
        return a.id - b.id;
      }
      if (currentSort === 'Due Date') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        const da = new Date(a.deadline.replace(/-/g, '/')).getTime();
        const db = new Date(b.deadline.replace(/-/g, '/')).getTime();
        return da - db;
      }
      if (currentSort === 'Date Created') {
        const da = new Date(a.timestamp.replace(/-/g, '/')).getTime();
        const db = new Date(b.timestamp.replace(/-/g, '/')).getTime();
        return db - da;
      }
      return a.id - b.id;
    });
  }, [tasks, currentUser, sortBy]);

  const topQueueTasks = sortedUserTasks.slice(0, 3);

  const myWorkload = teamWorkloadStats?.[currentUser] || { total_etc: 0, done_etc: 0 };
  const myActiveWorkloadEtc = myWorkload.total_etc - myWorkload.done_etc;
  const myTotalWorkloadEtc = myWorkload.total_etc;

  const isWeeklyOverload = myActiveWorkloadEtc > 40;
  const isMonthlyOverload = myTotalWorkloadEtc > 160;

  const [aiSummary, setAiSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  const tMsg = (en, id) => (language === 'id' ? id : en);

  const activeWsId = activeWorkspace?.id;

  // Multitenancy Isolation: Filter boards strictly belonging to active workspace
  const wsBoards = React.useMemo(() => {
    if (!activeWsId) return boards || [];
    return (boards || []).filter(b => b.workspace_id && parseInt(b.workspace_id) === parseInt(activeWsId));
  }, [boards, activeWsId]);

  // Multitenancy Isolation: Filter tasks strictly belonging to active workspace
  const wsTasks = React.useMemo(() => {
    if (!activeWsId) return tasks || [];
    return (tasks || []).filter(t => t.workspace_id && parseInt(t.workspace_id) === parseInt(activeWsId));
  }, [tasks, activeWsId]);

  // Multitenancy Isolation: Filter inbox chats strictly belonging to active workspace
  const wsInboxChats = React.useMemo(() => {
    if (!activeWsId) return inboxChats || [];
    return (inboxChats || []).filter(chat => {
      if (chat.workspace_id) return parseInt(chat.workspace_id) === parseInt(activeWsId);
      return true;
    });
  }, [inboxChats, activeWsId]);

  const today = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', dateOptions);

  // Sync logic: tasks that belong to the user in current workspace
  const myTasks = wsTasks.filter(t => {
    const status = (t.status || '').toLowerCase();
    return status !== 'done' && status !== 'rejected' && isUserAssigned(t, currentUser);
  });
  
  // Filter out default 'To-do List' from Projects count to prevent confusion
  const activeProjectsCount = wsBoards.filter(b => b.name.toLowerCase() !== 'to-do list' && b.name.toLowerCase() !== 'to-do-list').length;
  const criticalProjectsCount = wsBoards.filter(b => b.health_alert?.includes('Attention')).length;
  
  // Overdue logic in current workspace
  const overdueTasksCount = wsTasks.filter(t => {
    if (!t.deadline) return false;
    const status = (t.status || '').toLowerCase();
    if (status === 'done' || status === 'rejected') return false;
    const end = new Date(t.deadline);
    const now = new Date();
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return end < now;
  }).length;

  const visibleChatsForKey = wsInboxChats.filter(chat => !(chat.latest_message || '').includes('<!--PRIVATE:'));
  const dataKey = `${activeWsId}_${myTasks.length}_${overdueTasksCount}_${activeProjectsCount}_${visibleChatsForKey.length}_${language}`;

  const fetchAiSummary = async (currentDataKey) => {
    // Prevent spamming the API on every mount
    const cachedSummary = sessionStorage.getItem('aiWorkloadSnapshot');
    const cachedTime = sessionStorage.getItem('aiWorkloadSnapshotTime');
    const cachedKey = sessionStorage.getItem('aiWorkloadDataKey');
    const now = new Date().getTime();

    // Cache valid for 30 minutes (1800000 ms) and only if data hasn't changed
    if (cachedSummary && cachedTime && cachedKey === currentDataKey && now - parseInt(cachedTime) < 1800000) {
      setAiSummary(cachedSummary);
      return;
    }

    if (isFetchPending.current) return; // Prevent concurrent requests
    isFetchPending.current = true;
    lastActiveDataKeyRef.current = currentDataKey;
    setIsSummarizing(true);
    try {
      const topQueue = topQueueTasks.slice(0, 3).map(t => t.project_name || t.title).join(', ');
      const recentComments = visibleChatsForKey.slice(0, 2).map(chat => {
        const place = chat.is_dm ? `DM with @${chat.partner_username}` : (chat.board_name || chat.project_name);
        if (chat.latest_sender === currentUser) {
          return `You replied in ${place}`;
        }
        return `Message from @${chat.latest_sender} in ${place}`;
      }).join('; ');

      // Only count chats the user has NOT yet read for the AI
      const trulyUnreadCount = visibleChatsForKey.filter(chat => {
        if (chat.latest_sender === currentUser) return false;
        if (chat.is_dm) return (chat.unread_count || 0) > 0;
        if (chat.is_project_chat) {
          const lastRead = localStorage.getItem(`innocean_last_read_board_${chat.board_id}_${currentUser}`);
          return !lastRead || chat.timestamp > lastRead;
        } else {
          const lastRead = localStorage.getItem(`innocean_last_read_task_${chat.task_id}_${currentUser}`);
          return !lastRead || chat.timestamp > lastRead;
        }
      }).length;

      const workloadInfo = `The user's current active workload is ${Math.round(myActiveWorkloadEtc)} hours out of a total of ${Math.round(myTotalWorkloadEtc)} hours. `;
      const weeklyOverloadWarning = isWeeklyOverload ? tMsg('The user is currently experiencing a weekly overload. ', 'Pengguna saat ini mengalami kelebihan beban kerja mingguan. ') : '';
      const monthlyOverloadWarning = isMonthlyOverload ? tMsg("The user's total assigned work for this period indicates a monthly overload. ", 'Total pekerjaan yang ditugaskan pada pengguna untuk periode ini menunjukkan kelebihan beban bulanan. ') : '';

      const prompt = `As an AI assistant, provide a super brief (max 2 sentences) executive summary of the user's workload. Address the user directly (e.g., "You have..."). Use markdown bold syntax (**text**) to highlight key numbers, statuses, or action items (like overdue tasks or overload warnings). Here's the data: The user has ${myTasks.length} tasks, ${overdueTasksCount} overdue tasks, and is involved in ${activeProjectsCount} active projects. ` +
        workloadInfo + weeklyOverloadWarning + monthlyOverloadWarning +
        (topQueue ? `Their top queue priorities are: ${topQueue}. ` : '') +
        (recentComments ? `Their recent chat activity (may already be read): ${recentComments}. ` : '') +
        (trulyUnreadCount > 0 ? `They have ${trulyUnreadCount} unread message(s) that still need a response. ` : `All recent messages have been read. `) +
        `Use a professional, motivating tone. If there are overload warnings, mention them directly. Reply in ${language === 'id' ? 'Indonesian' : 'English'}.`;
      
      const response = await axios.post('/api/ai/generate', {
        prompt: prompt,
        task_context: '',
        board_id: 'global'
      });
      const summaryText = response.data.text;
      setAiSummary(summaryText);
      sessionStorage.setItem('aiWorkloadSnapshot', summaryText);
      sessionStorage.setItem('aiWorkloadSnapshotTime', now.toString());
      sessionStorage.setItem('aiWorkloadDataKey', currentDataKey);
    } catch (error) {
      console.error("AI Summary Error", error);
      const fallbackMsg = tMsg(
        'AI Summary is currently unavailable. Please focus on your priority tasks for today.',
        'Ringkasan AI saat ini tidak tersedia. Silakan fokus pada tugas prioritas Anda hari ini.'
      );
      setAiSummary(fallbackMsg);
    } finally {
      setIsSummarizing(false);
      isFetchPending.current = false;
    }
  };

  useEffect(() => {
    if (isLoading || isTasksLoading || isBoardsLoading) return;

    const hasData = tasks.length > 0 || boards.length > 0;
    let timer;

    if (hasData) {
      timer = setTimeout(() => fetchAiSummary(dataKey), 500);
    } else {
      timer = setTimeout(() => fetchAiSummary(dataKey), 5000);
    }

    return () => clearTimeout(timer);
  }, [isLoading, isTasksLoading, isBoardsLoading, tasks.length > 0, boards.length > 0, dataKey]);

  const getTaskDeadlineInfo = (task) => {
    if (!task.deadline) return null;
    const now = new Date();
    now.setHours(0,0,0,0);
    const d = new Date(task.deadline);
    d.setHours(0,0,0,0);
    
    const diffMs = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    let color = 'text-green-600 dark:text-green-400';
    let badgeColor = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/50';
    
    if (diffDays < 0) {
      color = 'text-red-600 dark:text-red-400';
      badgeColor = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50';
    } else if (diffDays <= 3) {
      color = 'text-amber-600 dark:text-amber-400';
      badgeColor = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
    }
    
    let timeStr = '';
    if (diffDays < 0) {
      timeStr = tMsg(`Overdue ${Math.abs(diffDays)}d`, `Terlambat ${Math.abs(diffDays)}h`);
    } else if (diffDays === 0) {
      timeStr = tMsg('Due Today', 'Batas Hari Ini');
    } else if (diffDays === 1) {
      timeStr = tMsg('1d left', '1h lagi');
    } else if (diffDays < 7) {
      timeStr = tMsg(`${diffDays}d left`, `${diffDays}h lagi`);
    } else {
      const w = Math.floor(diffDays / 7);
      const remD = diffDays % 7;
      timeStr = remD === 0 ? tMsg(`${w}w left`, `${w}m lagi`) : tMsg(`${w}w ${remD}d left`, `${w}m ${remD}h lagi`);
    }
    
    return { color, badgeColor, timeStr };
  };

  const projectDistribution = React.useMemo(() => {
    if (!myTasks.length) return [];
    const counts = {};
    myTasks.forEach(t => {
      const bId = t.board_id || 'global';
      counts[bId] = (counts[bId] || 0) + 1;
    });
    
    const dist = Object.entries(counts).map(([bId, count]) => {
      const board = boards.find(b => parseInt(b.id) === parseInt(bId));
      return {
        id: bId,
        name: board ? board.name : 'Global',
        percentage: Math.round((count / myTasks.length) * 100)
      };
    }).sort((a, b) => b.percentage - a.percentage).slice(0, 3);
    
    return dist;
  }, [myTasks, boards]);

  return (
    <div className="flex-1 p-6 md:p-8 bg-[#F3F4F6] dark:bg-[#0d0f11] overflow-y-auto w-full h-full custom-scrollbar">
      <div className="w-full space-y-8 relative z-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
              {formattedDate}
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none flex flex-wrap gap-x-2.5 items-baseline">
              <span>{tMsg('Good Morning,', 'Selamat Pagi,')}</span>
              <span className="text-indigo-900 dark:text-indigo-100">{currentUser}</span>
            </h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-3 font-medium">
              {tMsg('Here is your work summary for today.', 'Berikut ringkasan kerja Anda untuk hari ini.')}
            </p>
          </div>
          <button
            onClick={() => setIsCreateBoardOpen(true)}
            disabled={accountStatus === 'suspended'}
            className="tour-home-new-project shrink-0 bg-yellow-400 text-indigo-950 font-bold py-3 px-6 rounded-xl hover:bg-yellow-300 transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {tMsg('New Project', 'Proyek Baru')}
          </button>
        </header>

        {/* AI Intelligence Center */}
        <section className="tour-ai-briefing ai-glow rounded-2xl p-6 md:p-8 relative overflow-hidden group">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-30 dark:opacity-15 text-yellow-500 dark:text-yellow-400 transition-transform group-hover:rotate-12 duration-700 pointer-events-none select-none z-0">
            <span className="material-symbols-outlined leading-none" style={{ fontSize: '180px' }}>auto_awesome</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-500/20 rounded-lg shrink-0">
                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">tips_and_updates</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {tMsg("Today's Work Snapshot From AI", 'Sekilas Kerja Hari Ini Dari AI')}
                {isSummarizing && (
                  <span className="inline-block w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                )}
              </h2>
            </div>
            <div className="text-sm md:text-base text-slate-700 dark:text-slate-300 mb-6 max-w-3xl leading-relaxed font-medium">
              {isSummarizing ? (
                <span className="animate-pulse">{tMsg('Analyzing your workload...', 'Menganalisis beban kerja Anda...')}</span>
              ) : (
                aiSummary ? (
                  <span dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-white font-extrabold">$1</strong>') }} />
                ) : (
                  tMsg('No AI summary for today yet.', 'Belum ada ringkasan AI untuk hari ini.')
                )
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => {
                  setSelectedBoard({ id: 'global', name: `${tMsg('See the Big Picture', 'Lihat Gambaran Besar')}`, role: 'owner', isVirtual: true });
                  setShowMyTasks(true);
                  setShowOverdueOnly(false);
                  setShowDueTodayOnly(true);
                }}
                className="px-5 py-2.5 bg-indigo-950 dark:bg-indigo-900 text-white font-semibold rounded-xl hover:bg-indigo-900 dark:hover:bg-indigo-800 transition-colors shadow-sm text-sm"
              >
                {tMsg("See Today's Plan", 'Lihat Rencana Hari Ini')}
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  sessionStorage.removeItem('aiWorkloadSnapshot');
                  sessionStorage.removeItem('aiWorkloadSnapshotTime');
                  sessionStorage.removeItem('aiWorkloadDataKey');
                  fetchAiSummary(dataKey);
                }}
                disabled={isSummarizing}
                className="px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                {tMsg('Refresh', 'Perbarui')}
              </button>
            </div>
          </div>
        </section>

        {/* Key Metrics Bento Grid */}
        <section className="tour-quick-stats grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div 
            onClick={() => {
              setSelectedBoard({ id: 'global', name: `🌍 ${tMsg('See the Big Picture', 'Lihat Gambaran Besar')}`, role: 'owner', isVirtual: true });
              setShowMyTasks(true);
              setShowOverdueOnly(false);
              setShowDueTodayOnly(false);
            }}
            className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800 p-6 rounded-2xl shadow-xs flex items-start justify-between hover:shadow-md hover:border-indigo-300 dark:hover:border-[#FACC15]/40 cursor-pointer transition-all hover:-translate-y-0.5 group"
          >
            <div>
              <p className="text-[11px] font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1">{tMsg('Total Tasks', 'Total Tugas')}</p>
              <div className="text-3xl md:text-4xl font-black text-[#111E38] dark:text-white">
                {isLoading ? <div className="w-12 h-10 bg-neutral-200 dark:bg-slate-800 rounded animate-pulse"></div> : myTasks.length}
              </div>
              <p className="text-xs font-bold text-indigo-600 dark:text-[#FACC15] mt-2 flex items-center gap-1 group-hover:underline">
                {tMsg('See all tasks', 'Lihat semua tugas')} &rarr;
              </p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">task_alt</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800 p-6 rounded-2xl shadow-xs flex items-start justify-between hover:shadow-md transition-all">
            <div>
              <p className="text-[11px] font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1">{tMsg('Active Projects', 'Proyek Aktif')}</p>
              <div className="text-3xl md:text-4xl font-black text-[#111E38] dark:text-white">
                {isLoading ? <div className="w-12 h-10 bg-neutral-200 dark:bg-slate-800 rounded animate-pulse"></div> : activeProjectsCount}
              </div>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-2 flex items-center gap-1">
                {tMsg('Projects followed', 'Proyek yang diikuti')}
              </p>
            </div>
            <div className="p-3 bg-sky-50 dark:bg-sky-900/30 rounded-xl text-sky-600 dark:text-sky-400 shrink-0">
              <span className="material-symbols-outlined">folder_open</span>
            </div>
          </div>

          <div 
            onClick={() => {
              setSelectedBoard({ id: 'global', name: `${tMsg('See the Big Picture', 'Lihat Gambaran Besar')}`, role: 'owner', isVirtual: true });
              setShowOverdueOnly(true);
              setShowMyTasks(false);
              setShowDueTodayOnly(false);
            }}
            className="bg-white dark:bg-[#121B2D] border-l-4 border-l-rose-500 border-y border-r border-neutral-200/80 dark:border-neutral-800 p-6 rounded-2xl shadow-xs flex items-start justify-between cursor-pointer hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-[11px] font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1">{tMsg('Overdue Tasks', 'Tugas Terlambat')}</p>
              <div className="text-3xl md:text-4xl font-black text-rose-600 dark:text-rose-400">
                {isLoading ? <div className="w-12 h-10 bg-rose-100 dark:bg-rose-900/20 rounded animate-pulse"></div> : overdueTasksCount}
              </div>
              <p className="text-xs font-bold text-rose-600/90 dark:text-rose-400/90 mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                {tMsg('Action required', 'Perlu tindakan')}
              </p>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400 shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">schedule</span>
            </div>
          </div>

          <div 
            onClick={() => {
              const critBoard = boards.find(b => b.health_alert?.includes('Attention'));
              if (critBoard) {
                setSelectedBoard(critBoard);
                setShowMyTasks(false);
                setShowOverdueOnly(false);
              } else {
                setSelectedBoard({ id: 'global', name: `${tMsg('See the Big Picture', 'Lihat Gambaran Besar')}`, role: 'owner', isVirtual: true });
                setShowMyTasks(false);
                setShowOverdueOnly(false);
              }
            }}
            className="bg-white dark:bg-[#121B2D] border-l-4 border-l-[#FACC15] border-y border-r border-neutral-200/80 dark:border-neutral-800 p-6 rounded-2xl shadow-xs flex items-start justify-between hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group"
          >
            <div>
              <p className="text-[11px] font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1">{tMsg('Critical Projects', 'Proyek Kritis')}</p>
              <div className="text-3xl md:text-4xl font-black text-[#111E38] dark:text-white">
                {isLoading ? <div className="w-12 h-10 bg-neutral-200 dark:bg-slate-800 rounded animate-pulse"></div> : criticalProjectsCount}
              </div>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-2 flex items-center gap-1 group-hover:underline">
                <span className="material-symbols-outlined text-[14px]">priority_high</span>
                {criticalProjectsCount > 0 ? tMsg('Needs attention', 'Perlu perhatian') : tMsg('All safe', 'Semua aman')}
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">flag</span>
            </div>
          </div>
        </section>

        {/* Bento Grid: Analytics & Workspace */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Analitik Performa (1 Col) */}
          <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 block mb-1">
                    {tMsg('Workload Status', 'Status Beban Kerja')}
                  </span>
                  <h3 className="text-lg font-black text-[#111E38] dark:text-white leading-tight">
                    {tMsg('Performance Analytics', 'Analitik Performa')}
                  </h3>
                </div>
                {(isWeeklyOverload || isMonthlyOverload) ? (
                  <span className="text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 px-2.5 py-1 rounded-lg border border-rose-300/60 dark:border-rose-800/40 uppercase tracking-wider animate-pulse flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">warning</span>
                    Overload
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-300/60 dark:border-emerald-800/40 uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">check_circle</span>
                    Optimal
                  </span>
                )}
              </div>

              {/* Sleek Modern Arc Gauge + Centered Metrics */}
              {(() => {
                const capacityPct = myTotalWorkloadEtc > 0 ? Math.min(Math.round((myWorkload.done_etc / myTotalWorkloadEtc) * 100), 100) : 0;
                const hoursDone = Math.round((myWorkload.done_etc || 0) * 10) / 10;
                const hoursTotal = Math.round((myTotalWorkloadEtc || 0) * 10) / 10;
                const hoursRemaining = Math.max(0, Math.round((hoursTotal - hoursDone) * 10) / 10);

                // Arc Gauge Math: 240 degree arc (from 135deg to 375deg)
                // Circumference for r=72 is ~452.39. 240 deg arc length is (240/360) * 452.39 = 301.6px
                const maxArc = 301.6;
                const offset = maxArc - (maxArc * (capacityPct / 100));

                return (
                  <div className="relative py-2 flex flex-col items-center">
                    {/* Semi-Arc SVG Gauge */}
                    <div className="relative w-56 h-36 flex items-center justify-center overflow-hidden">
                      <svg className="w-56 h-56 transform rotate-[135deg]" viewBox="0 0 200 200">
                        {/* Background Arc */}
                        <circle
                          cx="100"
                          cy="100"
                          r="72"
                          fill="none"
                          className="stroke-neutral-150 dark:stroke-neutral-800"
                          strokeWidth="14"
                          strokeDasharray="301.6 150.8"
                          strokeLinecap="round"
                        />
                        {/* Active Progress Arc */}
                        <circle
                          cx="100"
                          cy="100"
                          r="72"
                          fill="none"
                          className="stroke-[#111E38] dark:stroke-[#FACC15] transition-all duration-1000 ease-out"
                          strokeWidth="14"
                          strokeLinecap="round"
                          strokeDasharray="301.6 150.8"
                          strokeDashoffset={offset}
                        />
                      </svg>
                      {/* Gauge Center Text */}
                      <div className="absolute inset-0 top-3 flex flex-col items-center justify-center text-center">
                        <span className="text-4xl font-black text-[#111E38] dark:text-white tracking-tight">
                          {capacityPct}%
                        </span>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mt-0.5">
                          {tMsg('Capacity Done', 'Kapasitas Selesai')}
                        </span>
                      </div>
                    </div>

                    {/* Compact Workload Pill Stats (No Empty Space!) */}
                    <div className="grid grid-cols-2 gap-3 w-full mt-2">
                      <div className="bg-[#F3F4F6] dark:bg-[#0d0f11] p-3 rounded-xl border border-neutral-200/60 dark:border-neutral-800/80 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                          <span className="material-symbols-outlined text-base">task_alt</span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block truncate">
                            {tMsg('Done', 'Selesai')}
                          </span>
                          <span className="text-sm font-black text-[#111E38] dark:text-white">
                            {hoursDone} <span className="text-[10px] font-normal text-neutral-500">jam</span>
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#F3F4F6] dark:bg-[#0d0f11] p-3 rounded-xl border border-neutral-200/60 dark:border-neutral-800/80 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                          <span className="material-symbols-outlined text-base">pending_actions</span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block truncate">
                            {tMsg('Remaining', 'Sisa')}
                          </span>
                          <span className="text-sm font-black text-[#111E38] dark:text-white">
                            {hoursRemaining} <span className="text-[10px] font-normal text-neutral-500">jam</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Project Distribution Progress Bars */}
            <div className="space-y-3 mt-6 pt-5 border-t border-neutral-150 dark:border-neutral-800/80">
              <h4 className="text-xs font-extrabold text-[#111E38] dark:text-white uppercase tracking-wider">{tMsg('Project Distribution', 'Distribusi Proyek')}</h4>
              <div className="space-y-3">
                {projectDistribution.length > 0 ? projectDistribution.map((dist, idx) => (
                  <div key={dist.id}>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-slate-600 dark:text-slate-400 truncate pr-2">{dist.name}</span>
                      <span className="text-slate-900 dark:text-white font-bold">{dist.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full ${idx === 0 ? 'bg-indigo-900 dark:bg-yellow-400' : idx === 1 ? 'bg-indigo-600 dark:bg-yellow-500/80' : 'bg-slate-400 dark:bg-slate-600'}`} 
                        style={{ width: `${dist.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )) : (
                  <div className="text-xs text-slate-500 text-center py-4">{tMsg('No active project data.', 'Tidak ada data proyek aktif.')}</div>
                )}
              </div>
            </div>

            <div className="space-y-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>{tMsg('Database Storage', 'Penyimpanan Database')}</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">Free Tier</span>
              </h4>
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-500 dark:text-slate-400">18.4 MB / 512.0 MB</span>
                  <span className="text-slate-900 dark:text-white font-bold">3.6%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full bg-yellow-400" style={{ width: '3.6%' }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>{tMsg('File Storage', 'Penyimpanan Berkas')}</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">Cloud S3</span>
              </h4>
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-500 dark:text-slate-400">245.8 MB / 5.0 GB</span>
                  <span className="text-slate-900 dark:text-white font-bold">4.9%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full bg-yellow-400" style={{ width: '4.9%' }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>{tMsg('AI Usage Quota', 'Kuota Penggunaan AI')}</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">Luruka AI</span>
              </h4>
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-500 dark:text-slate-400">142 / 500 {tMsg('prompts', 'permintaan')}</span>
                  <span className="text-slate-900 dark:text-white font-bold">28.4%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full bg-yellow-400" style={{ width: '28.4%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Workspace Focus (2 Cols) */}
          <div className="lg:col-span-2 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-[0_4px_24px_rgba(17,30,56,0.04)] flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{tMsg('Focused Workspace', 'Ruang Kerja Terfokus')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
              {/* Left Col: Tasks */}
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="material-symbols-outlined text-[18px]">list_alt</span>
                  {tMsg('My Top Queue', 'Antrean Teratas Saya')}
                </h4>
                <div className="space-y-3 flex-1">
                  {topQueueTasks.length > 0 ? topQueueTasks.map((task, idx) => (
                    <div 
                      key={task.id}
                      onClick={() => openTaskInGlobal(task)}
                      className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-start gap-3"
                    >
                      {/* Left side Queue Badge */}
                      <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-lg bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400 font-bold text-xs">
                        #{idx + 1}
                      </span>
                      
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                          {task.project_name || task.title}
                        </span>
                        
                        {/* Row 1 of metadata: Board name, category, impact, etc */}
                        <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap text-[10px]" style={{ scrollbarWidth: 'none' }}>
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 font-bold rounded border border-indigo-100/50 dark:border-indigo-900/30 truncate max-w-25">
                            {boards.find(b => parseInt(b.id) === parseInt(task.board_id))?.name || 'Global'}
                          </span>
                          
                          {task.category && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 font-bold rounded truncate max-w-17.5">
                              {task.category}
                            </span>
                          )}
                          
                          {task.impact && (
                            <span className={`px-2 py-0.5 rounded font-bold border flex items-center gap-1 ${
                              task.impact === 'High' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950 dark:text-red-400 dark:border-transparent' :
                              task.impact === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-950 dark:text-yellow-400 dark:border-transparent' :
                              'bg-green-50 text-green-600 border-green-100 dark:bg-green-950 dark:text-green-400 dark:border-transparent'
                            }`}>
                              <span>⚡</span>
                              <span>{task.impact}</span>
                            </span>
                          )}
                          
                          {task.etc && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50/50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold rounded">
                              <span>🕒</span>
                              <span>{task.etc}h</span>
                            </span>
                          )}
                        </div>
                        
                        {/* Row 2 of metadata: Dates strip */}
                        <div className="flex items-center gap-2 bg-slate-50/60 dark:bg-slate-800/40 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800/60 text-[10px] font-medium text-slate-500 dark:text-slate-400 overflow-hidden whitespace-nowrap">
                          {(() => {
                            const formatShortDate = (dateStr) => {
                              if (!dateStr) return '';
                              try {
                                const datePart = dateStr.split('T')[0];
                                const parts = datePart.split('-');
                                if (parts.length === 3) {
                                  const day = parseInt(parts[2], 10);
                                  const monthIndex = parseInt(parts[1], 10) - 1;
                                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                  return `${day} ${months[monthIndex] || ''}`;
                                }
                                const d = new Date(dateStr);
                                if (isNaN(d.getTime())) return dateStr;
                                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                return `${d.getDate()} ${months[d.getMonth()]}`;
                              } catch (e) {
                                return dateStr;
                              }
                            };
                            return (
                              <>
                                <span className="flex items-center gap-1 shrink-0">
                                  <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                                  <span>Start: {formatShortDate(task.start_date || task.timestamp)}</span>
                                </span>
                                
                                {task.deadline && (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0"></span>
                                    <span className="flex items-center gap-1 shrink-0">
                                      <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                                      <span>Due: {formatShortDate(task.deadline)}</span>
                                    </span>
                                  </>
                                )}

                                {task.priority_str && (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0"></span>
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shadow-sm shrink-0 ${
                                        task.priority_str.includes('NO DATE')
                                          ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                                          : task.priority_lvl === 'critical'
                                          ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                          : task.priority_lvl === 'warning'
                                          ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                          : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                      }`}
                                    >
                                      {task.priority_str}
                                    </span>
                                  </>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-sm text-slate-500 flex flex-col items-center h-full justify-center text-center gap-2 py-8">
                      <div className="text-4xl">🎉</div>
                      <div>{tMsg('Tidak ada tugas tertunda!', 'Tidak ada tugas tertunda!')}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Col: Comments */}
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="material-symbols-outlined text-[18px]">forum</span>
                  {tMsg('Recent Comments', 'Komentar Terbaru')}
                </h4>
                <div className="space-y-4 flex-1">
                  {isInboxLoading && inboxChats.length === 0 ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-900 dark:border-yellow-400 border-t-transparent"></div>
                    </div>
                  ) : (() => {
                    const visibleChats = inboxChats.filter(chat => !(chat.latest_message || '').includes('<!--PRIVATE:'));
                    return visibleChats.length > 0 ? visibleChats.slice(0, 3).map(chat => {
                      const isUnread = (() => {
                        if (chat.latest_sender === currentUser) return false;
                        if (chat.is_dm) return chat.unread_count > 0;
                        const lastReadKey = chat.is_project_chat ? `alurku_last_read_board_${chat.board_id}_${currentUser}` : `alurku_last_read_task_${chat.task_id}_${currentUser}`;
                        const lastRead = localStorage.getItem(lastReadKey);
                        return !lastRead || chat.timestamp > lastRead;
                      })();

                      return (
                        <div 
                          key={`${chat.is_dm ? 'dm-' + chat.partner_username : chat.task_id}-${chat.timestamp}`}
                          onClick={() => {
                            if (chat.is_dm) {
                              setWorkspaceChatTarget({ type: 'dm', id: chat.partner_username, name: chat.partner_username, partner: chat.partner_username });
                              setIsChatWorkspaceOpen(true);
                            } else if (chat.is_project_chat) {
                              setWorkspaceChatTarget({ type: 'project', id: chat.board_id, name: chat.board_name || 'Project Chat', board_id: chat.board_id });
                              setIsChatWorkspaceOpen(true);
                            } else {
                              handleNotificationTaskClick(chat.task_id);
                            }
                          }}
                          className={`flex gap-3 cursor-pointer group p-2 -mx-2 rounded-xl transition-all ${isUnread ? 'bg-indigo-50/50 dark:bg-yellow-400/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                        >
                          <div className="w-9 h-9 shrink-0 relative mt-0.5">
                            <Avatar name={chat.latest_sender} url={avatarsMap?.[chat.latest_sender]} size="w-9 h-9" />
                            {isUnread && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1 gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                @{chat.latest_sender} <span className="text-slate-400 font-normal">in {chat.is_dm ? 'DM' : chat.project_name || chat.board_name}</span>
                              </span>
                              <span className="text-[10px] font-medium text-slate-400 shrink-0">{formatDateMMM(chat.timestamp)}</span>
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl rounded-tl-sm border border-slate-200 dark:border-slate-700/50 line-clamp-2 leading-relaxed group-hover:border-indigo-200 dark:group-hover:border-yellow-400/30 transition-colors">
                              {cleanMarkdown(chat.latest_message || '...')}
                            </div>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="text-sm text-slate-500 flex flex-col items-center justify-center h-32 text-center gap-2">
                        <div className="text-3xl">💭</div>
                        <div>{tMsg('No recent comments.', 'Tidak ada komentar terbaru.')}</div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="bg-indigo-950 dark:bg-slate-800 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-xl relative overflow-hidden border border-indigo-900 dark:border-slate-700">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at right, #facc15 0%, transparent 60%)' }}></div>
          <div className="flex items-center gap-6 z-10 mb-6 md:mb-0 w-full md:w-auto">
            <div className="p-4 bg-yellow-400 rounded-2xl text-indigo-950 hidden sm:block shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-[32px]">rocket_launch</span>
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black mb-2 tracking-tight">{tMsg('Ready to get things done?', 'Siap untuk menyelesaikan tugas?')}</h3>
              <p className="text-indigo-200 dark:text-slate-400 text-sm md:text-base font-medium">
                {tMsg('Open Master View for in-depth management.', 'Buka Tampilan Master untuk manajemen mendalam.')}
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              setSelectedBoard({ id: 'global', name: `🌍 ${tMsg('See the Big Picture', 'Lihat Gambaran Besar')}`, role: 'owner', isVirtual: true });
              setShowMyTasks(false);
              setShowOverdueOnly(false);
            }}
            className="px-8 py-3.5 bg-yellow-400 text-indigo-950 font-black text-sm md:text-base uppercase tracking-wider rounded-xl shadow-[0_4px_14px_rgba(250,204,21,0.4)] hover:bg-yellow-300 hover:shadow-[0_6px_20px_rgba(250,204,21,0.6)] hover:-translate-y-1 transition-all z-10 w-full md:w-auto text-center"
          >
            {tMsg('Master View', 'Tampilan Master')}
          </button>
        </section>

      </div>
    </div>
  );
}
