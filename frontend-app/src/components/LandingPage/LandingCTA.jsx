import React from 'react';
import DoubleBezel from '../DoubleBezel';

export default function LandingCTA({ setIsLoginMode, setShowAuthForm, language }) {
  const t = (en, id) => (language === 'id' ? id : en);

  return (
    <section
      id="cta-section"
      className="py-24 md:py-32 bg-glass-bg dark:bg-[#090D16] relative z-10 overflow-hidden border-t border-slate-200/50 dark:border-slate-800/50"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-[#FACC15]/10 dark:bg-[#FACC15]/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <DoubleBezel 
          className="w-full border border-neutral-200/40 dark:border-neutral-800/30 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
          innerClassName="!bg-[#111E38] dark:!bg-[#121B2D]/40 backdrop-blur-md"
        >
          <div className="py-16 px-8 sm:px-16 text-center space-y-8 relative">
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] bg-size-[32px_32px] opacity-[0.03] dark:opacity-[0.1] pointer-events-none"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <span className="text-[#FACC15] dark:text-[#FACC15] font-extrabold tracking-widest uppercase text-xs block bg-white/10 dark:bg-[#FACC15]/10 px-4 py-1.5 rounded-full w-fit mx-auto border border-white/20 dark:border-[#FACC15]/20">
                {t('Get Started', 'Mulai Sekarang')}
              </span>
              <h2 className="text-4xl md:text-5.5xl font-black text-white dark:text-white tracking-tighter leading-none">
                {t("Ready to boost your team's productivity?", 'Siap meningkatkan produktivitas tim Anda?')}
              </h2>
              <p className="text-slate-200 dark:text-slate-350 text-lg md:text-xl font-semibold leading-relaxed max-w-2xl mx-auto">
                {t(
                  'Join now and experience the simplicity of modern, AI-powered workflow management.',
                  'Bergabunglah sekarang dan rasakan kemudahan manajemen alur kerja modern yang didukung kecerdasan AI.'
                )}
              </p>
            </div>

            <div className="relative z-10 pt-4">
              <button
                onClick={() => {
                  setIsLoginMode(false);
                  setShowAuthForm(true);
                }}
                className="w-full sm:w-auto bg-[#FACC15] hover:bg-[#EAB308] text-[#111E38] font-extrabold py-4 px-12 rounded-full shadow-[0_10px_30px_rgba(250,204,21,0.25)] hover:shadow-[0_15px_35px_rgba(250,204,21,0.35)] transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-3.5 mx-auto tracking-widest text-xs uppercase"
              >
                <span>{t('Get Started with alurku.', 'Mulai dengan alurku.')}</span>
                <svg className="w-4 h-4 shrink-0 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </DoubleBezel>
      </div>
    </section>
  );
}
