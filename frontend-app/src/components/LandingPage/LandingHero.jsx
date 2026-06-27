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
                  {/* Mockup Body (Real Workspace Image) */}
                  <div className="relative h-[400px] overflow-hidden select-none">
                    <img 
                      src="/hero_mockup.png" 
                      alt="Alurku Project Workspace Dashboard" 
                      className="w-full h-full object-cover object-top filter hover:brightness-[1.02] transition-all duration-300"
                    />
                    {/* Subtly overlayed glass shine */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 pointer-events-none"></div>
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
