import React from 'react';

export default function LandingCTA({ setIsLoginMode, setShowAuthForm, language }) {
  const t = (en, id) => (language === 'id' ? id : en);

  return (
    <section
      id="cta-section"
      className="py-20 md:py-28 bg-[#FACC15] relative z-10 overflow-hidden border-t border-yellow-500/20"
    >
      {/* Visual background grid pattern with dark navy overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#111e38_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center reveal-on-scroll">
        <h2 className="text-4xl md:text-5xl font-black text-[#111E38] mb-6 tracking-tighter leading-tight">
          {t("Ready to boost your team's productivity?", 'Siap meningkatkan produktivitas tim Anda?')}
        </h2>
        
        <p className="text-[#111E38]/80 text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
          {t(
            'Join now and experience the simplicity of modern, AI-powered workflow management.',
            'Bergabunglah sekarang dan rasakan kemudahan manajemen alur kerja modern yang didukung kecerdasan AI.'
          )}
        </p>
        
        <button
          onClick={() => {
            setIsLoginMode(false);
            setShowAuthForm(true);
          }}
          className="w-full sm:w-auto bg-[#111E38] hover:bg-[#1a2b4c] text-white font-extrabold py-4 px-10 rounded-full shadow-2xl transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] flex items-center justify-center gap-2.5 mx-auto tracking-wide text-sm sm:text-base border border-transparent"
        >
          <span>{t('Get Started with alurku.', 'Mulai dengan alurku.')}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </section>
  );
}
