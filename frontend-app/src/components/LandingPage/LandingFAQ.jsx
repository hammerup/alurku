import React, { useState } from 'react';

export default function LandingFAQ({ language }) {
  const [activeFaq, setActiveFaq] = useState(null);

  const t = (en, id) => (language === 'id' ? id : en);

  const faqs = [
    {
      q: t('Does alurku. offer a free trial?', 'Apakah alurku. menawarkan uji coba gratis?'),
      a: t(
        'Yes! We offer a 14-day free trial with full access to all features—no credit card required. You can sign up and start organizing your team\'s workflow in seconds.',
        'Ya! Kami menawarkan uji coba gratis selama 14 hari dengan akses penuh ke seluruh fitur—tanpa perlu kartu kredit. Anda dapat langsung mendaftar dan mulai merapikan alur kerja tim Anda dalam hitungan detik.'
      )
    },
    {
      q: t('How does the alurku. AI Assistant help my team?', 'Bagaimana Asisten AI alurku. membantu tim saya?'),
      a: t(
        'Our built-in AI Assistant automatically analyzes workloads, extracts actionable tasks from meeting notes or raw ideas, and predicts execution times. It helps you balance work capacity and prevent burnout without administrative hassle.',
        'Asisten AI bawaan kami secara otomatis menganalisis beban kerja, mengekstraksi tugas dari catatan rapat atau ide kasar, dan memprediksi durasi kerja. Ini membantu Anda menyeimbangkan kapasitas kerja dan mencegah burnout tanpa pusing.'
      )
    },
    {
      q: t('Can alurku. integrate with Google Workspace?', 'Apakah alurku. dapat terintegrasi dengan Google Workspace?'),
      a: t(
        'Yes, absolutely. alurku. supports secure one-click sign-in with Google SSO, making it easy to onboard your entire team and synchronize task assignments instantly.',
        'Ya, tentu saja. alurku. mendukung login satu klik yang aman dengan Google SSO, memudahkan onboarding seluruh tim Anda dan menyinkronkan penugasan tugas secara instan.'
      )
    },
    {
      q: t('Is my project data secure and private?', 'Apakah data proyek saya aman dan bersifat rahasia?'),
      a: t(
        'Your data security is our top priority. All data is encrypted in transit and at rest using industry-standard protocols. Furthermore, we use enterprise APIs from Google Gemini and Groq, ensuring your data is never used to train public AI models.',
        'Keamanan data Anda adalah prioritas utama kami. Semua data dienkripsi selama transit dan penyimpanan menggunakan protokol berstandar industri. Selain itu, kami menggunakan API tingkat enterprise dari Google Gemini dan Groq yang menjamin data Anda tidak pernah digunakan untuk melatih model AI umum.'
      )
    },
    {
      q: t('Can alurku. be used on mobile devices?', 'Apakah alurku. dapat digunakan di perangkat seluler (HP)?'),
      a: t(
        'Yes. alurku. is fully responsive and optimized for mobile browsers. You can also install it as a Progressive Web App (PWA) on your home screen for a fast, native-like mobile app experience.',
        'Ya. alurku. sepenuhnya responsif dan dioptimalkan untuk peramban seluler. Anda juga dapat menginstalnya sebagai Progressive Web App (PWA) di layar utama untuk pengalaman aplikasi seluler yang cepat layaknya aplikasi native.'
      )
    },
    {
      q: t('What support options are available for users?', 'Bantuan apa saja yang tersedia untuk pengguna?'),
      a: t(
        'We provide dedicated customer support. You can reach out to our team at any time via our in-app live chat or official support email for priority assistance.',
        'Kami menyediakan layanan bantuan pelanggan khusus. Anda dapat menghubungi tim kami kapan saja melalui live chat di dalam aplikasi atau email dukungan resmi kami untuk mendapatkan bantuan prioritas.'
      )
    }
  ];

  return (
    <section
      id="faq-section"
      className="py-24 md:py-32 bg-glass-bg dark:bg-[#090D16] border-t border-slate-200/50 dark:border-slate-800/50 relative z-10"
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl md:text-5.5xl font-black tracking-tighter text-[#111E38] dark:text-white mb-12 text-center reveal-on-scroll">
          {t('Frequently Asked Questions', 'Pertanyaan yang Sering Diajukan')}
        </h2>
        
        <div className="space-y-4 reveal-on-scroll" style={{ animationDelay: '100ms' }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`border border-neutral-200/60 dark:border-neutral-800/30 rounded-[1.5rem] overflow-hidden bg-white/75 dark:bg-[#121B2D]/40 backdrop-blur-md transition-all duration-500 ease-out ${
                activeFaq === idx
                  ? 'shadow-[0_15px_35px_rgba(0,0,0,0.02)] border-[#FACC15] dark:border-[#FACC15]'
                  : 'hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between font-black text-left text-[#111E38] dark:text-white focus:outline-none"
              >
                <span className="text-base sm:text-lg pr-4">{faq.q}</span>
                <span className={`p-2 rounded-xl transition-all duration-300 ${activeFaq === idx ? 'bg-[#FACC15] text-[#111E38]' : 'bg-neutral-100 dark:bg-neutral-800 text-slate-400 dark:text-slate-500'}`}>
                  <svg
                    className={`w-4 h-4 transform transition-transform duration-500 ${
                      activeFaq === idx ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <div
                className={`px-6 overflow-hidden transition-all duration-500 ease-in-out ${
                  activeFaq === idx ? 'max-h-[800px] pb-6 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">{faq.a}</p>
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
