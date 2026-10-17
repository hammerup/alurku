import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { getTourSteps } from './tourSteps';
import { useTimelinePan } from './useTimelinePan';

export function useAppPreferences({
  isAuthenticated,
  currentUser,
  language,
  t,
  tMsg,
  tasks,
  setTasks,
  boards,
  selectedBoard,
  setSelectedBoard,
  setSelectedTask,
  activeWorkspace,
  workspaces,
  switchWorkspace,
  viewMode,
  groupBy,
  leaves,
  isSuperAdmin,
  fetchTasks,
  showNotification,
  setPendingStatusChange,
  setAppTheme,
  setAppBgImage,
  setAppTexture,
  setCardTheme,
  setIsFormOpen,
  setIsDeleteConfirmOpen,
  isProactiveAIOpen,
  setIsProactiveAIOpen,
  isProjectChatOpen,
  setIsProjectChatOpen,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isSettingsOpen,
  setIsSettingsOpen,
  isDocsOpen,
  setIsDocsOpen,
  selectedTask,
  isLeaveModalOpen,
  setIsLeaveModalOpen,
  isAdminModalOpen,
  setIsAdminModalOpen,
  isFeedbackOpen,
  setIsFeedbackOpen,
  isSupportOpen,
  setIsSupportOpen,
  isTeamModalOpen,
  setIsTeamModalOpen,
  isInvitesModalOpen,
  setIsInvitesModalOpen,
  isLogoutConfirmOpen,
  setIsLogoutConfirmOpen,
  isDeleteConfirmOpen,
  isCreateBoardOpen,
  setIsCreateBoardOpen,
  isExportModalOpen,
  setIsExportModalOpen,
  isMyTicketsOpen,
  setIsMyTicketsOpen,
  isChatWorkspaceOpen,
  setIsChatWorkspaceOpen,
  isAssistantOpen,
  setIsAssistantOpen,
  colModal,
  setColModal,
  showWelcomeTour,
  setShowWelcomeTour,
  setShowTosUpdate,
  isGlobalSearchOpen,
  setIsGlobalSearchOpen,
  isTrashHovered,
  setIsTrashHovered,
  userDirectory,
  driverRef: externalDriverRef,
}) {
  const [dateFormat, setDateFormat] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('alurku_date_format') || 'DD MMM YYYY';
    return 'DD MMM YYYY';
  });
  const [showLiveClock, setShowLiveClock] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('alurku_show_clock') === 'true';
    return false;
  });
  const [showLiveClockDate, setShowLiveClockDate] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('alurku_show_clock_date') !== 'false';
    return true;
  });
  const [pomodoroEnabled, setPomodoroEnabled] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('alurku_pomodoro') === 'true';
    return false;
  });
  const [showAssistantButton, setShowAssistantButton] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('alurku_show_assistant_btn') !== 'false';
    return true;
  });

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    }
  };

  const prevProactiveAIOpen = useRef(isProactiveAIOpen);
  useEffect(() => {
    if (prevProactiveAIOpen.current === true && !isProactiveAIOpen && isAuthenticated && currentUser) {
      const hasAccepted = localStorage.getItem(`alurku_tos_accepted_${currentUser}`);
      if (hasAccepted !== 'true') {
        const timer = setTimeout(() => {
          if (setShowTosUpdate) setShowTosUpdate(true);
        }, 15000);
        return () => clearTimeout(timer);
      }
    }
    prevProactiveAIOpen.current = isProactiveAIOpen;
  }, [isProactiveAIOpen, isAuthenticated, currentUser, setShowTosUpdate]);

  const handleAcceptTos = () => {
    localStorage.setItem(`alurku_tos_accepted_${currentUser}`, 'true');
    if (setShowTosUpdate) setShowTosUpdate(false);
    if (showNotification) {
      showNotification(
        language === 'id' ? 'Terima kasih telah menyetujui persyaratan!' : 'Thank you for accepting the terms!',
        'success'
      );
    }
  };

  const formatDateMMM = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString.replace(/-/g, '/'));
    if (isNaN(d)) return dateString.split(' ')[0];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (dateFormat === 'DD/MM/YYYY') {
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } else if (dateFormat === 'YYYY-MM-DD') {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } else if (dateFormat === 'MMM DD, YYYY') {
      return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
    }
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const handleSelectAppTheme = (themeStr) => {
    if (setAppTheme) setAppTheme(themeStr);
    if (typeof window !== 'undefined') localStorage.setItem('alurku_app_theme', themeStr);
    if (showNotification) showNotification('App background updated!', 'success');
  };

  const handleAppBgUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        if (showNotification) showNotification('Image size must be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (setAppBgImage) setAppBgImage(reader.result);
        if (typeof window !== 'undefined') localStorage.setItem('alurku_app_bg_image', reader.result);
        if (showNotification) showNotification('Custom background updated!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAppBgImage = () => {
    if (setAppBgImage) setAppBgImage('');
    if (typeof window !== 'undefined') localStorage.removeItem('alurku_app_bg_image');
    if (showNotification) showNotification('Custom background removed!', 'success');
  };

  const handleSelectAppBg = (bgStr) => {
    if (setAppBgImage) setAppBgImage(bgStr || '');
    if (typeof window !== 'undefined') {
      if (bgStr) {
        localStorage.setItem('alurku_app_bg_image', bgStr);
      } else {
        localStorage.removeItem('alurku_app_bg_image');
      }
    }
    if (showNotification) {
      showNotification(language === 'id' ? 'Latar belakang diperbarui!' : 'Background updated!', 'success');
    }
  };

  const handleSelectAppTexture = (textureStr) => {
    if (setAppTexture) setAppTexture(textureStr);
    if (typeof window !== 'undefined') localStorage.setItem('alurku_app_texture', textureStr);
    if (showNotification) showNotification('Texture overlay updated!', 'success');
  };

  const handleSelectCardTheme = (themeStr) => {
    if (setCardTheme) setCardTheme(themeStr);
    if (typeof window !== 'undefined') localStorage.setItem('alurku_card_theme', themeStr);
    if (showNotification) showNotification('Task card theme updated!', 'success');
  };

  const internalDriverRef = useRef(null);
  const driverRef = externalDriverRef || internalDriverRef;

  const startTour = () => {
    if (setShowWelcomeTour) setShowWelcomeTour(true);
  };

  const startDriverTour = () => {
    let driverObj = null;
    driverObj = driver({
      allowClose: true,
      allowKeyboardControl: true,
      showProgress: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.75)',
      onDestroyStarted: () => {
        if (!selectedBoard || selectedBoard.id === 'global') {
          localStorage.setItem(`alurku_tour_done_v2_${currentUser}`, 'true');
          if (setIsProactiveAIOpen) setIsProactiveAIOpen(true);
          window.history.pushState({}, '', '/proactive-ai');
          window.dispatchEvent(new CustomEvent('alurku-navigate'));
        } else {
          localStorage.setItem(`alurku_board_tour_done_v2_${currentUser}`, 'true');
        }
        if (setIsFormOpen) setIsFormOpen(false);
        if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
        driverObj.destroy();
      },
      steps: getTourSteps({
        selectedBoard,
        tMsg,
        setIsFormOpen,
        getDriverObj: () => driverObj,
        driverRef,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
      }),
    });
    driverRef.current = driverObj;
    setTimeout(() => {
      driverObj.drive();
    }, 100);
  };

  useEffect(() => {
    if (selectedBoard && selectedBoard.id !== 'global' && !isProactiveAIOpen && !isProjectChatOpen) {
      const hasSeenBoardTour = localStorage.getItem(`alurku_board_tour_done_v2_${currentUser}`);
      const isAIOffering = localStorage.getItem('alurku_ai_offer_docs') === 'true';
      if (!hasSeenBoardTour && !isAIOffering) {
        const timer = setTimeout(() => {
          startDriverTour();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedBoard, isProactiveAIOpen, isProjectChatOpen, currentUser]);

  const handleManualFormClick = () => {
    if (driverRef.current && driverRef.current.isAtManualBtn) {
      setTimeout(() => {
        if (driverRef.current) driverRef.current.moveNext();
      }, 400);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const hasSeenTour = localStorage.getItem(`alurku_tour_done_v2_${currentUser}`);
      const legacyTour = localStorage.getItem('alurku_tour_done_v2');

      if (!hasSeenTour && !legacyTour) {
        const timer = setTimeout(() => {
          if (setShowWelcomeTour) setShowWelcomeTour(true);
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        if (!hasSeenTour && legacyTour) {
          localStorage.setItem(`alurku_tour_done_v2_${currentUser}`, 'true');
          localStorage.removeItem('alurku_tour_done_v2');
        }
        const justLoggedIn = sessionStorage.getItem('alurku_just_logged_in');
        if (justLoggedIn) {
          sessionStorage.removeItem('alurku_just_logged_in');
        }
      }
    }
  }, [isAuthenticated, currentUser, setShowWelcomeTour]);

  // Timeline Drag & Panning
  const timelinePan = useTimelinePan({
    tasks,
    setTasks,
    leaves,
    selectedBoard,
    currentUser,
    isSuperAdmin,
    groupBy,
    setPendingStatusChange,
    showNotification,
    fetchTasks,
    isTrashHovered,
    setIsTrashHovered,
    setIsDeleteConfirmOpen,
    setSelectedTask,
  });

  // Global search
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [globalSearchBoards, setGlobalSearchBoards] = useState([]);
  const [forceSearchAll, setForceSearchAll] = useState(false);
  const [isGlobalSearchClosing, setIsGlobalSearchClosing] = useState(false);

  useEffect(() => {
    if (globalSearchQuery.trim().length >= 2) {
      const delayDebounceFn = setTimeout(() => {
        let filterParam = '';
        if (!forceSearchAll) {
          if (selectedBoard && selectedBoard.id !== 'global') {
            filterParam = `&board_id=${selectedBoard.id}`;
          } else if (activeWorkspace && activeWorkspace.id) {
            filterParam = `&workspace_id=${activeWorkspace.id}`;
          }
        }
        axios
          .get(`/api/tasks/search?q=${encodeURIComponent(globalSearchQuery)}${filterParam}`)
          .then((res) => {
            setGlobalSearchResults(res.data.results || []);
            setGlobalSearchBoards(res.data.boards || []);
            if (setIsGlobalSearchOpen) setIsGlobalSearchOpen(true);
          })
          .catch((err) => console.error('Search failed:', err));
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setGlobalSearchResults([]);
      setGlobalSearchBoards([]);
      if (setIsGlobalSearchOpen) setIsGlobalSearchOpen(false);
    }
  }, [globalSearchQuery, forceSearchAll, selectedBoard, activeWorkspace, setIsGlobalSearchOpen]);

  const closeGlobalSearch = () => {
    setIsGlobalSearchClosing(true);
    setTimeout(() => {
      if (setIsGlobalSearchOpen) setIsGlobalSearchOpen(false);
      setIsGlobalSearchClosing(false);
    }, 200);
  };

  const handleGlobalSearchSelect = (task) => {
    if (task.workspace_id && (!activeWorkspace || activeWorkspace.id !== task.workspace_id)) {
      const ws = (workspaces || []).find((w) => w.id === task.workspace_id);
      if (ws && switchWorkspace) switchWorkspace(ws);
    }

    let board = (boards || []).find((b) => b.id === task.board_id);
    if (!board) {
      board = { id: task.board_id, name: task.board_name, workspace_id: task.workspace_id };
    }
    if (board && setSelectedBoard) setSelectedBoard(board);
    if (setSelectedTask) setSelectedTask(task);
    if (viewMode !== 'search-results') {
      setGlobalSearchQuery('');
    }
    closeGlobalSearch();
  };

  // Popstate mobile navigation
  useEffect(() => {
    const handlePopState = () => {
      if (
        isSettingsOpen ||
        isDocsOpen ||
        isProjectChatOpen ||
        selectedTask ||
        isLeaveModalOpen ||
        isAdminModalOpen ||
        isFeedbackOpen ||
        isSupportOpen ||
        isTeamModalOpen ||
        isInvitesModalOpen ||
        isLogoutConfirmOpen ||
        isDeleteConfirmOpen ||
        isCreateBoardOpen ||
        isExportModalOpen ||
        isMyTicketsOpen ||
        colModal?.isOpen ||
        isMobileMenuOpen ||
        isAssistantOpen ||
        isProactiveAIOpen
      ) {
        if (setIsSettingsOpen) setIsSettingsOpen(false);
        if (setIsDocsOpen) setIsDocsOpen(false);
        if (setIsProjectChatOpen) setIsProjectChatOpen(false);
        if (setIsFormOpen) setIsFormOpen(false);
        if (setSelectedTask) setSelectedTask(null);
        if (setIsLeaveModalOpen) setIsLeaveModalOpen(false);
        if (setIsAdminModalOpen) setIsAdminModalOpen(false);
        if (setIsFeedbackOpen) setIsFeedbackOpen(false);
        if (setIsSupportOpen) setIsSupportOpen(false);
        if (setIsTeamModalOpen) setIsTeamModalOpen(false);
        if (setIsInvitesModalOpen) setIsInvitesModalOpen(false);
        if (setIsLogoutConfirmOpen) setIsLogoutConfirmOpen(false);
        if (setIsDeleteConfirmOpen) setIsDeleteConfirmOpen(false);
        if (setIsCreateBoardOpen) setIsCreateBoardOpen(false);
        if (setIsExportModalOpen) setIsExportModalOpen(false);
        if (setIsMyTicketsOpen) setIsMyTicketsOpen(false);
        if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
        if (setIsChatWorkspaceOpen) setIsChatWorkspaceOpen(false);
        if (setIsAssistantOpen) setIsAssistantOpen(false);
        if (isProactiveAIOpen) {
          window.history.pushState({}, '', '/dashboard');
          window.dispatchEvent(new CustomEvent('alurku-navigate'));
        }
        if (setIsProactiveAIOpen) setIsProactiveAIOpen(false);
        if (setColModal) setColModal((prev) => ({ ...prev, isOpen: false }));
        window.history.pushState({ app_state: 'active' }, '');
      } else if (selectedBoard) {
        if (setSelectedBoard) setSelectedBoard(null);
        window.history.pushState({ app_state: 'active' }, '');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    isSettingsOpen,
    isDocsOpen,
    isProjectChatOpen,
    selectedTask,
    isLeaveModalOpen,
    isAdminModalOpen,
    isFeedbackOpen,
    isSupportOpen,
    selectedBoard,
    isTeamModalOpen,
    isInvitesModalOpen,
    isLogoutConfirmOpen,
    isDeleteConfirmOpen,
    isCreateBoardOpen,
    isExportModalOpen,
    isMyTicketsOpen,
    colModal?.isOpen,
    isChatWorkspaceOpen,
    isMobileMenuOpen,
    isAssistantOpen,
    isProactiveAIOpen,
    setSelectedBoard,
    setSelectedTask,
    setColModal,
    setIsAdminModalOpen,
    setIsAssistantOpen,
    setIsChatWorkspaceOpen,
    setIsCreateBoardOpen,
    setIsDeleteConfirmOpen,
    setIsDocsOpen,
    setIsExportModalOpen,
    setIsFeedbackOpen,
    setIsFormOpen,
    setIsInvitesModalOpen,
    setIsLeaveModalOpen,
    setIsLogoutConfirmOpen,
    setIsMobileMenuOpen,
    setIsMyTicketsOpen,
    setIsProactiveAIOpen,
    setIsProjectChatOpen,
    setIsSettingsOpen,
    setIsSupportOpen,
    setIsTeamModalOpen,
  ]);

  useEffect(() => {
    if (isAuthenticated) window.history.pushState({ app_state: 'active' }, '');
  }, [isAuthenticated]);

  const teamWorkloadStats = useMemo(() => {
    if (!tasks || tasks.length === 0 || !userDirectory || userDirectory.length === 0) {
      return {};
    }

    const memberDetailedStats = {};
    const currentMembersLookup = new Set((userDirectory || []).map((m) => m.username.toLowerCase()));

    tasks.forEach((t) => {
      if (t.status === 'Rejected') return;

      const involvedUsers = new Set();
      if (t.owner_username) involvedUsers.add(t.owner_username);

      if (t.requester) {
        const matches = t.requester.match(/@([\w.-]+)/g);
        if (matches) {
          matches.forEach((m) => involvedUsers.add(m.substring(1)));
        }
      }

      if (t.subtask_details) {
        const lines = t.subtask_details.split('\n');
        lines.forEach((line) => {
          const match = line.match(/\(@([\w.-]+)\)$/);
          if (match) involvedUsers.add(match[1]);
        });
      }

      const validUsers = Array.from(involvedUsers).filter(
        (p) => p && p.toLowerCase() !== 'unassigned' && currentMembersLookup.has(p.toLowerCase())
      );
      const divisor = validUsers.length > 0 ? validUsers.length : 1;
      const splitEtc = (t.etc || 2) / divisor;

      validUsers.forEach((person) => {
        if (!memberDetailedStats[person]) {
          memberDetailedStats[person] = {
            total_etc: 0,
            done_etc: 0,
            active_etc: 0,
            critical: 0,
          };
        }

        memberDetailedStats[person].total_etc += splitEtc;

        if (t.status === 'Done') {
          memberDetailedStats[person].done_etc += splitEtc;
        } else {
          if (t.status !== 'Pending') memberDetailedStats[person].active_etc += splitEtc;
          if (t.priority_lvl === 'critical') memberDetailedStats[person].critical += 1;
        }
      });
    });
    return memberDetailedStats;
  }, [tasks, userDirectory]);

  const navigateTo = useCallback((path) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  }, []);

  return {
    dateFormat,
    setDateFormat,
    showLiveClock,
    setShowLiveClock,
    showLiveClockDate,
    setShowLiveClockDate,
    pomodoroEnabled,
    setPomodoroEnabled,
    showAssistantButton,
    setShowAssistantButton,
    isInstallable,
    handleInstallClick,
    handleAcceptTos,
    formatDateMMM,
    handleSelectAppTheme,
    handleSelectAppBg,
    handleAppBgUpload,
    removeAppBgImage,
    handleSelectAppTexture,
    handleSelectCardTheme,
    startTour,
    startDriverTour,
    handleManualFormClick,
    timelineDrag: timelinePan.timelineDrag,
    setTimelineDrag: timelinePan.setTimelineDrag,
    hoveredTimelineRow: timelinePan.hoveredTimelineRow,
    setHoveredTimelineRow: timelinePan.setHoveredTimelineRow,
    handleMouseDown: timelinePan.handleMouseDown,
    handleMouseLeave: timelinePan.handleMouseLeave,
    handleMouseUp: timelinePan.handleMouseUp,
    handleMouseMove: timelinePan.handleMouseMove,
    scrollRef: timelinePan.scrollRef,
    globalSearchQuery,
    setGlobalSearchQuery,
    globalSearchResults,
    setGlobalSearchResults,
    globalSearchBoards,
    setGlobalSearchBoards,
    forceSearchAll,
    setForceSearchAll,
    isGlobalSearchClosing,
    setIsGlobalSearchClosing,
    closeGlobalSearch,
    handleGlobalSearchSelect,
    teamWorkloadStats,
    navigateTo,
  };
}
