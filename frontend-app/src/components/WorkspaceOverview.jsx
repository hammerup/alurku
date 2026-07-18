import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Avatar } from '../SharedUI';
import { useAppContext } from '../contexts/AppContext';
import { useWebSocket } from '../hooks/useWebSocket';

export default function WorkspaceOverview() {
  const {
    activeWorkspace,
    renameWorkspace,
    renameProject,
    setBoardToDelete,
    boards,
    tasks,
    filteredTasks,
    avatarsMap,
    currentUser,
    language,
    openTeamModal,
    setSelectedBoard,
    viewMode,
    setViewMode,
    setSelectedTask,
    showNotification,
    userDirectory,
    workspaces,
    switchWorkspace,
    fetchWorkspaces,
  } = useAppContext();

  const tMsg = (en, id) => (language === 'id' ? id : en);

  // States
  const [isEditingWsName, setIsEditingWsName] = useState(false);
  const [wsNameInput, setWsNameInput] = useState('');
  const [activeProjMenu, setActiveProjMenu] = useState(null);
  const [members, setMembers] = useState([]);
  
  // Project editing states
  const [editingProjId, setEditingProjId] = useState(null);
  const [editProjName, setEditProjName] = useState('');
  const [editProjDesc, setEditProjDesc] = useState('');

  // Project pagination state
  const [showAllProjects, setShowAllProjects] = useState(false);

  // Workspace member management states
  const [isViewingMembers, setIsViewingMembers] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuggestions, setInviteSuggestions] = useState([]);
  const [inviteIndex, setInviteIndex] = useState(0);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: '',
  });

  const token = localStorage.getItem('alurku_token') || '';
  const { onlineUsers, activityFeed } = useWebSocket(activeWorkspace?.id, token, currentUser);

  const getUserDisplayName = (username) => {
    const member = (members || []).find((m) => m.username === username);
    if (member && member.full_name) return member.full_name;
    const dirUser = (userDirectory || []).find((u) => u.username === username);
    if (dirUser && dirUser.full_name) return dirUser.full_name;
    return username;
  };

  const formatActivityMessage = (username, action, target_title, extra_data) => {
    const isIndo = language === 'id';
    const displayName = getUserDisplayName(username);
    
    if (action === 'task_created') {
      return (
        <p className="text-sm text-[#111E38] dark:text-white leading-snug">
          <span className="font-extrabold">{displayName}</span> {isIndo ? 'membuat tugas baru' : 'created a new task'} <span className="text-sky-600 dark:text-[#FACC15] font-bold">{target_title}</span>
        </p>
      );
    }
    if (action === 'task_status_changed') {
      const newStatus = extra_data?.new_status || 'Pending';
      return (
        <p className="text-sm text-[#111E38] dark:text-white leading-snug">
          <span className="font-extrabold">{displayName}</span> {isIndo ? 'mengubah status tugas' : 'changed status of'} <span className="text-sky-600 dark:text-[#FACC15] font-bold">{target_title}</span> {isIndo ? 'menjadi' : 'to'} <span className="font-extrabold uppercase tracking-wide text-xs px-2 py-0.5 bg-neutral-100 dark:bg-slate-800 rounded">{newStatus}</span>
        </p>
      );
    }
    if (action === 'task_deleted') {
      return (
        <p className="text-sm text-[#111E38] dark:text-white leading-snug">
          <span className="font-extrabold">{displayName}</span> {isIndo ? 'menghapus tugas' : 'deleted task'} <span className="text-neutral-400 font-bold line-through">{target_title}</span>
        </p>
      );
    }
    
    return (
      <p className="text-sm text-[#111E38] dark:text-white leading-snug">
        <span className="font-extrabold">{displayName}</span> {action.replace('_', ' ')} <span className="text-sky-600 dark:text-[#FACC15] font-bold">{target_title}</span>
      </p>
    );
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    try {
      const t = new Date(dateStr.replace(' ', 'T'));
      const diffMs = Date.now() - t.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHr / 24);

      const isIndo = language === 'id';

      if (diffSec < 60) return isIndo ? 'Baru saja' : 'Just now';
      if (diffMin < 60) return isIndo ? `${diffMin} menit yang lalu` : `${diffMin}m ago`;
      if (diffHr < 24) return isIndo ? `${diffHr} jam yang lalu` : `${diffHr}h ago`;
      return isIndo ? `${diffDays} hari yang lalu` : `${diffDays}d ago`;
    } catch (e) {
      return dateStr;
    }
  };

  // Fetch workspace members for active members lists
  useEffect(() => {
    if (activeWorkspace?.id) {
      axios.get(`/api/workspaces/${activeWorkspace.id}/members`)
        .then(res => setMembers(res.data || []))
        .catch(err => console.error('Error fetching workspace members:', err));
    }
  }, [activeWorkspace]);

  // Rename Workspace handler
  const handleRenameWsSubmit = (e) => {
    e.preventDefault();
    if (wsNameInput.trim() && activeWorkspace) {
      renameWorkspace(activeWorkspace.id, wsNameInput.trim());
      setIsEditingWsName(false);
    }
  };

  // Start editing project details
  const startEditingProject = (proj) => {
    setEditingProjId(proj.id);
    setEditProjName(proj.name);
    setEditProjDesc(proj.description || '');
    setActiveProjMenu(null);
  };

  // Save edited project name & description
  const handleSaveProjectSubmit = (e, projId) => {
    e.preventDefault();
    if (editProjName.trim()) {
      renameProject(projId, editProjName.trim(), editProjDesc.trim());
      setEditingProjId(null);
    }
  };

  const handleInviteInputChange = (e) => {
    const val = e.target.value;
    setInviteInput(val);
    if (!val.trim()) {
      setInviteSuggestions([]);
      return;
    }
    const filtered = (userDirectory || []).filter(
      (u) =>
        u.username.toLowerCase().includes(val.toLowerCase()) &&
        u.username.toLowerCase() !== currentUser.toLowerCase()
    );
    setInviteSuggestions(filtered.slice(0, 5));
    setInviteIndex(0);
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteInput.trim() || !activeWorkspace?.id) return;

    setIsInviting(true);
    axios
      .post(`/api/workspaces/${activeWorkspace.id}/invite`, {
        username_or_email: inviteInput.trim(),
        role: inviteRole,
      })
      .then((res) => {
        showNotification(
          tMsg(
            `Successfully invited @${inviteInput.trim()}`,
            `Berhasil mengundang @${inviteInput.trim()}`
          ),
          'success'
        );
        setInviteInput('');
        setInviteSuggestions([]);
        // Refresh members list
        axios.get(`/api/workspaces/${activeWorkspace.id}/members`)
          .then(res => setMembers(res.data || []));
      })
      .catch((err) => {
        showNotification(err.response?.data?.detail || 'Failed to send invite!', 'error');
      })
      .finally(() => {
        setIsInviting(false);
      });
  };

  const handleUpdateRole = (username, newRole) => {
    if (!activeWorkspace?.id) return;

    axios
      .put(`/api/workspaces/${activeWorkspace.id}/members/${username}`, { role: newRole })
      .then((res) => {
        showNotification(
          tMsg(`Successfully updated role for @${username} to ${newRole}`, `Berhasil mengubah peran @${username} menjadi ${newRole}`),
          "success"
        );
        // Refresh members list
        axios.get(`/api/workspaces/${activeWorkspace.id}/members`)
          .then(res => setMembers(res.data || []));
      })
      .catch((err) => {
        showNotification(err.response?.data?.detail || "Failed to update role!", "error");
      });
  };

  const handleRemoveMember = (username) => {
    if (!activeWorkspace?.id) return;

    setConfirmModal({
      isOpen: true,
      title: tMsg('Remove Workspace Member', 'Keluarkan Anggota'),
      message: tMsg(
        `Are you sure you want to remove @${username} from this workspace?`,
        `Apakah Anda yakin ingin mengeluarkan @${username} dari ruang kerja ini?`
      ),
      confirmText: tMsg('Remove', 'Keluarkan'),
      onConfirm: () => {
        axios
          .delete(`/api/workspaces/${activeWorkspace.id}/members/${username}`)
          .then((res) => {
            showNotification(
              tMsg(`Successfully removed @${username}`, `Berhasil mengeluarkan @${username}`),
              "success"
            );
            axios.get(`/api/workspaces/${activeWorkspace.id}/members`)
              .then(res => setMembers(res.data || []));
          })
          .catch((err) => {
            showNotification(err.response?.data?.detail || "Failed to remove member!", "error");
          });
      }
    });
  };

  const handleLeaveWorkspace = () => {
    if (!activeWorkspace?.id) return;

    setConfirmModal({
      isOpen: true,
      title: tMsg('Leave Workspace', 'Keluar dari Ruang Kerja'),
      message: tMsg(
        "Are you sure you want to leave this workspace?",
        "Apakah Anda yakin ingin keluar dari ruang kerja ini?"
      ),
      confirmText: tMsg('Leave', 'Keluar'),
      onConfirm: () => {
        axios
          .delete(`/api/workspaces/${activeWorkspace.id}/members/${currentUser}`)
          .then(async (res) => {
            showNotification(
              tMsg("You have left the workspace successfully.", "Anda berhasil keluar dari ruang kerja."),
              "success"
            );
            setIsViewingMembers(false);
            const updatedList = await fetchWorkspaces();
            if (updatedList && updatedList.length > 0) {
              switchWorkspace(updatedList[0]);
            } else {
              window.location.reload();
            }
          })
          .catch((err) => {
            showNotification(err.response?.data?.detail || "Failed to leave workspace!", "error");
          });
      }
    });
  };

  // Active projects mapping
  const activeProjects = useMemo(() => {
    return boards.filter(b => {
      const nameLower = (b.name || '').toLowerCase().trim();
      return nameLower !== 'to-do list' && nameLower !== 'to-do-list' && nameLower !== 'to do list';
    });
  }, [boards]);

  // Paginated/Limited projects
  const displayedProjects = useMemo(() => {
    return showAllProjects ? activeProjects : activeProjects.slice(0, 4);
  }, [activeProjects, showAllProjects]);

  // Task metrics for snapshot (uses filteredTasks for card list consistency)
  const todoTasks = filteredTasks.filter(t => (t.status || '').toLowerCase() === 'to do' || (t.status || '').toLowerCase() === 'backlog' || (t.status || '').toLowerCase() === 'pending');
  const doingTasks = filteredTasks.filter(t => (t.status || '').toLowerCase() === 'in progress' || (t.status || '').toLowerCase() === 'doing');
  const doneTasks = filteredTasks.filter(t => (t.status || '').toLowerCase() === 'done');

  // Global metrics for Workspace Velocity (always overall view/all tasks)
  const globalDoneTasks = tasks.filter(t => (t.status || '').toLowerCase() === 'done');
  const globalTodoTasks = tasks.filter(t => (t.status || '').toLowerCase() === 'to do' || (t.status || '').toLowerCase() === 'backlog' || (t.status || '').toLowerCase() === 'pending');
  const globalDoingTasks = tasks.filter(t => (t.status || '').toLowerCase() === 'in progress' || (t.status || '').toLowerCase() === 'doing');
  
  const doneThisWeekGlobal = globalDoneTasks.length; 
  const remainingTasksGlobal = globalTodoTasks.length + globalDoingTasks.length;

  if (isViewingMembers) {
    return (
      <div className="flex-1 p-6 md:p-8 bg-[#F3F4F6] dark:bg-[#0d0f11] overflow-y-auto w-full h-full custom-scrollbar">
        {/* Navigation & Header */}
        <div className="mb-8">
          <button
            onClick={() => setIsViewingMembers(false)}
            className="flex items-center gap-2 text-neutral-500 hover:text-[#111E38] dark:hover:text-white mb-4 text-sm font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            {tMsg('Back to Overview', 'Kembali')}
          </button>
          <h1 className="text-3xl md:text-4xl font-black text-[#111E38] dark:text-white tracking-tight">
            {tMsg('Workspace Members', 'Anggota Ruang Kerja')}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-sm font-medium">
            {tMsg('Manage user access and roles for ', 'Kelola hak akses dan peran anggota di ')}
            <span className="font-bold text-[#111E38] dark:text-white">{activeWorkspace?.name}</span>
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left panel: List of Members (8 cols) */}
          <div className="col-span-12 xl:col-span-8 space-y-6">
            <div className="bg-white dark:bg-[#121B2D] p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <h2 className="text-lg font-bold text-[#111E38] dark:text-white mb-4">
                {tMsg('Active Members', 'Anggota Aktif')} ({members.length})
              </h2>
              
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {(() => {
                  const currentUserMember = members.find((m) => m.username === currentUser);
                  const isCurrentUserAdmin = currentUserMember?.role === 'admin' || activeWorkspace?.owner_username === currentUser;

                  return members.map((m, idx) => {
                    const isMemberOwner = activeWorkspace?.owner_username === m.username;
                    const isSelf = m.username === currentUser;

                    return (
                      <div key={idx} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <Avatar name={m.username} url={avatarsMap[m.username]} size="w-11 h-11" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-[#111E38] dark:text-white">
                                {m.full_name || m.username}
                              </p>
                              {isMemberOwner && (
                                <span className="bg-[#111E38] text-white dark:bg-slate-800 dark:text-[#FACC15] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                                  Owner
                                </span>
                              )}
                              {isSelf && (
                                <span className="bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                                  {tMsg('You', 'Anda')}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-450 dark:text-neutral-400">@{m.username}</p>
                            <p className="text-xs text-neutral-405 dark:text-neutral-400 mt-0.5">{m.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* If current user is admin/owner and this member is not the owner, let them change roles */}
                          {isCurrentUserAdmin && !isMemberOwner && !isSelf ? (
                            <select
                              value={m.role || 'member'}
                              onChange={(e) => handleUpdateRole(m.username, e.target.value)}
                              className="bg-neutral-100 dark:bg-slate-800 border border-neutral-250 dark:border-neutral-700 text-xs font-bold text-[#111E38] dark:text-white rounded-lg px-2 py-1 outline-none cursor-pointer"
                            >
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                              <option value="viewer">Viewer</option>
                            </select>
                          ) : (
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                              {m.role || 'member'}
                            </span>
                          )}

                          {/* Action Buttons: Remove Member (Admin only) or Leave Workspace (Self only) */}
                          {isCurrentUserAdmin && !isMemberOwner && !isSelf && (
                            <button
                              onClick={() => handleRemoveMember(m.username)}
                              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors"
                              title={tMsg('Remove Member', 'Keluarkan Anggota')}
                            >
                              <span className="material-symbols-outlined text-lg">person_remove</span>
                            </button>
                          )}

                          {isSelf && !isMemberOwner && (
                            <button
                              onClick={handleLeaveWorkspace}
                              className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:bg-rose-55 dark:hover:bg-rose-950/30 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/30 transition-colors"
                              title={tMsg('Leave Workspace', 'Keluar dari Ruang Kerja')}
                            >
                              <span className="material-symbols-outlined text-sm">logout</span>
                              {tMsg('Leave', 'Keluar')}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* Right panel: Invite Form (4 cols) */}
          {(() => {
            const currentUserMember = members.find((m) => m.username === currentUser);
            const isCurrentUserAdmin = currentUserMember?.role === 'admin' || activeWorkspace?.owner_username === currentUser;
            
            return isCurrentUserAdmin && (
              <div className="col-span-12 xl:col-span-4">
                <div className="bg-white dark:bg-[#121B2D] p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                  <h2 className="text-lg font-bold text-[#111E38] dark:text-white">
                    {tMsg('Invite Member', 'Undang Anggota')}
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {tMsg('Invite a colleague to collaborate in this workspace.', 'Undang rekan untuk berkolaborasi di ruang kerja ini.')}
                  </p>

                  <form onSubmit={handleInviteSubmit} className="space-y-4 pt-2">
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-400 uppercase tracking-widest mb-1.5">
                        {tMsg('Username or Email', 'Nama Pengguna atau Email')}
                      </label>
                      <input
                        type="text"
                        value={inviteInput}
                        onChange={handleInviteInputChange}
                        className="w-full bg-[#F3F4F6] dark:bg-[#0d0f11] border border-neutral-250 dark:border-neutral-800 text-slate-800 dark:text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-neutral-350 dark:focus:border-neutral-700 transition-colors"
                        placeholder="e.g. budi, siti@email.com..."
                        required
                      />

                      {inviteSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl rounded-xl z-50 max-h-40 overflow-y-auto py-1">
                          {inviteSuggestions.map((u, idx) => (
                            <div
                              key={u.username}
                              className={`px-3 py-2 cursor-pointer flex items-center justify-between border-b border-neutral-100 dark:border-neutral-850 last:border-0 transition-colors ${
                                inviteIndex === idx ? 'bg-neutral-100 dark:bg-neutral-800' : 'hover:bg-neutral-50 dark:hover:bg-neutral-850'
                              }`}
                              onClick={() => {
                                setInviteInput(u.username);
                                setInviteSuggestions([]);
                              }}
                            >
                              <span className="text-xs text-[#111E38] dark:text-white font-bold">@{u.username}</span>
                              <span className="text-[10px] text-neutral-450 truncate ml-4">{u.email}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-400 uppercase tracking-widest mb-1.5">
                        {tMsg('Role', 'Peran')}
                      </label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="w-full bg-[#F3F4F6] dark:bg-[#0d0f11] border border-neutral-250 dark:border-neutral-800 text-slate-800 dark:text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-neutral-350 dark:focus:border-neutral-700 transition-colors cursor-pointer"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>

                  <button
                    type="submit"
                    disabled={isInviting}
                    className="w-full py-3 bg-[#FACC15] hover:bg-yellow-400 disabled:bg-yellow-200/50 text-[#111E38] font-bold text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isInviting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#111E38] border-t-transparent"></div>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        {tMsg('Send Invite', 'Kirim Undangan')}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
            );
          })()}
        </div>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-[#111E38]/20 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200">
            <div className="bg-white dark:bg-[#121B2D] p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-2xl w-full max-w-sm">
              <h3 className="text-base font-extrabold text-[#111E38] dark:text-white mb-2">
                {confirmModal.title}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
                {confirmModal.message}
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {tMsg('Cancel', 'Batal')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirmModal.onConfirm) confirmModal.onConfirm();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                  }}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  {confirmModal.confirmText}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 bg-[#F3F4F6] dark:bg-[#0d0f11] overflow-y-auto w-full h-full custom-scrollbar">
      {/* Page Title & Hero */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest">{tMsg('Workspace', 'Ruang Kerja')}</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-xs font-bold text-[#111E38] dark:text-white uppercase tracking-widest">
                {activeWorkspace ? activeWorkspace.name : 'Overview'}
              </span>
            </nav>
            <div className="flex items-center gap-3">
              {isEditingWsName ? (
                <form onSubmit={handleRenameWsSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={wsNameInput}
                    onChange={(e) => setWsNameInput(e.target.value)}
                    className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-lg font-bold rounded-lg text-black dark:text-white outline-none"
                    autoFocus
                  />
                  <button type="submit" className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600">Save</button>
                  <button type="button" onClick={() => setIsEditingWsName(false)} className="px-3 py-1 bg-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-400">Cancel</button>
                </form>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-black text-[#111E38] dark:text-white tracking-tight">
                    {activeWorkspace?.name || 'Main Workspace'}
                  </h1>
                  {activeWorkspace?.owner_username === currentUser && (
                    <button 
                      onClick={() => { setWsNameInput(activeWorkspace?.name || ''); setIsEditingWsName(true); }} 
                      className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                      title="Rename Workspace"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-sm font-medium">
              {tMsg("Overview of all projects and coordination hub.", "Kilasan tentang semua proyek dan pusat koordinasi tim.")}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3 overflow-hidden">
              {members.slice(0, 3).map((m, i) => (
                <div key={i} className="ring-2 ring-white dark:ring-[#121B2D] rounded-full" title={m.username}>
                  <Avatar name={m.username} url={avatarsMap[m.username]} size="w-10 h-10" />
                </div>
              ))}
              {members.length > 3 && (
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FAFAFA] dark:bg-slate-800 ring-2 ring-white dark:ring-[#121B2D] text-[#111E38] dark:text-white font-bold text-xs">
                  +{members.length - 3}
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsViewingMembers(true)} 
              className="bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800 px-4 py-2 rounded-xl text-sm font-bold text-[#111E38] dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
            >
              {tMsg('Manage Member', 'Kelola Anggota')}
            </button>
          </div>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Project Management Section (8 columns) */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#111E38] dark:text-white">{tMsg('Active Projects', 'Proyek Aktif')}</h2>
            {activeProjects.length > 4 && (
              <button 
                onClick={() => setShowAllProjects(!showAllProjects)} 
                className="text-sky-600 dark:text-[#FACC15] text-sm font-bold flex items-center gap-1 hover:underline"
              >
                {showAllProjects ? tMsg('Show Less', 'Tampilkan Lebih Sedikit') : tMsg('View All', 'Lihat Semua')}
                <span className="material-symbols-outlined text-sm">
                  {showAllProjects ? 'expand_less' : 'arrow_forward'}
                </span>
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedProjects.map((proj) => {
              const projTasks = tasks.filter(t => t.board_id && parseInt(t.board_id) === parseInt(proj.id));
              const totalProj = projTasks.length;
              const doneProj = projTasks.filter(t => (t.status || '').toLowerCase() === 'done').length;
              const progress = totalProj > 0 ? Math.round((doneProj / totalProj) * 100) : 0;
              const isEditing = editingProjId === proj.id;
              
              return (
                <div 
                  key={proj.id} 
                  onClick={() => {
                    if (isEditing) return;
                    setSelectedBoard(proj);
                    if (viewMode === 'overview') {
                      setViewMode('kanban');
                    }
                    window.history.pushState({}, '', '/dashboard');
                    window.dispatchEvent(new CustomEvent('alurku-navigate'));
                  }}
                  className="bg-white dark:bg-[#121B2D] p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-300 group relative flex flex-col justify-between cursor-pointer"
                >
                  {isEditing ? (
                    <form 
                      onSubmit={(e) => handleSaveProjectSubmit(e, proj.id)} 
                      onClick={(e) => e.stopPropagation()}
                      className="space-y-4 w-full"
                    >
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5">Project Name</label>
                        <input
                          type="text"
                          value={editProjName}
                          onChange={(e) => setEditProjName(e.target.value)}
                          className="w-full bg-[#F3F4F6] dark:bg-[#0d0f11] border border-neutral-200 dark:border-neutral-800 text-slate-800 dark:text-white text-sm rounded-xl px-3 py-2 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5">Description</label>
                        <textarea
                          value={editProjDesc}
                          onChange={(e) => setEditProjDesc(e.target.value)}
                          className="w-full h-20 bg-[#F3F4F6] dark:bg-[#0d0f11] border border-neutral-200 dark:border-neutral-800 text-slate-800 dark:text-white text-sm rounded-xl px-3 py-2 outline-none resize-none"
                          placeholder={tMsg('Add project description...', 'Tambah deskripsi proyek...')}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button type="submit" className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white dark:bg-[#FACC15] dark:hover:bg-yellow-400 dark:text-[#111E38] text-xs font-bold rounded-lg shadow-sm">Save</button>
                        <button type="button" onClick={() => setEditingProjId(null)} className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-[#111E38] dark:bg-slate-800 text-white dark:text-[#FACC15] rounded-xl">
                              <span className="material-symbols-outlined">folder_open</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {!!proj.is_private && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-450 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-lg" title={tMsg('Private Project', 'Proyek Privat')}>
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                  </svg>
                                  {tMsg('Private', 'Privat')}
                                </span>
                              )}
                              {proj.health_alert?.includes('Attention') && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-red-650 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded-lg animate-pulse" title={tMsg('Attention Needed', 'Butuh Perhatian')}>
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  {tMsg('Attention', 'Perhatian')}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Project action menu dropdown */}
                          <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setActiveProjMenu(activeProjMenu === proj.id ? null : proj.id); }} 
                              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">more_vert</span>
                            </button>
                            {activeProjMenu === proj.id && (
                              <>
                                <div className="fixed inset-0 z-30" onClick={() => setActiveProjMenu(null)}></div>
                                <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg z-40 p-1 text-left">
                                  <button 
                                    onClick={() => startEditingProject(proj)} 
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-semibold"
                                  >
                                    <span className="material-symbols-outlined text-xs">edit</span> {tMsg('Edit Details', 'Ubah Detail')}
                                  </button>
                                  <button 
                                    onClick={() => { setBoardToDelete(proj); setActiveProjMenu(null); }} 
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-600 flex items-center gap-1.5 font-semibold"
                                  >
                                    <span className="material-symbols-outlined text-xs text-red-600">delete</span> {tMsg('Delete', 'Hapus')}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-black text-[#111E38] dark:text-white mb-2 group-hover:text-sky-600 dark:group-hover:text-[#FACC15] transition-colors truncate">
                          {proj.name}
                        </h3>
                        <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium mb-6 line-clamp-2">
                          {proj.description || tMsg('No description provided.', 'Tidak ada deskripsi.')}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-neutral-500 dark:text-neutral-400">Progress</span>
                          <span className="text-[#111E38] dark:text-white">{progress}%</span>
                        </div>
                        <div className="w-full bg-neutral-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-[#FACC15] h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            {activeProjects.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center py-10 text-neutral-500 dark:text-neutral-400 font-medium">
                {tMsg('No active projects found.', 'Tidak ada proyek aktif.')}
              </div>
            )}
          </div>

          {/* Visual Progress: Kanban Preview (Wide) */}
          <div className="bg-white dark:bg-[#121B2D] p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#111E38] dark:text-white">{tMsg('Workflow Snapshot', 'Cuplikan Alur Kerja')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pb-4">
              
              {/* To Do Column Preview */}
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">To Do ({todoTasks.length})</span>
                </div>
                {todoTasks.length > 0 ? (
                  todoTasks.slice(0, 2).map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => setSelectedTask(t)}
                      className="bg-[#F3F4F6] dark:bg-[#0d0f11] p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm cursor-pointer hover:border-neutral-350 dark:hover:border-neutral-700 transition-colors"
                    >
                      <p className="text-sm font-bold text-[#111E38] dark:text-white mb-3 truncate">{t.project_name}</p>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded text-[9px] font-bold uppercase tracking-widest">
                          {t.category || 'Task'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-[#F3F4F6] dark:bg-[#0d0f11] p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm opacity-60">
                    <p className="text-sm font-bold text-[#111E38] dark:text-white mb-3 truncate">Sample: Setup Project Docs</p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded text-[9px] font-bold uppercase tracking-widest">
                        Documentation
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Doing Column Preview */}
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Doing ({doingTasks.length})</span>
                </div>
                {doingTasks.length > 0 ? (
                  doingTasks.slice(0, 2).map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => setSelectedTask(t)}
                      className="bg-[#FACC15]/10 p-4 rounded-xl border border-[#FACC15]/30 shadow-sm cursor-pointer hover:border-[#FACC15]/50 transition-colors"
                    >
                      <p className="text-sm font-bold text-[#111E38] dark:text-white mb-3 truncate">{t.project_name}</p>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-1 bg-[#FACC15] text-[#111E38] rounded text-[9px] font-bold uppercase tracking-widest">
                          In Progress
                        </span>
                        <Avatar name={t.assigned_user || currentUser} url={avatarsMap[t.assigned_user || currentUser]} size="w-6 h-6" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-[#FACC15]/5 p-4 rounded-xl border border-[#FACC15]/20 shadow-sm opacity-60">
                    <p className="text-sm font-bold text-[#111E38] dark:text-white mb-3 truncate">Sample: Design Dashboard UI</p>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 bg-[#FACC15] text-[#111E38] rounded text-[9px] font-bold uppercase tracking-widest">
                        Design
                      </span>
                      <Avatar name={currentUser} url={avatarsMap[currentUser]} size="w-6 h-6" />
                    </div>
                  </div>
                )}
              </div>

              {/* Done Column Preview */}
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Done ({doneTasks.length})</span>
                </div>
                {doneTasks.length > 0 ? (
                  doneTasks.slice(0, 2).map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => setSelectedTask(t)}
                      className="bg-neutral-50 dark:bg-slate-900/40 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 opacity-75 cursor-pointer hover:border-neutral-350 dark:hover:border-neutral-700 transition-colors"
                    >
                      <p className="text-sm font-bold text-neutral-400 dark:text-neutral-500 line-through mb-2 truncate">{t.project_name}</p>
                      <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                    </div>
                  ))
                ) : (
                  <div className="bg-neutral-55 dark:bg-slate-950 p-4 rounded-xl border border-neutral-200 dark:border-neutral-850 opacity-50">
                    <p className="text-sm font-bold text-neutral-450 dark:text-neutral-500 line-through mb-2 truncate">Sample: Project Initialization</p>
                    <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Right side: Team Activity Panel (4 columns) */}
        <div className="col-span-12 xl:col-span-4 flex">
          <div className="bg-white dark:bg-[#121B2D] rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden shadow-sm w-full h-full">
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#111E38] dark:text-white">{tMsg('Team Activity', 'Aktivitas Tim')}</h2>
              <span className="bg-[#FACC15] text-[#111E38] text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                Live
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative">
              {/* Vertical connector line */}
              {activityFeed.length > 0 && (
                <div className="absolute left-11 top-10 bottom-10 w-px bg-neutral-200 dark:bg-neutral-850"></div>
              )}
              
              {activityFeed.slice(0, 10).map((act) => (
                <div key={act.id} className="flex gap-4 relative z-10">
                  <div className="shrink-0">
                    <div className="ring-2 ring-white dark:ring-[#121B2D] rounded-full">
                      <Avatar name={act.username} url={avatarsMap[act.username]} size="w-10 h-10" />
                    </div>
                  </div>
                  <div className="flex-1">
                    {formatActivityMessage(act.username, act.action, act.target_title, act.extra_data)}
                    <p className="text-[11px] text-neutral-400 mt-0.5">{formatTimeAgo(act.created_at)}</p>
                  </div>
                </div>
              ))}

              {activityFeed.length === 0 && (
                <div className="text-center py-10 text-xs text-neutral-450 dark:text-neutral-500">
                  {tMsg('No activity recorded yet.', 'Belum ada aktivitas tercatat.')}
                </div>
              )}
            </div>

            {/* Active Members List */}
            <div className="p-6 bg-neutral-50 dark:bg-slate-900/30 border-t border-neutral-100 dark:border-neutral-800">
              <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Online Now</h3>
              <div className="space-y-4">
                {Array.from(onlineUsers).map((username) => (
                  <div key={username} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar name={username} url={avatarsMap[username]} size="w-8 h-8" />
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border border-white dark:border-[#121B2D] rounded-full"></span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#111E38] dark:text-white">{getUserDisplayName(username)}</p>
                        <p className="text-[10px] text-neutral-450 dark:text-neutral-500">@{username}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {onlineUsers.size === 0 && (
                  <div className="text-center py-4 text-xs text-neutral-450 dark:text-neutral-500">
                    {tMsg('Nobody online', 'Tidak ada yang online')}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Visual Progress: Timeline Summary */}
      <section className="mt-6 mb-10">
        <div className="bg-[#111E38] text-white rounded-2xl p-6 md:p-10 overflow-hidden relative min-h-50 flex items-center shadow-xl">
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
            <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,100 C20,80 40,90 60,70 C80,50 100,60 100,40 L100,100 L0,100 Z" fill="white"></path>
            </svg>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full gap-8">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-3xl font-black mb-3">Workspace Velocity</h2>
              <p className="text-indigo-200 text-sm md:text-base font-medium mb-8 leading-relaxed">
                {tMsg('Your team is maintaining strong momentum.', 'Tim Anda mempertahankan momentum yang kuat.')} {doneThisWeekGlobal > 0 ? `${doneThisWeekGlobal} tasks were completed recently.` : 'No tasks completed yet recently, keep it up!'}
              </p>
              
              <div className="flex gap-6">
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-[#FACC15] drop-shadow-sm">{globalDoneTasks.length}</span>
                  <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-1">Total Done</span>
                </div>
                <div className="w-px h-12 bg-indigo-500/30 self-center"></div>
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-white drop-shadow-sm">{remainingTasksGlobal}</span>
                  <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-1">Remaining</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
