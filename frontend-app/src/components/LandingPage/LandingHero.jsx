import React from 'react';

export default function LandingHero({ setIsLoginMode, setShowAuthForm, isInstallable, handleInstallClick, language }) {
  const t = (en, id) => (language === 'id' ? id : en);

  return (
    <>
      <div className="relative z-10 py-12 lg:py-20">
        {/* Abstract Elegant Mesh Gradient & Grid Background */}
        <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden">
          {/* Subtle geometric glowing spheres */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-400/10 blur-[120px] dark:bg-yellow-400/5"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[150px] dark:bg-blue-500/5"></div>
          {/* Grid lines pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [background-size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
        </div>

        {/* Hero Section Main Body */}
        <main className="flex-1 flex items-center pt-10 pb-24 lg:pt-20 lg:pb-32 px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="max-w-2xl text-left">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100/80 dark:bg-neutral-900/80 text-black dark:text-white font-bold text-xs mb-6 reveal-on-scroll border border-neutral-200/80 dark:border-neutral-800/80"
                style={{ animationDelay: '100ms' }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                {t('master your time, streamline your flow.', 'kuasai waktumu, lancarkan alurmu.')}
              </div>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter mb-6 leading-[1.1] text-slate-900 dark:text-white reveal-on-scroll"
                style={{ animationDelay: '200ms' }}
              >
                {t(
                  <>Stop remembering all your tasks, <br /><span className="text-[#111E38] dark:text-[#FACC15]">start getting them done.</span></>,
                  <>Berhenti mengingat semua tugasmu, <br /><span className="text-[#111E38] dark:text-[#FACC15]">mulailah menyelesaikannya.</span></>
                )}
              </h1>
              <p
                className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-medium mb-10 leading-relaxed reveal-on-scroll"
                style={{ animationDelay: '300ms' }}
              >
                {t(
                  'alurku. organizes your work plans into clear daily priorities, complete with capacity estimates and real-time team progress visualizations.',
                  'alurku. merapikan daftar rencana kerjamu menjadi prioritas harian yang jelas, lengkap dengan estimasi kapasitas, serta visualisasi progres tim secara real-time.'
                )}
              </p>
              <div
                className="flex flex-col sm:flex-row gap-4 justify-start items-stretch sm:items-center reveal-on-scroll"
                style={{ animationDelay: '400ms' }}
              >
                <button
                  onClick={() => {
                    setIsLoginMode(false);
                    setShowAuthForm(true);
                  }}
                  className="bg-[#FACC15] hover:bg-[#EAB308] dark:bg-[#FACC15] dark:hover:bg-[#EAB308] text-[#111E38] font-extrabold py-4 px-10 rounded-full shadow-2xl transition-all hover:-translate-y-1 text-center text-sm sm:text-base border border-[#111E38] dark:border-[#111E38]"
                >
                  {t('Try Free Now', 'Coba Gratis Sekarang')}
                </button>
                {isInstallable && (
                  <button
                    onClick={handleInstallClick}
                    className="bg-white hover:bg-slate-50 text-slate-800 font-extrabold py-4 px-10 rounded-full border border-slate-200 shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-3 3m0 0l-3-3m3 3V4"
                      ></path>
                    </svg>{' '}
                    {t('Install App', 'Pasang Aplikasi')}
                  </button>
                )}
              </div>
            </div>

            {/* Brand-safe Browser Mockup Frame containing HTML/CSS Kanban Board */}
            <div
              className="relative hidden lg:block lg:h-full lg:w-full perspective-[1000px] reveal-on-scroll"
              style={{ animationDelay: '400ms' }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-neutral-300/40 to-neutral-400/40 dark:from-neutral-700/40 dark:to-neutral-800/40 rounded-[2.5rem] transform rotate-3 scale-105 blur-lg"></div>

              <div className="relative w-[120%] -right-10 bg-white dark:bg-[#0e1116] border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden animate-float">
                {/* Mockup Header */}
                <div className="h-12 border-b border-slate-100 dark:border-slate-800 flex items-center px-4 gap-2 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
                    <div className="w-3 h-3 rounded-full bg-neutral-400 dark:bg-neutral-600"></div>
                    <div className="w-3 h-3 rounded-full bg-neutral-500 dark:bg-neutral-500"></div>
                  </div>
                  <div className="mx-auto bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-md px-24 py-1.5 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 font-mono">alurku.app</span>
                  </div>
                </div>

                {/* Mockup Body */}
                <div className="flex h-[400px]">
                  {/* Mockup Sidebar */}
                  <div className="w-1/4 border-r border-slate-100 dark:border-slate-800 p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="flex items-center gap-2 mb-6">
                      <img src="/favicon.png" className="w-6 h-6 rounded" alt="logo" />
                      {/* Logo text aligned with guidelines */}
                      <span className="text-[10px] sm:text-xs font-black tracking-tight text-slate-800 dark:text-white select-none">
                        alur<span className="text-[#EAB308] dark:text-[#FACC15]">ku</span>.
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      <div className="px-2 text-[8px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                        {t('Active Projects', 'Proyek Aktif')}
                      </div>
                      <div className="py-1 px-2 bg-slate-100 dark:bg-slate-800 text-[#111E38] dark:text-[#FACC15] rounded-md cursor-default flex items-center gap-1.5">
                        📁 alur<span className="text-[#EAB308] dark:text-[#FACC15]">ku</span>. Webapp
                      </div>
                      <div className="py-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-md transition-colors cursor-default flex items-center gap-1.5">{t('📁 Database System', '📁 Sistem Database')}</div>
                      <div className="py-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-md transition-colors cursor-default flex items-center gap-1.5">{t('📁 API Integration', '📁 Integrasi API')}</div>
                      <div className="py-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-md transition-colors cursor-default flex items-center gap-1.5">{t('📁 App Design', '📁 Desain Aplikasi')}</div>
                    </div>
                  </div>

                  {/* Mockup Kanban Board */}
                  <div className="flex-1 p-5 bg-white dark:bg-[#0e1116] flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-white">{t('Development Kanban Board', 'Papan Kanban Pengembangan')}</span>
                      <span className="text-[8px] sm:text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-0.5 px-2 rounded-full font-bold">{t('Active: 4 Tasks', 'Aktif: 4 Tugas')}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 flex-1 overflow-hidden">
                      {/* Column 1: To Do */}
                      <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-2 flex flex-col gap-2 border border-slate-100 dark:border-slate-800/60 overflow-hidden">
                        <div className="text-[8px] sm:text-[9px] font-extrabold text-slate-500 uppercase tracking-wider flex justify-between px-1 mb-1">
                          <span>{t('To Do', 'Perlu Dikerjakan')}</span>
                          <span className="bg-slate-200 dark:bg-slate-800 px-1.5 rounded">2</span>
                        </div>
                        
                        {/* Card 1 */}
                        <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col gap-1.5">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                            {t('alurku. UI Design', 'Desain Antarmuka alurku.')}
                          </span>
                          <div className="flex justify-between items-center">
                            <span className="text-[7px] sm:text-[8px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 py-0.5 px-1.5 rounded font-black">UI/UX</span>
                            <div className="flex items-center gap-1">
                              <span className="text-[7px] sm:text-[8px] text-red-500 font-bold">{t('🔴 High', '🔴 Tinggi')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col gap-1.5">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{t('Gemini API Integration', 'Integrasi API Gemini')}</span>
                          <div className="flex justify-between items-center">
                            <span className="text-[7px] sm:text-[8px] bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 py-0.5 px-1.5 rounded font-black">AI</span>
                            <div className="flex items-center gap-1">
                              <span className="text-[7px] sm:text-[8px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 py-0.5 px-1.5 rounded font-black">{t('🟡 Medium', '🟡 Sedang')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Column 2: In Progress */}
                      <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-2 flex flex-col gap-2 border border-slate-100 dark:border-slate-800/60 overflow-hidden">
                        <div className="text-[8px] sm:text-[9px] font-extrabold text-slate-500 uppercase tracking-wider flex justify-between px-1 mb-1">
                          <span>{t('In Progress', 'Sedang Dikerjakan')}</span>
                          <span className="bg-slate-200 dark:bg-slate-800 px-1.5 rounded">1</span>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col gap-1.5 border-l-4 border-l-blue-500">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{t('Landing Page Development', 'Pengembangan Landing Page')}</span>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full w-[65%]"></div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[7px] sm:text-[8px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 py-0.5 px-1.5 rounded font-black">Frontend</span>
                            <div className="flex items-center gap-1">
                              <span className="text-[7px] sm:text-[8px] text-red-500 font-bold">{t('🔴 High', '🔴 Tinggi')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Column 3: Done */}
                      <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-2 flex flex-col gap-2 border border-slate-100 dark:border-slate-800/60 overflow-hidden">
                        <div className="text-[8px] sm:text-[9px] font-extrabold text-slate-500 uppercase tracking-wider flex justify-between px-1 mb-1">
                          <span>{t('Done', 'Selesai')}</span>
                          <span className="bg-slate-200 dark:bg-slate-800 px-1.5 rounded">1</span>
                        </div>

                        {/* Card 4 */}
                        <div className="bg-white/60 dark:bg-neutral-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-1.5 opacity-75">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 line-through leading-tight">{t('Neon Database Setup', 'Setup Database Neon')}</span>
                          <div className="flex justify-between items-center">
                            <span className="text-[7px] sm:text-[8px] bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 py-0.5 px-1.5 rounded font-black">Backend</span>
                            <div className="flex items-center gap-1">
                              <span className="text-[8px] sm:text-[9px] text-green-500 font-bold">{t('✅ Ok', '✅ Ok')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative floating element */}
              <div className="absolute -bottom-10 -left-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-2xl animate-float-reverse flex items-center gap-4">
                <div className="text-3xl">✨</div>
                <div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-2"></div>
                  <div className="h-2 bg-black dark:bg-white rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Scroll Down Button to AI section */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex justify-center z-30">
          <button
            onClick={() => document.getElementById('ai-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-400 hover:text-[#111E38] dark:hover:text-[#FACC15] hover:border-[#111E38] dark:hover:border-[#FACC15] shadow-sm transition-all animate-bounce"
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
      </div>
    </>
  );
}
