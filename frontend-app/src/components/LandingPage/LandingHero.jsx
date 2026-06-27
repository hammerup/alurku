import React from 'react';

export default function LandingHero({ setIsLoginMode, setShowAuthForm, isInstallable, handleInstallClick }) {





  return (
    <>
        <div className="min-h-screen flex flex-col relative z-10">
          {/* Stripe-like Background Mesh */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-neutral-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:20px_20px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-neutral-500/5 via-transparent to-black/5 dark:from-white/5 dark:to-transparent"></div>
            <div className="absolute -top-24 right-0 -z-10 transform-gpu blur-3xl" aria-hidden="true">
              <div
                className="aspect-[1404/767] w-[87.75rem] bg-gradient-to-tr from-neutral-300 to-neutral-500 opacity-20 dark:from-neutral-700 dark:to-neutral-900 dark:opacity-40"
                style={{
                  clipPath:
                    'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
                }}
              ></div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-6 lg:px-8 py-6 flex justify-between items-center max-w-7xl mx-auto w-full relative z-20">
            <div className="font-sans font-extrabold text-2xl tracking-tight select-none shrink-0">
              <span className="text-black dark:text-white">alur</span>
              <span className="text-amber-600 dark:text-[#FACC15]">ku</span>
              <span className="text-black dark:text-white">.</span>
            </div>

            {/* Corporate Menu Links */}
            <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600 dark:text-slate-300">
              <button onClick={() => document.getElementById('specs-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-black dark:hover:text-white transition-colors">Fitur</button>
              <button onClick={() => document.getElementById('ai-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-black dark:hover:text-white transition-colors">Asisten AI</button>
              <button onClick={() => document.getElementById('comparison-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-black dark:hover:text-white transition-colors">Keunggulan</button>
              <button onClick={() => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-black dark:hover:text-white transition-colors">Tanya Jawab</button>
            </div>

            <div className="flex items-center gap-6">
              {isInstallable && (
                <button
                  onClick={handleInstallClick}
                  className="hidden sm:flex text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-3 3m0 0l-3-3m3 3V4"
                    ></path>
                  </svg>
                  Install App
                </button>
              )}
              <button
                onClick={() => {
                  setIsLoginMode(false);
                  setShowAuthForm(true);
                }}
                className="sm:hidden font-bold text-sm text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors"
              >
                Daftar
              </button>
              <button
                onClick={() => {
                  setIsLoginMode(false);
                  setShowAuthForm(true);
                }}
                className="hidden sm:flex bg-[#FACC15] hover:bg-[#F5C200] text-[#111E38] font-extrabold py-2 px-5 rounded-full transition-all text-sm items-center gap-2 group shadow-md"
              >
                Coba Gratis
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </nav>

          {/* Stripe-like Hero Section */}
          <main className="flex-1 flex items-center pt-10 pb-24 lg:pt-20 lg:pb-32 px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              <div className="max-w-2xl text-left">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white font-bold text-xs mb-6 reveal-on-scroll border border-neutral-200 dark:border-neutral-800"
                  style={{ animationDelay: '100ms' }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  kuasai waktumu, lancarkan alurmu.
                </div>
                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter mb-6 leading-[1.1] text-slate-900 dark:text-white reveal-on-scroll"
                  style={{ animationDelay: '200ms' }}
                >
                  Berhenti mengingat semua tugasmu, <br />
                  <span className="text-[#111E38] dark:text-[#FACC15]">
                    mulailah menyelesaikannya.
                  </span>
                </h1>
                <p
                  className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 font-medium leading-relaxed reveal-on-scroll"
                  style={{ animationDelay: '300ms' }}
                >
                  Alurku adalah asisten cerdas yang mengubah tumpukan rencana kerjamu menjadi alur eksekusi yang rapi. Fokus pada hasil, biarkan AI kami yang mengatur jadwalnya.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 reveal-on-scroll" style={{ animationDelay: '400ms' }}>
                  <button
                    onClick={() => {
                      setIsLoginMode(true);
                      setShowAuthForm(true);
                    }}
                    className="bg-[#FACC15] hover:bg-[#F5C200] text-[#111E38] font-extrabold py-3.5 px-8 rounded-full shadow-lg transition-all text-sm flex items-center justify-center gap-2 group hover:-translate-y-0.5"
                  >
                    Mulai Rapikan Alurku
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </button>
                  <button
                    onClick={() => document.getElementById('ai-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 font-bold py-3.5 px-8 border border-neutral-200 dark:border-neutral-800 rounded-full transition-all text-sm flex items-center justify-center shadow-sm"
                  >
                    Jelajahi Fitur
                  </button>
                  {isInstallable && (
                    <button
                      onClick={handleInstallClick}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-full shadow-lg transition-all text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-3 3m0 0l-3-3m3 3V4"
                        ></path>
                      </svg>{' '}
                      Install App
                    </button>
                  )}
                </div>
              </div>

              {/* Stripe-like Floating UI Mockup */}
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
                        <span className="text-[10px] sm:text-xs font-black tracking-tight text-slate-800 dark:text-white">Alurku Workspace</span>
                      </div>
                      <div className="space-y-1.5 text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        <div className="px-2 text-[8px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Proyek Aktif</div>
                        <div className="py-1 px-2 bg-slate-100 dark:bg-slate-800 text-[#111E38] dark:text-[#FACC15] rounded-md cursor-default flex items-center gap-1.5">📁 Alurku Webapp</div>
                        <div className="py-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-md transition-colors cursor-default flex items-center gap-1.5">📁 Sistem Database</div>
                        <div className="py-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-md transition-colors cursor-default flex items-center gap-1.5">📁 Integrasi API</div>
                        <div className="py-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-md transition-colors cursor-default flex items-center gap-1.5">📁 Desain Aplikasi</div>
                      </div>
                    </div>
                    {/* Mockup Kanban Board */}
                    <div className="flex-1 p-5 bg-white dark:bg-[#0e1116] flex flex-col overflow-hidden">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-white">Papan Kanban Pengembangan</span>
                        <span className="text-[8px] sm:text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-0.5 px-2 rounded-full font-bold">Aktif: 4 Tugas</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 flex-1 overflow-hidden">
                        {/* Column 1: Perlu Dikerjakan */}
                        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-2 flex flex-col gap-2 border border-slate-100 dark:border-slate-800/60 overflow-hidden">
                          <div className="text-[8px] sm:text-[9px] font-extrabold text-slate-500 uppercase tracking-wider flex justify-between px-1 mb-1">
                            <span>Perlu Dikerjakan</span>
                            <span className="bg-slate-200 dark:bg-slate-800 px-1.5 rounded">2</span>
                          </div>
                          
                          {/* Card 1 */}
                          <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col gap-1.5">
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight">Desain Antarmuka Alurku</span>
                            <div className="flex justify-between items-center">
                              <span className="text-[7px] sm:text-[8px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 py-0.5 px-1.5 rounded font-black">UI/UX</span>
                              <div className="flex items-center gap-1">
                                <span className="text-[7px] sm:text-[8px] text-red-500 font-bold">🔴 Tinggi</span>
                              </div>
                            </div>
                          </div>

                          {/* Card 2 */}
                          <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col gap-1.5">
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight">Integrasi API Gemini</span>
                            <div className="flex justify-between items-center">
                              <span className="text-[7px] sm:text-[8px] bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 py-0.5 px-1.5 rounded font-black">AI</span>
                              <div className="flex items-center gap-1">
                                <span className="text-[7px] sm:text-[8px] text-amber-500 font-bold">🟡 Sedang</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Sedang Dikerjakan */}
                        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-2 flex flex-col gap-2 border border-slate-100 dark:border-slate-800/60 overflow-hidden">
                          <div className="text-[8px] sm:text-[9px] font-extrabold text-slate-500 uppercase tracking-wider flex justify-between px-1 mb-1">
                            <span>Sedang Dikerjakan</span>
                            <span className="bg-slate-200 dark:bg-slate-800 px-1.5 rounded">1</span>
                          </div>

                          {/* Card 3 */}
                          <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col gap-1.5 border-l-4 border-l-blue-500">
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight">Pengembangan Landing Page</span>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full w-[65%]"></div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[7px] sm:text-[8px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 py-0.5 px-1.5 rounded font-black">Frontend</span>
                              <div className="flex items-center gap-1">
                                <span className="text-[7px] sm:text-[8px] text-red-500 font-bold">🔴 Tinggi</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Column 3: Selesai */}
                        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-2 flex flex-col gap-2 border border-slate-100 dark:border-slate-800/60 overflow-hidden">
                          <div className="text-[8px] sm:text-[9px] font-extrabold text-slate-500 uppercase tracking-wider flex justify-between px-1 mb-1">
                            <span>Selesai</span>
                            <span className="bg-slate-200 dark:bg-slate-800 px-1.5 rounded">1</span>
                          </div>

                          {/* Card 4 */}
                          <div className="bg-white/60 dark:bg-neutral-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-1.5 opacity-75">
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 line-through leading-tight">Setup Database Neon</span>
                            <div className="flex justify-between items-center">
                              <span className="text-[7px] sm:text-[8px] bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 py-0.5 px-1.5 rounded font-black">Backend</span>
                              <div className="flex items-center gap-1">
                                <span className="text-[8px] sm:text-[9px] text-green-500 font-bold">✅ Ok</span>
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

          {/* Scroll Down to AI */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex justify-center z-30">
            <button
              onClick={() => document.getElementById('ai-section')?.scrollIntoView({ behavior: 'smooth' })}
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
        </div>


    </>
  );
}
