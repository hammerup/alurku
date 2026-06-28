import React from 'react';
import { useSEO } from '../../hooks/useSEO';

export default function LandingAboutPage({ language }) {
  const t = (en, id) => (language === 'id' ? id : en);

  // SEO configuration
  useSEO({
    title: t('About Us', 'Tentang Kami'),
    description: t(
      'Learn about alurku.\'s mission: Balancing team productivity and workload management to prevent burnout.',
      'Ketahui misi alurku.: Menyeimbangkan produktivitas tim dan manajemen beban kerja untuk mencegah burnout.'
    ),
    path: '/tentang',
    schemaData: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": t("About alurku.", "Tentang alurku."),
      "description": t(
        "alurku. is a workload-aware collaborative task assistant designed to optimize team productivity.",
        "alurku. adalah asisten tugas kolaboratif sadar beban kerja yang dirancang untuk mengoptimalkan produktivitas tim."
      ),
      "publisher": {
        "@type": "Organization",
        "name": "alurku."
      }
    }
  });

  return (
    <div className="py-24 bg-white dark:bg-neutral-950 text-slate-900 dark:text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 reveal-on-scroll">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[#111E38] dark:text-white mb-6">
            {t('Our Mission: Balance Productivity', 'Misi Kami: Menyeimbangkan Produktivitas')}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            {t(
              'At alurku., we believe that the best productivity is not born from excessive pressure, but from a balanced and organized execution flow.',
              'Di alurku., kami percaya bahwa produktivitas terbaik tidak lahir dari tekanan kerja berlebih, melainkan dari alur eksekusi yang seimbang dan teratur.'
            )}
          </p>
        </div>

        {/* Content sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center mb-24 reveal-on-scroll">
          <div>
            <h2 className="text-3xl font-black text-[#111E38] dark:text-white mb-6 tracking-tight">
              {t('Brand Philosophy of alurku.', 'Filosofi Brand alurku.')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-4">
              {t(
                <>
                  The name <strong>alurku.</strong> is taken from our desire to give freedom to every individual and organization to own their own workflow (<em>"My Flow"</em>).
                </>,
                <>
                  Nama <strong>alur<span className="text-[#FACC15]">ku</span>.</strong> diambil dari keinginan kami untuk memberikan kebebasan bagi setiap individu dan organisasi untuk memiliki alur kerjanya sendiri (<em>"My Flow"</em>).
                </>
              )}
            </p>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-6">
              {t(
                <>
                  With our main tagline, <strong>"Master Your Time, Streamline Your Flow"</strong>, we shift the focus of management technology from just "high speed" to "harmonious human workload management".
                </>,
                <>
                  Dengan tagline utama kami, <strong>"Kuasai Waktumu, Lancarkan Alurmu"</strong>, kami menggeser fokus teknologi manajemen dari sekadar "kecepatan tinggi" menjadi "pengelolaan beban kerja manusia secara harmonis".
                </>
              )}
            </p>
            <div className="p-5 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 rounded-2xl">
              <span className="text-sky-600 dark:text-sky-400 font-bold block text-sm mb-1">
                {t('Our Main Motto', 'Motto Utama Kami')}
              </span>
              <p className="text-slate-700 dark:text-slate-300 italic text-sm font-medium">
                {t(
                  '"Hard work is important, but maintaining team balance and happiness is the key to long-term success."',
                  '"Kerja keras itu penting, namun menjaga keseimbangan dan kebahagiaan tim adalah kunci dari kesuksesan jangka panjang."'
                )}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-neutral-900 p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">
              {t('Contact Us', 'Hubungi Kami')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
              {t(
                'Have questions about products, partnerships, or need technical help? Send your message directly to our team.',
                'Punya pertanyaan seputar produk, kemitraan, atau butuh bantuan teknis? Kirimkan pesan Anda langsung kepada tim kami.'
              )}
            </p>
            <div className="space-y-4 text-sm font-medium">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 block">
                    {t('Email Address', 'Hubungi via Email')}
                  </span>
                  <a href="mailto:ekahary89@gmail.com" className="text-sky-600 dark:text-sky-400 hover:underline">
                    ekahary89@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 block">
                    {t('Headquarters', 'Kantor Utama')}
                  </span>
                  <span className="text-slate-750 dark:text-slate-350">Jakarta, Indonesia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
