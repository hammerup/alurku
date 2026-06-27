import React from 'react';

export default function LandingCTA({ setIsLoginMode, setShowAuthForm }) {
  return (
        <section
          id="cta-section"
          className="py-20 md:py-28 bg-white relative z-10 overflow-hidden border-t border-slate-200"
        >
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center reveal-on-scroll">
            <h2 className="text-4xl md:text-5xl font-black text-[#111E38] mb-6 tracking-tighter uppercase">
              Siap meningkatkan produktivitas tim Anda?
            </h2>
            <p className="text-neutral-500 text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto">
              Bergabunglah sekarang dan rasakan kemudahan manajemen alur kerja modern yang didukung kecerdasan AI.
            </p>
            <button
              onClick={() => {
                setIsLoginMode(false);
                setShowAuthForm(true);
              }}
              className="w-full sm:w-auto bg-[#FACC15] hover:bg-[#F5C200] text-[#111E38] font-extrabold py-4 px-10 rounded-full shadow-2xl transition-all hover:-translate-y-1 flex items-center justify-center gap-2 mx-auto uppercase tracking-wider text-xs sm:text-sm border border-[#EAB308]"
            >
              Mulai Rapikan Alurku <span className="text-xl leading-none">🚀</span>
            </button>
          </div>
        </section>
  );
}
