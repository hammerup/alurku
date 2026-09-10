import { useState } from 'react';
import axios from 'axios';
import { Avatar, SegmentedControl } from './SharedUI';

const SettingsSection = ({ title, description, children }) => (
  <div className="animate-in fade-in duration-300">
    <h3 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-8">{description}</p>
    <div className="space-y-2">{children}</div>
  </div>
);

const TabButton = ({ id, icon, label, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
      activeTab === id
        ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold shadow-xs'
        : 'text-neutral-600 dark:text-neutral-400 hover:bg-[#FACC15]/15 hover:text-[#111E38] dark:hover:text-[#FACC15]'
    }`}
  >
    <span className="w-5 h-5 shrink-0 flex items-center justify-center">{icon}</span>
    <span>{label}</span>
  </button>
);

const SettingItem = ({ title, description, children, stack = false }) => (
  <div
    className={`flex ${
      stack ? 'flex-col gap-4' : 'flex-col sm:flex-row sm:items-center justify-between gap-6'
    } border-b border-neutral-200 dark:border-neutral-800/50 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0`}
  >
    <div className="flex-1 pr-0 sm:pr-8">
      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{title}</h4>
      {description && (
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
          {description}
        </p>
      )}
    </div>
    <div className={`shrink-0 ${stack ? 'w-full' : 'w-full sm:w-auto flex justify-start sm:justify-end items-center'}`}>
      {children}
    </div>
  </div>
);

export default function SettingsPage({
  closeSettings,
  profileData,
  setProfileData,
  handleUpdateProfile,
  handleAvatarUpload,
  appTheme,
  handleSelectAppTheme,
  appBgImage,
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
  language,
  setLanguage,
  tMsg,
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
}) {
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Danger Zone: Delete Account states
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleConfirmDeleteAccount = async () => {
    if (!deleteAccountPassword) return;
    setIsDeletingAccount(true);
    try {
      await axios.delete('/api/profile/delete-account', {
        data: { password: deleteAccountPassword },
      });
      showNotification(
        tMsg('Your account has been deleted. Redirecting...', 'Akun Anda telah dihapus. Mengalihkan...'),
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
          tMsg('Failed to delete account. Incorrect password.', 'Gagal menghapus akun. Kata sandi salah.'),
        'error'
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const onProfileSubmit = (e) => {
    e.preventDefault();
    if (profileData.new_password && profileData.new_password !== confirmPassword) {
      showNotification(
        tMsg('New password and confirm password do not match!', 'Kata sandi baru dan konfirmasi tidak cocok!'),
        'error'
      );
      return;
    }
    handleUpdateProfile(e);
    setConfirmPassword('');
  };

  const handleToggleBrowserNotif = (val) => {
    if (val) {
      if (!('Notification' in window)) {
        showNotification(
          tMsg('This browser does not support desktop notification', 'Browser ini tidak mendukung notifikasi desktop'),
          'error'
        );
        setBrowserNotifEnabled(false);
        return;
      }
      Notification.requestPermission().then(function (permission) {
        if (permission === 'granted') {
          setBrowserNotifEnabled(true);
          localStorage.setItem('alurku_browser_notif', 'true');
          new Notification('Alurku', {
            body: tMsg('Desktop notifications enabled!', 'Notifikasi desktop diaktifkan!'),
          });
        } else {
          setBrowserNotifEnabled(false);
          localStorage.setItem('alurku_browser_notif', 'false');
          showNotification(
            tMsg('Notification permission denied by browser.', 'Izin notifikasi ditolak oleh browser.'),
            'error'
          );
        }
      });
    } else {
      setBrowserNotifEnabled(false);
      localStorage.setItem('alurku_browser_notif', 'false');
    }
  };

  const handlePreviewNotif = (msg, type) => {
    showNotification(msg, type);
    if (browserNotifEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Alurku', { body: msg });
    }
  };

  const triggerClose = () => {
    setIsClosing(true);
    setTimeout(closeSettings, 200); // Sesuaikan dengan durasi mac-exit
  };

  const defaultBackgrounds = [
    'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
    'linear-gradient(120deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)',
    'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(to right, #434343 0%, #000000 100%)',
  ];

  const uiThemes = [
    { name: 'Default', value: '' },
    { name: 'Gamer Dark', value: 'gamer' },
    { name: 'Minimal Light', value: 'minimal' },
    { name: 'Sunset Glass', value: 'sunset' },
    { name: 'Hacker Terminal', value: 'hacker' },
    { name: 'Chat App Dark', value: 'chatapp' },
    { name: 'Code Editor', value: 'editor' },
    { name: 'Cupertino', value: 'cupertino' },
    { name: 'Social Blue', value: 'social' },
    { name: 'Retail Orange', value: 'retail' },
  ];

  const gradientThemes = [
    { name: 'Midnight Dust', value: 'linear-gradient(to right, #243949 0%, #517fa4 100%)' },
    { name: 'Plum Plate', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Sunset Peach', value: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)' },
    { name: 'Rosy Pink', value: 'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)' },
    { name: 'Lavender Blush', value: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
    { name: 'Mint Breeze', value: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)' },
    { name: 'Ocean Blue', value: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)' },
    { name: 'Dark Noir', value: 'linear-gradient(to right, #434343 0%, #000000 100%)' },
    { name: 'Warm Flame', value: 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' },
    { name: 'Night Sky', value: 'linear-gradient(to top, #1e3c72 0%, #2a5298 100%)' },
    { name: 'Forest', value: 'linear-gradient(to top, #5ee7df 0%, #b490ca 100%)' },
    { name: 'Amour', value: 'linear-gradient(to top, #f77062 0%, #fe5196 100%)' },
    { name: 'Royal Purple', value: 'linear-gradient(to top, #c471f5 0%, #fa71cd 100%)' },
    { name: 'Cherry', value: 'linear-gradient(to right, #eb3349 0%, #f45c43 100%)' },
    { name: 'Deep Space', value: 'linear-gradient(to right, #000000 0%, #434343 100%)' },
    { name: 'Soft Grass', value: 'linear-gradient(to right, #c1dfc4 0%, #deecdd 100%)' },
    { name: 'Magic', value: 'linear-gradient(to right, #ff758c 0%, #ff7eb3 100%)' },
    { name: 'Coffee', value: 'linear-gradient(to right, #b9935a 0%, #e7c582 100%)' },
    { name: 'Hazy Apple', value: 'linear-gradient(to right, #fdfbfb 0%, #ebedee 100%)' },
  ];

  const InputClass =
    'w-full md:w-72 bg-neutral-50 dark:bg-[#0e1116] border border-neutral-200 dark:border-neutral-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-2.5 text-sm font-bold text-black dark:text-white transition-all outline-none shadow-inner placeholder-neutral-400 dark:placeholder-neutral-600';

  return (
    <div
      className={`fixed inset-0 bg-neutral-50 dark:bg-[#0e1116] overflow-y-auto z-100 ${
        isClosing ? 'mac-exit' : 'mac-animate'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-8 md:py-16">
        <div className="mb-12 flex justify-between items-center mac-animate">
          <h2 className="text-3xl md:text-4xl font-black text-[#111E38] dark:text-slate-100 tracking-tighter flex items-center gap-3">
            <svg className="w-8 h-8 md:w-9 md:h-9 text-[#111E38] dark:text-[#FACC15] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{tMsg('Settings', 'Pengaturan')}</span>
          </h2>
          <button
            onClick={triggerClose}
            className="text-neutral-500 hover:text-[#111E38] dark:hover:text-[#FACC15] font-bold flex items-center gap-2 transition-colors text-xs md:text-sm uppercase tracking-widest cursor-pointer"
          >
            <svg className="w-4 h-4 hidden sm:inline-block shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">{tMsg('Back to App', 'Kembali')}</span>
            <svg className="w-5 h-5 sm:hidden shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-16 mac-animate" style={{ animationDelay: '100ms' }}>
          {/* Left Navigation */}
          <div className="md:w-64 shrink-0 space-y-2">
            <TabButton
              id="profile"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              label={tMsg('Account Profile', 'Profil Akun')}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <TabButton
              id="appearance"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4 4.5 4.5 0 014.5-4.5H10v-3a3 3 0 116 0v3h2.5A4.5 4.5 0 0123 17a4 4 0 01-4 4H7zM12 3v9" />
                </svg>
              }
              label={tMsg('Appearance', 'Tampilan')}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <TabButton
              id="preferences"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              }
              label={tMsg('Preferences', 'Preferensi')}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <TabButton
              id="notifications"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              }
              label={tMsg('Notifications', 'Notifikasi')}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <TabButton
              id="billing"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              }
              label={tMsg('Plan & Usage', 'Paket & Penggunaan')}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

          {/* Right Content */}
          <div className="flex-1 min-w-0 bg-white dark:bg-[#15181e] p-6 sm:p-10 rounded-3xl border border-neutral-200 dark:border-neutral-800/80 shadow-sm">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <SettingsSection
                title={tMsg('Account Profile', 'Profil Akun')}
                description={tMsg(
                  'Manage your personal details and security credentials.',
                  'Kelola detail pribadi dan kredensial keamanan Anda.'
                )}
              >
                <form onSubmit={onProfileSubmit}>
                  <SettingItem
                    title={tMsg('Profile Avatar', 'Avatar Profil')}
                    description={tMsg(
                      'Upload a custom image to be displayed across the workspace. Maximum size is 1MB.',
                      'Unggah gambar kustom untuk ditampilkan di seluruh ruang kerja. Ukuran maksimum 1MB.'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar
                        name={profileData.username}
                        url={profileData.avatar}
                        size="w-12 h-12"
                        textClass="text-sm"
                      />
                      <label className="cursor-pointer bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700 shadow-sm">
                        {tMsg('Change Avatar', 'Ganti Avatar')}{' '}
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                      </label>
                    </div>
                  </SettingItem>

                  <SettingItem
                    title={tMsg('Username', 'Nama Pengguna')}
                    description={tMsg('Your unique system identifier.', 'Pengenal sistem unik Anda.')}
                  >
                    <input
                      type="text"
                      value={`@${profileData.username}`}
                      disabled
                      className={`${InputClass} opacity-50 cursor-not-allowed select-none`}
                    />
                  </SettingItem>

                  <SettingItem
                    title={tMsg('Full Name', 'Nama Lengkap')}
                    description={tMsg(
                      'Your real name for official reporting and exports.',
                      'Nama asli Anda untuk pelaporan dan ekspor resmi.'
                    )}
                  >
                    <input
                      type="text"
                      value={profileData.full_name || ''}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      className={InputClass}
                      required
                    />
                  </SettingItem>

                  <SettingItem
                    title={tMsg('Email Address', 'Alamat Email')}
                    description={tMsg(
                      'Used for system notifications and account recovery.',
                      'Digunakan untuk notifikasi sistem dan pemulihan akun.'
                    )}
                  >
                    <div className="flex flex-col w-full md:w-auto">
                      <input
                        type="email"
                        value={profileData.email || ''}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className={InputClass}
                        required
                      />
                      <p className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider mt-1.5 px-1">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>
                          {tMsg(
                            'Changing email requires re-verification.',
                            'Mengubah email memerlukan verifikasi ulang.'
                          )}
                        </span>
                      </p>
                    </div>
                  </SettingItem>

                  <SettingItem
                    title={tMsg('Change Password', 'Ubah Kata Sandi')}
                    description={tMsg(
                      'Leave these fields blank if you do not wish to change your current password.',
                      'Biarkan kolom ini kosong jika Anda tidak ingin mengubah kata sandi saat ini.'
                    )}
                    stack={true}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="relative w-full md:w-[calc(50%-0.5rem)]">
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          value={profileData.current_password || ''}
                          onChange={(e) => setProfileData({ ...profileData, current_password: e.target.value })}
                          className={`w-full ${InputClass}`}
                          style={{ paddingRight: '2.5rem' }}
                          placeholder={tMsg('Current Password', 'Kata Sandi Saat Ini')}
                        />
                        <button
                          type="button"
                          onMouseDown={() => setShowCurrentPass(true)}
                          onMouseUp={() => setShowCurrentPass(false)}
                          onMouseLeave={() => setShowCurrentPass(false)}
                          onTouchStart={() => setShowCurrentPass(true)}
                          onTouchEnd={() => setShowCurrentPass(false)}
                          onTouchCancel={() => setShowCurrentPass(false)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-indigo-500 transition-colors cursor-pointer select-none"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d={
                                showCurrentPass
                                  ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                                  : 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18'
                              }
                            ></path>
                          </svg>
                        </button>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                          <input
                            type={showNewPass ? 'text' : 'password'}
                            value={profileData.new_password || ''}
                            onChange={(e) => setProfileData({ ...profileData, new_password: e.target.value })}
                            className={`w-full ${InputClass}`}
                            style={{ paddingRight: '2.5rem' }}
                            placeholder={tMsg('New Password', 'Kata Sandi Baru')}
                          />
                          <button
                            type="button"
                            onMouseDown={() => setShowNewPass(true)}
                            onMouseUp={() => setShowNewPass(false)}
                            onMouseLeave={() => setShowNewPass(false)}
                            onTouchStart={() => setShowNewPass(true)}
                            onTouchEnd={() => setShowNewPass(false)}
                            onTouchCancel={() => setShowNewPass(false)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-indigo-500 transition-colors cursor-pointer select-none"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d={
                                  showNewPass
                                    ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                                    : 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18'
                                }
                              ></path>
                            </svg>
                          </button>
                        </div>
                        <div className="relative flex-1">
                          <input
                            type={showConfirmPass ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full ${InputClass}`}
                            style={{ paddingRight: '2.5rem' }}
                            placeholder={tMsg('Confirm Password', 'Konfirmasi Sandi')}
                          />
                          <button
                            type="button"
                            onMouseDown={() => setShowConfirmPass(true)}
                            onMouseUp={() => setShowConfirmPass(false)}
                            onMouseLeave={() => setShowConfirmPass(false)}
                            onTouchStart={() => setShowConfirmPass(true)}
                            onTouchEnd={() => setShowConfirmPass(false)}
                            onTouchCancel={() => setShowConfirmPass(false)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-indigo-500 transition-colors cursor-pointer select-none"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d={
                                  showConfirmPass
                                    ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                                    : 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18'
                                }
                              ></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </SettingItem>

                  <div className="flex justify-end mt-8">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#111E38] text-white hover:bg-[#1b2b4d] dark:bg-[#FACC15] dark:text-[#111E38] text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{tMsg('Save Profile Changes', 'Simpan Perubahan Profil')}</span>
                    </button>
                  </div>
                </form>

                {/* Danger Zone */}
                <div className="mt-12 pt-8 border-t border-rose-200 dark:border-rose-900/40">
                  <h4 className="text-sm font-black text-rose-600 dark:text-rose-400 flex items-center gap-2 mb-1.5 uppercase tracking-wider">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{tMsg('Danger Zone', 'Zona Bahaya')}</span>
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 font-medium">
                    {tMsg(
                      'Permanently delete your account, private tasks, and personal records. This action is irreversible.',
                      'Hapus akun, tugas privat, dan data pribadi Anda secara permanen. Tindakan ini tidak dapat dibatalkan.'
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsDeleteAccountModalOpen(true)}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800/60 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                    </svg>
                    <span>{tMsg('Delete Account Permanently', 'Hapus Akun Secara Permanen')}</span>
                  </button>
                </div>
              </SettingsSection>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <SettingsSection
                title={tMsg('Appearance', 'Tampilan')}
                description={tMsg(
                  'Customize the look and feel of your workspace.',
                  'Sesuaikan tampilan dan nuansa ruang kerja Anda.'
                )}
              >
                <SettingItem
                  title={tMsg('Workspace Interface Theme', 'Tema Antarmuka Ruang Kerja')}
                  description={tMsg(
                    'Change the entire look and feel of the application.',
                    'Ubah keseluruhan tampilan dan nuansa aplikasi.'
                  )}
                  stack={true}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                      {tMsg('Complete UI Overhauls', 'Perombakan UI Lengkap')}
                    </span>
                    {appTheme && (
                      <button
                        type="button"
                        onClick={() => handleSelectAppTheme('')}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1 rounded-md text-[10px] font-bold transition-colors uppercase tracking-widest"
                      >
                        {tMsg('Reset to Default', 'Atur Ulang ke Bawaan')}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {uiThemes.map((bg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectAppTheme(bg.value)}
                        className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl border-4 transition-all shadow-sm flex items-center justify-center relative ${
                          !bg.value ? 'bg-neutral-200 dark:bg-neutral-800' : ''
                        } ${
                          appTheme === bg.value ? 'border-indigo-500 scale-110' : 'border-transparent hover:scale-105'
                        }`}
                        style={
                          bg.value === 'gamer'
                            ? {
                                background:
                                  'radial-gradient(circle at top left, #2a475e 0%, #1b2838 50%, #171a21 100%)',
                              }
                            : bg.value === 'minimal'
                            ? { background: '#f8f9fa', border: '1px solid #dadce0' }
                            : bg.value === 'sunset'
                            ? {
                                background:
                                  'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                              }
                            : bg.value === 'hacker'
                            ? { background: '#373c44', border: '1px solid #21252b' }
                            : bg.value === 'chatapp'
                            ? { background: '#313338', border: '1px solid #1e1f22' }
                            : bg.value === 'editor'
                            ? { background: '#2D2A2E', border: '1px solid #221F22' }
                            : bg.value === 'cupertino'
                            ? { background: '#F5F5F7', border: '1px solid #E5E5EA' }
                            : bg.value === 'social'
                            ? { background: '#F0F2F5', border: '1px solid #CED0D4' }
                            : bg.value === 'retail'
                            ? { background: '#131921', border: '1px solid #232F3E' }
                            : {}
                        }
                        title={bg.name}
                      >
                        {!bg.value && (
                          <svg className="w-5 h-5 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="9" strokeWidth="2" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.5 5.5l13 13" />
                          </svg>
                        )}
                        {bg.value === 'gamer' && <span className="text-lg font-black text-[#66c0f4]">G</span>}
                        {bg.value === 'minimal' && <span className="text-lg font-black text-[#1a73e8]">M</span>}
                        {bg.value === 'sunset' && <span className="text-lg font-black text-white">S</span>}
                        {bg.value === 'hacker' && <span className="text-lg font-black text-[#A6E22E]">H</span>}
                        {bg.value === 'chatapp' && <span className="text-lg font-black text-[#5865F2]">C</span>}
                        {bg.value === 'editor' && <span className="text-lg font-black text-[#a8a0ee]">E</span>}
                        {bg.value === 'cupertino' && <span className="text-lg font-black text-[#86868B]">C</span>}
                        {bg.value === 'social' && <span className="text-lg font-black text-[#1877F2]">S</span>}
                        {bg.value === 'retail' && <span className="text-lg font-black text-[#FF9900]">R</span>}
                        {appTheme === bg.value && (
                          <div className="absolute -top-2 -right-2 bg-[#111E38] dark:bg-[#FACC15] text-white dark:text-[#111E38] rounded-full w-5 h-5 flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-[#15181e]">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </SettingItem>

                <SettingItem
                  title={tMsg('Gradient Backgrounds', 'Latar Belakang Gradien')}
                  description={tMsg(
                    'Apply a beautiful gradient to the default interface. (Will override UI Themes)',
                    'Terapkan gradien indah ke antarmuka bawaan. (Akan menimpa Tema UI)'
                  )}
                  stack={true}
                >
                  <div className="flex flex-wrap gap-3">
                    {gradientThemes.map((bg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectAppTheme(bg.value)}
                        className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl border-4 transition-all shadow-sm flex items-center justify-center relative ${
                          appTheme === bg.value ? 'border-indigo-500 scale-110' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ background: bg.value }}
                        title={bg.name}
                      >
                        {appTheme === bg.value && (
                          <div className="absolute -top-2 -right-2 bg-[#111E38] dark:bg-[#FACC15] text-white dark:text-[#111E38] rounded-full w-5 h-5 flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-[#15181e]">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </SettingItem>

                <SettingItem
                  title={tMsg('Texture Overlay', 'Hamparan Tekstur')}
                  description={tMsg(
                    'Apply a subtle pattern over the background to reduce eye strain.',
                    'Terapkan pola halus di atas latar belakang untuk mengurangi ketegangan mata.'
                  )}
                >
                  <div className="flex flex-wrap gap-2 justify-end w-full md:max-w-xs">
                    {[
                      { id: '', label: tMsg('None', 'Tidak Ada') },
                      { id: 'noise', label: tMsg('Noise', 'Noise') },
                      { id: 'dots', label: tMsg('Dots', 'Titik') },
                      { id: 'grid', label: tMsg('Grid', 'Kisi') },
                    ].map((tex) => (
                      <button
                        key={tex.id}
                        type="button"
                        onClick={() => handleSelectAppTexture(tex.id)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                          appTexture === tex.id
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-sm'
                            : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                        }`}
                      >
                        {tex.label}
                      </button>
                    ))}
                  </div>
                </SettingItem>

                <SettingItem
                  title={tMsg('Custom Photo Wallpaper', 'Wallpaper Foto Kustom')}
                  description={tMsg(
                    'Override the theme with a local image (Max 5MB).',
                    'Timpa tema dengan gambar lokal (Maks 5MB).'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {appBgImage && (
                      <button
                        type="button"
                        onClick={removeAppBgImage}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg text-xs font-bold transition-colors"
                      >
                        {tMsg('Remove', 'Hapus')}
                      </button>
                    )}
                    <label className="bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-black dark:text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm">
                      {tMsg('Upload Image', 'Unggah Gambar')}{' '}
                      <input type="file" accept="image/*" onChange={handleAppBgUpload} className="hidden" />
                    </label>
                  </div>
                </SettingItem>

                <SettingItem
                  title={tMsg('Task Card Background', 'Latar Kartu Tugas')}
                  description={tMsg(
                    'Apply a custom color specifically for active Kanban cards.',
                    'Terapkan warna kustom khusus untuk kartu Kanban yang aktif.'
                  )}
                  stack={true}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                      {tMsg('Available Colors', 'Warna Tersedia')}
                    </span>
                    {cardTheme && (
                      <button
                        type="button"
                        onClick={() => handleSelectCardTheme('')}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1 rounded-md text-[10px] font-bold transition-colors uppercase tracking-widest"
                      >
                        {tMsg('Reset', 'Atur Ulang')}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectCardTheme('')}
                      className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-lg border-2 transition-all shadow-sm flex items-center justify-center relative bg-neutral-200 dark:bg-neutral-800 ${
                        cardTheme === '' ? 'border-indigo-500 scale-110' : 'border-transparent hover:scale-105'
                      }`}
                      title="None"
                    >
                      <svg className="w-4 h-4 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" strokeWidth="2" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.5 5.5l13 13" />
                      </svg>
                      {cardTheme === '' && (
                        <div className="absolute -top-1.5 -right-1.5 bg-[#111E38] dark:bg-[#FACC15] text-white dark:text-[#111E38] rounded-full w-4 h-4 flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-[#15181e]">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                    {gradientThemes.map((bg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectCardTheme(bg.value)}
                        className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-lg border-2 transition-all shadow-sm flex items-center justify-center relative ${
                          cardTheme === bg.value ? 'border-indigo-500 scale-110' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ background: bg.value }}
                        title={bg.name}
                      >
                        {cardTheme === bg.value && (
                          <div className="absolute -top-1.5 -right-1.5 bg-[#111E38] dark:bg-[#FACC15] text-white dark:text-[#111E38] rounded-full w-4 h-4 flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-[#15181e]">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </SettingItem>

                <SettingItem
                  title={tMsg('Chat Area Background', 'Latar Area Obrolan')}
                  description={tMsg(
                    'Change the wallpaper behind task comments and team chat.',
                    'Ubah wallpaper di belakang komentar tugas dan obrolan tim.'
                  )}
                  stack={true}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                      {tMsg('Background & Gradients', 'Latar Belakang & Gradien')}
                    </span>
                    <div className="flex items-center gap-3">
                      {chatBg && (
                        <button
                          type="button"
                          onClick={removeChatBg}
                          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors uppercase tracking-widest"
                        >
                          {tMsg('Remove', 'Hapus')}
                        </button>
                      )}
                      <label className="cursor-pointer bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-black dark:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm">
                        {tMsg('Upload Image', 'Unggah Gambar')}{' '}
                        <input type="file" accept="image/*" onChange={handleChatBgUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    {defaultBackgrounds.map((bg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectDefaultBg(bg)}
                        className="w-10 h-10 rounded-full border-2 border-white dark:border-neutral-800 hover:scale-110 transition-transform shadow-sm cursor-pointer"
                        style={{ background: bg }}
                        title={`Theme ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <div
                    className="mt-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 h-40 overflow-hidden flex flex-col justify-end gap-3 relative bg-neutral-50 dark:bg-neutral-900 bg-cover bg-center shadow-inner"
                    style={
                      chatBg
                        ? chatBg.startsWith('data:image')
                        ? { backgroundImage: `url(${chatBg})` }
                        : { background: chatBg }
                        : {}
                    }
                  >
                    {chatBg && (
                      <div className="absolute inset-0 bg-white/40 dark:bg-black/60 backdrop-blur-[2px] z-0"></div>
                    )}
                    <div className="relative z-10 self-start bg-white dark:bg-neutral-800 px-4 py-2.5 rounded-2xl rounded-tl-sm text-xs font-medium shadow-sm text-black dark:text-white max-w-[80%]">
                      {tMsg(
                        'Hey, what do you think of this background?',
                        'Hei, bagaimana menurutmu latar belakang ini?'
                      )}
                    </div>
                    <div className="relative z-10 self-end bg-indigo-600 px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs font-medium shadow-sm text-white max-w-[80%] flex items-center gap-1.5">
                      <span>{tMsg('Looks highly professional!', 'Terlihat sangat profesional!')}</span>
                      <svg className="w-3.5 h-3.5 text-[#FACC15] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z" />
                      </svg>
                    </div>
                  </div>
                </SettingItem>
              </SettingsSection>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <SettingsSection
                title={tMsg('Preferences', 'Preferensi')}
                description={tMsg('Set your language and system modes.', 'Atur bahasa dan mode sistem Anda.')}
              >
                <SettingItem
                  title={tMsg('System Theme', 'Tema Sistem')}
                  description={tMsg(
                    'Toggle between the classic Light Mode and the sleek Dark Mode interface.',
                    'Beralih antara Mode Terang klasik dan antarmuka Mode Gelap yang elegan.'
                  )}
                >
                  <SegmentedControl
                    options={[
                      {
                        label: (
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span>Light</span>
                          </span>
                        ),
                        value: 'light',
                      },
                      {
                        label: (
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                            <span>Dark</span>
                          </span>
                        ),
                        value: 'dark',
                      },
                    ]}
                    value={isDarkMode ? 'dark' : 'light'}
                    onChange={(val) => setIsDarkMode(val === 'dark')}
                  />
                </SettingItem>

                <SettingItem
                  title={tMsg('Language Options', 'Opsi Bahasa')}
                  description={tMsg(
                    'Select your preferred system language for all menus and labels.',
                    'Pilih bahasa sistem yang Anda inginkan untuk semua menu dan label.'
                  )}
                >
                  <SegmentedControl
                    options={[
                      {
                        label: (
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" strokeWidth="2" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                            </svg>
                            <span>EN</span>
                          </span>
                        ),
                        value: 'en',
                      },
                      {
                        label: (
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" strokeWidth="2" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                            </svg>
                            <span>ID</span>
                          </span>
                        ),
                        value: 'id',
                      },
                    ]}
                    value={language}
                    onChange={(val) => {
                      setLanguage(val);
                      localStorage.setItem('alurku_lang', val);
                    }}
                  />
                </SettingItem>

                <SettingItem
                  title={tMsg('Date Format', 'Format Tanggal')}
                  description={tMsg(
                    'Choose how dates are displayed across the application.',
                    'Pilih bagaimana tanggal ditampilkan di seluruh aplikasi.'
                  )}
                >
                  <div className="relative w-full md:w-auto">
                    <select
                      value={dateFormat}
                      onChange={(e) => {
                        setDateFormat(e.target.value);
                        localStorage.setItem('alurku_date_format', e.target.value);
                      }}
                      className={`w-full md:w-56 appearance-none pr-10 cursor-pointer ${InputClass}`}
                    >
                      <option value="DD MMM YYYY">31 Dec 2026</option>
                      <option value="MMM DD, YYYY">Dec 31, 2026</option>
                      <option value="DD/MM/YYYY">31/12/2026</option>
                      <option value="YYYY-MM-DD">2026-12-31</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 font-bold text-xs">
                      ▼
                    </div>
                  </div>
                </SettingItem>
              </SettingsSection>
            )}

            {activeTab === 'preferences' && (
              <div className="mt-10">
                <SettingsSection
                  title={tMsg('Productivity', 'Produktivitas')}
                  description={tMsg(
                    'Enable extra tools to help you focus and track time.',
                    'Aktifkan alat tambahan untuk membantu Anda fokus dan melacak waktu.'
                  )}
                >
                  <SettingItem
                    title={tMsg('Live Clock', 'Jam Langsung')}
                    description={tMsg(
                      'Show the current time in the navigation bar.',
                      'Tampilkan waktu saat ini di bilah navigasi.'
                    )}
                  >
                    <SegmentedControl
                      options={[
                        { label: 'ON', value: true },
                        { label: 'OFF', value: false },
                      ]}
                      value={showLiveClock}
                    size="small"
                      onChange={(v) => {
                        setShowLiveClock(v);
                        localStorage.setItem('alurku_show_clock', v);
                      }}
                    />
                  </SettingItem>
                  {showLiveClock && (
                    <SettingItem
                      title={tMsg('Show Date in Clock', 'Tampilkan Tanggal di Jam')}
                      description={tMsg(
                        'Display the day and date alongside the live clock.',
                        'Tampilkan hari dan tanggal di samping jam langsung.'
                      )}
                    >
                      <SegmentedControl
                        options={[
                          { label: 'ON', value: true },
                          { label: 'OFF', value: false },
                        ]}
                        value={showLiveClockDate}
                        size="small"
                        onChange={(v) => {
                          setShowLiveClockDate(v);
                          localStorage.setItem('alurku_show_clock_date', v);
                        }}
                      />
                    </SettingItem>
                  )}
                  <SettingItem
                    title={tMsg('Pomodoro Timer', 'Penghitung Waktu Pomodoro')}
                    description={tMsg(
                      'Enable a floating Pomodoro timer. The Pomodoro Technique is a time management method based on 25-minute stretches of focused work broken by 5-minute breaks.',
                      'Aktifkan penghitung waktu Pomodoro mengambang. Teknik Pomodoro adalah metode manajemen waktu berdasarkan 25 menit kerja fokus yang dipisahkan oleh 5 menit istirahat.'
                    )}
                  >
                    <SegmentedControl
                      options={[
                        { label: 'ON', value: true },
                        { label: 'OFF', value: false },
                      ]}
                      value={pomodoroEnabled}
                      size="small"
                      onChange={(v) => {
                        setPomodoroEnabled(v);
                        localStorage.setItem('alurku_pomodoro', v);
                      }}
                    />
                  </SettingItem>
                  <SettingItem
                    title={tMsg('Floating AI Assistant', 'Asisten AI Mengambang')}
                    description={tMsg(
                      'Show the floating Smart Assistant button on the bottom right of your screen. You can still access it from the Account Menu.',
                      'Tampilkan tombol Asisten Pintar mengambang di kanan bawah layar Anda. Anda tetap bisa mengaksesnya dari Menu Akun.'
                    )}
                  >
                    <SegmentedControl
                      options={[
                        { label: 'ON', value: true },
                        { label: 'OFF', value: false },
                      ]}
                      value={showAssistantButton}
                      size="small"
                      onChange={(v) => {
                        setShowAssistantButton(v);
                        localStorage.setItem('alurku_show_assistant_btn', v);
                      }}
                    />
                  </SettingItem>
                </SettingsSection>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <SettingsSection
                title={tMsg('Notifications', 'Notifikasi')}
                description={tMsg(
                  'Manage how and where you receive system alerts.',
                  'Kelola bagaimana dan di mana Anda menerima peringatan sistem.'
                )}
              >
                <SettingItem
                  title={tMsg('Notification Sound', 'Suara Notifikasi')}
                  description={tMsg(
                    'Play a short chime when a notification arrives.',
                    'Mainkan suara pendek saat notifikasi tiba.'
                  )}
                >
                  <SegmentedControl
                    options={[
                      { label: 'ON', value: true },
                      { label: 'OFF', value: false },
                    ]}
                    value={notifSound}
                    size="small"
                    onChange={(v) => {
                      setNotifSound(v);
                      localStorage.setItem('alurku_notif_sound', v);
                    }}
                  />
                </SettingItem>
                <SettingItem
                  title={tMsg('Privacy Mode', 'Mode Privasi')}
                  description={tMsg(
                    'Hide sensitive content (like messages or task names) from pop-up notifications.',
                    'Sembunyikan konten sensitif (seperti pesan atau nama tugas) dari notifikasi pop-up.'
                  )}
                >
                  <SegmentedControl
                    options={[
                      { label: 'ON', value: true },
                      { label: 'OFF', value: false },
                    ]}
                    value={notifPrivacy}
                    size="small"
                    onChange={(v) => {
                      setNotifPrivacy(v);
                      localStorage.setItem('alurku_notif_privacy', v);
                    }}
                  />
                </SettingItem>
                <SettingItem
                  title={tMsg('Desktop Notifications', 'Notifikasi Desktop')}
                  description={tMsg(
                    'Receive system alerts as native browser/OS notifications.',
                    'Terima peringatan sistem sebagai notifikasi bawaan browser/OS.'
                  )}
                >
                  <SegmentedControl
                    options={[
                      { label: 'ON', value: true },
                      { label: 'OFF', value: false },
                    ]}
                    value={browserNotifEnabled}
                    size="small"
                    onChange={handleToggleBrowserNotif}
                  />
                </SettingItem>
                <SettingItem
                  title={tMsg('Notification Position', 'Posisi Notifikasi')}
                  description={tMsg(
                    'Choose where pop-up notifications appear on your screen.',
                    'Pilih di mana notifikasi pop-up muncul di layar Anda.'
                  )}
                  stack={true}
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['top-left', 'top-center', 'top-right', 'center', 'bottom-center', 'bottom-right'].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => {
                          setNotifPosition(pos);
                          localStorage.setItem('alurku_notif_pos', pos);
                        }}
                        className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                          notifPosition === pos
                            ? 'bg-indigo-50 border border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-300 shadow-sm'
                            : 'bg-transparent border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        {pos.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </SettingItem>
                <SettingItem
                  title={tMsg('Preview Notification', 'Pratinjau Notifikasi')}
                  description={tMsg(
                    'Test how different notification types look and sound with your current settings.',
                    'Uji tampilan dan suara berbagai jenis notifikasi dengan pengaturan Anda saat ini.'
                  )}
                  stack={true}
                >
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handlePreviewNotif(
                          tMsg('This is a test info notification!', 'Ini adalah notifikasi info pengujian!'),
                          'info'
                        )
                      }
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center gap-2 border border-blue-200 dark:border-blue-800/50 cursor-pointer"
                    >
                      <svg className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" />
                      </svg>
                      <span>{tMsg('Preview Info', 'Pratinjau Info')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handlePreviewNotif(
                          tMsg('This is a test success notification!', 'Ini adalah notifikasi sukses pengujian!'),
                          'success'
                        )
                      }
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center gap-2 border border-emerald-200 dark:border-emerald-800/50 cursor-pointer"
                    >
                      <svg className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4" />
                      </svg>
                      <span>{tMsg('Preview Success', 'Pratinjau Sukses')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handlePreviewNotif(
                          tMsg('This is a test error notification!', 'Ini adalah notifikasi error pengujian!'),
                          'error'
                        )
                      }
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center gap-2 border border-rose-200 dark:border-rose-800/50 cursor-pointer"
                    >
                      <svg className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>{tMsg('Preview Error', 'Pratinjau Error')}</span>
                    </button>
                  </div>
                </SettingItem>
              </SettingsSection>
            )}

            {/* Plan & Usage Tab */}
            {activeTab === 'billing' && (
              <SettingsSection
                title={tMsg('Plan & Usage Quota', 'Paket & Penggunaan Kuota')}
                description={tMsg(
                  'Manage your workspace subscription tier, storage allocation, and AI prompt quota.',
                  'Kelola paket berlangganan ruang kerja, alokasi penyimpanan, dan kuota permintaan AI.'
                )}
              >
                {/* Subscription Tier Banner */}
                <div className="bg-linear-to-r from-[#111E38] to-slate-900 text-white p-6 rounded-2xl mb-8 border border-neutral-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FACC15] block mb-1">
                      {tMsg('Current Active Plan', 'Paket Aktif Saat Ini')}
                    </span>
                    <h4 className="text-2xl font-black text-white flex items-center gap-2">
                      Free Community Tier
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                        Active
                      </span>
                    </h4>
                    <p className="text-xs text-neutral-300 font-medium mt-1">
                      {tMsg('Includes unlimited tasks, 5GB cloud storage, and 500 monthly Luruka AI prompts.', 'Termasuk tugas tak terbatas, penyimpanan 5GB, dan 500 kuota AI Luruka bulanan.')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      showNotification(tMsg('Pro Tier subscription upgrades coming soon!', 'Peningkatan paket Pro segera hadir!'), 'info');
                    }}
                    className="bg-[#FACC15] hover:bg-yellow-400 text-[#111E38] font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm shrink-0 cursor-pointer flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 shrink-0 text-[#111E38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m5.96 5.96a14.926 14.926 0 01-5.84 2.58m-.12-8.54a2 2 0 102.83 2.83M3 21l3.5-3.5" />
                    </svg>
                    <span>{tMsg('Upgrade to Pro', 'Tingkatkan ke Pro')}</span>
                  </button>
                </div>

                {/* Storage & Usage Metrics */}
                <SettingItem
                  title={tMsg('Database Storage', 'Penyimpanan Database')}
                  description={tMsg('Allocated SQL database space for task cards, comments, and project histories.', 'Alokasi ruang database SQL untuk kartu tugas, komentar, dan riwayat proyek.')}
                >
                  <div className="w-full md:w-72">
                    <div className="flex justify-between text-xs mb-1 font-bold">
                      <span className="text-neutral-500 dark:text-neutral-400">18.4 MB / 512.0 MB</span>
                      <span className="text-[#111E38] dark:text-[#FACC15]">3.6%</span>
                    </div>
                    <div className="w-full bg-neutral-150 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-[#111E38] dark:bg-[#FACC15] h-full rounded-full" style={{ width: '3.6%' }}></div>
                    </div>
                  </div>
                </SettingItem>

                <SettingItem
                  title={tMsg('Cloud File Storage (S3)', 'Penyimpanan Berkas (Cloud S3)')}
                  description={tMsg('Storage space for task attachments, image uploads, and documents.', 'Ruang penyimpanan untuk lampiran tugas, unggahan gambar, dan dokumen.')}
                >
                  <div className="w-full md:w-72">
                    <div className="flex justify-between text-xs mb-1 font-bold">
                      <span className="text-neutral-500 dark:text-neutral-400">245.8 MB / 5.0 GB</span>
                      <span className="text-[#111E38] dark:text-[#FACC15]">4.9%</span>
                    </div>
                    <div className="w-full bg-neutral-150 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-[#111E38] dark:bg-[#FACC15] h-full rounded-full" style={{ width: '4.9%' }}></div>
                    </div>
                  </div>
                </SettingItem>

                <SettingItem
                  title={tMsg('Luruka AI Prompt Quota', 'Kuota Permintaan Luruka AI')}
                  description={tMsg('Monthly prompt quota for AI workload summaries, task planning, and smart assistant.', 'Kuota permintaan bulanan untuk ringkasan AI, perencanaan tugas, dan asisten cerdas.')}
                >
                  <div className="w-full md:w-72">
                    <div className="flex justify-between text-xs mb-1 font-bold">
                      <span className="text-neutral-500 dark:text-neutral-400">142 / 500 prompts</span>
                      <span className="text-[#111E38] dark:text-[#FACC15]">28.4%</span>
                    </div>
                    <div className="w-full bg-neutral-150 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-[#111E38] dark:bg-[#FACC15] h-full rounded-full" style={{ width: '28.4%' }}></div>
                    </div>
                  </div>
                </SettingItem>
              </SettingsSection>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Permanent Confirmation Modal */}
      {isDeleteAccountModalOpen && (
        <div className="fixed inset-0 bg-[#111E38]/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center z-110 p-4 transition-opacity animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121B2D] p-6 md:p-7 border border-rose-200 dark:border-rose-900/50 shadow-2xl rounded-2xl w-full max-w-md">
            <div className="flex items-center gap-3 mb-3 text-rose-600 dark:text-rose-400">
              <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-black tracking-tight text-[#111E38] dark:text-white">
                {tMsg('Confirm Permanent Account Deletion', 'Konfirmasi Hapus Akun Permanen')}
              </h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 mb-4 leading-relaxed font-medium">
              {tMsg(
                'Please enter your account password to confirm deletion. Once confirmed, all your private tasks, personal records, and notifications will be wiped immediately.',
                'Harap masukkan kata sandi akun Anda untuk mengonfirmasi penghapusan. Setelah dikonfirmasi, seluruh tugas privat, data pribadi, dan notifikasi Anda akan dihapus seketika.'
              )}
            </p>

            <div className="mb-5">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                {tMsg('Account Password', 'Kata Sandi Akun')}
              </label>
              <input
                type="password"
                value={deleteAccountPassword}
                onChange={(e) => setDeleteAccountPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#F3F4F6] dark:bg-slate-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-bold text-[#111E38] dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteAccountModalOpen(false);
                  setDeleteAccountPassword('');
                }}
                className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[#111E38] dark:text-neutral-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {tMsg('Cancel', 'Batal')}
              </button>
              <button
                type="button"
                disabled={!deleteAccountPassword || isDeletingAccount}
                onClick={handleConfirmDeleteAccount}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-extrabold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                {isDeletingAccount ? (
                  <span>{tMsg('Deleting...', 'Menghapus...')}</span>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>{tMsg('Permanently Delete', 'Hapus Permanen')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
