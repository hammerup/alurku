import React, { useState, useEffect } from 'react';

export default function LandingFeatures({ showAuthForm, language }) {
  const [activeFeatureTab, setActiveFeatureTab] = useState('kanban');
  const [kanbanStep, setKanbanStep] = useState(0);
  const [listStep, setListStep] = useState(0);
  const [typedText, setTypedText] = useState('');

  const t = (en, id) => (language === 'id' ? id : en);

  // Auto rotation of tabs
  useEffect(() => {
    if (!showAuthForm) {
      const featureIds = ['kanban', 'list', 'timeline', 'calendar', 'analytics'];
      const timer = setInterval(() => {
        setActiveFeatureTab((prev) => {
          const idx = featureIds.indexOf(prev);
          return featureIds[(idx + 1) % featureIds.length];
        });
      }, 9000); // 9 seconds to allow complete animation sequences
      return () => clearInterval(timer);
    }
  }, [showAuthForm]);

  // Kanban animation timer
  useEffect(() => {
    if (activeFeatureTab === 'kanban') {
      const timer = setInterval(() => {
        setKanbanStep((prev) => (prev + 1) % 3);
      }, 3000);
      return () => clearInterval(timer);
    } else {
      setKanbanStep(0);
    }
  }, [activeFeatureTab]);

  // List animation timer
  useEffect(() => {
    if (activeFeatureTab === 'list') {
      setListStep(0);
      setTypedText('');
      const interval = setInterval(() => {
        setListStep((prev) => (prev + 1) % 4);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeFeatureTab]);

  // Typing simulator for list view
  useEffect(() => {
    if (activeFeatureTab === 'list') {
      if (listStep === 1) {
        let i = 0;
        const txt = t('Fix database connection leak', 'Perbaiki kebocoran koneksi database');
        setTypedText('');
        const timer = setInterval(() => {
          i++;
          setTypedText(txt.slice(0, i));
          if (i >= txt.length) clearInterval(timer);
        }, 50);
        return () => clearInterval(timer);
      } else if (listStep === 0) {
        setTypedText('');
      }
    }
  }, [listStep, activeFeatureTab, language]);

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
      title: t('Kanban Board', 'Papan Kanban'),
      desc: t('Drag-and-drop cards across customizable columns. Perfect for agile workflows and visualizing daily progress.', 'Geser dan letakkan kartu tugas di kolom yang dapat disesuaikan. Sangat cocok untuk alur kerja tangkas (agile) dan memantau progres harian.'),
    },
    {
      id: 'list',
      title: t('Table List', 'Daftar Tabel'),
      desc: t('A compact, spreadsheet-like view for managing tasks. Ideal for bulk actions and quick data entry.', 'Tampilan ringkas mirip spreadsheet untuk mengelola tugas. Sangat ideal untuk aksi massal dan input data yang cepat.'),
    },
    {
      id: 'timeline',
      title: t('Gantt Timeline', 'Garis Waktu Gantt'),
      desc: t('Map out complex project schedules. Drag task edges to adjust durations and balance team workloads visually.', 'Petakan jadwal proyek yang kompleks. Tarik ujung tugas untuk menyesuaikan durasi dan menyeimbangkan kapasitas tim secara visual.'),
    },
    {
      id: 'calendar',
      title: t('Smart Calendar', 'Kalender Pintar'),
      desc: t('Track deadlines effortlessly. Automatically skips weekends and national holidays for accurate planning.', 'Pantau batas waktu tugas dengan mudah. Secara otomatis melewati akhir pekan dan hari libur nasional untuk perencanaan yang akurat.'),
    },
    {
      id: 'analytics',
      title: t('Workload Analytics', 'Analisis Beban Kerja'),
      desc: t('Real-time project health scores, ETC workload distribution, and AI-generated executive summaries.', 'Skor kesehatan proyek real-time, distribusi kapasitas beban kerja (ETC), serta rangkuman eksekutif otomatis dari AI.'),
    },
  ];



  const renderFeatureMockup = () => {
    switch (activeFeatureTab) {
      case 'kanban': {
        const renderKanbanCard = (task, faded = false, extraClasses = '') => (
          <div className={`bg-white dark:bg-neutral-900 border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl shadow-sm flex flex-col gap-2 hover:shadow-md transition-all ease-in-out duration-700 ${faded ? 'opacity-60' : ''} ${extraClasses}`}>
            {/* Top Info Row */}
            <div className="flex justify-between items-center text-[7px] text-slate-400 dark:text-slate-500 font-bold shrink-0">
              <div className="flex items-center gap-1">
                <span className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-500 dark:text-slate-400">{task.folder}</span>
                <span>/</span>
                <span>{task.dept}</span>
              </div>
              <span>{task.date}</span>
            </div>

            {/* Title */}
            <h4 className="font-extrabold text-[9px] text-slate-800 dark:text-slate-200 leading-tight">
              {task.title}
            </h4>

            {/* Badges Row */}
            <div className="flex flex-wrap gap-1 font-black text-[7px] sm:text-[8px] shrink-0">
              {task.badges.map((b, i) => (
                <span key={i} className={`py-0.5 px-1.5 rounded ${b.cls}`}>{b.text}</span>
              ))}
            </div>

            {/* Antrean badge */}
            <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 py-0.5 px-1.5 rounded text-[7px] sm:text-[8px] font-black w-max shrink-0">
              {task.antrean}
            </span>

            {/* Description */}
            <p className="text-[8px] text-slate-400 dark:text-slate-500 leading-relaxed font-medium line-clamp-2">
              {task.desc}
            </p>

            {/* Footer Info */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-850 text-[8px] font-bold text-slate-400 shrink-0">
              <span className="text-[#111E38] dark:text-slate-200 bg-slate-100 dark:bg-slate-800/85 py-0.5 px-1.5 rounded-full font-black">
                @{task.assignee}
              </span>
              <div className="flex items-center gap-2">
                <span>📋 {task.subtasks}</span>
                <span>⏳ {task.time}</span>
              </div>
            </div>
          </div>
        );

        const tasksData = {
          t4: {
            folder: t('To-do List', 'Daftar Tugas'),
            dept: t('Deployment', 'Rilis'),
            date: '27 JUN 2026',
            title: 'ALURKU WEB APP: 4. TESTING, DEPLOYMENT & LAUNCH',
            badges: [
              { text: t('NO DATE', 'TANPA DEADLINE'), cls: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
              { text: 'HIGH', cls: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400' },
              { text: '24H', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500' }
            ],
            antrean: t('Antrean #3 of 3', 'Antrean #3 dari 3'),
            desc: t('Conduct comprehensive testing of the alurku. web application to identify and resolve bugs, ensure functionality, performance, and security.', 'Lakukan pengujian menyeluruh pada aplikasi web alurku. untuk menemukan bug, keamanan, serta performa sebelum rilis resmi.'),
            assignee: 'budi',
            subtasks: '0/5',
            time: '-'
          },
          t3: {
            folder: t('To-do List', 'Daftar Tugas'),
            dept: t('Development', 'Koding'),
            date: '27 JUN 2026',
            title: 'ALURKU WEB APP: 3. FRONTEND & BACKEND DEVELOPMENT',
            badges: [
              { text: t('NO DATE', 'TANPA DEADLINE'), cls: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
              { text: 'HIGH', cls: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400' },
              { text: '80H', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500' }
            ],
            antrean: t('Antrean #2 of 3', 'Antrean #2 dari 3'),
            desc: t('Implement the alurku. web application\'s user interface (frontend) and server-side logic with database integration (backend).', 'Mulai koding antarmuka pengguna (frontend) dan arsitektur database serverless serta integrasi API (backend).'),
            assignee: 'siti',
            subtasks: '0/5',
            time: '-'
          },
          t2: {
            folder: t('To-do List', 'Daftar Tugas'),
            dept: t('Design', 'Desain'),
            date: '27 JUN 2026',
            title: 'ALURKU WEB APP: 2. UI/UX DESIGN & PROTOTYPING',
            badges: [
              { text: t('NO DATE', 'TANPA DEADLINE'), cls: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
              { text: 'HIGH', cls: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400' },
              { text: '16H', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500' }
            ],
            antrean: t('Antrean #1 of 3', 'Antrean #1 dari 3'),
            desc: t('Design the user interface (UI) and user experience (UX) for the alurku. web application based on the requirements.', 'Rancang wireframe, mockup visual, serta prototipe interaktif untuk memetakan alur pengguna agar intuitif.'),
            assignee: 'budi',
            subtasks: '0/5',
            time: '-'
          },
          t1: {
            folder: t('To-do List', 'Daftar Tugas'),
            dept: t('Planning', 'Rencana'),
            date: '27 JUN 2026',
            title: 'ALURKU WEB APP: 1. INITIAL REQUIREMENTS & PLANNING',
            badges: [
              { text: t('NO DATE', 'TANPA DEADLINE'), cls: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
              { text: 'HIGH', cls: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400' },
              { text: '8H', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500' }
            ],
            antrean: t('Antrean #1 of 1', 'Antrean #1 dari 1'),
            desc: t('Conduct detailed discussions with stakeholders to define the core purpose, target audience, and key requirements for the brand web.', 'Lakukan diskusi mendalam bersama klien untuk mematangkan alur kerja utama serta arsitektur brand.'),
            assignee: 'siti',
            subtasks: '0/5',
            time: '-'
          }
        };

        return (
          <div className="flex gap-3 h-full p-3 bg-slate-50 dark:bg-neutral-900 select-none overflow-x-auto text-[9px] text-slate-600 dark:text-slate-350 scrollbar-thin">
            {/* Column 1: PENDING */}
            <div className="flex-1 min-w-[180px] sm:min-w-[220px] bg-slate-100/60 dark:bg-neutral-950 p-2.5 rounded-2xl flex flex-col gap-2.5 h-full overflow-hidden">
              <div className="flex items-center justify-between px-1.5 shrink-0">
                <span className="font-extrabold text-[9px] sm:text-[10px] tracking-wider text-slate-700 dark:text-white uppercase">
                  {t('PENDING', 'PERLU DIKERJAKAN')}
                </span>
                <span className="bg-slate-200 dark:bg-slate-850 text-slate-700 dark:text-slate-300 w-4 h-4 rounded-full flex items-center justify-center font-bold text-[8px]">
                  {kanbanStep === 2 ? 0 : 1}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar pb-2">
                {renderKanbanCard(
                  tasksData.t4,
                  false,
                  `transition-all duration-700 ${
                    kanbanStep === 2
                      ? 'max-h-0 opacity-0 pointer-events-none overflow-hidden mb-0 p-0 border-none'
                      : 'max-h-[300px] opacity-100 mb-2.5'
                  }`
                )}
                {kanbanStep === 2 && (
                  <div className="h-24 border border-dashed border-slate-250 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-300 dark:text-slate-700 font-bold text-[8px]">
                    {t('Empty Column', 'Kolom Kosong')}
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: IN PROGRESS */}
            <div className="flex-1 min-w-[180px] sm:min-w-[220px] bg-slate-100/60 dark:bg-neutral-950 p-2.5 rounded-2xl flex flex-col gap-2.5 h-full overflow-hidden">
              <div className="flex items-center justify-between px-1.5 shrink-0">
                <span className="font-extrabold text-[9px] sm:text-[10px] tracking-wider text-[#2563eb] dark:text-[#38bdf8] uppercase">
                  {t('IN PROGRESS', 'SEDANG JALAN')}
                </span>
                <span className="bg-slate-200 dark:bg-slate-850 text-slate-700 dark:text-slate-300 w-4 h-4 rounded-full flex items-center justify-center font-bold text-[8px]">
                  {kanbanStep === 0 ? 2 : kanbanStep === 1 ? 1 : 2}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar pb-2">
                {renderKanbanCard(
                  tasksData.t2,
                  false,
                  `transition-all duration-700 ${
                    kanbanStep >= 1
                      ? 'max-h-0 opacity-0 pointer-events-none overflow-hidden mb-0 p-0 border-none'
                      : 'max-h-[300px] opacity-100 mb-2.5'
                  }`
                )}
                {renderKanbanCard(tasksData.t3, false, 'max-h-[300px] opacity-100 mb-2.5')}
                {renderKanbanCard(
                  tasksData.t4,
                  false,
                  `transition-all duration-700 ${
                    kanbanStep !== 2
                      ? 'max-h-0 opacity-0 pointer-events-none overflow-hidden mb-0 p-0 border-none'
                      : 'max-h-[300px] opacity-100 mb-2.5'
                  }`
                )}
              </div>
            </div>

            {/* Column 3: DONE */}
            <div className="flex-1 min-w-[180px] sm:min-w-[220px] bg-slate-100/60 dark:bg-neutral-950 p-2.5 rounded-2xl flex flex-col gap-2.5 h-full overflow-hidden">
              <div className="flex items-center justify-between px-1.5 shrink-0">
                <span className="font-extrabold text-[9px] sm:text-[10px] tracking-wider text-slate-700 dark:text-white uppercase">
                  {t('DONE', 'SELESAI')}
                </span>
                <span className="bg-slate-200 dark:bg-slate-850 text-slate-700 dark:text-slate-300 w-4 h-4 rounded-full flex items-center justify-center font-bold text-[8px]">
                  {kanbanStep === 0 ? 1 : 2}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar pb-2">
                {renderKanbanCard(
                  tasksData.t2,
                  true,
                  `transition-all duration-700 ${
                    kanbanStep === 0
                      ? 'max-h-0 opacity-0 pointer-events-none overflow-hidden mb-0 p-0 border-none'
                      : 'max-h-[300px] opacity-60 mb-2.5'
                  }`
                )}
                {renderKanbanCard(tasksData.t1, true, 'max-h-[300px] opacity-60 mb-2.5')}
              </div>
            </div>

            {/* Column 4: REJECTED */}
            <div className="flex-1 min-w-[180px] sm:min-w-[220px] bg-slate-100/60 dark:bg-neutral-950 p-2.5 rounded-2xl flex flex-col gap-2.5 h-full overflow-hidden">
              <div className="flex items-center justify-between px-1.5 shrink-0">
                <span className="font-extrabold text-[9px] sm:text-[10px] tracking-wider text-slate-700 dark:text-white uppercase">
                  {t('REJECTED', 'DITOLAK')}
                </span>
                <span className="bg-slate-200 dark:bg-slate-850 text-slate-700 dark:text-slate-300 w-4 h-4 rounded-full flex items-center justify-center font-bold text-[8px]">
                  0
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar pb-2">
                <div className="h-24 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-300 dark:text-slate-700 font-bold text-[8px]">
                  {t('Empty Column', 'Kolom Kosong')}
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'list': {
        const t5Data = {
          id: 5,
          progress: '0/4',
          title: t('alurku. Web App: 5. Database Connection Optimization', 'Aplikasi Web alurku.: 5. Optimasi Koneksi Database'),
          desc: t('Investigate and resolve potential database connection pool leaks to ensure serverless stability.', 'Selidiki dan perbaiki potensi kebocoran koneksi database serverless untuk menjamin stabilitas sistem.'),
          tags: [t('To-do List', 'Daftar Tugas'), t('Development', 'Koding'), t('Pending', 'Tunda'), 'HIGH', '0/3', '12h'],
          assignee: 'budi'
        };

        const activeListCount = listStep >= 2 ? (listStep === 3 ? 4 : 5) : 4;
        const isT5Completed = listStep === 3;

        return (
          <div className="flex h-full bg-slate-50 dark:bg-neutral-900 select-none text-[10px] text-slate-600 dark:text-slate-300">
            {/* Main Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden p-3 sm:p-4">
              
              {/* Filter Sort Bar */}
              <div className="flex items-center gap-2 mb-3 text-[8px] font-black text-slate-400 dark:text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none pb-1 shrink-0">
                <span className="uppercase tracking-widest text-[7px] text-slate-500 dark:text-slate-400">SORT BY:</span>
                {['Queue', 'Name', 'Status', 'Start Date', 'Deadline', 'Priority'].map((opt) => (
                  <button key={opt} className="hover:text-slate-800 dark:hover:text-white transition-all uppercase tracking-wider">{opt}</button>
                ))}
              </div>

              {/* Quick Add Area */}
              <div className="bg-white dark:bg-neutral-950 border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl mb-3 flex flex-col gap-2 shrink-0 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-amber-500 text-xs shrink-0">✨</span>
                    <input 
                      type="text" 
                      readOnly
                      value={listStep === 1 ? typedText : ''}
                      placeholder={listStep === 1 ? '' : t('New task request title... (Press Enter to submit)', 'Judul pengajuan tugas baru... (Tekan Enter)')}
                      className="bg-transparent border-none text-[9px] font-bold text-slate-700 dark:text-slate-200 outline-none w-full placeholder-slate-400"
                    />
                  </div>
                  <button className={`bg-[#FACC15] text-[#111E38] text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all shrink-0 ${listStep === 2 ? 'scale-105 shadow-md' : 'hover:opacity-90'}`}>
                    {t('Add Task', 'Tambah')}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[8px] font-black text-slate-400 dark:text-slate-500">
                  <span className="bg-slate-50 dark:bg-neutral-900 border px-1.5 py-0.5 rounded flex items-center gap-1">
                    👤 @budi
                  </span>
                  <span className="bg-slate-50 dark:bg-neutral-900 border px-1.5 py-0.5 rounded flex items-center gap-1">
                    {t('Development', 'Pengembangan')} ▾
                  </span>
                  <span className="bg-slate-50 dark:bg-neutral-900 border px-1.5 py-0.5 rounded flex items-center gap-1">
                    {t('Med Impact', 'Dampak Sedang')} ▾
                  </span>
                  <span className="bg-slate-50 dark:bg-neutral-900 border px-1.5 py-0.5 rounded flex items-center gap-1">
                    📅 dd/mm/yyyy
                  </span>
                  <span className="bg-slate-50 dark:bg-neutral-900 border px-1.5 py-0.5 rounded flex items-center gap-1">
                    ⏱ 2
                  </span>
                </div>
              </div>

              {/* Scrollable Tasks Card List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar pb-3">
                {/* Simulated Task 5 (Added dynamically) */}
                <div className={`transition-all duration-700 ease-in-out ${listStep >= 2 ? 'max-h-[200px] opacity-100 overflow-visible mb-2.5' : 'max-h-0 opacity-0 overflow-hidden mb-0 border-none py-0 shadow-none'}`}>
                  <div className="bg-white dark:bg-neutral-950 border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl shadow-sm flex flex-col gap-2 border-l-4 border-l-[#FACC15]">
                    <div className="flex items-start gap-2">
                      <input type="checkbox" checked={isT5Completed} readOnly className="rounded border-slate-300 dark:border-slate-700 text-indigo-650 mt-1 shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 flex-wrap mb-1">
                          <h4 className={`font-extrabold text-[9px] sm:text-[10px] text-slate-800 dark:text-slate-200 leading-tight ${isT5Completed ? 'line-through text-slate-450 dark:text-slate-600' : ''}`}>
                            {t5Data.title}
                          </h4>
                          <span className="text-[7px] text-slate-400 shrink-0">27 Jun 2026 ⇄ {t('No Deadline', 'Tanpa Batas')}</span>
                        </div>
                        <p className="text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed mb-2 truncate-2-lines line-clamp-2">
                          {t5Data.desc}
                        </p>
                        
                        <div className="flex justify-between items-center flex-wrap gap-2 pt-1.5 border-t border-slate-50 dark:border-slate-900">
                          <div className="flex flex-wrap items-center gap-1 text-[7px] sm:text-[8px] font-black">
                            <span className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 py-0.5 px-1.5 rounded">{t5Data.progress}</span>
                            {t5Data.tags.map((tag, i) => {
                              let cls = "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-350";
                              if (tag === 'HIGH' || tag === 'Tinggi') cls = "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400";
                              if (tag.includes('h') || tag.includes('0/')) cls = "bg-slate-50 dark:bg-neutral-900 border text-slate-400 dark:text-slate-500";
                              return (
                                <span key={i} className={`py-0.5 px-1.5 rounded ${cls}`}>{tag}</span>
                              );
                            })}
                          </div>
                          <span className="text-[8px] font-black text-[#111E38] dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 py-0.5 px-2 rounded-full">
                            @{t5Data.assignee}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Static tasks */}
                {[
                  {
                    id: 4,
                    progress: '4/4',
                    title: t('alurku. Web App: 4. Testing, Deployment & Launch', 'Aplikasi Web alurku.: 4. Pengujian & Peluncuran'),
                    desc: t('Conduct comprehensive testing of the alurku. web application to identify and resolve bugs, ensure functionality, performance, and security.', 'Lakukan pengujian menyeluruh pada aplikasi web alurku. untuk menemukan bug, keamanan, serta performa sebelum rilis resmi.'),
                    tags: [t('To-do List', 'Daftar Tugas'), t('Development', 'Riset'), t('Pending', 'Tunda'), 'HIGH', '0/5', '24h'],
                    assignee: 'budi'
                  },
                  {
                    id: 3,
                    progress: '3/4',
                    title: t('alurku. Web App: 3. Frontend & Backend Development', 'Aplikasi Web alurku.: 3. Pengembangan Frontend & Backend'),
                    desc: t('Implement the alurku. web application\'s user interface (frontend) and server-side logic with database integration (backend).', 'Mulai koding antarmuka pengguna (frontend) dan arsitektur database serverless serta integrasi API (backend).'),
                    tags: [t('To-do List', 'Daftar Tugas'), t('Development', 'Koding'), t('Pending', 'Tunda'), 'HIGH', '0/6', '80h'],
                    assignee: 'siti'
                  },
                  {
                    id: 2,
                    progress: '2/4',
                    title: t('alurku. Web App: 2. UI/UX Design & Prototyping', 'Aplikasi Web alurku.: 2. Desain UI/UX & Prototiping'),
                    desc: t('Design the user interface (UI) and user experience (UX) for the alurku. web application based on the requirements.', 'Rancang wireframe, mockup visual, serta prototipe interaktif untuk memetakan alur pengguna agar intuitif.'),
                    tags: [t('To-do List', 'Daftar Tugas'), t('Design', 'Desain'), t('Pending', 'Tunda'), 'HIGH', '0/5', '16h'],
                    assignee: 'budi'
                  },
                  {
                    id: 1,
                    progress: '1/4',
                    title: t('alurku. Web App: 1. Initial Requirements & Planning', 'Aplikasi Web alurku.: 1. Analisis Kebutuhan & Rencana'),
                    desc: t('Conduct detailed discussions with stakeholders to define the core purpose, target audience, and key requirements for the brand web.', 'Lakukan diskusi mendalam bersama klien untuk mematangkan alur kerja utama serta arsitektur brand.'),
                    tags: [t('To-do List', 'Daftar Tugas'), t('Planning', 'Rencana'), t('Pending', 'Tunda'), 'HIGH', '0/5', '8h'],
                    assignee: 'siti'
                  }
                ].map((task) => (
                  <div key={task.id} className="bg-white dark:bg-neutral-950 border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl shadow-sm flex flex-col gap-2 border-l-4 border-l-[#FACC15]">
                    <div className="flex items-start gap-2">
                      <input type="checkbox" readOnly className="rounded border-slate-300 dark:border-slate-700 text-indigo-650 mt-1 shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 flex-wrap mb-1">
                          <h4 className="font-extrabold text-[9px] sm:text-[10px] text-slate-800 dark:text-slate-200 leading-tight">
                            {task.title}
                          </h4>
                          <span className="text-[7px] text-slate-400 shrink-0">27 Jun 2026 ⇄ {t('No Deadline', 'Tanpa Batas')}</span>
                        </div>
                        <p className="text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed mb-2 truncate-2-lines line-clamp-2">
                          {task.desc}
                        </p>
                        
                        <div className="flex justify-between items-center flex-wrap gap-2 pt-1.5 border-t border-slate-50 dark:border-slate-900">
                          <div className="flex flex-wrap items-center gap-1 text-[7px] sm:text-[8px] font-black">
                            <span className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 py-0.5 px-1.5 rounded">{task.progress}</span>
                            {task.tags.map((tag, i) => {
                              let cls = "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-350";
                              if (tag === 'HIGH' || tag === 'Tinggi') cls = "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400";
                              if (tag.includes('h') || tag.includes('0/')) cls = "bg-slate-50 dark:bg-neutral-900 border text-slate-400 dark:text-slate-500";
                              return (
                                <span key={i} className={`py-0.5 px-1.5 rounded ${cls}`}>{tag}</span>
                              );
                            })}
                          </div>
                          <span className="text-[8px] font-black text-[#111E38] dark:text-slate-200 bg-slate-105 dark:bg-slate-800/80 py-0.5 px-2 rounded-full">
                            @{task.assignee}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Pagination Info */}
              <div className="flex items-center justify-between text-[8px] font-black text-slate-400 dark:text-slate-500 border-t pt-2 shrink-0">
                <div className="flex items-center gap-1">
                  <span>SHOW:</span>
                  <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded cursor-pointer">15 Tasks ▾</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="px-1.5 py-0.5 hover:text-slate-800 dark:hover:text-white">PREV</button>
                  <span className="bg-[#FACC15] text-[#111E38] px-2 py-0.5 rounded shadow-sm">1</span>
                  <button className="px-1.5 py-0.5 hover:text-slate-800 dark:hover:text-white">NEXT</button>
                </div>
                <div className="flex items-center gap-2">
                  <span>ACTIVE: {activeListCount}</span>
                  <button className="bg-slate-105 dark:bg-slate-800 text-slate-600 dark:text-slate-350 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all">{t('BULK SELECT', 'MASSAL')}</button>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Completed Tasks */}
            <div className="hidden md:flex flex-col w-[120px] border-l border-slate-200 dark:border-slate-800 p-3 shrink-0 h-full overflow-hidden bg-white dark:bg-neutral-950">
              <span className="text-[9px] font-black text-slate-800 dark:text-white flex items-center gap-1 mb-6 border-b pb-2 shrink-0">
                <span className="text-emerald-500">✓</span> {t('Completed Tasks', 'Tugas Selesai')}
              </span>
              
              {/* Dynamic Completed Sidebar */}
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                {isT5Completed ? (
                  <div className="w-full flex flex-col gap-2.5 animate-fade-down">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-lg mx-auto shadow-sm">
                      🎉
                    </div>
                    <div className="bg-slate-50 dark:bg-neutral-900 p-2 rounded-xl border border-slate-150 dark:border-slate-800 text-left flex flex-col gap-1.5 shadow-sm">
                      <span className="text-[7px] font-black text-emerald-600 uppercase tracking-widest">{t('Completed', 'Selesai')}</span>
                      <h5 className="font-extrabold text-[8px] text-slate-800 dark:text-slate-200 leading-tight line-clamp-2">
                        {t5Data.title}
                      </h5>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 border flex items-center justify-center text-lg shadow-inner">
                      🎉
                    </div>
                    <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 leading-relaxed px-1">
                      {t('No completed tasks yet. Keep going!', 'Belum ada tugas selesai. Semangat!')}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      }
      case 'timeline':
        return (
          <div className="flex flex-col h-full p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50 gap-1">
            <div className="flex gap-2 mb-4">
              <div className="w-1/4"></div>
              <div className="flex-1 flex justify-between px-2 text-[8px] font-bold text-slate-400">
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
              </div>
            </div>
            {['Design', 'Frontend', 'Backend', 'Testing'].map((role, i) => (
              <div key={role} className="flex gap-2 items-center mb-3">
                <div className="w-1/4 text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400">{role}</div>
                <div className="flex-1 relative h-6 sm:h-8 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div
                    className={`absolute top-1 bottom-1 rounded-md shadow-sm ${
                      i === 0
                        ? 'left-[10%] w-[30%] bg-indigo-500'
                        : i === 1
                        ? 'left-[30%] w-[40%] bg-emerald-500'
                        : i === 2
                        ? 'left-[40%] w-[35%] bg-amber-500'
                        : 'left-[70%] w-[25%] bg-blue-500'
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'calendar':
        return (
          <div className="h-full p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-slate-400">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 flex-1">
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-md sm:rounded-lg border ${
                    [12, 13, 18, 22].includes(i)
                      ? 'bg-indigo-100 border-indigo-200 dark:bg-indigo-900/40 dark:border-indigo-800/50'
                      : [5, 6, 19, 20].includes(i)
                      ? 'bg-slate-200/50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'
                      : 'bg-white border-slate-100 dark:bg-slate-800/20 dark:border-slate-800/50'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="flex gap-4 sm:gap-6 h-full p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50 items-center justify-center">
            <div className="w-1/3 aspect-square rounded-full border-[8px] sm:border-[12px] border-indigo-100 dark:border-indigo-900/40 relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[8px] sm:border-[12px] border-indigo-500 border-r-transparent border-b-transparent rotate-45"></div>
              <span className="text-lg sm:text-xl font-black text-slate-800 dark:text-white">76%</span>
            </div>
            <div className="flex-1 flex flex-col gap-3 sm:gap-4">
              {[
                { label: 'Completed', color: 'bg-emerald-500', width: 'w-[76%]' },
                { label: 'In Progress', color: 'bg-blue-500', width: 'w-[15%]' },
                { label: 'Pending', color: 'bg-amber-500', width: 'w-[9%]' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 mb-1">{stat.label}</div>
                  <div className="h-1.5 sm:h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${stat.color} ${stat.width}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };



  return (
    <>
        {/* Feature Highlight Section */}
        <section
          id="features-section"
          className="py-24 md:py-32 bg-slate-50 dark:bg-black border-t border-slate-200 dark:border-slate-800 relative z-10"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16 reveal-on-scroll">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-6">
                {t('Built for every workflow', 'Didesain untuk Setiap Alur Kerja')}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
                {t('Switch seamlessly between multiple views to manage your work exactly how you want. No reloads required.', 'Beralih tampilan secara mulus untuk mengelola pekerjaan sesuai keinginan Anda. Tanpa muat ulang halaman.')}
              </p>
            </div>

            <div
              className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center reveal-on-scroll"
              style={{ animationDelay: '100ms' }}
            >
              <div className="flex flex-col gap-4">
                {features.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => setActiveFeatureTab(feature.id)}
                    className={`text-left p-6 rounded-2xl border transition-all ${
                      activeFeatureTab === feature.id
                        ? 'bg-white dark:bg-[#0e1116] border-slate-900 dark:border-slate-100 shadow-xl scale-[1.02]'
                        : 'bg-transparent border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900/50'
                    }`}
                  >
                    <h3
                      className={`text-xl font-bold mb-2 flex items-center gap-3 ${
                        activeFeatureTab === feature.id
                          ? 'text-black dark:text-white'
                          : 'text-slate-500 dark:text-slate-300'
                      }`}
                    >
                      <span className={activeFeatureTab === feature.id ? 'text-[#111E38] dark:text-[#FACC15]' : 'text-slate-400 dark:text-slate-500'}>
                        {featureIcons[feature.id]}
                      </span>{' '}
                      {feature.title}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed font-medium ${
                        activeFeatureTab === feature.id
                          ? 'text-slate-600 dark:text-slate-200'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {feature.desc}
                    </p>
                  </button>
                ))}
              </div>

              <div className="relative h-[400px] sm:h-[450px] lg:h-[500px] w-full rounded-[2rem] bg-white dark:bg-[#0e1116] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800/20 dark:to-slate-900/20"></div>
                <div className="absolute inset-x-0 top-0 h-12 bg-white/50 dark:bg-black/50 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50 flex items-center px-4 gap-2 z-10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                </div>
                <div className="absolute inset-x-0 top-12 bottom-0">{renderFeatureMockup()}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Spesifikasi / Enterprise Architecture Section */}
        <section
          id="specs-section"
          className="py-24 md:py-32 bg-slate-50 dark:bg-neutral-950 border-t border-slate-200 dark:border-slate-800 relative z-10"
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 reveal-on-scroll">
              <span className="text-neutral-500 font-bold tracking-widest uppercase text-xs mb-3 block">
                Fitur Unggulan
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-6 uppercase">
                Fitur Cerdas untuk Menemani Alur Kerjamu
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
                Lebih dari sekadar daftar tugas biasa. Dirancang secara intuitif untuk membantu Anda dan tim mencapai target lebih cepat tanpa stres.
              </p>
            </div>

            <div className="space-y-32">
              {/* Pillar 1: Automated AI Planning */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center reveal-on-scroll">
                {/* Visual Mockup (Left) */}
                <div className="relative bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl overflow-hidden order-2 md:order-1">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">{t('AI Daily Schedule', 'Jadwal Harian AI')}</span>
                    <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 py-0.5 px-2 rounded-full font-bold">{t('Auto', 'Otomatis')}</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-3 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/40 rounded-xl">
                      <span className="text-indigo-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </span>
                      <div className="flex-1">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{t('Arrange Work Plan', 'Menyusun Rencana Kerja')}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">{t('Predicted duration: 2.5h', 'Durasi diprediksi: 2.5 jam')}</div>
                      </div>
                      <span className="text-[10px] text-indigo-600 font-bold">09:00</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <span className="text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                        </svg>
                      </span>
                      <div className="flex-1">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{t('Review Mockup Design', 'Review Desain Mockup')}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">{t('Duration: 1h', 'Durasi: 1 jam')}</div>
                      </div>
                      <span className="text-[10px] text-slate-500">11:30</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <span className="text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      <div className="flex-1">
                        <div className="font-bold text-slate-400 dark:text-slate-550 line-through">{t('Lunch Break', 'Istirahat Siang')}</div>
                      </div>
                      <span className="text-[10px] text-slate-400">12:30</span>
                    </div>
                  </div>
                </div>

                {/* Text Content (Right) */}
                <div className="space-y-6 order-1 md:order-2">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-sm border border-indigo-100 dark:border-indigo-800/50">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white tracking-tight text-2xl lg:text-3xl leading-tight">
                    {t('Automated AI Planning', 'Asisten Perencana Otomatis')}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    {t(
                      "Not sure how long a project will take? alurku. AI will automatically predict the duration and organize your daily schedule, so you don't have to guess anymore.",
                      "Tidak yakin butuh waktu berapa lama untuk sebuah proyek? AI alurku. akan memprediksi durasi dan menyusun jadwal harianmu secara otomatis, sehingga kamu tidak perlu lagi menebak-nebak."
                    )}
                  </p>
                  <ul className="space-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-500">✓</span> {t('AI-based task duration estimation', 'Estimasi durasi pengerjaan berbasis AI')}
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-500">✓</span> {t('Automatic daily scheduling', 'Penyusunan jadwal harian otomatis')}
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-500">✓</span> {t('Intelligent adjustment to blockers', 'Penyesuaian cerdas terhadap hambatan kerja')}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Pillar 2: Workload Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center reveal-on-scroll">
                {/* Text Content (Left) */}
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100 dark:border-emerald-800/50">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5" />
                    </svg>
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white tracking-tight text-2xl lg:text-3xl leading-tight">
                    {t('Work-Life Balance, Anti-Burnout', 'Kerja Seimbang, Anti-Kewalahan')}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    {t(
                      "Know the capacity limits of yourself and your team. alurku. visualizes workload in real-time so you can distribute tasks fairly, prevent burnout, and rest on time.",
                      "Ketahui batas kapasitasmu dan timmu. alurku. memvisualisasikan beban kerja secara real time agar kamu bisa membagi tugas dengan adil, mencegah burnout, dan bisa istirahat tepat waktu."
                    )}
                  </p>
                  <ul className="space-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-500">✓</span> {t('Real-time team workload visualization', 'Visualisasi grafik beban kerja tim secara langsung')}
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-500">✓</span> {t('Fair automated task distribution', 'Distribusi tugas otomatis yang adil')}
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-500">✓</span> {t('Early detection of burnout potential', 'Deteksi dini potensi kelelahan (burnout)')}
                    </li>
                  </ul>
                </div>

                {/* Visual Mockup (Right) */}
                <div className="relative bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">{t('Team Workload', 'Beban Kerja Tim')}</span>
                    <span className="text-[10px] text-emerald-600 font-bold">{t('Normal', 'Normal')}</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5">
                        <span>Adit Pratama (UI Developer)</span>
                        <span className="text-emerald-600">{t('80% Capacity', '80% Kapasitas')}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[80%] rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5">
                        <span>Jane Smith (Backend Eng)</span>
                        <span className="text-amber-600">{t('95% Capacity', '95% Kapasitas')}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full w-[95%] rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5">
                        <span>David Miller (Project Manager)</span>
                        <span className="text-blue-600">{t('45% Capacity', '45% Kapasitas')}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-[45%] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pillar 3: Visual Workflow */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center reveal-on-scroll">
                {/* Visual Mockup (Left) */}
                <div className="relative bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl overflow-hidden order-2 md:order-1">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">{t('Kanban Flow', 'Alur Kanban')}</span>
                    <span className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 py-0.5 px-2 rounded-full font-bold">{t('1 New Task', '1 Tugas Baru')}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
                    <div className="bg-white dark:bg-slate-905 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col gap-2 border-l-4 border-l-amber-500">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{t('Kanban Feature Development', 'Pengembangan Fitur Kanban')}</span>
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                          </svg>
                          {t('Workflow', 'Alur Kerja')}
                        </span>
                        <span className="text-[9px] font-black bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 py-0.5 px-2 rounded-full">{t('New', 'Baru Masuk')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text Content (Right) */}
                <div className="space-y-6 order-1 md:order-2">
                  <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shadow-sm border border-amber-100 dark:border-amber-800/50">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white tracking-tight text-2xl lg:text-3xl leading-tight">
                    {t('One Screen for All Progress', 'Satu Layar untuk Semua Progres')}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    {t(
                      "Track your story from project start to finish. With a clean and dynamic view, you always know what is being done, who is doing it, and what needs to be completed next.",
                      "Pantau jalan ceritamu dari awal hingga akhir proyek. Dengan tampilan yang bersih dan dinamis, kamu selalu tahu apa yang sedang dikerjakan, siapa yang mengerjakan, dan apa yang harus diselesaikan selanjutnya."
                    )}
                  </p>
                  <ul className="space-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-500">✓</span> {t('Intuitive drag-and-drop between columns', 'Drag-and-drop antar kolom yang intuitif')}
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-500">✓</span> {t('Interactive timeline (Gantt Chart)', 'Garis waktu interaktif (Gantt Chart)')}
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-500">✓</span> {t('Real-time sync across team members', 'Sinkronisasi real-time antar anggota tim')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          {/* Scroll Down to FAQ */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex justify-center z-30">
            <button
              onClick={() => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm transition-all animate-bounce"
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
