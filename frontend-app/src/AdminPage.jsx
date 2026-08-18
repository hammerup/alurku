import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppContext } from './hooks/useAppContext';
import { HighlightText } from './Utils';

export default function AdminPage(props) {
  const context = useAppContext();

  // Accept props or fallback to context
  const currentUser = props.currentUser || context.currentUser;
  const adminUsers = props.adminUsers || context.adminUsers || [];
  const setAdminUsers = props.setAdminUsers || context.setAdminUsers;
  const handleDeleteUser = props.handleDeleteUser || context.handleDeleteUser;
  const handleUpdateUserStatus = props.handleUpdateUserStatus || context.handleUpdateUserStatus;
  const handleToggleSuperAdmin = props.handleToggleSuperAdmin || context.handleToggleSuperAdmin;
  const handleManualVerify = props.handleManualVerify || context.handleManualVerify;
  const language = props.language || context.language || 'id';
  const showNotification = props.showNotification || context.showNotification;

  const tMsg = (en, id) => (language === 'id' ? id : en);

  // Tabs: 'users' | 'projects' | 'policies' | 'config' | 'maintenance'
  const [activeTab, setActiveTab] = useState('users');

  // Stats State
  const [stats, setStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  // User Management State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userToProcess, setUserToProcess] = useState(null);
  const [processAction, setProcessAction] = useState('schedule');
  const [confirmText, setConfirmText] = useState('');
  const [offboardDate, setOffboardDate] = useState('');
  const [showDeleteChoice, setShowDeleteChoice] = useState(false);
  const [deleteChoiceUser, setDeleteChoiceUser] = useState(null);
  const [bulkUserConfirmOpen, setBulkUserConfirmOpen] = useState(false);
  const [bulkUserActionType, setBulkUserActionType] = useState('purge');
  const [isProcessingBulkUsers, setIsProcessingBulkUsers] = useState(false);

  // Project Management State
  const [adminBoards, setAdminBoards] = useState([]);
  const [isBoardsLoading, setIsBoardsLoading] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [boardsToDelete, setBoardsToDelete] = useState([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [boardToTransfer, setBoardToTransfer] = useState(null);
  const [newOwnerInput, setNewOwnerInput] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Policies State
  const [policies, setPolicies] = useState({
    org_name: 'alurku.',
    default_language: 'id',
    allow_public_signup: true,
    allowed_domains: '',
    session_duration_days: 30,
    soft_delete_grace_days: 90,
    max_upload_size_mb: 10,
    default_ai_engine: 'auto',
    enable_proactive_nudge: true,
    enable_auto_subtasks: true,
  });
  const [isPoliciesLoading, setIsPoliciesLoading] = useState(false);
  const [isPoliciesSaving, setIsPoliciesSaving] = useState(false);

  // Credentials / System Config State
  const [configData, setConfigData] = useState({
    database_url: '',
    secret_key: '',
    google_calendar_api_key: '',
    smtp_server: '',
    smtp_port: '',
    smtp_username: '',
    smtp_password: '',
    gemini_api_key: '',
    groq_api_key: '',
  });
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [showPass, setShowPass] = useState({
    db: false,
    jwt: false,
    cal: false,
    smtp: false,
    gemini: false,
    groq: false,
  });
  const togglePass = (key, val) => setShowPass((prev) => ({ ...prev, [key]: val }));

  // Maintenance State
  const [isCleaningOrphans, setIsCleaningOrphans] = useState(false);
  const [isPurgingExpired, setIsPurgingExpired] = useState(false);

  // Sudo Security State
  const [isSudoVerified, setIsSudoVerified] = useState(false);
  const [showSudoModal, setShowSudoModal] = useState(false);
  const [sudoPassword, setSudoPassword] = useState('');
  const [isSudoLoading, setIsSudoLoading] = useState(false);
  const [showSudoPass, setShowSudoPass] = useState(false);

  // Fetch Stats
  const fetchStats = () => {
    setIsStatsLoading(true);
    axios
      .get('/api/admin/stats')
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setIsStatsLoading(false));
  };

  // Fetch Users
  const fetchUsers = () => {
    if (setAdminUsers) {
      axios
        .get('/api/admin/users')
        .then((res) => setAdminUsers(res.data.users || []))
        .catch(() => showNotification('Gagal memuat pengguna', 'error'));
    }
  };

  // Fetch Boards
  const fetchBoards = () => {
    setIsBoardsLoading(true);
    axios
      .get('/api/admin/boards')
      .then((res) => setAdminBoards(res.data.boards || []))
      .catch(() => showNotification('Gagal memuat proyek', 'error'))
      .finally(() => setIsBoardsLoading(false));
  };

  // Fetch Policies
  const fetchPolicies = () => {
    setIsPoliciesLoading(true);
    axios
      .get('/api/admin/policies')
      .then((res) => {
        if (res.data) setPolicies(res.data);
      })
      .catch(() => {})
      .finally(() => setIsPoliciesLoading(false));
  };

  // Fetch Config
  const fetchConfig = () => {
    setIsConfigLoading(true);
    axios
      .get('/api/admin/config')
      .then((res) => {
        if (res.data) {
          setConfigData({
            database_url: res.data.database_url || '',
            secret_key: res.data.secret_key || '',
            google_calendar_api_key: res.data.google_calendar_api_key || '',
            smtp_server: res.data.smtp_server || '',
            smtp_port: res.data.smtp_port || '',
            smtp_username: res.data.smtp_username || '',
            smtp_password: res.data.smtp_password || '',
            gemini_api_key: res.data.gemini_api_key || '',
            groq_api_key: res.data.groq_api_key || '',
          });
        }
      })
      .catch(() => showNotification('Gagal memuat konfigurasi sistem', 'error'))
      .finally(() => setIsConfigLoading(false));
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchPolicies();
  }, []);

  useEffect(() => {
    if (activeTab === 'projects') fetchBoards();
    if (activeTab === 'policies') fetchPolicies();
    if (activeTab === 'config' && isSudoVerified) fetchConfig();
  }, [activeTab, isSudoVerified]);

  // Sudo Gate Handler
  const handleSudoVerify = (e) => {
    e.preventDefault();
    if (!sudoPassword.trim()) return;
    setIsSudoLoading(true);
    axios
      .post('/api/admin/verify-sudo', { password: sudoPassword })
      .then(() => {
        setIsSudoVerified(true);
        setShowSudoModal(false);
        setSudoPassword('');
        showNotification(tMsg('Sudo access granted', 'Akses Sudo disetujui'), 'success');
        fetchConfig();
      })
      .catch((err) => {
        showNotification(err.response?.data?.detail || tMsg('Incorrect password', 'Kata sandi salah'), 'error');
      })
      .finally(() => setIsSudoLoading(false));
  };

  // Policy Save Handler
  const handleSavePolicies = (e) => {
    e.preventDefault();
    setIsPoliciesSaving(true);
    axios
      .put('/api/admin/policies', policies)
      .then((res) => {
        showNotification(res.data.message || tMsg('Policies saved', 'Kebijakan berhasil disimpan'), 'success');
      })
      .catch((err) => {
        showNotification(err.response?.data?.detail || tMsg('Failed to save policies', 'Gagal menyimpan kebijakan'), 'error');
      })
      .finally(() => setIsPoliciesSaving(false));
  };

  // Config Save Handler
  const handleSaveConfig = (e) => {
    e.preventDefault();
    setIsConfigSaving(true);
    axios
      .put('/api/admin/config', configData)
      .then((res) => {
        showNotification(res.data.message || tMsg('Config saved', 'Konfigurasi berhasil disimpan'), 'success');
        fetchConfig();
      })
      .catch((err) => {
        showNotification(err.response?.data?.detail || tMsg('Failed to save config', 'Gagal menyimpan konfigurasi'), 'error');
      })
      .finally(() => setIsConfigSaving(false));
  };

  // Maintenance Handlers
  const handleRunCleanupOrphans = () => {
    if (!window.confirm(tMsg('Run database cleanup for orphaned subtasks and comments?', 'Jalankan pembersihan database untuk subtask dan komentar yatim?'))) return;
    setIsCleaningOrphans(true);
    axios
      .post('/api/admin/maintenance/cleanup-orphans')
      .then((res) => {
        showNotification(res.data.message, 'success');
        fetchStats();
      })
      .catch(() => showNotification('Gagal menjalankan pembersihan', 'error'))
      .finally(() => setIsCleaningOrphans(false));
  };

  const handleRunPurgeExpired = () => {
    if (!window.confirm(tMsg('Permanently delete accounts past their 90-day grace period?', 'Hapus permanen akun yang telah melewati masa retensi 90 hari?'))) return;
    setIsPurgingExpired(true);
    axios
      .post('/api/admin/maintenance/purge-expired')
      .then((res) => {
        showNotification(res.data.message, 'success');
        fetchUsers();
        fetchStats();
      })
      .catch(() => showNotification('Gagal membersihkan akun kedaluwarsa', 'error'))
      .finally(() => setIsPurgingExpired(false));
  };

  // Filtered Users
  const filteredUsers = adminUsers.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.full_name && u.full_name.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(userSearchQuery.toLowerCase()));

    if (!matchSearch) return false;

    if (userStatusFilter === 'active') return u.account_status === 'active';
    if (userStatusFilter === 'unverified') return u.is_verified === 0;
    if (userStatusFilter === 'superadmin') return u.is_superadmin === 1;
    if (userStatusFilter === 'frozen') return u.account_status === 'frozen';
    if (userStatusFilter === 'pending_deletion') return u.account_status === 'pending_deletion';
    if (userStatusFilter === 'offboarding') return u.account_status === 'offboarding';
    return true;
  });

  // Filtered Boards
  const filteredAdminBoards = adminBoards.filter((b) => {
    const matchFilter = projectFilter === 'all' || b.owner_status === projectFilter;
    const matchSearch =
      b.name.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
      b.owner_username.toLowerCase().includes(projectSearchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleToggleSelectUser = (username) => {
    if (username === 'admin') return;
    setSelectedUsers((prev) => (prev.includes(username) ? prev.filter((u) => u !== username) : [...prev, username]));
  };

  const handleSelectAllUsers = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.filter((u) => u.username !== 'admin').map((u) => u.username));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleExecuteBulkUsers = () => {
    setIsProcessingBulkUsers(true);
    const promises = selectedUsers.map((username) => {
      if (bulkUserActionType === 'purge') {
        return axios.post('/api/admin/users/delete', { username });
      } else if (bulkUserActionType === 'verify') {
        return axios.put('/api/admin/users/verify', { username, status: '' });
      } else if (bulkUserActionType === 'freeze') {
        return axios.put('/api/admin/users/status', { username, status: 'frozen' });
      } else if (bulkUserActionType === 'soft_delete') {
        return axios.put('/api/admin/users/status', { username, status: 'pending_deletion' });
      }
      return Promise.resolve();
    });

    Promise.allSettled(promises)
      .then((results) => {
        const successes = results.filter((r) => r.status === 'fulfilled').length;
        const failures = results.filter((r) => r.status === 'rejected').length;
        showNotification(
          tMsg(
            `Bulk action completed: ${successes} success, ${failures} failed.`,
            `Aksi massal selesai: ${successes} berhasil, ${failures} gagal.`
          ),
          failures > 0 ? 'info' : 'success'
        );
        fetchUsers();
        fetchStats();
        setSelectedUsers([]);
        setBulkUserConfirmOpen(false);
      })
      .finally(() => setIsProcessingBulkUsers(false));
  };

  const handleExecuteTransfer = (e) => {
    e.preventDefault();
    if (!boardToTransfer || !newOwnerInput.trim()) return;
    setIsTransferring(true);
    axios
      .put(`/api/admin/boards/${boardToTransfer.id}/transfer`, { new_owner: newOwnerInput.trim() })
      .then((res) => {
        showNotification(res.data.message || tMsg('Transferred', 'Proyek berhasil dipindah'), 'success');
        setBoardToTransfer(null);
        setNewOwnerInput('');
        fetchBoards();
        fetchStats();
      })
      .catch((err) => {
        showNotification(err.response?.data?.detail || tMsg('Transfer failed', 'Transfer gagal'), 'error');
      })
      .finally(() => setIsTransferring(false));
  };

  const handleBulkDeleteProjects = () => {
    setIsDeletingBulk(true);
    const promises = boardsToDelete.map((b) => axios.delete(`/api/boards/${b.id}`));
    Promise.allSettled(promises)
      .then((results) => {
        const successes = results.filter((r) => r.status === 'fulfilled').length;
        const failures = results.filter((r) => r.status === 'rejected').length;
        showNotification(
          tMsg(
            `Deleted ${successes} project(s). ${failures ? `${failures} failed.` : ''}`,
            `Berhasil menghapus ${successes} proyek. ${failures ? `${failures} gagal.` : ''}`
          ),
          failures > 0 ? 'info' : 'success'
        );
        setDeleteConfirmOpen(false);
        setBoardsToDelete([]);
        setSelectedBoards([]);
        fetchBoards();
        fetchStats();
      })
      .finally(() => setIsDeletingBulk(false));
  };

  const executeProcessAction = () => {
    if (!userToProcess) return;
    if (processAction === 'promote' || processAction === 'demote') {
      if (handleToggleSuperAdmin) handleToggleSuperAdmin(userToProcess);
    } else if (processAction === 'freeze') {
      if (handleUpdateUserStatus) handleUpdateUserStatus(userToProcess, 'frozen');
    } else if (processAction === 'unfreeze' || processAction === 'restore') {
      if (handleUpdateUserStatus) handleUpdateUserStatus(userToProcess, 'active');
    } else if (processAction === 'verify') {
      if (handleManualVerify) handleManualVerify(userToProcess);
    } else if (processAction === 'offboard') {
      if (handleUpdateUserStatus) handleUpdateUserStatus(userToProcess, 'offboarding', offboardDate);
    } else if (processAction === 'schedule') {
      if (handleUpdateUserStatus) handleUpdateUserStatus(userToProcess, 'pending_deletion');
    } else if (processAction === 'purge') {
      if (handleDeleteUser) handleDeleteUser(userToProcess);
    }
    setUserToProcess(null);
    setConfirmText('');
    setOffboardDate('');
    setTimeout(() => {
      fetchUsers();
      fetchStats();
    }, 500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F3F4F6] dark:bg-[#0d0f11] overflow-y-auto custom-scrollbar text-[#111E38] dark:text-neutral-200">
      {/* ── TOP HEADER / BREADCRUMB ── */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#111E38]/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              window.history.pushState({}, '', '/dashboard');
              window.dispatchEvent(new CustomEvent('alurku-navigate'));
            }}
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[#111E38] dark:text-white transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
            title={tMsg('Back to Dashboard', 'Kembali ke Dasbor')}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="hidden sm:inline">{tMsg('Dashboard', 'Dasbor')}</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FACC15] animate-pulse"></span>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-[#111E38] dark:text-white flex items-center gap-2">
                <span>🛡️</span> {tMsg('Admin Control Center', 'Pusat Kendali Admin')}
              </h1>
            </div>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
              {tMsg('Manage workspace members, projects, security policies, and system credentials.', 'Kelola anggota workspace, proyek, kebijakan keamanan, dan konfigurasi sistem.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              fetchStats();
              fetchUsers();
              if (activeTab === 'projects') fetchBoards();
              if (activeTab === 'policies') fetchPolicies();
              showNotification(tMsg('Refreshed data', 'Data diperbarui'), 'info');
            }}
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[#111E38] dark:text-white transition-colors"
            title={tMsg('Refresh', 'Segarkan Data')}
          >
            <span className={`material-symbols-outlined text-[18px] ${isStatsLoading ? 'animate-spin' : ''}`}>refresh</span>
          </button>
          <span className="px-3 py-1 bg-[#FACC15] text-[#111E38] font-black text-xs rounded-full shadow-2xs border border-amber-400/80">
            Super Admin
          </span>
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* ── STATS SUMMARY CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Users */}
          <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-4 rounded-2xl shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{tMsg('Total Users', 'Total Pengguna')}</span>
              <span className="material-symbols-outlined text-[20px] text-blue-500">group</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#111E38] dark:text-white">
                {stats?.users?.total ?? adminUsers.length}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {stats?.users?.verified ?? 0} {tMsg('verified', 'terverifikasi')}
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2 flex gap-2">
              <span>👑 {stats?.users?.superadmins ?? 0} admin</span>
              <span>❄️ {stats?.users?.frozen ?? 0} beku</span>
            </div>
          </div>

          {/* Card 2: Projects */}
          <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-4 rounded-2xl shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{tMsg('Projects', 'Direktori Proyek')}</span>
              <span className="material-symbols-outlined text-[20px] text-amber-500">folder_open</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#111E38] dark:text-white">
                {stats?.projects?.total ?? adminBoards.length}
              </span>
              <span className="text-[11px] font-bold text-neutral-500">
                {tMsg('spaces', 'ruang')}
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2">
              {adminBoards.filter((b) => b.owner_status === 'orphan').length} {tMsg('orphaned projects', 'proyek yatim')}
            </div>
          </div>

          {/* Card 3: Tasks & Workload */}
          <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-4 rounded-2xl shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{tMsg('Total Tasks', 'Total Tugas')}</span>
              <span className="material-symbols-outlined text-[20px] text-emerald-500">task_alt</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#111E38] dark:text-white">
                {stats?.tasks?.total ?? 0}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {stats?.tasks?.completed ?? 0} {tMsg('done', 'selesai')}
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2 flex gap-2">
              <span>📋 {stats?.tasks?.subtasks ?? 0} subtasks</span>
              <span>💬 {stats?.tasks?.comments ?? 0} msgs</span>
            </div>
          </div>

          {/* Card 4: System Health */}
          <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-4 rounded-2xl shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{tMsg('System Health', 'Kesehatan Sistem')}</span>
              <span className="material-symbols-outlined text-[20px] text-purple-500">dns</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {tMsg('All Systems Operational', 'Semua Berjalan Normal')}
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2 flex gap-2">
              <span>DB: Online</span>
              <span>AI: {stats?.system_health?.gemini_configured || stats?.system_health?.groq_configured ? 'Ready' : 'Not Set'}</span>
            </div>
          </div>
        </div>

        {/* ── TAB NAVIGATION BAR ── */}
        <div className="flex items-center gap-1 sm:gap-2 p-1.5 bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl shadow-2xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <span>👥</span> {tMsg('Users & Accounts', 'Pengguna & Akun')} ({adminUsers.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <span>📁</span> {tMsg('Project Directory', 'Direktori Proyek')} ({adminBoards.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('policies')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'policies'
                ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <span>🛡️</span> {tMsg('Organization Policies', 'Kebijakan & Keamanan')}
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isSudoVerified) {
                setShowSudoModal(true);
              } else {
                setActiveTab('config');
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'config'
                ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <span>⚙️</span> {tMsg('System Config & APIs', 'Konfigurasi Sistem & API')}
            {!isSudoVerified && <span className="material-symbols-outlined text-[13px] opacity-70">lock</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('maintenance')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'maintenance'
                ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <span>🧹</span> {tMsg('Health & Maintenance', 'Pemeliharaan & Diagnostik')}
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 1: USERS & ACCOUNTS
           ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-4 rounded-2xl shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-400 text-[18px]">search</span>
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder={tMsg('Search users, email, name...', 'Cari username, nama, email...')}
                  className="w-full pl-9 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
                {[
                  { id: 'all', label: tMsg('All', 'Semua') },
                  { id: 'active', label: tMsg('Active', 'Aktif') },
                  { id: 'unverified', label: tMsg('Unverified', 'Belum Verif') },
                  { id: 'superadmin', label: 'Super Admin' },
                  { id: 'frozen', label: tMsg('Frozen', 'Dibekukan') },
                  { id: 'pending_deletion', label: tMsg('Deleting Soon', 'Akan Dihapus') },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setUserStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      userStatusFilter === tab.id
                        ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38]'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bulk User Bar */}
            {selectedUsers.length > 0 && (
              <div className="bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-black">
                  <span className="material-symbols-outlined text-[18px]">checklist</span>
                  <span>{selectedUsers.length} {tMsg('users selected', 'pengguna dipilih')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setBulkUserActionType('verify');
                      setBulkUserConfirmOpen(true);
                    }}
                    className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold cursor-pointer"
                  >
                    {tMsg('Verify All', 'Verifikasi Semua')}
                  </button>
                  <button
                    onClick={() => {
                      setBulkUserActionType('freeze');
                      setBulkUserConfirmOpen(true);
                    }}
                    className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold cursor-pointer"
                  >
                    {tMsg('Freeze All', 'Bekukan Semua')}
                  </button>
                  <button
                    onClick={() => {
                      setBulkUserActionType('soft_delete');
                      setBulkUserConfirmOpen(true);
                    }}
                    className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                  >
                    {tMsg('Soft Delete (90d)', 'Hapus (90 Hari)')}
                  </button>
                  <button
                    onClick={() => {
                      setBulkUserActionType('purge');
                      setBulkUserConfirmOpen(true);
                    }}
                    className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                  >
                    {tMsg('Purge (Permanent)', 'Hapus Permanen')}
                  </button>
                  <button
                    onClick={() => setSelectedUsers([])}
                    className="px-2 py-1 text-xs opacity-70 hover:opacity-100 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Users Table */}
            <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50 text-[10px] uppercase tracking-wider font-extrabold text-neutral-400">
                      <th className="p-3.5 pl-4 w-10 text-center">
                        <input
                          type="checkbox"
                          onChange={handleSelectAllUsers}
                          checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.filter((u) => u.username !== 'admin').length}
                          className="rounded cursor-pointer"
                        />
                      </th>
                      <th className="p-3.5">{tMsg('User & Email', 'Pengguna & Email')}</th>
                      <th className="p-3.5">{tMsg('Role', 'Peran')}</th>
                      <th className="p-3.5">{tMsg('Status', 'Status')}</th>
                      <th className="p-3.5">{tMsg('Retention / Deletion', 'Masa Retensi')}</th>
                      <th className="p-3.5 pr-4 text-right">{tMsg('Actions', 'Aksi')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50 font-medium">
                    {filteredUsers.map((u) => {
                      const isSelected = selectedUsers.includes(u.username);
                      const isRootAdmin = u.username === 'admin';
                      return (
                        <tr
                          key={u.username}
                          className={`hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors ${
                            isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                          }`}
                        >
                          <td className="p-3.5 pl-4 text-center">
                            {!isRootAdmin && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectUser(u.username)}
                                className="rounded cursor-pointer"
                              />
                            )}
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#111E38] dark:bg-neutral-700 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                {u.username.slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-[#111E38] dark:text-white flex items-center gap-1.5">
                                  <span>@{u.username}</span>
                                  {u.is_verified === 1 && (
                                    <span className="material-symbols-outlined text-[14px] text-blue-500" title="Verified">verified</span>
                                  )}
                                  {u.is_superadmin === 1 && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[9px] font-black">
                                      ADMIN
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-neutral-400 truncate">
                                  {u.email || u.full_name || tMsg('No email provided', 'Email tidak terisi')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
                              {u.is_superadmin === 1 ? 'Super Administrator' : 'Workspace Member'}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {u.account_status === 'active' ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                                {tMsg('Active', 'Aktif')}
                              </span>
                            ) : u.account_status === 'frozen' ? (
                              <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold">
                                {tMsg('Frozen', 'Dibekukan')}
                              </span>
                            ) : u.account_status === 'pending_deletion' ? (
                              <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-[10px] font-bold">
                                {tMsg('Pending Deletion', 'Antrean Hapus')}
                              </span>
                            ) : u.account_status === 'offboarding' ? (
                              <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                                {tMsg('Offboarding', 'Offboarding')}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px] font-bold">
                                {u.account_status || 'Unknown'}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-neutral-400 text-[11px]">
                            {u.deletion_date ? (
                              <span className="text-red-500 font-bold">{u.deletion_date.split(' ')[0]}</span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="p-3.5 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Verify */}
                              {u.is_verified === 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUserToProcess(u.username);
                                    setProcessAction('verify');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] cursor-pointer"
                                  title={tMsg('Manual Verify', 'Verifikasi Manual')}
                                >
                                  {tMsg('Verify', 'Verif')}
                                </button>
                              )}

                              {/* Toggle Role */}
                              {!isRootAdmin && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUserToProcess(u.username);
                                    setProcessAction(u.is_superadmin === 1 ? 'demote' : 'promote');
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-amber-500 cursor-pointer"
                                  title={u.is_superadmin === 1 ? tMsg('Demote to User', 'Turunkan ke Pengguna') : tMsg('Promote to Admin', 'Jadikan Admin')}
                                >
                                  <span className="material-symbols-outlined text-[16px]">
                                    {u.is_superadmin === 1 ? 'shield_person' : 'security'}
                                  </span>
                                </button>
                              )}

                              {/* Freeze / Unfreeze */}
                              {!isRootAdmin && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUserToProcess(u.username);
                                    setProcessAction(u.account_status === 'frozen' ? 'unfreeze' : 'freeze');
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-cyan-500 cursor-pointer"
                                  title={u.account_status === 'frozen' ? tMsg('Unfreeze Account', 'Cairkan Akun') : tMsg('Freeze Account', 'Bekukan Akun')}
                                >
                                  <span className="material-symbols-outlined text-[16px]">
                                    {u.account_status === 'frozen' ? 'lock_open' : 'lock'}
                                  </span>
                                </button>
                              )}

                              {/* Offboard / Delete */}
                              {!isRootAdmin && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteChoiceUser(u.username);
                                    setShowDeleteChoice(true);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-400 hover:text-red-500 cursor-pointer"
                                  title={tMsg('Delete or Offboard', 'Hapus atau Offboard')}
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-12 text-center text-neutral-400 font-bold">
                          {tMsg('No users found.', 'Tidak ada pengguna ditemukan.')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 2: PROJECT DIRECTORY
           ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-4 rounded-2xl shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-400 text-[18px]">search</span>
                <input
                  type="text"
                  value={projectSearchQuery}
                  onChange={(e) => setProjectSearchQuery(e.target.value)}
                  placeholder={tMsg('Search projects or owner...', 'Cari proyek atau pemilik...')}
                  className="w-full pl-9 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                />
              </div>

              <div className="flex items-center gap-1">
                {[
                  { id: 'all', label: tMsg('All Projects', 'Semua Proyek') },
                  { id: 'orphan', label: tMsg('Orphaned Projects', 'Proyek Yatim') },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setProjectFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      projectFilter === tab.id
                        ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38]'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl shadow-2xs overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50 text-[10px] uppercase tracking-wider font-extrabold text-neutral-400">
                    <th className="p-3.5 pl-4">{tMsg('Project Name', 'Nama Proyek')}</th>
                    <th className="p-3.5">{tMsg('Current Owner', 'Pemilik Saat Ini')}</th>
                    <th className="p-3.5">{tMsg('Owner Status', 'Status Pemilik')}</th>
                    <th className="p-3.5">{tMsg('Created Date', 'Tanggal Dibuat')}</th>
                    <th className="p-3.5 pr-4 text-right">{tMsg('Actions', 'Aksi')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50 font-medium">
                  {filteredAdminBoards.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="p-3.5 pl-4 font-bold text-[#111E38] dark:text-white">
                        📁 {b.name}
                      </td>
                      <td className="p-3.5 text-neutral-600 dark:text-neutral-300">
                        @{b.owner_username}
                      </td>
                      <td className="p-3.5">
                        {b.owner_status === 'orphan' ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                            ⚠️ {tMsg('Orphaned (No Owner)', 'Yatim (Tanpa Pemilik)')}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                            {b.owner_status}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-neutral-400 text-[11px]">
                        {b.created_at ? b.created_at.split('T')[0] : '—'}
                      </td>
                      <td className="p-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setBoardToTransfer(b);
                              setNewOwnerInput('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-[11px] cursor-pointer"
                          >
                            {tMsg('Transfer Ownership', 'Pindah Pemilik')}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setBoardsToDelete([b]);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-400 hover:text-red-500 cursor-pointer"
                            title={tMsg('Delete Project', 'Hapus Proyek')}
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAdminBoards.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-neutral-400 font-bold">
                        {tMsg('No projects found.', 'Tidak ada proyek ditemukan.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 3: ORGANIZATION POLICIES & SECURITY
           ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'policies' && (
          <form onSubmit={handleSavePolicies} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: Organization Identity & Defaults */}
              <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-3xl shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="material-symbols-outlined text-blue-500">apartment</span>
                  <h3 className="text-sm font-extrabold text-[#111E38] dark:text-white">
                    {tMsg('Organization Identity & Defaults', 'Identitas Organisasi & Bawaan')}
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    {tMsg('Organization / Workspace Brand Name', 'Nama Organisasi / Brand Workspace')}
                  </label>
                  <input
                    type="text"
                    value={policies.org_name}
                    onChange={(e) => setPolicies({ ...policies, org_name: e.target.value })}
                    className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                    placeholder="alurku."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    {tMsg('Default Application Language', 'Bahasa Default Aplikasi')}
                  </label>
                  <select
                    value={policies.default_language}
                    onChange={(e) => setPolicies({ ...policies, default_language: e.target.value })}
                    className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none focus:border-[#111E38] dark:focus:border-[#FACC15] cursor-pointer"
                  >
                    <option value="id">Bahasa Indonesia (ID) — Default</option>
                    <option value="en">English (EN)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    {tMsg('Max File Upload Limit (MB)', 'Batas Maksimal Ukuran Unggah File (MB)')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={policies.max_upload_size_mb}
                    onChange={(e) => setPolicies({ ...policies, max_upload_size_mb: Number(e.target.value) })}
                    className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                  />
                </div>
              </div>

              {/* Box 2: Registration & Access Controls */}
              <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-3xl shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="material-symbols-outlined text-amber-500">lock_person</span>
                  <h3 className="text-sm font-extrabold text-[#111E38] dark:text-white">
                    {tMsg('Registration & Security Policies', 'Registrasi & Kebijakan Keamanan')}
                  </h3>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50">
                  <div>
                    <div className="text-xs font-bold text-[#111E38] dark:text-white">
                      {tMsg('Allow Public Self-Registration', 'Izinkan Pendaftaran Publik Mandiri')}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      {tMsg('When disabled, only admins can create new accounts.', 'Jika dinonaktifkan, hanya admin yang bisa menambahkan akun baru.')}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={policies.allow_public_signup}
                    onChange={(e) => setPolicies({ ...policies, allow_public_signup: e.target.checked })}
                    className="w-5 h-5 accent-[#111E38] dark:accent-[#FACC15] cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    {tMsg('Restricted Email Domains (Whitelist)', 'Pembatasan Domain Email (Whitelist)')}
                  </label>
                  <input
                    type="text"
                    value={policies.allowed_domains}
                    onChange={(e) => setPolicies({ ...policies, allowed_domains: e.target.value })}
                    className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                    placeholder="e.g. company.com, agency.id (kosongkan untuk bebas)"
                  />
                  <span className="text-[10px] text-neutral-400 mt-1 block">
                    {tMsg('Separate multiple domains with commas. Leave blank to allow any email.', 'Pisahkan domain dengan koma. Kosongkan jika mengizinkan semua email.')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      {tMsg('Session Timeout (Days)', 'Durasi Sesi Login (Hari)')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={policies.session_duration_days}
                      onChange={(e) => setPolicies({ ...policies, session_duration_days: Number(e.target.value) })}
                      className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      {tMsg('Soft Delete Grace (Days)', 'Retensi Hapus Akun (Hari)')}
                    </label>
                    <input
                      type="number"
                      min="7"
                      max="365"
                      value={policies.soft_delete_grace_days}
                      onChange={(e) => setPolicies({ ...policies, soft_delete_grace_days: Number(e.target.value) })}
                      className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                    />
                  </div>
                </div>
              </div>

              {/* Box 3: AI Assistant & Automation Policies */}
              <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-3xl shadow-2xs space-y-4 md:col-span-2">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="material-symbols-outlined text-purple-500">auto_awesome</span>
                  <h3 className="text-sm font-extrabold text-[#111E38] dark:text-white">
                    {tMsg('AI Assistant & Automation Policies (Luruka AI)', 'Kebijakan Asisten AI & Otomasi (Luruka AI)')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      {tMsg('Primary AI Engine Provider', 'Penyedia Model AI Utama')}
                    </label>
                    <select
                      value={policies.default_ai_engine}
                      onChange={(e) => setPolicies({ ...policies, default_ai_engine: e.target.value })}
                      className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none focus:border-[#111E38] dark:focus:border-[#FACC15] cursor-pointer"
                    >
                      <option value="auto">Auto (Gemini & Groq Fallback)</option>
                      <option value="gemini">Google Gemini 2.5 Flash</option>
                      <option value="groq">Groq (Llama 3.3 70B Versatile)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50">
                    <div>
                      <div className="text-xs font-bold text-[#111E38] dark:text-white">
                        {tMsg('Proactive Deadline Nudge', 'Pengingat Deadline Otomatis')}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {tMsg('AI nudges tasks nearing due date.', 'AI mengingatkan tugas mendekati deadline.')}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={policies.enable_proactive_nudge}
                      onChange={(e) => setPolicies({ ...policies, enable_proactive_nudge: e.target.checked })}
                      className="w-5 h-5 accent-[#111E38] dark:accent-[#FACC15] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50">
                    <div>
                      <div className="text-xs font-bold text-[#111E38] dark:text-white">
                        {tMsg('Automatic Subtask Breakdown', 'Pemecahan Subtask Otomatis')}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {tMsg('AI generates suggested subtasks.', 'AI otomatis memecah tugas kompleks.')}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={policies.enable_auto_subtasks}
                      onChange={(e) => setPolicies({ ...policies, enable_auto_subtasks: e.target.checked })}
                      className="w-5 h-5 accent-[#111E38] dark:accent-[#FACC15] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPoliciesSaving}
                className="px-8 py-3 bg-[#FACC15] hover:bg-amber-400 text-[#111E38] font-black text-xs rounded-2xl shadow-md border border-amber-400/80 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>{isPoliciesSaving ? tMsg('Saving...', 'Menyimpan...') : tMsg('Save Organization Policies', 'Simpan Kebijakan Organisasi')}</span>
              </button>
            </div>
          </form>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 4: SYSTEM CONFIG & APIS (SUDO GATED)
           ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'config' && (
          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Database & Security Keys */}
              <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-3xl shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="material-symbols-outlined text-blue-500">database</span>
                  <h3 className="text-sm font-extrabold text-[#111E38] dark:text-white">
                    {tMsg('Database & Security Keys', 'Database & Kunci Keamanan')}
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    PostgreSQL Database URL
                  </label>
                  <div className="relative">
                    <input
                      type={showPass.db ? 'text' : 'password'}
                      value={configData.database_url}
                      onChange={(e) => setConfigData({ ...configData, database_url: e.target.value })}
                      className="w-full p-3 pr-10 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                      placeholder="postgresql://user:password@host:5432/dbname"
                    />
                    <button
                      type="button"
                      onClick={() => togglePass('db', !showPass.db)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPass.db ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    JWT Secret Key
                  </label>
                  <div className="relative">
                    <input
                      type={showPass.jwt ? 'text' : 'password'}
                      value={configData.secret_key}
                      onChange={(e) => setConfigData({ ...configData, secret_key: e.target.value })}
                      className="w-full p-3 pr-10 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                    />
                    <button
                      type="button"
                      onClick={() => togglePass('jwt', !showPass.jwt)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPass.jwt ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Google Calendar API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showPass.cal ? 'text' : 'password'}
                      value={configData.google_calendar_api_key}
                      onChange={(e) => setConfigData({ ...configData, google_calendar_api_key: e.target.value })}
                      className="w-full p-3 pr-10 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                    />
                    <button
                      type="button"
                      onClick={() => togglePass('cal', !showPass.cal)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPass.cal ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SMTP Mail Server */}
              <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-3xl shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="material-symbols-outlined text-emerald-500">mail</span>
                  <h3 className="text-sm font-extrabold text-[#111E38] dark:text-white">
                    {tMsg('SMTP Email Server (Notifications & OTP)', 'Server Email SMTP (Notifikasi & OTP)')}
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={configData.smtp_server}
                      onChange={(e) => setConfigData({ ...configData, smtp_server: e.target.value })}
                      className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Port
                    </label>
                    <input
                      type="text"
                      value={configData.smtp_port}
                      onChange={(e) => setConfigData({ ...configData, smtp_port: e.target.value })}
                      className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                      placeholder="587"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    SMTP Username / Email
                  </label>
                  <input
                    type="text"
                    value={configData.smtp_username}
                    onChange={(e) => setConfigData({ ...configData, smtp_username: e.target.value })}
                    className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    SMTP Password / App Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass.smtp ? 'text' : 'password'}
                      value={configData.smtp_password}
                      onChange={(e) => setConfigData({ ...configData, smtp_password: e.target.value })}
                      className="w-full p-3 pr-10 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                    />
                    <button
                      type="button"
                      onClick={() => togglePass('smtp', !showPass.smtp)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPass.smtp ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Provider Keys */}
              <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-3xl shadow-2xs space-y-4 md:col-span-2">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="material-symbols-outlined text-amber-500">smart_toy</span>
                  <h3 className="text-sm font-extrabold text-[#111E38] dark:text-white">
                    {tMsg('Artificial Intelligence (AI) API Keys', 'Kunci API Kecerdasan Buatan (AI)')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Google Gemini API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showPass.gemini ? 'text' : 'password'}
                        value={configData.gemini_api_key}
                        onChange={(e) => setConfigData({ ...configData, gemini_api_key: e.target.value })}
                        className="w-full p-3 pr-10 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                      />
                      <button
                        type="button"
                        onClick={() => togglePass('gemini', !showPass.gemini)}
                        className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showPass.gemini ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Groq API Key (Llama 3.3 Fast Inference)
                    </label>
                    <div className="relative">
                      <input
                        type={showPass.groq ? 'text' : 'password'}
                        value={configData.groq_api_key}
                        onChange={(e) => setConfigData({ ...configData, groq_api_key: e.target.value })}
                        className="w-full p-3 pr-10 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                      />
                      <button
                        type="button"
                        onClick={() => togglePass('groq', !showPass.groq)}
                        className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showPass.groq ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isConfigSaving}
                className="px-8 py-3 bg-[#FACC15] hover:bg-amber-400 text-[#111E38] font-black text-xs rounded-2xl shadow-md border border-amber-400/80 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>{isConfigSaving ? tMsg('Updating...', 'Memperbarui...') : tMsg('Save System Configuration', 'Simpan Konfigurasi Sistem')}</span>
              </button>
            </div>
          </form>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 5: SYSTEM HEALTH & MAINTENANCE
           ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Maintenance Tools */}
              <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-3xl shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="material-symbols-outlined text-amber-500">cleaning_services</span>
                  <h3 className="text-sm font-extrabold text-[#111E38] dark:text-white">
                    {tMsg('Database Maintenance Routines', 'Rutinitas Pemeliharaan Database')}
                  </h3>
                </div>

                <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#111E38] dark:text-white">
                      {tMsg('Clean Orphaned Subtasks & Comments', 'Bersihkan Subtask & Komentar Yatim')}
                    </h4>
                    <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">
                      {tMsg(
                        'Removes subtasks and comments that belong to deleted tasks to keep database fast and light.',
                        'Membersihkan record subtask dan komentar yang tugas induknya sudah dihapus untuk mengoptimalkan kecepatan database.'
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRunCleanupOrphans}
                    disabled={isCleaningOrphans}
                    className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">mop</span>
                    <span>{isCleaningOrphans ? tMsg('Cleaning...', 'Membersihkan...') : tMsg('Run Orphan Cleaner', 'Jalankan Pembersih Data Yatim')}</span>
                  </button>
                </div>

                <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#111E38] dark:text-white">
                      {tMsg('Purge Expired Accounts (90+ Days)', 'Hapus Permanen Akun Kedaluwarsa (90+ Hari)')}
                    </h4>
                    <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">
                      {tMsg(
                        'Executes permanent purge for accounts queued for deletion whose 90-day grace period has passed.',
                        'Mengeksekusi penghapusan permanen untuk akun dalam antrean hapus yang telah melewati masa tenggang 90 hari.'
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRunPurgeExpired}
                    disabled={isPurgingExpired}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-950/50 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                    <span>{isPurgingExpired ? tMsg('Purging...', 'Menghapus...') : tMsg('Purge Expired Accounts', 'Hapus Akun Kedaluwarsa')}</span>
                  </button>
                </div>
              </div>

              {/* System Diagnostics */}
              <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-3xl shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="material-symbols-outlined text-blue-500">monitor_heart</span>
                  <h3 className="text-sm font-extrabold text-[#111E38] dark:text-white">
                    {tMsg('System Diagnostics & Status', 'Diagnostik & Status Sistem')}
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800/60">
                    <span className="text-neutral-400">{tMsg('Server Timestamp', 'Waktu Server')}</span>
                    <span className="font-mono font-bold">{stats?.system_health?.server_time || new Date().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800/60">
                    <span className="text-neutral-400">{tMsg('Database Connection', 'Koneksi Database')}</span>
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Connected (PostgreSQL)
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800/60">
                    <span className="text-neutral-400">Google Gemini API</span>
                    <span className={stats?.system_health?.gemini_configured ? 'text-emerald-500 font-bold' : 'text-neutral-400'}>
                      {stats?.system_health?.gemini_configured ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800/60">
                    <span className="text-neutral-400">Groq Llama 3.3</span>
                    <span className={stats?.system_health?.groq_configured ? 'text-emerald-500 font-bold' : 'text-neutral-400'}>
                      {stats?.system_health?.groq_configured ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800/60">
                    <span className="text-neutral-400">SMTP Email Server</span>
                    <span className={stats?.system_health?.smtp_configured ? 'text-emerald-500 font-bold' : 'text-neutral-400'}>
                      {stats?.system_health?.smtp_configured ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SUDO AUTHENTICATION MODAL ── */}
      {showSudoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-100 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121B2D] p-6 sm:p-8 w-full max-w-sm border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl animate-fadeIn text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800">
              <span className="material-symbols-outlined text-[28px]">lock</span>
            </div>
            <h3 className="text-base font-black text-[#111E38] dark:text-white uppercase mb-1">
              {tMsg('Sudo Security Verification', 'Verifikasi Keamanan Sudo')}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              {tMsg('Enter your admin password to view and edit system credentials.', 'Masukkan kata sandi admin Anda untuk melihat dan mengedit kredensial sistem.')}
            </p>

            <form onSubmit={handleSudoVerify} className="space-y-4">
              <div className="relative text-left">
                <input
                  type={showSudoPass ? 'text' : 'password'}
                  autoFocus
                  value={sudoPassword}
                  onChange={(e) => setSudoPassword(e.target.value)}
                  placeholder={tMsg('Admin password...', 'Kata sandi admin...')}
                  className="w-full p-3 pr-10 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSudoPass(!showSudoPass)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showSudoPass ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSudoModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
                >
                  {tMsg('Cancel', 'Batal')}
                </button>
                <button
                  type="submit"
                  disabled={isSudoLoading}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black bg-[#FACC15] hover:bg-amber-400 text-[#111E38] shadow-md border border-amber-400 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSudoLoading ? tMsg('Verifying...', 'Memverifikasi...') : tMsg('Unlock', 'Buka Akses')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TRANSFER PROJECT MODAL ── */}
      {boardToTransfer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-100 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121B2D] p-6 sm:p-8 w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl animate-fadeIn">
            <h3 className="text-base font-black text-[#111E38] dark:text-white uppercase mb-2">
              {tMsg('Transfer Project Ownership', 'Pindahkan Pemilik Proyek')}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              {tMsg('Transfer project', 'Pindahkan kepemilikan proyek')} <strong>"{boardToTransfer.name}"</strong> {tMsg('to a new username:', 'ke username baru:')}
            </p>

            <form onSubmit={handleExecuteTransfer} className="space-y-4">
              <input
                type="text"
                autoFocus
                value={newOwnerInput}
                onChange={(e) => setNewOwnerInput(e.target.value)}
                placeholder={tMsg('New owner username...', 'Username pemilik baru...')}
                className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                required
              />

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setBoardToTransfer(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                >
                  {tMsg('Cancel', 'Batal')}
                </button>
                <button
                  type="submit"
                  disabled={isTransferring}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-[#FACC15] hover:bg-amber-400 text-[#111E38] border border-amber-400 disabled:opacity-50"
                >
                  {isTransferring ? tMsg('Transferring...', 'Memindahkan...') : tMsg('Confirm Transfer', 'Konfirmasi Pindah')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── BULK USER CONFIRMATION MODAL ── */}
      {bulkUserConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-100 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121B2D] p-6 sm:p-8 w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl animate-fadeIn text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-800">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <h3 className="text-base font-black text-[#111E38] dark:text-white uppercase mb-2">
              {tMsg('Confirm Bulk Action', 'Konfirmasi Aksi Massal')}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
              {tMsg(
                `Are you sure you want to execute '${bulkUserActionType}' on ${selectedUsers.length} selected users?`,
                `Apakah Anda yakin ingin menjalankan aksi '${bulkUserActionType}' pada ${selectedUsers.length} pengguna terpilih?`
              )}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBulkUserConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              >
                {tMsg('Cancel', 'Batal')}
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkUsers}
                disabled={isProcessingBulkUsers}
                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-md disabled:opacity-50"
              >
                {isProcessingBulkUsers ? tMsg('Processing...', 'Memproses...') : tMsg('Yes, Proceed', 'Ya, Lanjutkan')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SINGLE USER DELETE CHOICE MODAL ── */}
      {showDeleteChoice && deleteChoiceUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-100 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121B2D] p-6 sm:p-8 w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl animate-fadeIn space-y-4">
            <h3 className="text-base font-black text-[#111E38] dark:text-white uppercase">
              {tMsg('Choose Deletion Method', 'Pilih Metode Penghapusan')}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {tMsg('Action for user:', 'Aksi untuk pengguna:')} <strong>@{deleteChoiceUser}</strong>
            </p>

            <button
              type="button"
              onClick={() => {
                setShowDeleteChoice(false);
                setUserToProcess(deleteChoiceUser);
                setProcessAction('schedule');
              }}
              className="w-full p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60 text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-amber-700 dark:text-amber-300 text-xs">
                🕒 {tMsg('Soft Delete (90-Day Retention)', 'Hapus Bertahap (Masa Tenggang 90 Hari)')}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                {tMsg('Deactivates immediately, queued for permanent deletion in 90 days. Can be restored.', 'Akun dinonaktifkan segera, dapat dipulihkan dalam 90 hari.')}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowDeleteChoice(false);
                setUserToProcess(deleteChoiceUser);
                setProcessAction('purge');
              }}
              className="w-full p-4 rounded-2xl border border-red-200 dark:border-red-800/60 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/60 text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-red-700 dark:text-red-300 text-xs">
                💥 {tMsg('Purge Immediately (Permanent)', 'Hapus Segera (Permanen)')}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                {tMsg('Permanently deletes account and transfers owned projects to admin.', 'Menghapus permanen segera dan mengalihkan proyek ke admin.')}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowDeleteChoice(false);
                setUserToProcess(deleteChoiceUser);
                setProcessAction('offboard');
              }}
              className="w-full p-4 rounded-2xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/60 text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-purple-700 dark:text-purple-300 text-xs">
                🚪 {tMsg('Schedule Offboarding Date', 'Jadwalkan Tanggal Karyawan Keluar')}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                {tMsg('Account stays active until the employee’s last working day.', 'Akun tetap aktif hingga tanggal hari kerja terakhir karyawan.')}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteChoice(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            >
              {tMsg('Cancel', 'Batal')}
            </button>
          </div>
        </div>
      )}

      {/* ── USER PROCESS MODAL (SCHEDULE / PURGE / OFFBOARD / ROLE) ── */}
      {userToProcess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-100 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121B2D] p-6 sm:p-8 w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl animate-fadeIn text-center space-y-4">
            <h3 className="text-base font-black text-[#111E38] dark:text-white uppercase">
              {processAction === 'purge'
                ? tMsg('Purge User Account', 'Hapus Akun Permanen')
                : processAction === 'schedule'
                ? tMsg('Schedule 90-Day Deletion', 'Jadwalkan Penghapusan 90 Hari')
                : processAction === 'offboard'
                ? tMsg('Schedule Offboarding', 'Jadwalkan Offboarding')
                : processAction === 'promote'
                ? tMsg('Promote to Admin', 'Jadikan Super Admin')
                : processAction === 'demote'
                ? tMsg('Demote to User', 'Turunkan ke Pengguna Biasa')
                : processAction === 'freeze'
                ? tMsg('Freeze Account', 'Bekukan Akun')
                : tMsg('Confirm Action', 'Konfirmasi Aksi')}
            </h3>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {tMsg('Target user:', 'Pengguna sasaran:')} <strong className="text-[#111E38] dark:text-white">@{userToProcess}</strong>
            </p>

            {processAction === 'offboard' && (
              <div className="text-left space-y-1">
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                  {tMsg('Last Working Day', 'Hari Kerja Terakhir')}
                </label>
                <input
                  type="date"
                  value={offboardDate}
                  onChange={(e) => setOffboardDate(e.target.value)}
                  className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none"
                  required
                />
              </div>
            )}

            {(processAction === 'purge' || processAction === 'schedule') && (
              <div className="text-left space-y-1">
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                  {tMsg('Type username to confirm:', 'Ketik username untuk konfirmasi:')} <strong>@{userToProcess}</strong>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={`@${userToProcess}`}
                  className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none"
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToProcess(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800"
              >
                {tMsg('Cancel', 'Batal')}
              </button>
              <button
                type="button"
                onClick={executeProcessAction}
                disabled={
                  (processAction === 'purge' || processAction === 'schedule') &&
                  confirmText !== userToProcess &&
                  confirmText !== `@${userToProcess}`
                }
                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-md disabled:opacity-40"
              >
                {tMsg('Confirm', 'Konfirmasi')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PROJECT DELETE CONFIRMATION MODAL ── */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-100 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121B2D] p-6 sm:p-8 w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl animate-fadeIn text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-800">
              <span className="material-symbols-outlined text-[28px]">delete</span>
            </div>
            <h3 className="text-base font-black text-[#111E38] dark:text-white uppercase">
              {tMsg('Delete Project(s)?', 'Hapus Proyek?')}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {tMsg(
                `Are you sure you want to permanently delete ${boardsToDelete.length} project(s)? All tasks within will be deleted.`,
                `Apakah Anda yakin ingin menghapus permanen ${boardsToDelete.length} proyek? Semua tugas di dalamnya akan terhapus.`
              )}
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800"
              >
                {tMsg('Cancel', 'Batal')}
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteProjects}
                disabled={isDeletingBulk}
                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-md disabled:opacity-50"
              >
                {isDeletingBulk ? tMsg('Deleting...', 'Menghapus...') : tMsg('Yes, Delete', 'Ya, Hapus')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
