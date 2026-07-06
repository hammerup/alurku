import React from 'react';

export default function LandingSocialProof({ language }) {
  const t = (en, id) => (language === 'id' ? id : en);

  const logos = [
    {
      name: 'Nusantara Digital',
      abbr: 'ND',
      color: '#2563EB'
    },
    {
      name: 'Kreasi Inovasi',
      abbr: 'KI',
      color: '#7C3AED'
    },
    {
      name: 'Maju Bersama',
      abbr: 'MB',
      color: '#0891B2'
    },
    {
      name: 'Karya Bangsa',
      abbr: 'KB',
      color: '#059669'
    },
    {
      name: 'Solusi Prima',
      abbr: 'SP',
      color: '#DC2626'
    },
    {
      name: 'Teknologi Andal',
      abbr: 'TA',
      color: '#D97706'
    },
    {
      name: 'Lintas Cakrawala',
      abbr: 'LC',
      color: '#0F172A'
    },
    {
      name: 'Inovasi Nusantara',
      abbr: 'IN',
      color: '#7C3AED'
    },
  ];

  // Duplicate for infinite scroll illusion
  const allLogos = [...logos, ...logos];

  return (
    <section className="py-14 bg-[#F3F4F6] dark:bg-[#090D16] border-t border-b border-slate-200/50 dark:border-slate-800/50 relative z-10 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 text-center mb-8">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
          {t('Trusted by teams across industries', 'Dipercaya oleh tim dari berbagai industri')}
        </p>
      </div>

      {/* Scrolling logo strip */}
      <div className="relative overflow-hidden">
        {/* Left & right fade masks */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-linear-to-r from-[#F3F4F6]/80 dark:from-[#090D16]/80 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-linear-to-l from-[#F3F4F6]/80 dark:from-[#090D16]/80 to-transparent z-10" />

        <div className="flex gap-8 items-center animate-scroll-x whitespace-nowrap">
          {allLogos.map((logo, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3.5 px-6 py-3.5 bg-white/60 dark:bg-[#121B2D]/40 backdrop-blur-md border border-white/20 dark:border-neutral-800/40 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.15)] shrink-0 select-none grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 ease-out cursor-default"
            >
              {/* Logo monogram badge */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm"
                style={{ backgroundColor: logo.color }}
              >
                {logo.abbr}
              </div>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
