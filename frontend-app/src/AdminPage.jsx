import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAppContext } from './hooks/useAppContext';

import AdminStatsCards from './admin/AdminStatsCards';
import AdminUsersTab from './admin/AdminUsersTab';
import AdminProjectsTab from './admin/AdminProjectsTab';
import AdminPoliciesTab from './admin/AdminPoliciesTab';
import AdminMaintenanceTab from './admin/AdminMaintenanceTab';
import AdminContentReviewTab from './admin/AdminContentReviewTab';

export default function AdminPage(props) {
  const context = useAppContext();

  // Accept props or fallback to context
  const adminUsers = props.adminUsers || context.adminUsers || [];
  const setAdminUsers = props.setAdminUsers || context.setAdminUsers;
  const handleDeleteUser = props.handleDeleteUser || context.handleDeleteUser;
  const handleUpdateUserStatus = props.handleUpdateUserStatus || context.handleUpdateUserStatus;
  const handleToggleSuperAdmin = props.handleToggleSuperAdmin || context.handleToggleSuperAdmin;
  const handleManualVerify = props.handleManualVerify || context.handleManualVerify;
  const language = props.language || context.language || 'id';
  const showNotification = props.showNotification || context.showNotification;

  const tMsg = useCallback((en, id) => (language === 'id' ? id : en), [language]);

  // Tabs: 'users' | 'projects' | 'content' | 'policies' | 'maintenance'
  const [activeTab, setActiveTab] = useState('users');

  // Stats State
  const [stats, setStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  // Fetch Stats
  const fetchStats = useCallback(() => {
    axios
      .get('/api/admin/stats')
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setIsStatsLoading(false));
  }, []);

  // Fetch Users
  const fetchUsers = useCallback(() => {
    axios
      .get('/api/admin/users')
      .then((res) => {
        if (setAdminUsers) setAdminUsers(res.data.users || []);
      })
      .catch(() => {});
  }, [setAdminUsers]);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [fetchStats, fetchUsers]);

  const tabs = [
    { id: 'users', label: tMsg('Users & Accounts', 'Pengguna & Akun'), icon: 'group' },
    { id: 'projects', label: tMsg('Project Directory', 'Direktori Proyek'), icon: 'folder_open' },
    { id: 'content', label: tMsg('Content Review', 'Moderasi Konten'), icon: 'content_paste_search' },
    { id: 'policies', label: tMsg('Org Policies', 'Kebijakan Organisasi'), icon: 'shield' },
    { id: 'maintenance', label: tMsg('Maintenance', 'Pemeliharaan'), icon: 'cleaning_services' },
  ];

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
                <span className="material-symbols-outlined text-[20px] text-[#FACC15]">shield</span> 
                {tMsg('Admin Control Center', 'Pusat Kendali Admin')}
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
              showNotification(tMsg('Refreshed data', 'Data diperbarui'), 'info');
            }}
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[#111E38] dark:text-white transition-colors cursor-pointer"
            title={tMsg('Refresh', 'Segarkan Data')}
          >
            <span className={`material-symbols-outlined text-[18px] ${isStatsLoading ? 'animate-spin' : ''}`}>refresh</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* STATS CARDS */}
        <AdminStatsCards stats={stats} adminUsers={adminUsers} language={language} />

        {/* TAB NAVIGATION */}
        <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl shadow-2xs overflow-hidden flex flex-nowrap overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[140px] px-4 py-3 sm:py-4 text-xs font-bold transition-all flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#111E38] dark:border-[#FACC15] text-[#111E38] dark:text-[#FACC15] bg-neutral-50/50 dark:bg-neutral-900/30'
                  : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div className="animate-fadeIn">
          {activeTab === 'users' && (
            <AdminUsersTab
              adminUsers={adminUsers}
              language={language}
              showNotification={showNotification}
              handleDeleteUser={handleDeleteUser}
              handleUpdateUserStatus={handleUpdateUserStatus}
              handleToggleSuperAdmin={handleToggleSuperAdmin}
              handleManualVerify={handleManualVerify}
              fetchUsers={fetchUsers}
              fetchStats={fetchStats}
            />
          )}

          {activeTab === 'projects' && (
            <AdminProjectsTab
              language={language}
              showNotification={showNotification}
              fetchStats={fetchStats}
            />
          )}

          {activeTab === 'content' && (
            <AdminContentReviewTab
              language={language}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'policies' && (
            <AdminPoliciesTab
              language={language}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'maintenance' && (
            <AdminMaintenanceTab
              language={language}
              showNotification={showNotification}
              stats={stats}
              fetchStats={fetchStats}
              fetchUsers={fetchUsers}
            />
          )}
        </div>
      </div>
    </div>
  );
}
