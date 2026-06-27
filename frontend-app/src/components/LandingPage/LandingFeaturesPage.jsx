import React from 'react';

export default function LandingFeaturesPage() {
  const features = [
    {
      title: 'Asisten Perencana Otomatis',
      description: 'Menghilangkan tebakan dalam manajemen waktu. AI Alurku memprediksi durasi tugas secara cerdas dan menyusun jadwal harian Anda secara otomatis.',
      icon: '🤖',
      points: [
        'Prediksi durasi pengerjaan berbasis AI',
        'Penjadwalan harian cerdas otomatis',
        'Penyesuaian prioritas tugas yang fleksibel',
        'Notifikasi cerdas pengingat tenggat waktu'
      ]
    },
    {
      title: 'Kerja Seimbang & Anti-Kewalahan',
      description: 'Keseimbangan kerja adalah prioritas kami. Lacak beban kerja tim secara real-time dan bagikan tugas secara adil untuk mencegah burnout.',
      icon: '⚖️',
      points: [
        'Grafik pemantauan beban kerja (workload) tim',
        'Deteksi dini potensi stres dan kelebihan beban',
        'Distribusi tugas merata secara otomatis',
        'Saran istirahat berkala untuk performa maksimal'
      ]
    },
    {
      title: 'Satu Layar untuk Semua Progres',
      description: 'Dapatkan gambaran besar proyek Anda dalam satu tempat. Desain visual yang interaktif memudahkan kolaborasi dan pelacakan tugas.',
      icon: '📋',
      points: [
        'Papan Kanban drag-and-drop yang mulus',
        'Garis waktu proyek (Gantt Chart) yang jelas',
        'Filter tugas berdasarkan prioritas dan label',
        'Riwayat aktivitas dan catatan perkembangan proyek'
      ]
    },
    {
      title: 'Integrasi Luas & Keamanan Tinggi',
      description: 'Hubungkan Alurku dengan alur kerja Anda yang sudah ada dengan aman. Dibangun dengan sistem otentikasi zero-trust.',
      icon: '🔒',
      points: [
        'Otentikasi aman via Google OAuth',
        'PWA Installer untuk akses cepat di Desktop & Mobile',
        'Proteksi enkripsi data tingkat tinggi',
        'Ekspor dan impor data dengan format fleksibel'
      ]
    }
  ];

  return (
    <div className="py-24 bg-white dark:bg-neutral-950 text-slate-900 dark:text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 reveal-on-scroll">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[#111E38] dark:text-white mb-6">
            Fitur Cerdas untuk Kolaborasi Modern
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Jelajahi bagaimana Alurku membantu tim Anda merencanakan, melaksanakan, dan mengontrol proyek tanpa rasa kewalahan.
          </p>
        </div>

        {/* Features List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-slate-50 dark:bg-neutral-900 border border-slate-200/60 dark:border-slate-800 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow reveal-on-scroll"
            >
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 text-3xl rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-indigo-100 dark:border-indigo-900/30">
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
                    <span className="text-emerald-500 text-lg">✓</span>
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
