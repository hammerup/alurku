import React, { useState, useEffect } from 'react';

/**
 * OnboardingChecklist
 * Interactive onboarding guide widget for new and existing users.
 * Persists step completion state in localStorage per user.
 * Adheres to alurku. Brand Book:
 * - Colors: Deep Navy (#111E38), Flat Yellow (#FACC15), Calm Gray (#F3F4F6)
 * - 100% Inline SVG icons (zero raw emojis)
 * - Full bilingual support (ID / EN)
 */
export default function OnboardingChecklist({
  currentUser = '',
  language = 'id',
  onOpenCommandBar,
  onOpenNewTaskForm,
  onNavigateView,
  onOpenAssistant,
  onOpenDocs,
}) {
  const tMsg = (en, id) => (language === 'id' ? id : en);

  const storageKey = `alurku_onboarding_${currentUser || 'guest'}`;
  const dismissedKey = `alurku_onboarding_dismissed_${currentUser || 'guest'}`;

  const [completedSteps, setCompletedSteps] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return localStorage.getItem(dismissedKey) === 'true';
    } catch {
      return false;
    }
  });

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(completedSteps));
    } catch (e) {
      console.error(e);
    }
  }, [completedSteps, storageKey]);

  const toggleStep = (stepId, e) => {
    if (e) e.stopPropagation();
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(dismissedKey, 'true');
    } catch (e) {
      console.error(e);
    }
  };

  const steps = [
    {
      id: 'step_cmd_k',
      title: tMsg('Try Command Bar Quick-Add (Ctrl + K)', 'Coba Command Bar Quick-Add (Ctrl + K)'),
      desc: tMsg(
        'Type a task using Natural Language Parsing (e.g. Design UI p:urgent due:tomorrow).',
        'Ketik tugas cepat dengan Natural Language Parsing (mis: Desain UI p:urgent due:tomorrow).'
      ),
      icon: (
        <svg className="w-4 h-4 text-[#FACC15]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      actionLabel: tMsg('Open Command Bar', 'Buka Command Bar'),
      onClick: () => {
        setCompletedSteps((prev) => ({ ...prev, step_cmd_k: true }));
        if (onOpenCommandBar) onOpenCommandBar();
      },
    },
    {
      id: 'step_task_kanban',
      title: tMsg('Create Your First Kanban Task', 'Buat Tugas Pertamamu di Papan Kanban'),
      desc: tMsg(
        'Add a task with start date, deadline, and ETC estimated hours.',
        'Tambahkan kartu tugas lengkap dengan tanggal mulai, tenggat waktu, dan perkiraan jam (ETC).'
      ),
      icon: (
        <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      actionLabel: tMsg('Create Task', 'Buat Tugas'),
      onClick: () => {
        setCompletedSteps((prev) => ({ ...prev, step_task_kanban: true }));
        if (onOpenNewTaskForm) onOpenNewTaskForm();
      },
    },
    {
      id: 'step_gantt_workload',
      title: tMsg('Explore Gantt Timeline & Workload', 'Jelajahi Lini Masa Gantt & Workload'),
      desc: tMsg(
        'View horizontal delivery schedules and prevent team burnout with capacity meters.',
        'Lihat jadwal pengiriman proyek dan pantau kapasitas tim untuk mencegah kelelahan.'
      ),
      icon: (
        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      actionLabel: tMsg('View Timeline', 'Buka Timeline'),
      onClick: () => {
        setCompletedSteps((prev) => ({ ...prev, step_gantt_workload: true }));
        if (onNavigateView) onNavigateView('timeline');
      },
    },
    {
      id: 'step_ask_ai',
      title: tMsg('Consult with Luruka AI Assistant', 'Konsultasi dengan Luruka AI'),
      desc: tMsg(
        'Ask Luruka AI to break down complex tasks or provide daily executive summaries.',
        'Minta Luruka AI merapikan rencana kerjamu atau memecah tugas besar menjadi terukur.'
      ),
      icon: (
        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      actionLabel: tMsg('Open Luruka AI', 'Sapa Luruka AI'),
      onClick: () => {
        setCompletedSteps((prev) => ({ ...prev, step_ask_ai: true }));
        if (onOpenAssistant) onOpenAssistant();
      },
    },
    {
      id: 'step_read_docs',
      title: tMsg('Read Platform Documentation & Guides', 'Pelajari Dokumentasi Platform'),
      desc: tMsg(
        'Master permissions, per-seat quotas, file attachments, and data security standards.',
        'Pahami sistem peran, kuota per-seat, manajemen file lampiran, dan kepatuhan privasi.'
      ),
      icon: (
        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      actionLabel: tMsg('Open Docs', 'Baca Dokumentasi'),
      onClick: () => {
        setCompletedSteps((prev) => ({ ...prev, step_read_docs: true }));
        if (onOpenDocs) onOpenDocs();
      },
    },
  ];

  const totalSteps = steps.length;
  const completedCount = steps.filter((s) => completedSteps[s.id]).length;
  const percent = Math.round((completedCount / totalSteps) * 100);

  if (isDismissed) {
    return (
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setIsDismissed(false);
            try {
              localStorage.removeItem(dismissedKey);
            } catch (e) {
              console.error(e);
            }
          }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-[#111E38] dark:hover:text-white shadow-2xs hover:shadow-xs transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 text-[#FACC15]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{tMsg('Show Getting Started Guide', 'Tampilkan Panduan Memulai')}</span>
          <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-extrabold px-1.5 py-0.2 rounded text-[10px]">
            {completedCount}/{totalSteps}
          </span>
        </button>
      </div>
    );
  }

  return (
    <section className="mb-8 bg-white dark:bg-[#121B2D] border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden transition-all">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-neutral-50 via-white to-neutral-50 dark:from-[#111E38]/40 dark:via-[#121B2D] dark:to-[#111E38]/40 border-b border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="p-2.5 rounded-xl bg-[#FACC15] text-[#111E38] shrink-0 shadow-2xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-[#111E38] dark:text-white">
                {tMsg('Quick-Start Guide to alurku.', 'Panduan Memulai alurku.')}
              </h2>
              <span className="bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                {percent === 100 ? tMsg('Completed! 🎉', 'Selesai! 🎉') : `${percent}%`}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
              {tMsg(
                'Complete these 5 quick steps to master task flow, AI scheduling, and team collaboration.',
                'Selesaikan 5 langkah mudah berikut untuk menguasai alur tugas, penjadwalan AI, dan kolaborasi tim.'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title={isCollapsed ? tMsg('Expand', 'Buka') : tMsg('Collapse', 'Ciutkan')}
          >
            <svg className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title={tMsg('Dismiss', 'Tutup')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5">
        <div
          className="bg-[#FACC15] h-1.5 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        ></div>
      </div>

      {/* Step List (Visible when not collapsed) */}
      {!isCollapsed && (
        <div className="p-4 sm:p-6 divide-y divide-neutral-100 dark:divide-neutral-800/80">
          {steps.map((step, idx) => {
            const isDone = !!completedSteps[step.id];
            return (
              <div
                key={step.id}
                className={`py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4 transition-all ${
                  isDone ? 'opacity-60' : 'opacity-100'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Interactive Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => toggleStep(step.id, e)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-2xs'
                        : 'border-neutral-300 dark:border-neutral-700 hover:border-[#111E38] dark:hover:border-[#FACC15]'
                    }`}
                    aria-label="Toggle step completion"
                  >
                    {isDone && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* Title & Desc */}
                  <div className="min-w-0">
                    <h3
                      className={`text-xs sm:text-sm font-bold transition-colors ${
                        isDone
                          ? 'line-through text-neutral-400 dark:text-neutral-500'
                          : 'text-[#111E38] dark:text-white'
                      }`}
                    >
                      <span className="text-neutral-400 dark:text-neutral-500 mr-1.5 font-semibold">
                        {idx + 1}.
                      </span>
                      {step.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* Direct Action Button */}
                <button
                  type="button"
                  onClick={step.onClick}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] hover:opacity-90 shadow-2xs transition-transform active:scale-95 shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="hidden sm:inline">{step.icon}</span>
                  <span>{step.actionLabel}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
