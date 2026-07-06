import React, { useState } from 'react';

const testimonials = [
  {
    name: 'Rina Kusumawati',
    role: { id: 'Manajer Proyek', en: 'Project Manager' },
    company: { id: 'Nusantara Digital', en: 'Nusantara Digital' },
    avatar: 'RK',
    avatarColor: '#2563EB',
    quote: {
      id: '"Sebelum pakai alurku., rapat koordinasi kami sering molor karena semua orang tidak tahu status tugas masing-masing. Sekarang, satu menit sebelum rapat dimulai semua sudah tahu apa yang harus dilaporkan."',
      en: '"Before alurku., our coordination meetings ran long because nobody knew the status of each task. Now, one minute before the meeting everyone already knows what to report."'
    },
    tag: { id: 'Tim 12 Orang', en: '12-Person Team' }
  },
  {
    name: 'Deni Prasetyo',
    role: { id: 'Tech Lead', en: 'Tech Lead' },
    company: { id: 'Kreasi Inovasi', en: 'Kreasi Inovasi' },
    avatar: 'DP',
    avatarColor: '#7C3AED',
    quote: {
      id: '"Fitur estimasi waktu AI-nya akurat banget. Tim saya tidak pernah lagi kehabisan kapasitas di tengah sprint karena alurku. selalu memberi peringatan lebih awal."',
      en: '"The AI time estimation is incredibly accurate. My team never runs out of capacity mid-sprint anymore because alurku. always gives early warnings."'
    },
    tag: { id: 'Tim Engineering', en: 'Engineering Team' }
  },
  {
    name: 'Sari Anggraini',
    role: { id: 'Creative Director', en: 'Creative Director' },
    company: { id: 'Maju Bersama Studio', en: 'Maju Bersama Studio' },
    avatar: 'SA',
    avatarColor: '#059669',
    quote: {
      id: '"Sebagai tim kreatif, kami selalu kewalahan dengan revisi yang bertumpuk. alurku. membantu kami melacak setiap versi revisi dalam satu tampilan yang rapi dan mudah dimengerti."',
      en: '"As a creative team, we were always overwhelmed by stacked revisions. alurku. helps us track every revision version in one clean, easy-to-understand view."'
    },
    tag: { id: 'Tim Kreatif', en: 'Creative Team' }
  },
  {
    name: 'Fajar Wibisono',
    role: { id: 'CEO & Co-Founder', en: 'CEO & Co-Founder' },
    company: { id: 'Solusi Prima Tech', en: 'Solusi Prima Tech' },
    avatar: 'FW',
    avatarColor: '#DC2626',
    quote: {
      id: '"alurku. bukan sekadar task manager. Ini adalah command center seluruh operasi startup kami. Dari onboarding klien sampai deployment produk, semuanya terpantau dalam satu platform."',
      en: '"alurku. is not just a task manager. It\'s the command center for our entire startup operations. From client onboarding to product deployment, everything is tracked on one platform."'
    },
    tag: { id: 'Startup B2B', en: 'B2B Startup' }
  }
];

const StarIcon = () => (
  <svg className="w-4 h-4 text-[#FACC15]" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const QuoteIcon = () => (
  <svg className="w-8 h-8 text-slate-200 dark:text-slate-800" fill="currentColor" viewBox="0 0 24 24">
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
  </svg>
);

export default function LandingTestimonials({ language }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const t = (en, id) => (language === 'id' ? id : en);

  return (
    <section
      id="testimonials-section"
      className="py-24 md:py-32 bg-white dark:bg-neutral-950 border-t border-slate-200 dark:border-slate-800 relative z-10 overflow-hidden"
    >
      {/* Subtle dot background */}
      <div className="absolute inset-0 bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-60" />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 reveal-on-scroll">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-3 block">
            {t('What our users say', 'Apa kata pengguna kami')}
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#111E38] dark:text-white mb-5 leading-tight">
            {t('Teams that have felt the difference', 'Tim-tim yang sudah merasakan perbedaannya')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto text-lg leading-relaxed">
            {t(
              'Real stories from real teams — not marketing copy.',
              'Cerita nyata dari tim nyata — bukan teks marketing.'
            )}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 reveal-on-scroll" style={{ animationDelay: '100ms' }}>
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`relative bg-[#FAFAFA] dark:bg-neutral-900 border rounded-2xl p-7 flex flex-col gap-5 cursor-pointer transition-all duration-300 ${
                activeIdx === idx
                  ? 'border-[#111E38] dark:border-[#FACC15] shadow-lg ring-1 ring-[#111E38]/10 dark:ring-[#FACC15]/10'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
              }`}
            >
              {/* Quote icon top-right */}
              <div className="absolute top-5 right-5">
                <QuoteIcon />
              </div>

              {/* 5-star rating */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
              </div>

              {/* Quote text */}
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed text-sm flex-1">
                {t(item.quote.en, item.quote.id)}
              </p>

              {/* Author Row */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                {/* Avatar monogram */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-[11px] shrink-0 shadow-sm"
                  style={{ backgroundColor: item.avatarColor }}
                >
                  {item.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-sm text-[#111E38] dark:text-white truncate">
                    {item.name}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                    {t(item.role.en, item.role.id)} · {t(item.company.en, item.company.id)}
                  </div>
                </div>

                {/* Tag badge */}
                <span className="shrink-0 text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  {t(item.tag.en, item.tag.id)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom trust indicator */}
        <div className="mt-12 text-center reveal-on-scroll" style={{ animationDelay: '200ms' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glass-bg dark:bg-neutral-900 border border-slate-200/50 dark:border-slate-800 text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-wide">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            {t('Verified user reviews', 'Ulasan dari pengguna terverifikasi')}
          </div>
        </div>
      </div>

      {/* Scroll Down to FAQ */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex justify-center z-30">
        <button
          onClick={() => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#111E38] dark:hover:text-[#FACC15] hover:border-[#111E38] dark:hover:border-[#FACC15] shadow-sm transition-all animate-bounce"
          title="Next Section"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>
    </section>
  );
}
