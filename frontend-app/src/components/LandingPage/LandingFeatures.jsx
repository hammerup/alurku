import React, { useState, useEffect } from 'react';

export default function LandingFeatures({ showAuthForm, language }) {
  const [activeFeatureTab, setActiveFeatureTab] = useState('kanban');
  
  const t = (en, id) => (language === 'id' ? id : en);

  // --- STATE FOR INTERACTIVE MOCKUPS ---

  // 1. Kanban State (Changed PENDING to TO DO)
  const [kanbanCards, setKanbanCards] = useState([
    { id: 1, title: t('Design User Persona & Flow', 'Desain Persona & Alur Pengguna'), column: 'TO DO', tag: 'Design', priority: 'Medium' },
    { id: 2, title: t('Fix DB Connection Pools', 'Perbaiki Connection Pool DB'), column: 'IN PROGRESS', tag: 'Database', priority: 'High' },
    { id: 3, title: t('Implement OAuth2 Login', 'Implementasi Login OAuth2'), column: 'IN PROGRESS', tag: 'Security', priority: 'High' },
    { id: 4, title: t('Optimize Workload Ring SVG', 'Optimasi SVG Ring Beban Kerja'), column: 'DONE', tag: 'Analytics', priority: 'Low' },
  ]);

  const moveKanbanCard = (cardId) => {
    setKanbanCards(prev => prev.map(card => {
      if (card.id === cardId) {
        const columns = ['TO DO', 'IN PROGRESS', 'DONE'];
        const nextIdx = (columns.indexOf(card.column) + 1) % columns.length;
        return { ...card, column: columns[nextIdx] };
      }
      return card;
    }));
  };

  // 2. Card List / To-Do State
  const [todoTasks, setTodoTasks] = useState([
    { id: 1, title: t('Map relational database schemas', 'Petakan skema database relasional'), completed: true },
    { id: 2, title: t('Prepare production staging env', 'Siapkan lingkungan pementasan produksi'), completed: false },
    { id: 3, title: t('Validate SEO dynamic meta crawler tags', 'Validasi tag crawler meta dinamis SEO'), completed: false },
    { id: 4, title: t('Write integration tests for workspace', 'Tulis uji integrasi untuk ruang kerja'), completed: false },
  ]);

  const toggleTodo = (id) => {
    setTodoTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const completedCount = todoTasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / todoTasks.length) * 100);

  // alurku. custom slash menu
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashItems, setSlashItems] = useState([
    { id: 'todo', label: 'To-do list', icon: '☑️' },
    { id: 'h1', label: 'Heading 1', icon: 'H1' },
    { id: 'bullet', label: 'Bulleted list', icon: '•' },
    { id: 'page', label: 'Page', icon: '📄' },
  ]);

  const handleAddTodo = () => {
    const title = language === 'id' ? 'Tugas baru yang ditambahkan' : 'New added task';
    setTodoTasks(prev => [...prev, { id: Date.now(), title, completed: false }]);
    setSlashMenuOpen(false);
  };

  // 3. Gantt Timeline State with color mapping for realistic project tracking (Indigo, Emerald, Rose, Blue)
  const [timelineTasks, setTimelineTasks] = useState([
    { id: 1, role: 'Design', name: t('Research', 'Riset'), start: 10, width: 30, colorClass: 'bg-indigo-500 dark:bg-indigo-600 border-l-indigo-700 text-white' },
    { id: 2, role: 'Frontend', name: t('Interface', 'Antarmuka'), start: 30, width: 45, colorClass: 'bg-emerald-500 dark:bg-emerald-600 border-l-emerald-700 text-white' },
    { id: 3, role: 'Backend', name: t('API Systems', 'Sistem API'), start: 40, width: 35, colorClass: 'bg-rose-500 dark:bg-rose-600 border-l-rose-700 text-white' },
    { id: 4, role: 'Testing', name: t('E2E Audit', 'Audit E2E'), start: 70, width: 20, colorClass: 'bg-blue-500 dark:bg-blue-600 border-l-blue-700 text-white' },
  ]);

  const adjustTimelineWidth = (id, direction) => {
    setTimelineTasks(prev => prev.map(task => {
      if (task.id === id) {
        const delta = direction === 'expand' ? 10 : -10;
        const newWidth = Math.max(15, Math.min(80, task.width + delta));
        return { ...task, width: newWidth };
      }
      return task;
    }));
  };

  // 4. Smart Calendar State
  const [selectedCalDate, setSelectedCalDate] = useState(null);
  const calendarEvents = {
    4: { title: t('Kick-off Meeting', 'Rapat Perdana Proyek'), time: '10:00 AM' },
    12: { title: t('Weekly Sync & Demo', 'Sinkronisasi Mingguan'), time: '02:00 PM' },
    13: { title: t('Beta Release v1.0', 'Rilis Beta v1.0'), time: '09:00 AM' },
    18: { title: t('Sprint Retro', 'Evaluasi Sprint'), time: '04:00 PM' },
    22: { title: t('Feedback Session', 'Sesi Umpan Balik'), time: '11:00 AM' },
  };

  // 5. Workload State
  const [hoveredWorkloadUser, setHoveredWorkloadUser] = useState(null);

  // Auto rotation of tabs (clears if user interacts with the tabs)
  useEffect(() => {
    if (!showAuthForm) {
      const featureIds = ['kanban', 'list', 'timeline', 'calendar', 'analytics'];
      const timer = setInterval(() => {
        setActiveFeatureTab((prev) => {
          const idx = featureIds.indexOf(prev);
          return featureIds[(idx + 1) % featureIds.length];
        });
      }, 10000); 
      return () => clearInterval(timer);
    }
  }, [showAuthForm]);

  const featureIcons = {
    kanban: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    list: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    timeline: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    calendar: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    analytics: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
      </svg>
    )
  };

  const features = [
    {
      id: 'kanban',
      title: t('Playable Kanban Board', 'Papan Kanban Interaktif'),
      desc: t('Click on the cards inside the mockup to shift columns and organize daily priorities in real time.', 'Klik kartu di dalam mockup untuk memindahkan kolom dan mengelola prioritas harian secara langsung.'),
    },
    {
      id: 'list',
      title: t('Interactive Task List', 'Daftar Tugas Interaktif'),
      desc: t('Check off items, watch the status progress bar advance, and click to prompt command blocks.', 'Centang tugas, lihat grafik kemajuan berjalan, dan klik untuk memunculkan blok perintah.'),
    },
    {
      id: 'timeline',
      title: t('Interactive Gantt Timeline', 'Garis Waktu Gantt Dinamis'),
      desc: t('Manage deadlines visually. Click side arrows to extend or shrink task blocks instantly.', 'Kelola tenggat waktu secara visual. Klik panah di ujung baris tugas untuk memperpanjang/memperpendek durasi.'),
    },
    {
      id: 'calendar',
      title: t('Smart Calendar Event Popover', 'Kalender Pintar Popover'),
      desc: t('Click highlighted dates on the calendar mockup to view scheduled project syncs and alerts.', 'Klik tanggal bertanda khusus di mockup kalender untuk melihat info rapat dan notifikasi jadwal.'),
    },
    {
      id: 'analytics',
      title: t('Interactive Load Analytics', 'Analisis Beban Kerja Cerdas'),
      desc: t('Hover over team members to see specific balance warnings, ensuring zero burnout risk.', 'Arahkan kursor pada anggota tim untuk melihat detail status kapasitas kerja dan mencegah burnout.'),
    },
  ];

  const renderFeatureMockup = () => {
    switch (activeFeatureTab) {
      case 'kanban': {
        return (
          <div className="flex flex-col h-full bg-[#F3F4F6]/50 dark:bg-neutral-900/50 p-4 overflow-hidden">
            <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎯 {t('Interactive Demo: Click any card to shift columns', 'Demo Interaktif: Klik kartu untuk geser kolom')}</span>
            </div>
            <div className="flex gap-3 h-full">
              {['TO DO', 'IN PROGRESS', 'DONE'].map((col) => {
                const colCards = kanbanCards.filter(c => c.column === col);
                return (
                  <div key={col} className="flex-1 bg-slate-200/40 dark:bg-neutral-850/60 rounded-2xl p-2.5 flex flex-col gap-2.5 border border-slate-200/50 dark:border-slate-800/40">
                    <div className="flex justify-between items-center px-1 mb-1">
                      <span className="text-[9px] font-extrabold text-[#111E38] dark:text-slate-400 tracking-wider">
                        {col}
                      </span>
                      <span className="text-[9px] bg-slate-355/50 dark:bg-slate-700/60 text-[#111E38] dark:text-slate-300 font-bold px-1.5 py-0.2 rounded-full">
                        {colCards.length}
                      </span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                      {colCards.map((card) => (
                        <div
                          key={card.id}
                          onClick={() => moveKanbanCard(card.id)}
                          className="bg-white dark:bg-neutral-950 rounded-xl p-3 shadow-xs border border-slate-200/60 dark:border-neutral-800/50 hover:border-[#FACC15] dark:hover:border-[#FACC15] hover:scale-[1.03] transition-all duration-200 cursor-pointer select-none group relative"
                        >
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <span className="text-[10px] font-bold text-[#111E38] dark:text-slate-100 leading-tight">
                              {card.title}
                            </span>
                            <span className="text-[7px] font-black tracking-widest text-slate-300 dark:text-slate-600 group-hover:text-[#FACC15] transition-colors">
                              ➔
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-1 border-t border-slate-100 dark:border-slate-900">
                            <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded ${
                              card.priority === 'High' 
                                ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' 
                                : card.priority === 'Medium'
                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {card.priority}
                            </span>
                            <span className="text-[7px] font-bold text-slate-400">
                              #{card.tag}
                            </span>
                          </div>
                        </div>
                      ))}
                      {colCards.length === 0 && (
                        <div className="border border-dashed border-slate-300 dark:border-neutral-800 rounded-xl p-4 text-center text-[10px] text-slate-400">
                          {t('Drop items here', 'Kosong')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      case 'list': {
        return (
          <div className="flex flex-col h-full bg-slate-50/70 dark:bg-neutral-900/50 p-4 relative overflow-hidden">
            {/* Header progress bar */}
            <div className="bg-white dark:bg-neutral-950 border border-slate-200/60 dark:border-neutral-800/85 rounded-2xl p-3.5 mb-3.5 shadow-xs flex justify-between items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-[10px] font-extrabold text-[#111E38] dark:text-slate-200 mb-1.5">
                  <span>📈 {t('Milestone Completion', 'Pencapaian Milestone')}</span>
                  <span className="text-[#111E38] dark:text-[#FACC15]">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#FACC15] h-full transition-all duration-500 rounded-full" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
              <div className="relative shrink-0">
                <button
                  onClick={() => setSlashMenuOpen(!slashMenuOpen)}
                  className="bg-[#FACC15] text-[#111E38] dark:bg-[#111E38] dark:text-[#FACC15] hover:scale-105 active:scale-95 text-[10px] font-bold py-2 px-3 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>+</span> {t('Add Block', 'Tambah')}
                </button>

                {slashMenuOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl shadow-xl z-20 p-1 flex flex-col gap-0.5 animate-fade-up">
                    <div className="text-[8px] font-extrabold text-slate-400 p-1.5 tracking-wider uppercase border-b border-slate-100 dark:border-slate-900">
                      alurku. Blocks
                    </div>
                    {slashItems.map(item => (
                      <button
                        key={item.id}
                        onClick={handleAddTodo}
                        className="flex items-center gap-2 w-full text-left px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-neutral-900 rounded-md text-[10px] text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        <span className="text-xs">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* List entries */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
              {todoTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTodo(task.id)}
                  className="bg-white dark:bg-neutral-955 rounded-xl p-3.5 shadow-xs border border-slate-200/50 dark:border-neutral-800/40 hover:border-slate-350 dark:hover:border-slate-800 flex items-center justify-between gap-3 cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-3.5 w-3/4">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                      task.completed 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-slate-300 dark:border-neutral-700 bg-transparent group-hover:border-[#FACC15]'
                    }`}>
                      {task.completed && <span className="text-[8px] font-black">✓</span>}
                    </div>
                    <span className={`text-[10px] font-bold leading-tight transition-all ${
                      task.completed 
                        ? 'line-through text-slate-400 dark:text-slate-500' 
                        : 'text-[#111E38] dark:text-slate-200'
                    }`}>
                      {task.title}
                    </span>
                  </div>
                  <span className="text-[8px] font-extrabold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {task.completed ? t('Done', 'Selesai') : t('Mark Done', 'Tandai')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case 'timeline': {
        return (
          <div className="flex flex-col h-full bg-slate-50/70 dark:bg-neutral-900/50 p-4 overflow-hidden">
            <div className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">
              <span>📅 {t('Interactive Timeline: Click ◀ / ▶ to adjust schedules', 'Garis Waktu: Klik ◀ / ▶ untuk atur jadwal')}</span>
            </div>
            <div className="flex-1 flex flex-col gap-2.5">
              {timelineTasks.map((task) => (
                <div key={task.id} className="flex gap-4 items-center">
                  <div className="w-20 shrink-0">
                    <span className="text-[10px] font-black text-[#111E38] dark:text-slate-300 block leading-tight">
                      {task.role}
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold block mt-0.5">
                      {task.name}
                    </span>
                  </div>
                  
                  <div className="flex-1 relative h-9 bg-slate-200/30 dark:bg-neutral-950/40 rounded-xl border border-slate-200/50 dark:border-neutral-800/40 overflow-hidden flex items-center px-1">
                    {/* Realistic dynamic colors for Gantt chart bars (Indigo, Emerald, Rose, Blue) instead of brand accent button color */}
                    <div
                      className={`absolute h-7 rounded-lg shadow-sm flex items-center justify-between px-2 text-[9px] font-bold border-l-4 transition-all duration-305 ${task.colorClass}`}
                      style={{ 
                        left: `${task.start}%`, 
                        width: `${task.width}%` 
                      }}
                    >
                      <button
                        onClick={() => adjustTimelineWidth(task.id, 'shrink')}
                        className="text-white hover:scale-125 px-0.5 select-none"
                        title="Shrink"
                      >
                        ◀
                      </button>
                      <span className="truncate mx-1 text-[8px] font-bold tracking-wider text-white">
                        {Math.round(task.width / 5)}d
                      </span>
                      <button
                        onClick={() => adjustTimelineWidth(task.id, 'expand')}
                        className="text-white hover:scale-125 px-0.5 select-none"
                        title="Expand"
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case 'calendar': {
        return (
          <div className="h-full bg-[#F3F4F6]/50 dark:bg-neutral-900/50 p-4 flex flex-col relative overflow-hidden">
            <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
              <span>📅 {t('Click highlighted dates to show events', 'Klik tanggal bertanda untuk info kegiatan')}</span>
            </div>
            
            <div className="grid grid-cols-7 gap-1.5 mb-1.5 text-center text-[9px] font-extrabold text-slate-400 tracking-wider">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 flex-1">
              {Array.from({ length: 28 }).map((_, i) => {
                const dayNum = i + 1;
                const hasEvent = !!calendarEvents[dayNum];
                return (
                  <button
                    key={i}
                    onClick={() => hasEvent && setSelectedCalDate(dayNum)}
                    className={`rounded-xl border flex flex-col justify-between p-1.5 select-none transition-all ${
                      hasEvent 
                        ? 'bg-amber-50/40 border-[#FACC15] dark:bg-neutral-950/80 hover:scale-105 hover:shadow-xs cursor-pointer' 
                        : 'bg-white border-slate-200/50 dark:bg-neutral-955 dark:border-neutral-800/40'
                    }`}
                  >
                    <span className={`text-[8px] font-bold ${
                      hasEvent ? 'text-[#111E38] dark:text-[#FACC15] font-extrabold' : 'text-slate-400'
                    }`}>
                      {dayNum}
                    </span>
                    {hasEvent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15] mx-auto block mb-0.5"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Event Detail Popover inside Mockup */}
            {selectedCalDate && calendarEvents[selectedCalDate] && (
              <div className="absolute inset-0 bg-white/90 dark:bg-neutral-955/95 backdrop-blur-xs flex items-center justify-center p-4 z-20 animate-fade-up">
                <div className="bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-4 rounded-2xl w-full max-w-xs shadow-xl text-center">
                  <div className="text-xl mb-1">📅</div>
                  <h4 className="text-[11px] font-black text-[#111E38] dark:text-white mb-1 uppercase tracking-wider">
                    {t('Schedule Alert', 'Detail Jadwal')}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 mb-2 leading-snug">
                    {calendarEvents[selectedCalDate].title}
                  </p>
                  <div className="bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] text-[8px] font-black py-1 px-3.5 rounded-full inline-block mb-3.5">
                    {calendarEvents[selectedCalDate].time}
                  </div>
                  <button
                    onClick={() => setSelectedCalDate(null)}
                    className="block w-full bg-[#FACC15] text-[#111E38] font-bold text-[9px] py-2 rounded-lg hover:opacity-90 transition-all uppercase tracking-widest"
                  >
                    {t('Close', 'Tutup')}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      }
      case 'analytics': {
        return (
          <div className="flex flex-col h-full bg-slate-50/70 dark:bg-neutral-900/50 p-4 overflow-hidden relative">
            <div className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">
              <span>👥 {t('Team Workload & Capacity Balance', 'Kapasitas Kerja & Keseimbangan Tim')}</span>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              {[
                { name: 'Siti Handayani', role: 'Frontend Engineer', hours: 48, max: 40, status: 'Overloaded', avatar: '👩‍💻' },
                { name: 'Budi Santoso', role: 'UI/UX Designer', hours: 32, max: 40, status: 'Balanced', avatar: '👨‍🎨' },
              ].map((user, idx) => {
                const percent = Math.min(100, (user.hours / user.max) * 100);
                const isOver = user.hours > user.max;
                
                return (
                  <div 
                    key={idx}
                    onMouseEnter={() => setHoveredWorkloadUser(user.name)}
                    onMouseLeave={() => setHoveredWorkloadUser(null)}
                    className="bg-white dark:bg-neutral-950 p-3.5 rounded-2xl shadow-xs border border-slate-200/60 dark:border-neutral-800/50 transition-all hover:border-[#FACC15] hover:scale-[1.01] relative cursor-help"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm shrink-0">{user.avatar}</span>
                        <div>
                          <span className="font-extrabold text-[10px] text-[#111E38] dark:text-slate-100 block leading-tight">
                            {user.name}
                          </span>
                          <span className="text-[7.5px] font-bold text-slate-400 block mt-0.5">
                            {user.role}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[8px] font-black ${isOver ? 'text-red-500' : 'text-blue-500'}`}>
                          {user.hours}h / {user.max}h
                        </span>
                        <span className="text-[7px] text-slate-400 block mt-0.2">
                          {t('weekly load', 'kapasitas mingguan')}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-[#F3F4F6] dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden flex">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    {/* Interactive Tooltip Card */}
                    {hoveredWorkloadUser === user.name && (
                      <div className="absolute left-1/2 -translate-x-1/2 -top-12 bg-[#111E38] text-white dark:bg-white dark:text-[#111E38] p-2 rounded-xl text-[8px] leading-relaxed shadow-lg z-20 w-44 pointer-events-none animate-fade-up text-center font-semibold">
                        {isOver 
                          ? `⚠️ ${t('Warning: Capacity limit exceeded! Redistribute tasks.', 'Peringatan: Melebihi kapasitas! Atur ulang tugas.')}`
                          : `✓ ${t('Healthy load distribution. Ready for sprint.', 'Distribusi sehat. Siap untuk sprint.')}`
                        }
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <>
      {/* Feature Highlight Section */}
      <section
        id="features-section"
        className="py-24 md:py-32 bg-glass-bg dark:bg-[#090D16] border-t border-slate-200/50 dark:border-slate-800/50 relative z-10"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 reveal-on-scroll">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#111E38] dark:text-white mb-6">
              {t('Built for every workflow', 'Didesain untuk Setiap Alur Kerja')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
              {t('Switch seamlessly between multiple views to manage your work exactly how you want. No reloads required.', 'Beralih tampilan secara mulus untuk mengelola pekerjaan sesuai keinginan Anda. Tanpa muat ulang halaman.')}
            </p>
          </div>

          <div
            className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center reveal-on-scroll"
            style={{ animationDelay: '100ms' }}
          >
            <div className="flex flex-col gap-5">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeatureTab(feature.id)}
                  className={`text-left p-6 rounded-[2rem] border transition-all duration-500 ease-out transform ${
                    activeFeatureTab === feature.id
                      ? 'bg-white dark:bg-[#121B2D]/80 border-[#111E38] dark:border-[#FACC15] shadow-[0_20px_50px_rgba(17,30,56,0.06)] dark:shadow-[0_20px_50px_rgba(250,204,21,0.08)] scale-[1.02] -translate-y-1'
                      : 'bg-[#FAFAFA]/40 dark:bg-neutral-900/10 border-neutral-200/40 dark:border-neutral-800/20 hover:bg-white/60 dark:hover:bg-[#121B2D]/30 hover:border-neutral-350 dark:hover:border-neutral-700 hover:scale-[1.01]'
                  }`}
                >
                  <h3
                    className={`text-xl font-black mb-2.5 flex items-center gap-3.5 transition-colors duration-300 ${
                      activeFeatureTab === feature.id
                        ? 'text-[#111E38] dark:text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <span className={`p-2.5 rounded-xl transition-all duration-300 ${activeFeatureTab === feature.id ? 'bg-[#FACC15]/20 text-[#EAB308] dark:text-[#FACC15] scale-110' : 'bg-neutral-100 dark:bg-neutral-800 text-slate-400 dark:text-slate-500'}`}>
                      {featureIcons[feature.id]}
                    </span>{' '}
                    {feature.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed font-semibold transition-colors duration-300 ${
                      activeFeatureTab === feature.id
                        ? 'text-slate-700 dark:text-slate-200'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {feature.desc}
                  </p>
                </button>
              ))}
            </div>

            <div className="relative h-100 sm:h-112.5 lg:h-[500px] w-full rounded-[2.5rem] bg-white dark:bg-[#121B2D]/60 border border-neutral-200/50 dark:border-neutral-800/40 shadow-[0_25px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.25)] overflow-hidden group backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-[#FAFAFA]/50 dark:from-[#121B2D]/10 dark:to-neutral-900/10"></div>
              <div className="absolute inset-x-0 top-0 h-14 bg-white/40 dark:bg-[#090D16]/40 backdrop-blur-md border-b border-neutral-200/30 dark:border-neutral-800/30 flex items-center px-6 gap-2.5 z-10">
                <div className="flex gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-400/90 shadow-sm shadow-red-500/20"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-400/90 shadow-sm shadow-amber-500/20"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-400/90 shadow-sm shadow-emerald-500/20"></div>
                </div>
                <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 mx-auto select-none tracking-widest uppercase">
                  alurku.app - interactive_workspace
                </div>
              </div>
              <div className="absolute inset-x-0 top-14 bottom-0">{renderFeatureMockup()}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Spesifikasi / Enterprise Architecture Section (Bento Layout) */}
      <section
        id="specs-section"
        className="py-24 md:py-32 bg-glass-bg dark:bg-[#090D16] border-t border-slate-200/50 dark:border-slate-800/50 relative z-10"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20 reveal-on-scroll">
            <span className="text-[#111E38] dark:text-[#FACC15] font-extrabold tracking-widest uppercase text-xs mb-3.5 block bg-slate-100 dark:bg-[#FACC15]/10 px-4 py-1.5 rounded-full w-fit mx-auto border border-slate-200 dark:border-[#FACC15]/20">
              {t('Key Features', 'Fitur Unggulan')}
            </span>
            <h2 className="text-3xl md:text-5.5xl font-black tracking-tighter text-[#111E38] dark:text-white mb-6 leading-tight">
              {t('Smart Features to Elevate Your Workflow', 'Fitur Cerdas untuk Menemani Alur Kerjamu')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-semibold max-w-2xl mx-auto text-lg leading-relaxed">
              {t(
                'More than just a to-do list. Designed intuitively to help you and your team hit targets faster — without the stress.',
                'Lebih dari sekadar daftar tugas biasa. Dirancang secara intuitif untuk membantu Anda dan tim mencapai target lebih cepat tanpa stres.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Bento Card 1: Automated AI Planning (Span 2 Columns) */}
            <div className="lg:col-span-2 relative bg-white/70 dark:bg-[#121B2D]/40 backdrop-blur-md border border-neutral-200/40 dark:border-neutral-800/30 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col justify-between group min-h-[500px]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
              
              <div className="space-y-4 max-w-xl">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-650 dark:text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-850 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-black text-[#111E38] dark:text-white tracking-tight text-2xl lg:text-3xl leading-tight">
                  {t('Automated AI Planning', 'Asisten Perencana Otomatis')}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                  {t(
                    "Not sure how to structure a project? Describe your goal to alurku. AI, and it will instantly generate a structured project plan with checkable tasks, subtasks, and duration estimates (ETCs).",
                    "Tidak yakin bagaimana memulai suatu proyek? Jelaskan tujuan besarmu pada AI alurku., dan sistem akan otomatis menyusun rencana proyek terstruktur lengkap dengan sub-tugas dan estimasi waktu."
                  )}
                </p>
              </div>

              {/* Visual Mockup inside Bento Card */}
              <div className="relative bg-white dark:bg-neutral-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-0 shadow-xl overflow-hidden min-h-[260px] flex mt-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 w-full h-full">
                  {/* Left Panel: Goal & Generated Tasks (2/3 width) */}
                  <div className="sm:col-span-2 p-5 flex flex-col gap-4 justify-between h-full bg-white dark:bg-neutral-900 border-r border-slate-100 dark:border-slate-805">
                    <div className="space-y-4">
                      {/* Heading */}
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-xs leading-none">
                          {t("Project goal", "Tujuan proyek")}
                        </h4>
                        <span className="text-[8px] text-slate-400 font-medium block mt-1">
                          {t("AI will break this down for you.", "AI akan menguraikan ini untuk Anda.")}
                        </span>
                      </div>

                      {/* Input Box */}
                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 bg-[#F3F4F6] dark:bg-neutral-955/40 flex justify-between items-center shadow-inner">
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium truncate flex-1 pr-2">
                          {t("Plan marketing campaign...", "Rencanakan kampanye pemasaran...")}
                        </span>
                        <span className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-[9px] flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 font-bold shadow-sm">
                          ✨
                        </span>
                      </div>

                      {/* Generated Tasks list */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                          <span className="text-slate-700 dark:text-slate-300">{t("Generated tasks", "Tugas dihasilkan")}</span>
                          <span className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer font-medium">{t("Deselect all", "Batal semua")}</span>
                        </div>
                        
                        {/* Task items */}
                        <div className="space-y-2">
                          <div className="bg-[#F3F4F6]/85 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-2.5 shadow-sm flex items-start gap-2 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                            <input type="checkbox" readOnly checked className="rounded-sm text-indigo-500 focus:ring-indigo-500 mt-0.5" />
                            <div className="flex-1 space-y-1.5">
                              <span className="font-bold text-[9px] text-slate-800 dark:text-slate-200 leading-tight block">
                                Channel selection & budget
                              </span>
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-700/60 rounded w-5/6"></div>
                              <div className="flex gap-1.5 text-[7px] font-semibold text-slate-400 pt-1">
                                <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded-md text-slate-500">Marketing</span>
                                <span className="text-indigo-500 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-md">@budi</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#F3F4F6]/85 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-2.5 shadow-sm flex items-start gap-2 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                            <input type="checkbox" readOnly checked className="rounded-sm text-indigo-500 focus:ring-indigo-500 mt-0.5" />
                            <div className="flex-1 space-y-1.5">
                              <span className="font-bold text-[9px] text-slate-800 dark:text-slate-200 leading-tight block">
                                Content creation & distribution
                              </span>
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-700/60 rounded w-2/3"></div>
                              <div className="flex gap-1.5 text-[7px] font-semibold text-slate-400 pt-1">
                                <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded-md text-slate-500">Marketing</span>
                                <span className="text-indigo-500 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-md">@budi</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Add to Inbox Action */}
                    <div className="flex justify-end pt-2 mt-2">
                      <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[8px] sm:text-[9px] py-1.5 px-3.5 rounded-lg shadow-sm flex items-center gap-1.5 hover:shadow-md transition-all">
                        <span>+</span> {t("Add to inbox", "Tambah ke inbox")}
                      </button>
                    </div>
                  </div>

                  {/* Right Panel: Inbox Sidebar (1/3 width) */}
                  <div className="p-4 bg-[#F3F4F6]/55 dark:bg-neutral-950/20 flex flex-col justify-between h-full min-h-55">
                    <div className="space-y-4">
                      {/* Inbox Header */}
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                            <span className="text-[10px]">📥</span>
                          </div>
                          <div>
                            <span className="font-black text-[10px] text-slate-800 dark:text-white block leading-none">Inbox</span>
                            <span className="text-[7px] text-slate-400 font-semibold block mt-1">Ready to dispatch</span>
                          </div>
                        </div>
                        <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[8px] font-bold px-1.5 py-0.5 rounded-full">3</span>
                      </div>

                      {/* Inbox Card */}
                      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-805 rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-default space-y-2 relative group">
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 text-[10px]">⋮</div>
                        <div className="flex gap-1.5 text-[7px] font-semibold">
                          <span className="bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-955/40 dark:border-amber-900/50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path></svg>
                            To-do list
                          </span>
                        </div>
                        <span className="font-bold text-[10px] text-slate-800 dark:text-slate-200 leading-tight block pr-4">
                          Campaign objective
                        </span>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800/80 rounded w-5/6"></div>
                        <div className="flex gap-1.5 text-[7px] font-bold pt-1">
                          <span className="bg-red-50 text-red-650 border border-red-100 dark:bg-red-955/30 dark:border-red-900/50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> High priority
                          </span>
                          <span className="bg-[#F3F4F6] border border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 px-1.5 py-0.5 rounded-md">
                            4h
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Workload Analytics (1 Column) */}
            <div className="relative bg-white/70 dark:bg-[#121B2D]/40 backdrop-blur-md border border-neutral-200/40 dark:border-neutral-800/30 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col justify-between group min-h-[500px]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
              
              <div className="space-y-4">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-indigo-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-100 dark:border-emerald-850 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5" />
                  </svg>
                </div>
                <h3 className="font-black text-[#111E38] dark:text-white tracking-tight text-2xl lg:text-3xl leading-tight">
                  {t('Work-Life Balance, Anti-Burnout', 'Kerja Seimbang, Anti-Kewalahan')}
                </h3>
                <p className="text-slate-650 dark:text-slate-400 font-semibold leading-relaxed">
                  {t(
                    "Know the capacity limits of yourself and your team. alurku. visualizes workload in real-time to prevent burnout.",
                    "Ketahui batas kapasitasmu dan timmu. alurku. memvisualisasikan beban kerja secara real time untuk mencegah burnout."
                  )}
                </p>
              </div>

              {/* Workload Visualizer inside Bento Card */}
              <div className="relative bg-white dark:bg-neutral-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-xl overflow-hidden mt-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-2.5 dark:border-slate-800 mb-4">
                  <span className="text-[10px] font-black text-slate-800 dark:text-white flex items-center gap-1">
                    {t('Team Workload', 'Beban Kerja Tim')}
                  </span>
                  <div className="flex gap-2 text-[7px] font-extrabold tracking-wider uppercase">
                    <span className="text-emerald-500">● DONE</span>
                    <span className="text-blue-500">● ACTIVE</span>
                  </div>
                </div>

                {/* Workload List */}
                <div className="space-y-4 text-[10px] sm:text-xs">
                  {/* User siti (Overloaded) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-glass-bg dark:bg-slate-700 flex items-center justify-center text-[10px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
                          👤
                        </div>
                        <span className="font-bold text-[#111E38] dark:text-slate-250">siti</span>
                      </div>
                      <div className="text-right text-[8px] leading-tight font-black">
                        <span className="text-red-500 block">50h ACTIVE / WEEK</span>
                      </div>
                    </div>
                    {/* Segmented Progress Bar */}
                    <div className="w-full bg-glass-bg dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full w-[10%]" title="Done: 10%"></div>
                      <div className="bg-blue-500 h-full w-[15%]" title="Active: 15% z-10"></div>
                      <div className="bg-amber-500 h-full w-[75%]" title="Wait: 75%"></div>
                    </div>
                  </div>

                  {/* User budi (Healthy) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-glass-bg dark:bg-slate-700 flex items-center justify-center text-[10px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
                          👤
                        </div>
                        <span className="font-bold text-[#111E38] dark:text-slate-250">budi</span>
                      </div>
                      <div className="text-right text-[8px] leading-tight font-black">
                        <span className="text-[#2563eb] dark:text-[#38bdf8] block">35h ACTIVE / WEEK</span>
                      </div>
                    </div>
                    {/* Segmented Progress Bar */}
                    <div className="w-full bg-glass-bg dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full w-[40%]" title="Done: 40%"></div>
                      <div className="bg-blue-500 h-full w-[25%]" title="Active: 25%"></div>
                      <div className="bg-amber-500 h-full w-[35%]" title="Wait: 35%"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 3: Visual Workflow (Span 3 Columns) */}
            <div className="lg:col-span-3 relative bg-white/70 dark:bg-[#121B2D]/40 backdrop-blur-md border border-neutral-200/40 dark:border-neutral-800/30 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col md:flex-row gap-12 items-center justify-between group min-h-[400px]">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]"></div>
              
              <div className="space-y-4 max-w-xl">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center border border-amber-100 dark:border-amber-850 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <h3 className="font-black text-[#111E38] dark:text-white tracking-tight text-2xl lg:text-3xl leading-tight">
                  {t('One Screen for All Progress', 'Satu Layar untuk Semua Progres')}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                  {t(
                    "Track your story from project start to finish. With a clean and dynamic view, you always know what is being done, who is doing it, and what needs to be completed next.",
                    "Pantau jalan ceritamu dari awal hingga akhir proyek. Dengan tampilan yang bersih dan dinamis, kamu selalu tahu apa yang sedang dikerjakan, siapa yang mengerjakan, dan apa yang harus diselesaikan selanjutnya."
                  )}
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400 pt-2">
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-505 font-bold">✓</span> {t('Intuitive drag-and-drop', 'Drag-and-drop antar kolom yang intuitif')}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-505 font-bold">✓</span> {t('Interactive timeline (Gantt)', 'Garis waktu interaktif (Gantt Chart)')}
                  </li>
                </ul>
              </div>

              {/* Visual Mockup inside Bento Card */}
              <div className="relative bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-805 rounded-3xl p-6 shadow-xl overflow-hidden w-full md:w-[350px] shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold text-slate-805 dark:text-white">{t('Kanban Flow', 'Alur Kanban')}</span>
                  <span className="text-[10px] bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 py-0.5 px-2 rounded-full font-bold">{t('1 New Task', '1 Tugas Baru')}</span>
                </div>
                <div className="bg-glass-bg dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/60 dark:border-slate-805 shadow-sm flex flex-col gap-2 border-l-4 border-l-amber-500">
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-200 leading-tight">{t('Kanban Feature Development', 'Pengembangan Fitur Kanban')}</span>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        Workflow
                      </span>
                      <span className="text-[9px] font-black bg-amber-50 dark:bg-amber-955/40 text-amber-700 dark:text-amber-400 py-0.5 px-2 rounded-full">{t('New', 'Baru Masuk')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Scroll Down to FAQ */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex justify-center z-30">
          <button
            onClick={() => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#111E38] dark:hover:text-indigo-400 hover:border-indigo-350 dark:hover:border-indigo-700 shadow-sm transition-all animate-bounce"
            title="Next Section"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              ></path>
            </svg>
          </button>
        </div>
      </section>
    </>
  );
}
