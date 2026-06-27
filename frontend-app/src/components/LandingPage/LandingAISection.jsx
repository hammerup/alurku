import React, { useState, useEffect, useRef } from 'react';

export default function LandingAISection({ showAuthForm, language }) {
  const [simStep, setSimStep] = useState(0);
  const [typedText, setTypedText] = useState('');
  
  // States for Live Playable Mockup
  const [selectedScenario, setSelectedScenario] = useState('tasks'); // 'tasks', 'capacity', 'summary'
  const [chatStatus, setChatStatus] = useState('typing'); // 'typing', 'thinking', 'complete'
  const [typedUserPrompt, setTypedUserPrompt] = useState('');
  const typingTimerRef = useRef(null);

  const t = (en, id) => (language === 'id' ? id : en);

  const scenarios = {
    tasks: {
      name: 'Ekstrak Tugas',
      nameEn: 'Extract Tasks',
      userPrompt: 'Tolong buatkan tugas dari catatan rapat ini: 1. Desain antarmuka baru sebelum Jumat (@budi) 2. Perbaiki bug autentikasi (@siti).',
      userPromptEn: 'Extract tasks from meeting notes: 1. Redesign homepage by Friday (@budi) 2. Fix login bug (@siti).',
      aiResponse: {
        title: 'Tentu, berikut adalah 2 tugas baru yang berhasil dibuat:',
        titleEn: 'Certainly! Here are the 2 new tasks created:',
        items: [
          { text: 'Desain ulang beranda', textEn: 'Redesign homepage', label: 'Desain', labelEn: 'Design', assignee: 'Budi', date: 'Jumat / Friday' },
          { text: 'Perbaiki bug autentikasi', textEn: 'Fix authentication bug', label: 'Backend', labelEn: 'Backend', assignee: 'Siti', date: 'Segera / ASAP' },
        ],
      }
    },
    capacity: {
      name: 'Estimasi Waktu',
      nameEn: 'Time Estimate',
      userPrompt: 'Hitung estimasi waktu (ETC) untuk pengerjaan modul integrasi API pembayaran.',
      userPromptEn: 'Calculate the time estimate (ETC) for payment API integration.',
      aiResponse: {
        title: 'Berikut adalah hasil analisis kapasitas kerja:',
        titleEn: 'Here is the workload capacity analysis:',
        capacityCard: {
          estimation: '8 Jam Kerja (1.0 ETC)',
          estimationEn: '8 Work Hours (1.0 ETC)',
          risk: 'Sedang',
          riskEn: 'Medium',
          recommendation: 'Rekomendasi: Mulai Senin pagi untuk koordinasi tim maksimal.',
          recommendationEn: 'Recommendation: Start Monday morning for optimal alignment.'
        }
      }
    },
    summary: {
      name: 'Status Kesehatan',
      nameEn: 'Health Status',
      userPrompt: 'Berikan ringkasan kesehatan proyek alurku. saat ini.',
      userPromptEn: 'Give me the current health summary of alurku. project.',
      aiResponse: {
        title: 'Berikut adalah rangkuman performa proyek saat ini:',
        titleEn: 'Here is the current project performance summary:',
        healthCard: {
          status: 'Sangat Sehat (92%)',
          statusEn: 'Highly Healthy (92%)',
          completed: '3 Tugas Selesai',
          completedEn: '3 Tasks Completed',
          inProgress: '1 Sedang Berjalan',
          inProgressEn: '1 In Progress',
          etcStatus: 'Kapasitas Tim: Aman',
          etcStatusEn: 'Team Capacity: Safe'
        }
      }
    }
  };

  const scenarioIcons = {
    tasks: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    capacity: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    summary: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
      </svg>
    )
  };

  const stepIcons = {
    0: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    1: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    2: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    3: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    4: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  };

  // Handle typing simulation
  useEffect(() => {
    if (showAuthForm) return;

    // Reset states
    setChatStatus('typing');
    setTypedUserPrompt('');
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    const promptText = t(scenarios[selectedScenario].userPromptEn, scenarios[selectedScenario].userPrompt);
    let i = 0;
    
    typingTimerRef.current = setInterval(() => {
      i++;
      setTypedUserPrompt(promptText.slice(0, i));
      if (i >= promptText.length) {
        clearInterval(typingTimerRef.current);
        // Advance to thinking
        setChatStatus('thinking');
        setTimeout(() => {
          setChatStatus('complete');
        }, 1200);
      }
    }, 20);

    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [selectedScenario, language, showAuthForm]);

  // Handle step-by-step slideshow simulation
  const fullText = t(
    'Extract tasks: 1. Redesign homepage by next Friday (@budi). 2. Fix login API bug (@siti). 3. Update documentation.',
    'Ekstrak tugas: 1. Desain ulang beranda sebelum Jumat depan (@budi). 2. Perbaiki bug API login (@siti). 3. Perbarui dokumentasi.'
  );
  useEffect(() => {
    if (simStep === 0) {
      let i = 0;
      setTypedText('');
      const timer = setInterval(() => {
        i++;
        setTypedText(fullText.slice(0, i));
        if (i > fullText.length) clearInterval(timer);
      }, 40);
      return () => clearInterval(timer);
    } else {
      setTypedText(fullText);
    }
  }, [simStep, fullText]);

  return (
    <>
      {/* AI Integration Section */}
      <section
        id="ai-section"
        className="py-24 md:py-32 bg-white dark:bg-neutral-950 border-t border-slate-200 dark:border-slate-800 relative z-10"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side text content */}
            <div className="reveal-on-scroll">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111E38] text-white dark:bg-white/10 dark:text-white font-extrabold text-xs mb-6 shadow-md select-none border-none">
                <span className="text-base leading-none">✨</span>
                {t('Asisten Pintar Beban Kerja', 'Asisten Pintar Beban Kerja')}
              </div>
              
              {/* Removed uppercase for clean corporate styling */}
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-6 leading-[1.1]">
                {t('Work Smarter with Alurku AI Assistant.', 'Kerja Lebih Tenang & Teratur dengan Asisten AI.')}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 font-medium leading-relaxed">
                {t(
                  'Let the integrated Alurku AI manager analyze workloads, extract actions, and summarize workflows, allowing you and your team to focus on executing priorities.',
                  'Nikmati kemudahan mengatur beban kerja Anda tanpa pusing. Asisten Cerdas alurku. membantu menyelesaikan urusan administratif sehingga Anda dan tim bisa fokus pada hasil yang nyata.'
                )}
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight mb-1">
                      {t('Automated Task Generation', 'Pembuatan Tugas Otomatis')}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {t(
                        'Provide raw thoughts or chat notes, and AI parses them into structured boards, task descriptions, and estimates dates instantly.',
                        'Tulis ide kasar Anda, dan AI alurku. akan langsung merapikannya menjadi detail tugas, sub-tugas, serta memprediksi durasi pengerjaannya secara otomatis.'
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight mb-1">
                      {t('Interactive Meeting Summaries', 'Rangkuman Hasil Rapat')}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {t(
                        'Paste meeting summaries or key notes to extract action items, assignees, and build clean checklist schedules.',
                        'Gunakan catatan rapat interaktif. AI akan menyaring keputusan penting, menunjuk penanggung jawab, dan membuat daftar tugas secara otomatis.'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scenario Interactive Selector */}
              <div className="mt-10 p-5 bg-slate-50 dark:bg-neutral-900/60 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 animate-fade-in">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block mb-3">
                  {t('⚡ TEST AI SCENARIOS (CLICK TO PLAY):', '⚡ UJI SKENARIO AI (KLIK UNTUK MENCOBA):')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(scenarios).map((key) => (
                    <button
                      key={key}
                      onClick={() => setSelectedScenario(key)}
                      className={`px-4 py-2.5 rounded-full text-xs font-black shadow-sm transition-all hover:-translate-y-0.5 flex items-center gap-2 ${
                        selectedScenario === key
                          ? 'bg-[#111E38] dark:bg-white text-white dark:text-[#111E38]'
                          : 'bg-white dark:bg-neutral-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {scenarioIcons[key]}
                      <span>{language === 'id' ? scenarios[key].name : scenarios[key].nameEn}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Live Playable Chatbot Mockup */}
            <div className="relative reveal-on-scroll" style={{ animationDelay: '200ms' }}>
              <div className="relative w-full aspect-square lg:aspect-auto lg:h-[650px] bg-gradient-to-tr from-slate-100 to-slate-50 dark:from-slate-800/30 dark:to-slate-900/30 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/50 shadow-2xl overflow-hidden flex items-center justify-center p-6 lg:p-10">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>
                
                <div className="relative w-full max-w-sm bg-white/95 dark:bg-[#0e1116]/95 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 shadow-2xl rounded-3xl p-5 space-y-5 transform-gpu hover:scale-[1.02] transition-transform duration-300">
                  {/* Chat Mockup Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-xl bg-[#111E38] dark:bg-white text-white dark:text-[#111E38] flex items-center justify-center shadow-md text-xs font-black">
                      ✨
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-none">
                        Alurku AI Assistant
                      </h4>
                      <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        {t('Aktif / Online', 'Aktif / Online')}
                      </span>
                    </div>
                  </div>

                  {/* Chat User Input Bubble */}
                  <div className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                      👤
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800/80 p-3 rounded-2xl rounded-tl-sm text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-350 w-3/4 leading-relaxed shadow-sm">
                      {typedUserPrompt}
                      {chatStatus === 'typing' && (
                        <span className="inline-block w-[2px] h-3 bg-slate-500 animate-pulse ml-1 align-middle"></span>
                      )}
                    </div>
                  </div>

                  {/* AI Response Bubble */}
                  {chatStatus !== 'typing' && (
                    <div className="flex gap-3 items-start flex-row-reverse">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-black shadow-md flex-shrink-0">
                        AI
                      </div>
                      
                      {chatStatus === 'thinking' ? (
                        /* Pulsing Thinking Indicator */
                        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl rounded-tr-sm text-xs text-slate-800 dark:text-slate-100 font-extrabold flex items-center gap-2 shadow-sm animate-pulse">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600 dark:bg-indigo-400"></span>
                          </span>
                          {t('Alurku AI is analyzing...', 'Alurku AI sedang menganalisis...')}
                        </div>
                      ) : (
                        /* Complete Rich AI Response Cards */
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 p-4 rounded-2xl rounded-tr-sm text-xs text-indigo-900 dark:text-indigo-200 w-[85%] shadow-md select-none mac-animate">
                          <div className="font-bold mb-3 flex items-center gap-2">
                            {t(scenarios[selectedScenario].aiResponse.titleEn, scenarios[selectedScenario].aiResponse.title)}
                          </div>
                          
                          {/* Scenario 1 Output: Task Lists */}
                          {selectedScenario === 'tasks' && (
                            <div className="space-y-3.5">
                              {scenarios.tasks.aiResponse.items.map((item, idx) => (
                                <div key={idx} className="bg-white dark:bg-neutral-900 border border-slate-150 dark:border-slate-800 rounded-xl p-3 shadow-sm flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <input type="checkbox" readOnly checked className="rounded text-indigo-600" />
                                    <span className="font-black text-[11px] text-slate-800 dark:text-slate-200 leading-tight">
                                      {t(item.textEn, item.text)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 mt-1 border-t border-slate-50 dark:border-slate-800 pt-2">
                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-0.5 px-2 rounded-full">
                                      {t(item.labelEn, item.label)}
                                    </span>
                                    <span>@{item.assignee}</span>
                                  </div>
                                </div>
                              ))}
                              <button className="w-full bg-[#111E38] dark:bg-white text-white dark:text-[#111E38] hover:opacity-90 transition-all py-2.5 rounded-xl text-[10px] font-extrabold shadow-md flex items-center justify-center gap-1 border border-slate-900">
                                ⚡ {t('Create All Tasks', 'Buat Semua Tugas')}
                              </button>
                            </div>
                          )}

                          {/* Scenario 2 Output: Capacity Estimations */}
                          {selectedScenario === 'capacity' && (
                            <div className="space-y-3">
                              <div className="bg-white dark:bg-neutral-900 border border-slate-150 dark:border-slate-800 rounded-xl p-3 shadow-sm flex flex-col gap-2">
                                <span className="text-[10px] text-slate-400 font-bold block">{t('ESTIMATED TIME', 'ESTIMASI DURASI')}</span>
                                <div className="text-sm font-black text-slate-800 dark:text-slate-100">
                                  {t(scenarios.capacity.aiResponse.capacityCard.estimationEn, scenarios.capacity.aiResponse.capacityCard.estimation)}
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                                  <div className="bg-emerald-500 h-full w-[60%]"></div>
                                </div>
                                <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1">
                                  <span>{t('Risk: ', 'Risiko: ')}{t(scenarios.capacity.aiResponse.capacityCard.riskEn, scenarios.capacity.aiResponse.capacityCard.risk)}</span>
                                  <span className="text-emerald-500">Aman / Safe</span>
                                </div>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                {t(scenarios.capacity.aiResponse.capacityCard.recommendationEn, scenarios.capacity.aiResponse.capacityCard.recommendation)}
                              </p>
                            </div>
                          )}

                          {/* Scenario 3 Output: Health Summary Card */}
                          {selectedScenario === 'summary' && (
                            <div className="space-y-3">
                              <div className="bg-white dark:bg-neutral-900 border border-slate-150 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
                                <div className="space-y-1.5">
                                  <span className="text-[9px] text-slate-400 font-bold block uppercase">{t('PROJECT HEALTH', 'KESEHATAN PROYEK')}</span>
                                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight block">
                                    {t(scenarios.summary.aiResponse.healthCard.statusEn, scenarios.summary.aiResponse.healthCard.status)}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-bold block">
                                    {t(scenarios.summary.aiResponse.healthCard.completedEn, scenarios.summary.aiResponse.healthCard.completed)} | {t(scenarios.summary.aiResponse.healthCard.inProgressEn, scenarios.summary.aiResponse.healthCard.inProgress)}
                                  </span>
                                </div>
                                {/* Circular success widget */}
                                <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-slate-100 dark:border-t-neutral-800 flex items-center justify-center font-black text-[10px] text-slate-800 dark:text-white shadow-sm shrink-0">
                                  92%
                                </div>
                              </div>
                              <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 p-2 rounded-lg font-bold text-[9px] text-center border border-emerald-100 dark:border-emerald-900/30">
                                ✓ {t(scenarios.summary.aiResponse.healthCard.etcStatusEn, scenarios.summary.aiResponse.healthCard.etcStatus)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Down Button to How It Works */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex justify-center z-30">
          <button
            onClick={() => document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm transition-all animate-bounce"
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

      {/* See how it works Section */}
      <section
        id="how-it-works-section"
        className="pt-16 pb-24 md:pt-20 md:pb-32 bg-slate-50 dark:bg-black border-t border-slate-200 dark:border-slate-800 relative z-10 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16 reveal-on-scroll">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-6">
              {t('See How It Works', 'Lihat Bagaimana AI Bekerja')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
              {t(
                'From a simple thought to an organized workflow in seconds. Experience the magic of AI-driven project management.',
                'Dari ide kasar hingga menjadi alur kerja yang terstruktur dalam hitungan detik. Rasakan kemudahan manajemen proyek berbasis AI.'
              )}
            </p>
          </div>

          <div
            className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center reveal-on-scroll"
            style={{ animationDelay: '100ms' }}
          >
            {/* Left Side: Steps */}
            <div className="flex flex-col gap-3 lg:gap-4">
              {[
                {
                  id: 0,
                  title: t('1. Tell the AI what you need', '1. Tulis instruksi Anda pada AI'),
                  desc: t('Just type your request naturally. No need to fill out complex forms or select multiple dropdowns.', 'Ketik instruksi atau salin catatan kerja Anda. AI akan merespons layaknya asisten pribadi.'),
                },
                {
                  id: 1,
                  title: t('2. AI extracts the details', '2. AI menyaring informasi detail'),
                  desc: t('The Smart Assistant instantly pulls out the task title, assignees, deadlines, and generates a structured checklist.', 'Asisten pintar menyaring judul tugas, menentukan penanggung jawab, mendeteksi deadline, dan membuat sub-tugas.'),
                },
                {
                  id: 2,
                  title: t('3. Task appears on your board', '3. Tugas muncul di papan Kanban'),
                  desc: t('Boom! Your task is perfectly categorized, prioritized, and placed on your Kanban board ready for action.', 'Tugas yang rapi langsung disalurkan ke dalam kolom prioritas papan Kanban tim Anda.'),
                },
                {
                  id: 3,
                  title: t('4. Collaborate Instantly', '4. Mulai kolaborasi tim'),
                  desc: t('Team members get notified. Start discussions, share files, and track progress in one place without switching apps.', 'Anggota tim mendapat notifikasi instan. Anda bisa berdiskusi langsung di kolom detail tugas.'),
                },
                {
                  id: 4,
                  title: t('5. Automated Insights', '5. Analisis performa otomatis'),
                  desc: t('Generate executive summaries and workload analytics instantly with the click of a button.', 'Dapatkan rangkuman performa kerja proyek serta grafik kapasitas beban kerja tim secara real-time.'),
                },
              ].map((step) => (
                <div
                  key={step.id}
                  onClick={() => !showAuthForm && setSimStep(step.id)}
                  className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-300 border ${
                    simStep === step.id
                      ? 'bg-white dark:bg-[#0e1116] border-slate-900 dark:border-slate-100 shadow-xl scale-[1.02]'
                      : 'bg-transparent border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 opacity-60 hover:opacity-100'
                  }`}
                >
                  <h3
                    className={`text-base sm:text-lg font-bold mb-1.5 flex items-center gap-3 ${
                      simStep === step.id ? 'text-black dark:text-white' : 'text-slate-500 dark:text-slate-300'
                    }`}
                  >
                    <span className={simStep === step.id ? 'text-[#111E38] dark:text-[#FACC15]' : 'text-slate-400 dark:text-slate-500'}>
                      {stepIcons[step.id]}
                    </span>{' '}
                    {step.title}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm leading-relaxed font-medium ${
                      simStep === step.id
                        ? 'text-slate-600 dark:text-slate-200'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Right Side: Interactive Simulation */}
            <div className="relative h-[350px] sm:h-[450px] w-full rounded-[2rem] bg-white dark:bg-[#0e1116] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden group flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800/20 dark:to-slate-900/20"></div>

              {/* Step 0: Typing */}
              <div
                className={`absolute inset-0 p-8 flex flex-col justify-center transition-all duration-700 ${
                  simStep === 0 ? 'opacity-100 translate-y-0 z-20' : 'opacity-0 translate-y-8 z-0 pointer-events-none'
                }`}
              >
                <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center rounded-full text-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-white text-sm">Smart Assistant</div>
                      <div className="text-[10px] text-indigo-500">{t('Ready to help', 'Siap membantu')}</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {typedText}
                    <span className="inline-block w-[2px] h-4 bg-indigo-500 animate-pulse ml-1 align-middle"></span>
                  </div>
                </div>
              </div>
              {/* Step 1: AI Processing */}
              <div
                className={`absolute inset-0 p-8 flex flex-col justify-center transition-all duration-700 ${
                  simStep === 1 ? 'opacity-100 translate-y-0 z-20' : 'opacity-0 translate-y-8 z-0 pointer-events-none'
                }`}
              >
                <div className="bg-white dark:bg-neutral-900 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-5 shadow-xl ring-4 ring-indigo-500/10 flex flex-col h-full max-h-full">
                  <div className="flex justify-between items-center mb-4 shrink-0">
                    <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full inline-block"></span>
                      {t('Extracting 3 tasks...', 'Mengekstraksi 3 tugas...')}
                    </div>
                  </div>
                  <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 pb-1">
                    {/* Task 1 */}
                    <div
                      className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 animate-fade-up"
                      style={{ animationDelay: '300ms' }}
                    >
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1.5">
                        {t('Redesign homepage', 'Desain ulang beranda')}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-[#111E38] dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 py-0.5 px-2 rounded">
                          @budi
                        </span>
                        <span className="text-[9px] font-bold text-slate-400">{t('Next Friday', 'Jumat depan')}</span>
                      </div>
                    </div>
                    {/* Task 2 */}
                    <div
                      className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 animate-fade-up"
                      style={{ animationDelay: '600ms' }}
                    >
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1.5">
                        {t('Fix login API bug', 'Perbaiki bug login API')}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-[#111E38] dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 py-0.5 px-2 rounded">
                          @siti
                        </span>
                        <span className="text-[9px] font-bold text-red-500">ASAP / Segera</span>
                      </div>
                    </div>
                    {/* Task 3 */}
                    <div
                      className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 animate-fade-up"
                      style={{ animationDelay: '900ms' }}
                    >
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1.5">
                        {t('Update documentation', 'Perbarui dokumentasi')}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400">Backlog</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Kanban board placement */}
              <div
                className={`absolute inset-0 p-8 flex flex-col justify-center transition-all duration-700 ${
                  simStep === 2 ? 'opacity-100 translate-y-0 z-20' : 'opacity-0 translate-y-8 z-0 pointer-events-none'
                }`}
              >
                <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 shadow-xl flex flex-col h-full max-h-full">
                  <div className="text-xs font-black mb-3 border-b pb-2 text-slate-800 dark:text-white shrink-0">
                    📂 alurku. Kanban Board
                  </div>
                  <div className="flex gap-2 flex-1 overflow-hidden">
                    {/* Col 1 */}
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl flex flex-col gap-2">
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{t('To Do', 'Rencana')}</div>
                      <div className="bg-white dark:bg-neutral-900 border p-2 rounded shadow-sm text-[9px] font-bold">
                        {t('Update Doc', 'Perbarui Doc')}
                      </div>
                    </div>
                    {/* Col 2 */}
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl flex flex-col gap-2 border-t-2 border-[#2563eb] dark:border-t-[#38bdf8]">
                      <div className="text-[8px] font-black text-[#2563eb] dark:text-[#38bdf8] uppercase tracking-wider">{t('In Progress', 'Sedang Jalan')}</div>
                      <div className="bg-white dark:bg-neutral-900 border p-2 rounded shadow-sm text-[9px] font-bold">
                        {t('Redesign Homepage', 'Desain Beranda')}
                      </div>
                    </div>
                    {/* Col 3 */}
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl flex flex-col gap-2">
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{t('Done', 'Selesai')}</div>
                      <div className="bg-white dark:bg-neutral-900 border p-2 rounded shadow-sm text-[9px] font-bold line-through text-slate-400">
                        {t('Fix Login API', 'Perbaiki Login API')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Collaborate */}
              <div
                className={`absolute inset-0 p-8 flex flex-col justify-center transition-all duration-700 ${
                  simStep === 3 ? 'opacity-100 translate-y-0 z-20' : 'opacity-0 translate-y-8 z-0 pointer-events-none'
                }`}
              >
                <div className="bg-white dark:bg-neutral-900 border border-slate-200 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b pb-3 shrink-0">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-xs font-black text-slate-850 dark:text-white">{t('Redesign Homepage - Discussion', 'Desain Ulang Beranda - Diskusi')}</span>
                  </div>
                  <div className="space-y-3 text-[10px] sm:text-xs">
                    <div className="flex gap-2">
                      <span className="font-bold text-[#111E38] dark:text-slate-200">@budi:</span>
                      <span className="text-slate-500 dark:text-slate-350">{t("I've started the wireframes.", 'Saya sudah mulai merancang wireframe.')}</span>
                    </div>
                    <div className="flex gap-2 bg-indigo-50/50 dark:bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
                      <span className="font-bold text-purple-600">@alurku_ai:</span>
                      <span className="text-indigo-900 dark:text-indigo-300 font-medium">
                        {t('Tip: Make sure the brand color matches #FACC15.', 'Tip: Pastikan warna logo menggunakan kode warna #FACC15.')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Insights */}
              <div
                className={`absolute inset-0 p-8 flex flex-col justify-center transition-all duration-700 ${
                  simStep === 4 ? 'opacity-100 translate-y-0 z-20' : 'opacity-0 translate-y-8 z-0 pointer-events-none'
                }`}
              >
                <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-3">
                  <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5 border-b pb-2 shrink-0">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {t('alurku. Workload Insights', 'alurku. Analisis Beban Kerja')}
                  </span>
                  <div className="space-y-3 text-[10px] sm:text-xs">
                    <div>
                      <div className="flex justify-between font-bold text-slate-600 dark:text-slate-300 mb-1">
                        <span>Budi (Frontend)</span>
                        <span>0.8 ETC</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[80%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-bold text-slate-600 dark:text-slate-300 mb-1">
                        <span>Siti (Backend)</span>
                        <span>1.4 ETC</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full w-[95%] animate-pulse"></div>
                      </div>
                    </div>
                    <div className="text-[9px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-100 dark:border-rose-900/30 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>{t('Warning: Siti is over-allocated. Balance workload.', 'Peringatan: Beban kerja Siti berlebih. Seimbangkan tugas.')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
