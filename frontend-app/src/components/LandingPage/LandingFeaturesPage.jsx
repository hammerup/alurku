import React from 'react';
import { useSEO } from '../../hooks/useSEO';

export default function LandingFeaturesPage({ language }) {
  const tMsg = (en, id) => (language === 'id' ? id : en);

  useSEO({
    title: tMsg('Key Features', 'Fitur Utama'),
    description: tMsg(
      'Discover alurku.\'s smart features: Automated AI planning, workload balancing, and seamless visual task management.',
      'Jelajahi fitur cerdas alurku.: Perencana AI otomatis, keseimbangan beban kerja, dan manajemen tugas visual yang mulus.'
    ),
    path: '/fitur',
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": tMsg("alurku. Features", "Fitur alurku."),
      "description": tMsg(
        "Complete overview of alurku.\'s features including AI planning and workload analytics.",
        "Ringkasan lengkap fitur-fitur alurku. termasuk perencanaan AI dan analitik beban kerja."
      )
    }
  });

  const features = [
    {
      title: tMsg('Automated AI Planner', 'Asisten Perencana Otomatis'),
      description: tMsg(
        "Eliminate guesswork in time management. alurku.'s AI breaks down large tasks and predicts durations intelligently to ensure projects finish on time.",
        "Menghilangkan tebakan dalam manajemen waktu. AI alurku. memecah tugas besar dan memprediksi durasi pengerjaan secara cerdas agar proyek selesai tepat waktu."
      ),
      icon: (
        <svg className="w-7 h-7 text-[#111E38] dark:text-[#FACC15]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
        </svg>
      ),
      points: [
        tMsg('AI-based task duration predictions', 'Prediksi durasi pengerjaan berbasis AI'),
        tMsg('Automated task breakdown & time estimation', 'Pemecahan tugas & estimasi waktu otomatis'),
        tMsg('Flexible task priority adjustments', 'Penyesuaian prioritas tugas yang fleksibel'),
        tMsg('Smart notifications for deadline reminders', 'Notifikasi cerdas pengingat tenggat waktu')
      ]
    },
    {
      title: tMsg('Workload Balance & Anti-Burnout', 'Kerja Seimbang & Anti-Kewalahan'),
      description: tMsg(
        "Work-life balance is our priority. Track team workload in real-time and distribute tasks fairly to prevent burnout.",
        "Keseimbangan kerja adalah prioritas kami. Lacak beban kerja tim secara real-time dan bagikan tugas secara adil untuk mencegah burnout."
      ),
      icon: (
        <svg className="w-7 h-7 text-[#111E38] dark:text-[#FACC15]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      ),
      points: [
        tMsg('Team workload monitoring charts', 'Grafik pemantauan beban kerja (workload) tim'),
        tMsg('Early detection of potential stress and overload', 'Deteksi dini potensi stres dan kelebihan beban'),
        tMsg('Automated even distribution of tasks', 'Distribusi tugas merata secara otomatis'),
        tMsg('Periodic break recommendations for peak performance', 'Saran istirahat berkala untuk performa maksimal')
      ]
    },
    {
      title: tMsg('One Screen for All Progress', 'Satu Layar untuk Semua Progres'),
      description: tMsg(
        "Get the big picture of your projects in one place. Interactive visual designs make collaboration and task tracking seamless.",
        "Dapatkan gambaran besar proyek Anda dalam satu tempat. Desain visual yang interaktif memudahkan kolaborasi dan pelacakan tugas."
      ),
      icon: (
        <svg className="w-7 h-7 text-[#111E38] dark:text-[#FACC15]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
          <path d="M9 3v18"/>
          <path d="M15 3v18"/>
          <path d="M3 9h6"/>
          <path d="M3 15h6"/>
          <path d="M15 12h6"/>
        </svg>
      ),
      points: [
        tMsg('Seamless drag-and-drop Kanban board', 'Papan Kanban drag-and-drop yang mulus'),
        tMsg('Clear project timeline (Gantt Chart)', 'Garis waktu proyek (Gantt Chart) yang jelas'),
        tMsg('Filter tasks by priority and labels', 'Filter tugas berdasarkan prioritas dan label'),
        tMsg('Activity history and project progress logs', 'Riwayat aktivitas dan catatan perkembangan proyek')
      ]
    },
    {
      title: tMsg('Wide Integration & High Security', 'Integrasi Luas & Keamanan Tinggi'),
      description: tMsg(
        "Securely connect alurku. with your existing workflow. Built on a zero-trust authentication system.",
        "Hubungkan alurku. dengan alur kerja Anda yang sudah ada dengan aman. Dibangun dengan sistem otentikasi zero-trust."
      ),
      icon: (
        <svg className="w-7 h-7 text-[#111E38] dark:text-[#FACC15]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      ),
      points: [
        tMsg('Secure authentication via Google OAuth', 'Otentikasi aman via Google OAuth'),
        tMsg('PWA Installer for quick desktop & mobile access', 'PWA Installer untuk akses cepat di Desktop & Mobile'),
        tMsg('High-level data encryption protection', 'Proteksi enkripsi data tingkat tinggi'),
        tMsg('Flexible data export and import formats', 'Ekspor dan impor data dengan format fleksibel')
      ]
    }
  ];

  return (
    <div className="py-24 bg-white dark:bg-neutral-950 text-slate-900 dark:text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 reveal-on-scroll">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[#111E38] dark:text-white mb-6">
            {tMsg('Smart Features for Modern Collaboration', 'Fitur Cerdas untuk Kolaborasi Modern')}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            {tMsg(
              'Explore how alurku. helps your team plan, execute, and monitor projects without feeling overwhelmed.',
              'Jelajahi bagaimana alurku. membantu tim Anda merencanakan, melaksanakan, dan mengontrol proyek tanpa rasa kewalahan.'
            )}
          </p>
        </div>

        {/* Features List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-slate-50 dark:bg-neutral-900 border border-slate-200/60 dark:border-slate-800 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow reveal-on-scroll group"
            >
              <div className="w-14 h-14 bg-[#FACC15]/10 dark:bg-[#FACC15]/5 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-[#FACC15]/20 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                {feature.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium leading-relaxed">
                {feature.description}
              </p>
              <ul className="space-y-3.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                {feature.points.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-center gap-3">
                    <span className="text-[#111E38] dark:text-[#FACC15] text-lg font-black">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
