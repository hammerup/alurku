import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useAppContext } from './hooks/useAppContext';
import UpgradeModal from './components/UpgradeModal';

/**
 * SettingsPage (Halaman Pengaturan)
 * 
 * First-class, industry-standard full page for personal and workspace settings.
 * Designed according to alurku. Brand Book:
 * - Full page layout (non-modal) with dedicated permalinks (/pengaturan, /settings)
 * - Deep-link sub-routes (/pengaturan/profil, /pengaturan/tampilan, etc.)
 * - Solid card surface protection (WCAG AA ≥ 4.5:1 guaranteed contrast)
 * - Flat Design, Calm Gray (#F3F4F6) light, Dark Navy Void (#090D16) dark
 * - 100% modern inline SVG iconography (zero raw emojis)
 * - Comprehensive bilingual support (ID/EN)
 */
export default function SettingsPage({
  closeSettings,
  profileData,
  setProfileData,
  handleUpdateProfile,
  handleAvatarUpload,
  appTheme,
  handleSelectAppTheme,
  appBgImage,
  setAppBgImage,
  handleSelectAppBg,
  handleAppBgUpload,
  removeAppBgImage,
  appTexture,
  handleSelectAppTexture,
  chatBg,
  handleChatBgUpload,
  removeChatBg,
  handleSelectDefaultBg,
  cardTheme,
  handleSelectCardTheme,
  isDarkMode,
  setIsDarkMode,
  language = 'id',
  setLanguage,
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
  notifPosition,
  setNotifPosition,
  notifSound,
  setNotifSound,
  notifPrivacy,
  setNotifPrivacy,
  browserNotifEnabled,
  setBrowserNotifEnabled,
  showNotification,
  tMsg,
}) {
  const { activeWorkspace, switchWorkspace, workspaces, fetchWorkspaces } = useAppContext();

  // Helper for bilingual messages if not passed
  const msg = (en, id) => {
    if (typeof tMsg === 'function') return tMsg(en, id);
    return language === 'id' ? id : en;
  };

  // Determine active tab based on current pathname
  const getTabFromPath = () => {
    if (typeof window === 'undefined') return 'profile';
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/tampilan') || path.includes('/appearance')) return 'appearance';
    if (path.includes('/preferensi') || path.includes('/preferences')) return 'preferences';
    if (path.includes('/notifikasi') || path.includes('/notifications')) return 'notifications';
    if (path.includes('/keamanan') || path.includes('/security')) return 'security';
    if (path.includes('/ruang-kerja') || path.includes('/workspace')) return 'workspace';
    if (path.includes('/paket') || path.includes('/billing') || path.includes('/plan')) return 'billing';
    return 'profile';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath);

  // Sync tab with browser popstate and URL
  useEffect(() => {
    const handleUrlSync = () => {
      setActiveTab(getTabFromPath());
    };
    window.addEventListener('popstate', handleUrlSync);
    window.addEventListener('alurku-navigate', handleUrlSync);
    return () => {
      window.removeEventListener('popstate', handleUrlSync);
      window.removeEventListener('alurku-navigate', handleUrlSync);
    };
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const slugMap = {
      profile: '/pengaturan/profil',
      appearance: '/pengaturan/tampilan',
      preferences: '/pengaturan/preferensi',
      notifications: '/pengaturan/notifikasi',
      security: '/pengaturan/keamanan',
      workspace: '/pengaturan/ruang-kerja',
      billing: '/pengaturan/paket',
    };
    const targetUrl = slugMap[tabId] || '/pengaturan';
    window.history.pushState({}, '', targetUrl);
  };

  const handleBackToDashboard = () => {
    if (typeof closeSettings === 'function') {
      closeSettings();
    }
    window.history.pushState({}, '', '/dashboard');
    window.dispatchEvent(new CustomEvent('alurku-navigate'));
  };

  // State for password management
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  // Danger Zone: Delete Account states
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Workspace Usage & Plan State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [usageData, setUsageData] = useState(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);

  const fetchUsageData = async () => {
    if (!activeWorkspace?.id) return;
    setIsLoadingUsage(true);
    try {
      const resp = await axios.get(`/api/workspaces/${activeWorkspace.id}/usage`);
      setUsageData(resp.data);
    } catch (err) {
      console.error('Failed to load workspace usage data:', err);
    } finally {
      setIsLoadingUsage(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'billing') {
      fetchUsageData();
    }
  }, [activeTab, activeWorkspace?.id]);

  // Audio preview helper using Web Audio API
  const playSoundPreview = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  };

  // Browser desktop notification requester
  const handleToggleBrowserNotif = (val) => {
    if (val) {
      if (!('Notification' in window)) {
        showNotification(
          msg('This browser does not support desktop notifications.', 'Browser ini tidak mendukung notifikasi desktop.'),
          'error'
        );
        setBrowserNotifEnabled(false);
        return;
      }
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          setBrowserNotifEnabled(true);
          localStorage.setItem('alurku_browser_notif', 'true');
          new Notification('alurku.', {
            body: msg('Desktop notifications are now active!', 'Notifikasi desktop sekarang telah aktif!'),
          });
          showNotification(
            msg('Desktop notifications enabled!', 'Notifikasi desktop diaktifkan!'),
            'success'
          );
        } else {
          setBrowserNotifEnabled(false);
          localStorage.setItem('alurku_browser_notif', 'false');
          showNotification(
            msg('Notification permission denied by browser.', 'Izin notifikasi ditolak oleh peramban.'),
            'error'
          );
        }
      });
    } else {
      setBrowserNotifEnabled(false);
      localStorage.setItem('alurku_browser_notif', 'false');
    }
  };

  const handleTestDesktopNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('alurku.', {
        body: msg('Test Notification: All systems running smoothly!', 'Notifikasi Uji Coba: Semua sistem berjalan lancar!'),
      });
      showNotification(msg('Test notification sent!', 'Notifikasi uji coba dikirim!'), 'success');
    } else {
      showNotification(
        msg('Please enable desktop permissions first.', 'Harap aktifkan izin notifikasi desktop terlebih dahulu.'),
        'error'
      );
    }
  };

  // Profile Submit Handler
  const onProfileSubmit = async (e) => {
    e.preventDefault();
    if (profileData.new_password) {
      if (!profileData.current_password) {
        showNotification(
          msg('Please enter your current password to set a new password.', 'Harap masukkan kata sandi saat ini untuk mengganti kata sandi.'),
          'error'
        );
        return;
      }
      if (profileData.new_password !== confirmPassword) {
        showNotification(
          msg('New password and confirmation password do not match.', 'Kata sandi baru dan konfirmasi kata sandi tidak cocok.'),
          'error'
        );
        return;
      }
      if (
        profileData.new_password.length < 8 ||
        !/[A-Z]/.test(profileData.new_password) ||
        !/[0-9]/.test(profileData.new_password)
      ) {
        showNotification(
          msg('Password must be at least 8 characters with 1 uppercase letter and 1 number.', 'Kata sandi minimal 8 karakter dengan 1 huruf besar dan 1 angka.'),
          'error'
        );
        return;
      }
    }

    setIsSubmittingProfile(true);
    try {
      await handleUpdateProfile(e);
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  // Delete Account Handler
  const handleConfirmDeleteAccount = async () => {
    if (!deleteAccountPassword) return;
    setIsDeletingAccount(true);
    try {
      await axios.delete('/api/profile/delete-account', {
        data: { password: deleteAccountPassword },
      });
      showNotification(
        msg('Your account has been deleted. Redirecting...', 'Akun Anda telah dihapus. Mengalihkan...'),
        'success'
      );
      setTimeout(() => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/masuk';
      }, 1200);
    } catch (err) {
      console.error(err);
      showNotification(
        err.response?.data?.detail ||
          msg('Failed to delete account. Incorrect password.', 'Gagal menghapus akun. Kata sandi salah.'),
        'error'
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Curated UI Themes (Guaranteed high contrast)
  const curatedThemes = [
    {
      id: 'default',
      name: 'alurku. Classic',
      desc: msg('Deep Navy and Flat Yellow brand palette', 'Palet brand Deep Navy dan Flat Yellow'),
      primaryColor: '#111E38',
      accentColor: '#FACC15',
    },
    {
      id: 'minimal',
      name: 'Minimalist Light',
      desc: msg('Clean slate monochrome with calm contrast', 'Slate monokrom bersih dengan kontras tenang'),
      primaryColor: '#202124',
      accentColor: '#1A73E8',
    },
    {
      id: 'cupertino',
      name: 'Cupertino Clean',
      desc: msg('Apple-inspired slate with subtle borders', 'Gaya slate Apple dengan border presisi'),
      primaryColor: '#1C1C1E',
      accentColor: '#007AFF',
    },
    {
      id: 'gamer',
      name: 'Gamer Dark',
      desc: msg('Cyber navy with neon blue highlights', 'Navy cyber dengan aksen biru neon tajam'),
      primaryColor: '#171A21',
      accentColor: '#66C0F4',
    },
    {
      id: 'sunset',
      name: 'Sunset Glass',
      desc: msg('Warm rose gradients with glassmorphic cards', 'Gradien mawar hangat dengan kartu kaca terproteksi'),
      primaryColor: '#4A154B',
      accentColor: '#E6683C',
    },
    {
      id: 'editor',
      name: 'Code Editor',
      desc: msg('Developer IDE palette with cyan accents', 'Palet IDE developer dengan aksen cyan'),
      primaryColor: '#1E1E1E',
      accentColor: '#4EC9B0',
    },
    {
      id: 'hacker',
      name: 'Hacker Terminal',
      desc: msg('Matrix terminal dark with phosphor green', 'Terminal Matrix gelap dengan aksen hijau fosfor'),
      primaryColor: '#0C100C',
      accentColor: '#00FF66',
    },
    {
      id: 'social',
      name: 'Social Blue',
      desc: msg('Corporate blue palette with clear readability', 'Palet biru korporat dengan keterbacaan tinggi'),
      primaryColor: '#1877F2',
      accentColor: '#42B72A',
    },
  ];

  // Calibrated Wallpaper Presets (Tested for WCAG AA Contrast)
  const lightWallpapers = [
    { name: 'Calm Gray (Default)', value: '' },
    { name: 'Soft Ice', value: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' },
    { name: 'Pale Indigo', value: 'linear-gradient(135deg, #f1f5f9 0%, #e0e7ff 100%)' },
    { name: 'Warm Pearl', value: 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)' },
    { name: 'Lavender Mist', value: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)' },
  ];

  const darkWallpapers = [
    { name: 'Dark Void (Default)', value: '' },
    { name: 'Midnight Navy', value: 'linear-gradient(135deg, #090D16 0%, #111E38 100%)' },
    { name: 'Deep Slate', value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
    { name: 'Cosmic Indigo', value: 'linear-gradient(135deg, #0b0f19 0%, #1e1b4b 100%)' },
    { name: 'Obsidian Grid', value: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)' },
  ];

  const activeWallpapers = isDarkMode ? darkWallpapers : lightWallpapers;

  // Tab Item definitions
  const personalTabs = [
    {
      id: 'profile',
      label: msg('Account Profile', 'Profil Akun'),
      subtitle: msg('Name, email, and credentials', 'Nama, email, dan kredensial'),
      icon: (
        <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'appearance',
      label: msg('Appearance & Themes', 'Tampilan & Tema'),
      subtitle: msg('Theme, mode, and contrast', 'Tema, mode, dan kontras'),
      icon: (
        <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4 4.5 4.5 0 014.5-4.5H10v-3a3 3 0 116 0v3h2.5A4.5 4.5 0 0123 17a4 4 0 01-4 4H7zM12 3v9" />
        </svg>
      ),
    },
    {
      id: 'preferences',
      label: msg('Work Preferences', 'Preferensi Kerja'),
      subtitle: msg('Date, clock, and focus tools', 'Format tanggal, jam, dan fokus'),
      icon: (
        <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
    },
    {
      id: 'notifications',
      label: msg('Notifications & Audio', 'Notifikasi & Suara'),
      subtitle: msg('Sounds, alerts, and privacy', 'Suara, peringatan, dan privasi'),
      icon: (
        <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      id: 'security',
      label: msg('Security & Danger Zone', 'Keamanan & Zona Bahaya'),
      subtitle: msg('Password and account deletion', 'Kata sandi dan penghapusan akun'),
      icon: (
        <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  ];

  const workspaceTabs = [
    {
      id: 'workspace',
      label: msg('Workspace Details', 'Detail Ruang Kerja'),
      subtitle: msg('Active space & team members', 'Ruang kerja aktif & anggota tim'),
      icon: (
        <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: 'billing',
      label: msg('Plan & Usage Quotas', 'Paket & Penggunaan'),
      subtitle: msg('Tiers, storage, and AI prompts', 'Tingkat paket, ruang & kuota AI'),
      icon: (
        <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
  ];

  // Active tab title for breadcrumbs
  const allTabs = [...personalTabs, ...workspaceTabs];
  const currentTabObj = allTabs.find((t) => t.id === activeTab) || personalTabs[0];

  return (
    <div className="w-full flex-1 flex flex-col min-h-screen bg-transparent overflow-y-auto">
      {/* Top Header & Breadcrumbs */}
      <div className="border-b border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-[#121B2D]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
            <button
              onClick={handleBackToDashboard}
              className="hover:text-[#111E38] dark:hover:text-[#FACC15] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>{msg('Dashboard', 'Dasbor')}</span>
            </button>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
            <span className="text-slate-700 dark:text-slate-200 font-bold">{msg('Settings', 'Pengaturan')}</span>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
            <span className="text-[#111E38] dark:text-[#FACC15] font-black">{currentTabObj.label}</span>
          </nav>

          {/* Action: Back to Dashboard */}
          <button
            onClick={handleBackToDashboard}
            className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">{msg('Back to Dashboard', 'Kembali ke Dasbor')}</span>
            <span className="sm:hidden">{msg('Back', 'Kembali')}</span>
          </button>
        </div>
      </div>

      {/* Main Settings Content Container */}
      <div className="max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 md:py-10 flex-1">
        {/* Page Title & Subtitle */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] flex items-center justify-center shadow-xs">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="3" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#111E38] dark:text-slate-100 tracking-tight">
                {msg('Settings', 'Pengaturan')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                {msg(
                  'Manage your account profile, visual themes, sound alerts, and workspace quotas.',
                  'Kelola profil akun, tampilan visual, notifikasi, dan kuota ruang kerja Anda.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Sub-Navigation (< lg) */}
        <div className="lg:hidden w-full mb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 custom-scrollbar">
            {allTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={`mobile-tab-${tab.id}`}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                      : 'bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800 text-slate-700 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span className={isActive ? 'text-[#FACC15] dark:text-[#111E38]' : 'text-slate-400 dark:text-slate-500'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Two-Column Layout: Sidebar Tabs + Card Content */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Sub-Navigation Sidebar (Desktop) */}
          <div className="hidden lg:block w-72 shrink-0 space-y-6">
            {/* Category 1: Personal Settings */}
            <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-3 shadow-xs">
              <div className="px-3 py-1.5 text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                {msg('Personal Account', 'Akun Pribadi')}
              </div>
              <div className="space-y-1 mt-1">
                {personalTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold shadow-xs'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-slate-300 font-medium'
                      }`}
                    >
                      <span className={isActive ? 'text-[#FACC15] dark:text-[#111E38]' : 'text-slate-400 dark:text-slate-500'}>
                        {tab.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm truncate">{tab.label}</div>
                        <div className={`text-[10px] truncate ${isActive ? 'text-slate-300 dark:text-slate-800' : 'text-slate-400 dark:text-slate-500'}`}>
                          {tab.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category 2: Workspace Settings */}
            <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-3 shadow-xs">
              <div className="px-3 py-1.5 text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                {msg('Workspace', 'Ruang Kerja')}
              </div>
              <div className="space-y-1 mt-1">
                {workspaceTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold shadow-xs'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-slate-300 font-medium'
                      }`}
                    >
                      <span className={isActive ? 'text-[#FACC15] dark:text-[#111E38]' : 'text-slate-400 dark:text-slate-500'}>
                        {tab.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm truncate">{tab.label}</div>
                        <div className={`text-[10px] truncate ${isActive ? 'text-slate-300 dark:text-slate-800' : 'text-slate-400 dark:text-slate-500'}`}>
                          {tab.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Contrast Assurance Badge */}
            <div className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/80 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
              <div className="font-bold text-[#111E38] dark:text-[#FACC15] flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{msg('WCAG AA Contrast Safeguard', 'Proteksi Kontras WCAG AA')}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {msg(
                  'Cards and surfaces maintain minimum 4.5:1 ratio for optimal eye comfort and zero text bleeding.',
                  'Permukaan kartu selalu menjaga rasio kontras 4.5:1 untuk kenyamanan mata tanpa teks terpotong.'
                )}
              </p>
            </div>
          </div>

          {/* Right Main Content Card (Surface Protected) */}
          <div className="flex-1 w-full min-w-0 bg-white dark:bg-[#121B2D] border border-neutral-200/90 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs settings-card-surface">
            {/* ─────────────────────────────────────────────────────────────
                TAB 1: ACCOUNT PROFILE
            ────────────────────────────────────────────────────────────── */}
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#111E38] dark:text-slate-100 tracking-tight">
                    {msg('Account Profile', 'Profil Akun')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {msg(
                      'Update your profile avatar, personal details, and contact email.',
                      'Perbarui foto profil, detail data pribadi, dan email kontak Anda.'
                    )}
                  </p>
                </div>

                <form onSubmit={onProfileSubmit} className="space-y-6">
                  {/* Avatar Upload Block */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#F3F4F6]/70 dark:bg-[#090D16]/50 border border-neutral-200/70 dark:border-neutral-800 flex flex-col sm:flex-row items-center gap-5">
                    <div className="relative group shrink-0">
                      <div className="w-20 h-20 rounded-full border-2 border-[#111E38] dark:border-[#FACC15] overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shadow-inner">
                        {profileData?.avatar ? (
                          <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-black text-slate-600 dark:text-slate-300 uppercase">
                            {profileData?.username ? profileData.username.substring(0, 2) : 'AL'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        {msg('Profile Photo', 'Foto Profil')}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {msg('Supported formats: JPG, PNG, WebP (Max 2MB).', 'Format yang didukung: JPG, PNG, WebP (Maks 2MB).')}
                      </p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <label className="px-3.5 py-1.5 rounded-xl bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>{msg('Upload Photo', 'Unggah Foto')}</span>
                          <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                        </label>
                        {profileData?.avatar && (
                          <button
                            type="button"
                            onClick={() => setProfileData((prev) => ({ ...prev, avatar: '' }))}
                            className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 text-xs font-bold transition-all cursor-pointer"
                          >
                            {msg('Remove', 'Hapus')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {msg('Full Name', 'Nama Lengkap')}
                      </label>
                      <input
                        type="text"
                        value={profileData?.full_name || ''}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, full_name: e.target.value }))}
                        className="w-full bg-[#F3F4F6]/50 dark:bg-[#090D16] border border-neutral-300 dark:border-neutral-700 focus:border-[#111E38] dark:focus:border-[#FACC15] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none transition-all shadow-inner"
                        placeholder="e.g. Alex Johnson"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {msg('Username', 'Nama Pengguna')}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={profileData?.username || ''}
                          readOnly
                          className="w-full bg-neutral-200/50 dark:bg-neutral-800/50 border border-neutral-300/80 dark:border-neutral-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-300 dark:bg-neutral-700 text-slate-600 dark:text-slate-300 uppercase">
                          {msg('Locked', 'Terkunci')}
                        </span>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {msg('Email Address', 'Alamat Email')}
                      </label>
                      <input
                        type="email"
                        value={profileData?.email || ''}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-[#F3F4F6]/50 dark:bg-[#090D16] border border-neutral-300 dark:border-neutral-700 focus:border-[#111E38] dark:focus:border-[#FACC15] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none transition-all shadow-inner"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingProfile}
                      className="px-6 py-2.5 rounded-xl bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-black text-xs sm:text-sm hover:opacity-95 transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingProfile ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span>{msg('Saving...', 'Menyimpan...')}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{msg('Save Profile', 'Simpan Profil')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 2: APPEARANCE & THEMES
            ────────────────────────────────────────────────────────────── */}
            {activeTab === 'appearance' && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#111E38] dark:text-slate-100 tracking-tight">
                    {msg('Appearance & Visual Themes', 'Tampilan & Tema Visual')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {msg(
                      'Choose your interface mode, calibrated theme palettes, and anti-glare wallpapers.',
                      'Pilih mode tampilan, tema palet terkalibrasi, dan wallpaper anti-silau.'
                    )}
                  </p>
                </div>

                {/* 1. Dark Mode / Light Mode Toggle */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                    {msg('Color Mode', 'Mode Tampilan')}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setIsDarkMode(false)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        !isDarkMode
                          ? 'border-[#111E38] bg-[#F3F4F6] text-[#111E38] ring-2 ring-[#111E38]/20 font-bold'
                          : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-slate-600 dark:text-slate-400 font-medium'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#111E38] dark:text-white">
                          {msg('Light Theme (Default)', 'Tema Terang (Standar)')}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {msg('Calm Gray background, crisp navy text', 'Latar Calm Gray, teks navy kontras tinggi')}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsDarkMode(true)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        isDarkMode
                          ? 'border-[#FACC15] bg-[#121B2D] text-[#FACC15] ring-2 ring-[#FACC15]/20 font-bold'
                          : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-slate-600 dark:text-slate-400 font-medium'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-950 text-[#FACC15] flex items-center justify-center shrink-0 border border-[#FACC15]/30">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {msg('Dark Theme', 'Tema Gelap')}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {msg('Dark Navy Void background, yellow accents', 'Latar Dark Navy, aksen kuning kontras')}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Curated UI Themes (Calibrated Palettes) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      {msg('Calibrated Theme Palettes', 'Palet Tema Terkalibrasi')}
                    </label>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {msg('WCAG AA Verified', 'Lolos Uji WCAG AA')}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {curatedThemes.map((theme) => {
                      const isSelected = (!appTheme && theme.id === 'default') || appTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => handleSelectAppTheme(theme.id === 'default' ? '' : theme.id)}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                            isSelected
                              ? 'border-[#111E38] dark:border-[#FACC15] bg-[#F3F4F6]/80 dark:bg-[#090D16] ring-2 ring-[#111E38]/20 dark:ring-[#FACC15]/20'
                              : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-[#121B2D]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-3.5 h-3.5 rounded-full shadow-2xs border border-white/20" style={{ backgroundColor: theme.primaryColor }}></span>
                              <span className="w-3.5 h-3.5 rounded-full shadow-2xs border border-white/20" style={{ backgroundColor: theme.accentColor }}></span>
                            </div>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] flex items-center justify-center text-[10px]">
                                ✓
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{theme.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{theme.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Anti-Glare Wallpapers & Gradients */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      {msg('Anti-Glare Backgrounds', 'Latar Belakang Anti-Silau')}
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {isDarkMode ? msg('Dark mode presets', 'Preset mode gelap') : msg('Light mode presets', 'Preset mode terang')}
                    </span>
                  </div>

                  {/* Live Preview Box */}
                  <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-[#F3F4F6]/50 dark:bg-[#090D16]/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {msg('Live Background & Card Preview', 'Pratinjau Langsung Latar & Kartu')}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-black">
                        {msg('Active', 'Aktif')}: {activeWallpapers.find(w => w.value === (appBgImage || ''))?.name || msg('Custom Image', 'Gambar Kustom')}
                      </span>
                    </div>
                    <div
                      className="h-24 rounded-xl border border-neutral-300/80 dark:border-neutral-700/80 p-3 flex items-center justify-center gap-3 overflow-hidden shadow-inner relative transition-all duration-300"
                      style={
                        appBgImage
                          ? appBgImage.includes('gradient')
                            ? { background: appBgImage }
                            : { backgroundImage: `url(${appBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                          : { backgroundColor: isDarkMode ? '#090D16' : '#F3F4F6' }
                      }
                    >
                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-700 shadow-md text-left w-40 space-y-1">
                        <div className="text-[10px] font-black text-slate-900 dark:text-white truncate">Task Card Preview</div>
                        <div className="text-[9px] text-slate-500 dark:text-slate-400">Surface Protected</div>
                        <div className="h-1.5 w-16 bg-[#111E38] dark:bg-[#FACC15] rounded-full"></div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-700 shadow-md text-left w-40 space-y-1 hidden sm:block">
                        <div className="text-[10px] font-black text-slate-900 dark:text-white truncate">Kanban Column</div>
                        <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">✓ WCAG AA (≥ 7:1)</div>
                        <div className="h-1.5 w-12 bg-emerald-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Preset Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {activeWallpapers.map((wp, idx) => {
                      const isSelected = (!appBgImage && !wp.value) || appBgImage === wp.value;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (!wp.value) {
                              if (typeof removeAppBgImage === 'function') {
                                removeAppBgImage();
                              } else if (typeof setAppBgImage === 'function') {
                                setAppBgImage('');
                              }
                            } else {
                              if (typeof handleSelectAppBg === 'function') {
                                handleSelectAppBg(wp.value);
                              } else if (typeof setAppBgImage === 'function') {
                                setAppBgImage(wp.value);
                              }
                            }
                          }}
                          className={`h-16 rounded-xl border p-2 flex flex-col justify-end text-left transition-all cursor-pointer relative overflow-hidden ${
                            isSelected
                              ? 'border-[#111E38] dark:border-[#FACC15] ring-2 ring-[#111E38]/20 dark:ring-[#FACC15]/20 font-bold'
                              : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
                          }`}
                          style={wp.value ? { background: wp.value } : { backgroundColor: isDarkMode ? '#090D16' : '#F3F4F6' }}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md truncate ${
                              isDarkMode ? 'bg-black/60 text-white' : 'bg-white/80 text-slate-900'
                            }`}>
                              {wp.name}
                            </span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] flex items-center justify-center text-[10px] font-black shrink-0 ml-1">
                                ✓
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Wallpaper Upload */}
                  <div className="pt-2 flex items-center gap-3">
                    <label className="px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-slate-700 dark:text-slate-300 hover:bg-neutral-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{msg('Upload Custom Wallpaper', 'Unggah Wallpaper Kustom')}</span>
                      <input type="file" accept="image/*" onChange={handleAppBgUpload} className="hidden" />
                    </label>
                    {appBgImage && (
                      <button
                        type="button"
                        onClick={removeAppBgImage}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                      >
                        {msg('Reset to Default', 'Kembalikan ke Standar')}
                      </button>
                    )}
                  </div>
                </div>

                {/* 4. Texture Overlays */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                    {msg('Subtle Texture Pattern', 'Tekstur Latar Belakang')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {[
                      { id: '', label: msg('None', 'Tanpa Tekstur') },
                      { id: 'dots', label: msg('Subtle Dots', 'Titik Halus') },
                      { id: 'grid', label: msg('Blueprint Grid', 'Kisi Presisi') },
                      { id: 'noise', label: msg('Film Grain', 'Grain Lembut') },
                      { id: 'lines', label: msg('Diagonal Strip', 'Garis Diagonal') },
                    ].map((tx) => {
                      const isSelected = (!appTexture && tx.id === '') || appTexture === tx.id;
                      return (
                        <button
                          key={tx.id}
                          type="button"
                          onClick={() => handleSelectAppTexture(tx.id)}
                          className={`px-3 py-2 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#111E38] dark:border-[#FACC15] bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold shadow-xs'
                              : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121B2D] text-slate-700 dark:text-slate-300 hover:bg-neutral-100'
                          }`}
                        >
                          {tx.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 3: WORK PREFERENCES
            ────────────────────────────────────────────────────────────── */}
            {activeTab === 'preferences' && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#111E38] dark:text-slate-100 tracking-tight">
                    {msg('Work Preferences & Clock', 'Preferensi Kerja & Jam')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {msg(
                      'Customize your regional date formats, header live clock, and focus tools.',
                      'Sesuaikan format tanggal regional, jam digital header, dan alat bantu fokus.'
                    )}
                  </p>
                </div>

                <div className="space-y-6 divide-y divide-neutral-200 dark:divide-neutral-800">
                  {/* Date Format Setting */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        {msg('Date Format', 'Format Tanggal')}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {msg('Choose how due dates and calendars are formatted.', 'Format penulisan tenggat waktu dan kalender.')}
                      </p>
                    </div>
                    <select
                      value={dateFormat || 'DD/MM/YYYY'}
                      onChange={(e) => {
                        setDateFormat(e.target.value);
                        if (typeof window !== 'undefined') localStorage.setItem('alurku_date_format', e.target.value);
                        showNotification(msg('Date format updated!', 'Format tanggal diperbarui!'), 'success');
                      }}
                      className="bg-[#F3F4F6] dark:bg-[#090D16] border border-neutral-300 dark:border-neutral-700 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2 text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 31/12/2026)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 12/31/2026)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-12-31)</option>
                      <option value="D MMMM YYYY">D MMMM YYYY (e.g. 31 Desember 2026)</option>
                    </select>
                  </div>

                  {/* Header Live Clock Toggle */}
                  <div className="pt-6 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        {msg('Live Header Clock', 'Jam Digital di Header')}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {msg('Displays a real-time digital clock in the navigation bar.', 'Menampilkan jam digital real-time di bar navigasi atas.')}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={!!showLiveClock}
                        onChange={(e) => {
                          setShowLiveClock(e.target.checked);
                          if (typeof window !== 'undefined') localStorage.setItem('alurku_show_clock', e.target.checked ? 'true' : 'false');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111E38] dark:peer-checked:bg-[#FACC15]"></div>
                    </label>
                  </div>

                  {/* Live Clock Date Toggle */}
                  <div className="pt-6 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        {msg('Show Date in Header Clock', 'Tampilkan Tanggal di Jam Header')}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {msg('Include weekday and current date alongside the time.', 'Menyertakan nama hari dan tanggal di samping jam.')}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={!!showLiveClockDate}
                        onChange={(e) => {
                          setShowLiveClockDate(e.target.checked);
                          if (typeof window !== 'undefined') localStorage.setItem('alurku_show_clock_date', e.target.checked ? 'true' : 'false');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111E38] dark:peer-checked:bg-[#FACC15]"></div>
                    </label>
                  </div>

                  {/* Pomodoro Timer Toggle */}
                  <div className="pt-6 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        {msg('Pomodoro Focus Timer', 'Timer Fokus Pomodoro')}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {msg('Activate the 25-minute productivity timer in the toolbar.', 'Aktifkan penghitung waktu fokus 25 menit di bilah alat.')}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={!!pomodoroEnabled}
                        onChange={(e) => {
                          setPomodoroEnabled(e.target.checked);
                          if (typeof window !== 'undefined') localStorage.setItem('alurku_pomodoro', e.target.checked ? 'true' : 'false');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111E38] dark:peer-checked:bg-[#FACC15]"></div>
                    </label>
                  </div>

                  {/* Floating AI Button Toggle */}
                  <div className="pt-6 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        {msg('Floating Smart Assistant Launcher', 'Tombol Asisten AI Melayang')}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {msg('Show the quick assistant launcher at the bottom-right of the screen.', 'Tampilkan tombol pintas asisten di sudut kanan bawah layar.')}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={!!showAssistantButton}
                        onChange={(e) => {
                          setShowAssistantButton(e.target.checked);
                          if (typeof window !== 'undefined') localStorage.setItem('alurku_show_assistant_btn', e.target.checked ? 'true' : 'false');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111E38] dark:peer-checked:bg-[#FACC15]"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 4: NOTIFICATIONS & AUDIO
            ────────────────────────────────────────────────────────────── */}
            {activeTab === 'notifications' && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#111E38] dark:text-slate-100 tracking-tight">
                    {msg('Notifications & Sound Alerts', 'Notifikasi & Peringatan Suara')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {msg(
                      'Configure audio chimes, toast positions, and desktop browser notifications.',
                      'Atur suara bel, posisi notifikasi muncul, dan izin notifikasi desktop.'
                    )}
                  </p>
                </div>

                <div className="space-y-6 divide-y divide-neutral-200 dark:divide-neutral-800">
                  {/* Notification Audio Chime */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        {msg('Notification Chime', 'Suara Notifikasi')}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {msg('Play a subtle tone when new tasks or messages arrive.', 'Putar suara lembut saat ada tugas atau pesan baru masuk.')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={!!notifSound}
                          onChange={(e) => {
                            setNotifSound(e.target.checked);
                            if (typeof window !== 'undefined') localStorage.setItem('alurku_notif_sound', e.target.checked ? 'true' : 'false');
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111E38] dark:peer-checked:bg-[#FACC15]"></div>
                      </label>
                      <button
                        type="button"
                        onClick={playSoundPreview}
                        className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-neutral-200 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{msg('Test Sound', 'Tes Suara')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Toast Position Selector */}
                  <div className="pt-6 space-y-3">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        {msg('Toast Notification Position', 'Posisi Notifikasi Pop-up')}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {msg('Choose which quadrant notifications will appear in.', 'Pilih di sudut mana jendela notifikasi akan muncul.')}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      {[
                        { id: 'top-left', label: msg('Top Left', 'Kiri Atas') },
                        { id: 'top-right', label: msg('Top Right', 'Kanan Atas') },
                        { id: 'bottom-left', label: msg('Bottom Left', 'Kiri Bawah') },
                        { id: 'bottom-right', label: msg('Bottom Right', 'Kanan Bawah') },
                      ].map((pos) => {
                        const isSelected = notifPosition === pos.id;
                        return (
                          <button
                            key={pos.id}
                            type="button"
                            onClick={() => {
                              setNotifPosition(pos.id);
                              if (typeof window !== 'undefined') {
                                localStorage.setItem('alurku_notif_pos', pos.id);
                                localStorage.setItem('alurku_notif_position', pos.id);
                              }
                              showNotification(msg(`Position set to ${pos.label}`, `Posisi disetel ke ${pos.label}`), 'success');
                            }}
                            className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#111E38] dark:border-[#FACC15] bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                                : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {pos.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Privacy Mask Mode */}
                  <div className="pt-6 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        {msg('Privacy Mask Mode', 'Mode Privasi Notifikasi')}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {msg(
                          'Censor message details from toast alerts to protect confidentiality during screen sharing.',
                          'Sensor rincian pesan pada notifikasi untuk menjaga kerahasiaan saat berbagi layar.'
                        )}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={!!notifPrivacy}
                        onChange={(e) => {
                          setNotifPrivacy(e.target.checked);
                          if (typeof window !== 'undefined') localStorage.setItem('alurku_notif_privacy', e.target.checked ? 'true' : 'false');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111E38] dark:peer-checked:bg-[#FACC15]"></div>
                    </label>
                  </div>

                  {/* Desktop Browser Notifications */}
                  <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        {msg('Desktop Browser Push Notifications', 'Notifikasi Desktop Peramban')}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {msg(
                          'Receive system notifications even when alurku. is running in the background.',
                          'Terima notifikasi sistem meskipun tab alurku. sedang berada di latar belakang.'
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={!!browserNotifEnabled}
                          onChange={(e) => handleToggleBrowserNotif(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111E38] dark:peer-checked:bg-[#FACC15]"></div>
                      </label>
                      {browserNotifEnabled && (
                        <button
                          type="button"
                          onClick={handleTestDesktopNotification}
                          className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-neutral-200 transition-all cursor-pointer"
                        >
                          {msg('Send Test Push', 'Kirim Tes Push')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 5: SECURITY & DANGER ZONE
            ────────────────────────────────────────────────────────────── */}
            {activeTab === 'security' && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#111E38] dark:text-slate-100 tracking-tight">
                    {msg('Security & Credentials', 'Keamanan & Kredensial')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {msg(
                      'Update your access password and manage account termination safeguards.',
                      'Perbarui kata sandi akses dan kelola proteksi keamanan akun Anda.'
                    )}
                  </p>
                </div>

                {/* Change Password Card */}
                <form onSubmit={onProfileSubmit} className="space-y-5 p-5 rounded-2xl bg-[#F3F4F6]/50 dark:bg-[#090D16]/40 border border-neutral-200/80 dark:border-neutral-800">
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#111E38] dark:text-[#FACC15]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span>{msg('Update Password', 'Perbarui Kata Sandi')}</span>
                  </div>

                  <div className="space-y-4 max-w-lg">
                    {/* Current Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {msg('Current Password', 'Kata Sandi Saat Ini')}
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          value={profileData?.current_password || ''}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, current_password: e.target.value }))}
                          className="w-full bg-white dark:bg-[#121B2D] border border-neutral-300 dark:border-neutral-700 focus:border-[#111E38] dark:focus:border-[#FACC15] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 outline-none pr-10"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showCurrentPass ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {msg('New Password', 'Kata Sandi Baru')}
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          value={profileData?.new_password || ''}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, new_password: e.target.value }))}
                          className="w-full bg-white dark:bg-[#121B2D] border border-neutral-300 dark:border-neutral-700 focus:border-[#111E38] dark:focus:border-[#FACC15] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 outline-none pr-10"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showNewPass ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          )}
                        </button>
                      </div>
                      {/* Password Requirements Checklist */}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className={`flex items-center gap-1 ${profileData?.new_password?.length >= 8 ? 'text-emerald-500 font-bold' : ''}`}>
                          <span>•</span> {msg('Min 8 characters', 'Min 8 karakter')}
                        </span>
                        <span className={`flex items-center gap-1 ${/[A-Z]/.test(profileData?.new_password || '') ? 'text-emerald-500 font-bold' : ''}`}>
                          <span>•</span> {msg('1 uppercase letter', '1 huruf besar')}
                        </span>
                        <span className={`flex items-center gap-1 ${/[0-9]/.test(profileData?.new_password || '') ? 'text-emerald-500 font-bold' : ''}`}>
                          <span>•</span> {msg('1 number', '1 angka')}
                        </span>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {msg('Confirm New Password', 'Konfirmasi Kata Sandi Baru')}
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-white dark:bg-[#121B2D] border border-neutral-300 dark:border-neutral-700 focus:border-[#111E38] dark:focus:border-[#FACC15] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 outline-none pr-10"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showConfirmPass ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!profileData?.new_password}
                      className="px-5 py-2 rounded-xl bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold text-xs hover:opacity-90 transition-all cursor-pointer disabled:opacity-40"
                    >
                      {msg('Change Password', 'Ubah Kata Sandi')}
                    </button>
                  </div>
                </form>

                {/* Danger Zone: Account Termination */}
                <div className="p-5 sm:p-6 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 space-y-3">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-black text-sm">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{msg('Danger Zone: Account Purge', 'Zona Bahaya: Penghapusan Akun')}</span>
                  </div>
                  <p className="text-xs text-red-700/80 dark:text-red-300/80 leading-relaxed">
                    {msg(
                      'Permanently delete your user account and revoke all workspace access. This action is irreversible and immediate.',
                      'Menghapus akun Anda secara permanen dan mencabut seluruh akses workspace. Tindakan ini tidak dapat dibatalkan.'
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsDeleteAccountModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>{msg('Delete My Account Permanently', 'Hapus Akun Saya Permanen')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 6: WORKSPACE DETAILS
            ────────────────────────────────────────────────────────────── */}
            {activeTab === 'workspace' && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#111E38] dark:text-slate-100 tracking-tight">
                    {msg('Workspace Details', 'Detail Ruang Kerja')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {msg(
                      'Manage team organization, active space context, and member access.',
                      'Kelola organisasi tim, ruang kerja aktif, dan akses anggota.'
                    )}
                  </p>
                </div>

                {/* Active Workspace Info Card */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#F3F4F6]/70 dark:bg-[#090D16]/50 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] font-black text-xl flex items-center justify-center shadow-xs">
                        {activeWorkspace?.name ? activeWorkspace.name.substring(0, 1).toUpperCase() : 'W'}
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                          {activeWorkspace?.name || 'Workspace'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          ID: #{activeWorkspace?.id || '—'}
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#FACC15] text-[#111E38] text-[10px] font-black uppercase tracking-wider">
                      {activeWorkspace?.tier ? activeWorkspace.tier.toUpperCase() : 'FREE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{msg('Your Role', 'Peran Anda')}</span>
                      <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {activeWorkspace?.role || 'Owner'}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{msg('Total Workspaces', 'Jumlah Ruang Kerja')}</span>
                      <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {workspaces?.length || 1} {msg('Spaces', 'Ruang')}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{msg('Status', 'Status')}</span>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{msg('Active & Synced', 'Aktif & Tersinkron')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Available Workspaces Switcher */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {msg('Switch Active Workspace', 'Ganti Ruang Kerja Aktif')}
                  </div>
                  <div className="space-y-2">
                    {(workspaces || []).map((ws) => {
                      const isCurrent = ws.id === activeWorkspace?.id;
                      return (
                        <div
                          key={ws.id}
                          className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                            isCurrent
                              ? 'border-[#111E38] dark:border-[#FACC15] bg-[#F3F4F6]/50 dark:bg-[#090D16]/50 ring-1 ring-[#111E38]/10'
                              : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                              {ws.name.substring(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">{ws.name}</div>
                              <div className="text-[10px] text-slate-400">Tier: {ws.tier?.toUpperCase() || 'FREE'}</div>
                            </div>
                          </div>
                          {isCurrent ? (
                            <span className="px-2.5 py-1 rounded bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] text-[10px] font-black">
                              {msg('Active', 'Aktif')}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                switchWorkspace(ws);
                                showNotification(msg(`Switched to ${ws.name}`, `Beralih ke ${ws.name}`), 'success');
                              }}
                              className="px-3 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                            >
                              {msg('Switch', 'Pilih')}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 7: PLAN & USAGE QUOTAS
            ────────────────────────────────────────────────────────────── */}
            {activeTab === 'billing' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#111E38] dark:text-slate-100 tracking-tight">
                      {msg('Plan & Usage Quotas', 'Paket & Kuota Penggunaan')}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {msg(
                        'Monitor workspace storage, team seats, and monthly AI prompt quotas.',
                        'Pantau kapasitas penyimpanan, kursi tim, dan kuota prompt AI bulanan.'
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#FACC15] text-[#111E38] font-black text-xs sm:text-sm hover:bg-[#EAB308] transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>{msg('Upgrade Plan', 'Upgrade Paket')}</span>
                  </button>
                </div>

                {/* Plan Overview Card */}
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#111E38] to-[#1E293B] text-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black tracking-widest text-[#FACC15] uppercase">
                        {msg('Current Subscription', 'Langganan Aktif')}
                      </span>
                      <div className="text-2xl font-black tracking-tight mt-0.5">
                        {activeWorkspace?.tier === 'pro'
                          ? 'Plan Pro'
                          : activeWorkspace?.tier === 'business'
                          ? 'Plan Business'
                          : 'Plan Free'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-[#FACC15]">
                        {activeWorkspace?.tier === 'pro'
                          ? 'Rp79.000'
                          : activeWorkspace?.tier === 'business'
                          ? 'Rp199.000'
                          : 'Rp0'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold">
                        {activeWorkspace?.tier === 'free' ? msg('Forever free', 'Gratis selamanya') : msg('/month billed annually', '/bulan ditagih tahunan')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usage Meters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Seats Meter */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#F3F4F6]/70 dark:bg-[#090D16]/50 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>{msg('Team Seats', 'Kursi Anggota')}</span>
                      <span>
                        {usageData?.members?.used ?? usageData?.seats_used ?? 1} /{' '}
                        {usageData?.members?.is_unlimited ? '∞' : (usageData?.members?.max ?? usageData?.seats_limit ?? (activeWorkspace?.tier === 'pro' ? 25 : 3))}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#111E38] dark:bg-[#FACC15] h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            usageData?.members?.is_unlimited
                              ? 5
                              : (((usageData?.members?.used ?? usageData?.seats_used ?? 1) / (usageData?.members?.max ?? usageData?.seats_limit ?? (activeWorkspace?.tier === 'pro' ? 25 : 3))) * 100)
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {activeWorkspace?.tier === 'business' ? msg('Unlimited team seats', 'Kursi tim tanpa batas') : msg('Standard allocation', 'Alokasi standar')}
                    </div>
                  </div>

                  {/* Storage Meter */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#F3F4F6]/70 dark:bg-[#090D16]/50 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>{msg('Storage Used', 'Penyimpanan')}</span>
                      <span>
                        {usageData?.storage?.used_mb ?? usageData?.storage_used_mb ?? 0} MB /{' '}
                        {activeWorkspace?.tier === 'pro' ? '15 GB' : activeWorkspace?.tier === 'business' ? '100 GB' : '500 MB'}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            usageData?.storage?.percentage ?? (((usageData?.storage?.used_mb ?? usageData?.storage_used_mb ?? 0) / (activeWorkspace?.tier === 'pro' ? 15360 : 500)) * 100)
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {msg('Encrypted document storage', 'Penyimpanan dokumen terenkripsi')}
                    </div>
                  </div>

                  {/* AI Prompts Meter */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#F3F4F6]/70 dark:bg-[#090D16]/50 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>{msg('AI Prompts / Mo', 'Prompt AI / Bulan')}</span>
                      <span>
                        {usageData?.ai_requests?.used ?? usageData?.ai_prompts_used ?? 0} /{' '}
                        {usageData?.ai_requests?.max ?? (activeWorkspace?.tier === 'pro' ? '1.500' : activeWorkspace?.tier === 'business' ? '5.000' : '50')}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            usageData?.ai_requests?.percentage ?? (((usageData?.ai_requests?.used ?? usageData?.ai_prompts_used ?? 0) / (activeWorkspace?.tier === 'pro' ? 1500 : activeWorkspace?.tier === 'business' ? 5000 : 50)) * 100)
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {msg('Resets on 1st of every month', 'Direset setiap tanggal 1')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {isDeleteAccountModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                {msg('Delete Account Permanently?', 'Hapus Akun Secara Permanen?')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {msg(
                  'This action will permanently delete all your projects, tasks, and data. Please enter your password to confirm.',
                  'Tindakan ini akan menghapus semua proyek, tugas, dan data Anda secara permanen. Masukkan kata sandi Anda untuk konfirmasi.'
                )}
              </p>
            </div>
            <input
              type="password"
              value={deleteAccountPassword}
              onChange={(e) => setDeleteAccountPassword(e.target.value)}
              placeholder={msg('Your current password', 'Kata sandi saat ini')}
              className="w-full bg-[#F3F4F6] dark:bg-[#090D16] border border-neutral-300 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold outline-none text-slate-900 dark:text-slate-100"
            />
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteAccountModalOpen(false);
                  setDeleteAccountPassword('');
                }}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-neutral-100 transition-all cursor-pointer"
              >
                {msg('Cancel', 'Batal')}
              </button>
              <button
                type="button"
                disabled={!deleteAccountPassword || isDeletingAccount}
                onClick={handleConfirmDeleteAccount}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeletingAccount ? msg('Deleting...', 'Menghapus...') : msg('Delete Now', 'Hapus Sekarang')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {isUpgradeModalOpen && (
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          activeWorkspace={activeWorkspace}
          language={language}
          showNotification={showNotification}
          onUpgradeSuccess={(data) => {
            if (fetchWorkspaces) {
              fetchWorkspaces().then((list) => {
                if (list && activeWorkspace) {
                  const refreshed = list.find((w) => w.id === activeWorkspace.id);
                  if (refreshed) switchWorkspace(refreshed);
                }
              });
            } else if (activeWorkspace) {
              switchWorkspace({ ...activeWorkspace, tier: data.tier });
            }
          }}
        />
      )}
    </div>
  );
}
