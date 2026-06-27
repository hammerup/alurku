import React, { useState } from 'react';

export default function LandingFAQ() {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: 'Apakah Alurku benar-benar gratis?',
      a: 'Aplikasi Alurku tidak memungut biaya lisensi per pengguna (zero per-user licensing fees). Aplikasi ini dirancang untuk dideploy di infrastruktur cloud Anda sendiri. Alurku dapat berjalan dengan lancar pada layanan free-tier (seperti Vercel dan Neon DB) untuk tim kecil, namun skala trafik yang lebih besar akan memerlukan sumber daya cloud berbayar dari penyedia hosting Anda.',
    },
    {
      q: 'Bagaimana cara kerja integrasi Google SSO?',
      a: 'Pengguna dapat masuk secara mudah menggunakan akun Google mereka. Sistem akan memverifikasi email secara otomatis dan menyiapkan akun mereka seketika.',
    },
    {
      q: 'Apakah saya perlu membayar untuk fitur AI?',
      a: 'Untuk menggunakan Asisten Cerdas AI, Anda cukup memasukkan API key Google Gemini atau Groq Anda sendiri di halaman pengaturan sistem. Kedua penyedia tersebut menawarkan tingkat gratis (free-tier) yang sangat memadai untuk kebutuhan tim standar.',
    },
    {
      q: 'Apakah data proyek saya digunakan untuk melatih AI?',
      a: 'Sama sekali tidak. Kami menggunakan API berstandar enterprise dari Google dan Groq yang menjamin kerahasiaan data tanpa retensi untuk pelatihan model. Data Anda sepenuhnya tetap menjadi milik Anda.',
    },
    {
      q: 'Browser apa saja yang didukung? Bisakah digunakan di HP?',
      a: 'Alurku dioptimalkan untuk browser desktop modern seperti Google Chrome, Firefox, dan Safari. Selain responsif di browser mobile, kami merekomendasikan instalasi sebagai Progressive Web App (PWA) untuk pengalaman terbaik layaknya aplikasi native di HP Anda.',
    },
    {
      q: 'Bisakah saya mengelola banyak proyek sekaligus?',
      a: 'Tentu saja! Dasbor "Tampilan Global" memungkinkan Anda memantau, memfilter, dan mengatur tugas di seluruh proyek yang Anda miliki secara bersamaan dengan fitur drag-and-drop.',
    },
    {
      q: 'Apa yang terjadi pada tugas dan riwayat obrolan lama?',
      a: 'Untuk menjaga performa aplikasi tetap cepat, sistem secara otomatis akan membersihkan tugas yang telah selesai setelah 6 bulan dan riwayat obrolan setelah 1 tahun.',
    },
  ];

  return (
        <section
          id="faq-section"
          className="py-24 md:py-32 bg-white dark:bg-neutral-950 border-t border-slate-200 dark:border-slate-800 relative z-10"
        >
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#111E38] dark:text-white mb-12 text-center reveal-on-scroll">
              Pertanyaan yang Sering Diajukan
            </h2>
            <div className="space-y-4 reveal-on-scroll" style={{ animationDelay: '100ms' }}>
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className={`border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-[#0e1116] transition-all duration-300 ${
                    activeFaq === idx
                      ? 'shadow-lg ring-2 ring-indigo-500/20'
                      : 'hover:border-indigo-300 dark:hover:border-indigo-800'
                  }`}
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between font-bold text-left text-slate-800 dark:text-white focus:outline-none"
                  >
                    <span className="text-base sm:text-lg pr-4">{faq.q}</span>
                    <span
                      className={`transform transition-transform duration-300 text-indigo-500 shrink-0 ${
                        activeFaq === idx ? 'rotate-180' : ''
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                  <div
                    className={`px-6 overflow-hidden transition-all duration-300 ${
                      activeFaq === idx ? 'max-h-[800px] pb-5 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Scroll Down to CTA */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex justify-center z-30">
            <button
              onClick={() => document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })}
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
  );
}
