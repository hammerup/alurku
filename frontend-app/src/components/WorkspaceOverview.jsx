import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Avatar } from '../SharedUI';
import { useAppContext } from '../contexts/AppContext';

export default function WorkspaceOverview() {
  const {
    activeWorkspace,
    renameWorkspace,
    renameProject,
    setBoardToDelete,
    boards,
    tasks,
    avatarsMap,
    currentUser,
    language,
    openTeamModal,
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

  // Active projects mapping
  const activeProjects = useMemo(() => {
    return boards
      .filter(b => b.name.toLowerCase() !== 'to-do list' && b.name.toLowerCase() !== 'to-do-list');
  }, [boards]);

  // Paginated/Limited projects
  const displayedProjects = useMemo(() => {
    return showAllProjects ? activeProjects : activeProjects.slice(0, 4);
  }, [activeProjects, showAllProjects]);

  // Task metrics for snapshot
  const todoTasks = tasks.filter(t => (t.status || '').toLowerCase() === 'to do' || (t.status || '').toLowerCase() === 'backlog');
  const doingTasks = tasks.filter(t => (t.status || '').toLowerCase() === 'in progress' || (t.status || '').toLowerCase() === 'doing');
  const doneTasks = tasks.filter(t => (t.status || '').toLowerCase() === 'done');

  const doneThisWeek = doneTasks.length; 
  const remainingTasks = todoTasks.length + doingTasks.length;

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
              onClick={() => openTeamModal(null)} 
              className="bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800 px-4 py-2 rounded-xl text-sm font-bold text-[#111E38] dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
            >
              {tMsg('Manage Team', 'Kelola Anggota')}
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
              const projTasks = tasks.filter(t => t.board_id === proj.id || t.project_name === proj.name);
              const totalProj = projTasks.length;
              const doneProj = projTasks.filter(t => (t.status || '').toLowerCase() === 'done').length;
              const progress = totalProj > 0 ? Math.round((doneProj / totalProj) * 100) : 0;
              const isEditing = editingProjId === proj.id;
              
              return (
                <div key={proj.id} className="bg-white dark:bg-[#121B2D] p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-300 group relative flex flex-col justify-between">
                  {isEditing ? (
                    <form onSubmit={(e) => handleSaveProjectSubmit(e, proj.id)} className="space-y-4 w-full">
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
                          <div className="p-2 bg-[#111E38] dark:bg-slate-800 text-white dark:text-[#FACC15] rounded-xl">
                            <span className="material-symbols-outlined">folder_open</span>
                          </div>
                          
                          {/* Project action menu dropdown */}
                          <div className="relative">
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
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              
              {/* To Do Column Preview */}
              <div className="shrink-0 w-64 space-y-3">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">To Do ({todoTasks.length})</span>
                </div>
                {todoTasks.length > 0 ? (
                  todoTasks.slice(0, 2).map(t => (
                    <div key={t.id} className="bg-[#F3F4F6] dark:bg-[#0d0f11] p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
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
              <div className="shrink-0 w-64 space-y-3">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Doing ({doingTasks.length})</span>
                </div>
                {doingTasks.length > 0 ? (
                  doingTasks.slice(0, 2).map(t => (
                    <div key={t.id} className="bg-[#FACC15]/10 p-4 rounded-xl border border-[#FACC15]/30 shadow-sm">
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
              <div className="shrink-0 w-64 space-y-3">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Done ({doneTasks.length})</span>
                </div>
                {doneTasks.length > 0 ? (
                  doneTasks.slice(0, 2).map(t => (
                    <div key={t.id} className="bg-neutral-50 dark:bg-slate-900/40 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 opacity-75">
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
              <div className="absolute left-11 top-10 bottom-10 w-px bg-neutral-200 dark:bg-neutral-850"></div>
              
              {/* Activity Item 1 */}
              <div className="flex gap-4 relative z-10">
                <div className="shrink-0">
                  <div className="ring-2 ring-white dark:ring-[#121B2D] rounded-full">
                    <Avatar name="Budi Santoso" url="" size="w-10 h-10" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#111E38] dark:text-white leading-snug">
                    <span className="font-extrabold">Budi Santoso</span> {tMsg('pushed 4 commits to', 'mengirim 4 komit ke')} <span className="text-sky-600 dark:text-[#FACC15] font-bold">dev/main-auth</span>
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">2 minutes ago</p>
                  <div className="mt-2.5 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-neutral-850">
                    <p className="text-xs font-mono text-slate-650 dark:text-slate-300">feat: improve login validation logic</p>
                  </div>
                </div>
              </div>

              {/* Activity Item 2 */}
              <div className="flex gap-4 relative z-10">
                <div className="shrink-0">
                  <div className="ring-2 ring-white dark:ring-[#121B2D] rounded-full">
                    <Avatar name="Siti Aminah" url="" size="w-10 h-10" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#111E38] dark:text-white leading-snug">
                    <span className="font-extrabold">Siti Aminah</span> {tMsg('commented on', 'mengomentari')} <span className="text-sky-600 dark:text-[#FACC15] font-bold">Checkout Flow Design</span>
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">1 hour ago</p>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-300 italic text-xs leading-relaxed">
                    "The button placement looks great, but let's check accessibility."
                  </p>
                </div>
              </div>

              {/* Activity Item 3 */}
              <div className="flex gap-4 relative z-10">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-center text-sky-650 dark:text-[#FACC15] ring-2 ring-white dark:ring-[#121B2D]">
                    <span className="material-symbols-outlined text-lg">rocket_launch</span>
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm text-[#111E38] dark:text-white leading-snug">
                    <span className="font-extrabold">System</span> {tMsg('automatically deployed', 'otomatis meluncurkan')} <span className="text-sky-600 dark:text-[#FACC15] font-bold">Production v2.4</span>
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">4 hours ago</p>
                </div>
              </div>
            </div>

            {/* Active Members List */}
            <div className="p-6 bg-neutral-50 dark:bg-slate-900/30 border-t border-neutral-100 dark:border-neutral-800">
              <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Online Now</h3>
              <div className="space-y-4">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar name="Alex Rivera" url="" size="w-8 h-8" />
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border border-white dark:border-[#121B2D] rounded-full"></span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#111E38] dark:text-white">Alex Rivera</p>
                      <p className="text-[10px] text-neutral-400">Working on API</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-[#111E38] dark:hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-base">chat_bubble</span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar name="Linda Chen" url="" size="w-8 h-8" />
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border border-white dark:border-[#121B2D] rounded-full"></span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#111E38] dark:text-white">Linda Chen</p>
                      <p className="text-[10px] text-neutral-400">Reviewing Designs</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-[#111E38] dark:hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-base">chat_bubble</span>
                  </button>
                </div>

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
                {tMsg('Your team is maintaining strong momentum.', 'Tim Anda mempertahankan momentum yang kuat.')} {doneThisWeek > 0 ? `${doneThisWeek} tasks were completed recently.` : 'No tasks completed yet recently, keep it up!'}
              </p>
              
              <div className="flex gap-6">
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-[#FACC15] drop-shadow-sm">{doneTasks.length}</span>
                  <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-1">Total Done</span>
                </div>
                <div className="w-px h-12 bg-indigo-500/30 self-center"></div>
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-white drop-shadow-sm">{remainingTasks}</span>
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
