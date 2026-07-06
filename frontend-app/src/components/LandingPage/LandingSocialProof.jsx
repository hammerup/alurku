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
    <section className="py-14 bg-glass-bg dark:bg-[#090D16] border-t border-b border-slate-200/50 dark:border-slate-800/50 relative z-10 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 text-center mb-8">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
          {t('Trusted by teams across industries', 'Dipercaya oleh tim dari berbagai industri')}
        </p>
      </div>

      {/* Scrolling logo strip */}
      <div className="relative overflow-hidden">
        {/* Left & right fade masks */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-[#F3F4F6]/80 dark:from-[#090D16]/80 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#F3F4F6]/80 dark:from-[#090D16]/80 to-transparent z-10" />

        <div className="flex gap-8 items-center animate-scroll-x whitespace-nowrap">
          {allLogos.map((logo, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm shrink-0 select-none grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            >
              {/* Logo monogram badge */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-[10px] shrink-0"
                style={{ backgroundColor: logo.color }}
              >
                {logo.abbr}
              </div>
              <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 tracking-tight">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
