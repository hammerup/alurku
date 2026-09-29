import React from 'react';
import { motion } from 'framer-motion';

// Geometric AI Node Network icon (AI Planning) — clean, professional, and symmetrical SaaS design
const IconAI = () => (
  <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
    {/* Central core node */}
    <circle cx="40" cy="40" r="8" stroke="#FACC15" strokeWidth="2.5" fill="#111E38" />
    <circle cx="40" cy="40" r="3" fill="#FACC15" />

    {/* Symmetrical digital grid / network links */}
    <line x1="40" y1="16" x2="40" y2="32" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" />
    <line x1="40" y1="48" x2="40" y2="64" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" />
    <line x1="16" y1="40" x2="32" y2="40" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" />
    <line x1="48" y1="40" x2="64" y2="40" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" />

    {/* Diagonal dotted connection lines */}
    <line x1="23.03" y1="23.03" x2="34.34" y2="34.34" stroke="#FACC15" strokeWidth="1.5" strokeDasharray="3 2" />
    <line x1="56.97" y1="56.97" x2="45.66" y2="45.66" stroke="#FACC15" strokeWidth="1.5" strokeDasharray="3 2" />
    <line x1="56.97" y1="23.03" x2="45.66" y2="34.34" stroke="#FACC15" strokeWidth="1.5" strokeDasharray="3 2" />
    <line x1="23.03" y1="56.97" x2="34.34" y2="45.66" stroke="#FACC15" strokeWidth="1.5" strokeDasharray="3 2" />

    {/* Outer peripheral nodes */}
    <circle cx="40" cy="12" r="4" fill="#FACC15" />
    <circle cx="40" cy="68" r="4" fill="#FACC15" />
    <circle cx="12" cy="40" r="4" fill="#FACC15" />
    <circle cx="68" cy="40" r="4" fill="#FACC15" />

    <circle cx="21" cy="21" r="3" fill="#111E38" stroke="#FACC15" strokeWidth="1.5" />
    <circle cx="59" cy="59" r="3" fill="#111E38" stroke="#FACC15" strokeWidth="1.5" />
    <circle cx="59" cy="21" r="3" fill="#111E38" stroke="#FACC15" strokeWidth="1.5" />
    <circle cx="21" cy="59" r="3" fill="#111E38" stroke="#FACC15" strokeWidth="1.5" />

    {/* Outer orbit/ring indicating system processing */}
    <circle cx="40" cy="40" r="28" stroke="#FACC15" strokeWidth="1.5" strokeDasharray="5 4" strokeOpacity="0.4" />
  </svg>
);

// Calendar + clock icon (Timelines) — navy only
const IconTimeline = () => (
  <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
    {/* Calendar body */}
    <rect x="12" y="20" width="44" height="40" rx="4" stroke="#FACC15" strokeWidth="2"/>
    <line x1="12" y1="32" x2="56" y2="32" stroke="#FACC15" strokeWidth="2"/>
    <line x1="24" y1="14" x2="24" y2="26" stroke="#FACC15" strokeWidth="2" strokeLinecap="round"/>
    <line x1="44" y1="14" x2="44" y2="26" stroke="#FACC15" strokeWidth="2" strokeLinecap="round"/>
    {/* Grid dots */}
    {[22, 34, 46].map(x => [40, 50, 60].map(y => (
      <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" rx="1" fill="#FACC15" fillOpacity="0.3"/>
    )))}
    {/* Clock (navy, overlapping bottom-right) */}
    <circle cx="58" cy="56" r="14" fill="#111E38" stroke="#FACC15" strokeWidth="2"/>
    <circle cx="58" cy="56" r="14" fill="#FACC15" fillOpacity="0.1"/>
    <line x1="58" y1="50" x2="58" y2="56" stroke="#FACC15" strokeWidth="2" strokeLinecap="round"/>
    <line x1="58" y1="56" x2="63" y2="60" stroke="#FACC15" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="58" cy="56" r="2" fill="#FACC15"/>
  </svg>
);

// People / team icon (Workspace) — navy only
const IconTeam = () => (
  <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
    {/* Center person */}
    <circle cx="40" cy="28" r="10" stroke="#FACC15" strokeWidth="2"/>
    <path d="M22 66 Q22 50 40 50 Q58 50 58 66" stroke="#FACC15" strokeWidth="2" strokeLinecap="round"/>
    {/* Left person (smaller) */}
    <circle cx="18" cy="34" r="7" stroke="#FACC15" strokeWidth="1.5" fillOpacity="0"/>
    <path d="M6 62 Q6 50 18 50 Q24 50 28 54" stroke="#FACC15" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Right person (smaller) */}
    <circle cx="62" cy="34" r="7" stroke="#FACC15" strokeWidth="1.5" fillOpacity="0"/>
    <path d="M74 62 Q74 50 62 50 Q56 50 52 54" stroke="#FACC15" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Navy triangle/badge between them */}
    <path d="M40 40 L36 48 L44 48 Z" fill="#FACC15" fillOpacity="0.5"/>
    {/* Connection lines */}
    <line x1="25" y1="34" x2="30" y2="34" stroke="#FACC15" strokeWidth="1.5" strokeDasharray="2 1"/>
    <line x1="50" y1="34" x2="55" y2="34" stroke="#FACC15" strokeWidth="1.5" strokeDasharray="2 1"/>
  </svg>
);

// Database / import-export icon (Data Portability)
const IconPortability = () => (
  <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
    <rect x="16" y="18" width="48" height="44" rx="6" stroke="#FACC15" strokeWidth="2"/>
    <line x1="16" y1="32" x2="64" y2="32" stroke="#FACC15" strokeWidth="1.5"/>
    <line x1="32" y1="32" x2="32" y2="62" stroke="#FACC15" strokeWidth="1.5" strokeDasharray="3 2"/>
    <line x1="48" y1="32" x2="48" y2="62" stroke="#FACC15" strokeWidth="1.5" strokeDasharray="3 2"/>
    {/* Arrow badge */}
    <circle cx="56" cy="54" r="14" fill="#111E38" stroke="#FACC15" strokeWidth="2"/>
    <path d="M56 46 V58 M52 54 L56 58 L60 54" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Integration / webhook & tags icon
const IconIntegrations = () => (
  <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
    <circle cx="28" cy="30" r="10" stroke="#FACC15" strokeWidth="2"/>
    <circle cx="52" cy="50" r="10" stroke="#FACC15" strokeWidth="2"/>
    <path d="M35 37 L45 43" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round"/>
    <rect x="44" y="20" width="22" height="12" rx="3" stroke="#FACC15" strokeWidth="1.5"/>
    <circle cx="48" cy="26" r="2" fill="#FACC15"/>
    <rect x="14" y="48" width="22" height="12" rx="3" stroke="#FACC15" strokeWidth="1.5"/>
    <circle cx="18" cy="54" r="2" fill="#FACC15"/>
  </svg>
);

export default function LandingFeatures({ language }) {
  const isId = language === 'id';

  const features = [
    {
      icon: <IconAI />,
      title: isId ? 'Perencanaan AI Otomatis' : 'AI-Powered Planning',
      desc: isId
        ? 'Buat rencana proyek secara otomatis dan pecah tugas menggunakan asisten AI canggih kami. Hemat waktu berjam-jam untuk perencanaan administrasi.'
        : 'Automatically generate project plans and break down tasks with our advanced AI assistant. Save hours of administrative planning.',
    },
    {
      icon: <IconTimeline />,
      title: isId ? 'Linimasa Cerdas & Gantt' : 'Smart Timelines & Gantt',
      desc: isId
        ? 'Visualisasikan progres proyek, kelola tenggat waktu, dan sesuaikan jadwal dengan antarmuka drag-and-drop yang intuitif.'
        : 'Visualize project progress, manage deadlines, and adjust schedules in an intuitive drag-and-drop interface.',
    },
    {
      icon: <IconTeam />,
      title: isId ? 'Ruang Kerja Tim & Beban Kerja' : 'Unified Team & Workload',
      desc: isId
        ? 'Pusatkan komunikasi, distribusi kapasitas tim, dan pencegahan burnout agar seluruh anggota tim tetap seimbang.'
        : 'Centralize communication, balance team workload, and prevent burnout to keep everyone productive and healthy.',
    },
    {
      icon: <IconPortability />,
      title: isId ? 'Portabilitas Data & Impor CSV' : 'Data Portability & CSV Import',
      desc: isId
        ? 'Pindahkan tugas dari Excel, Trello, atau spreadsheet dalam hitungan detik. Ekspor seluruh data proyek kapan saja tanpa terkunci vendor.'
        : 'Migrate tasks from Excel, Trello, or spreadsheets in seconds. Export your complete project data anytime with zero vendor lock-in.',
    },
    {
      icon: <IconIntegrations />,
      title: isId ? 'Webhook Otomasi & Multi-Tag' : 'Webhook Automations & Tags',
      desc: isId
        ? 'Kirim notifikasi instan ke Slack atau Discord saat tugas diperbarui, dan rapikan ratusan tugas dengan label warna dinamis.'
        : 'Dispatch instant alerts to Slack or Discord when tasks change, and organize hundreds of tasks with dynamic color-coded tags.',
    },
  ];

  return (
    <section className="w-full py-24 px-8 lg:px-16 flex justify-center border-b border-neutral-200/50">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Row 1: Highlight Card (AI Planning) spanning both columns */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2 bg-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center md:items-start gap-8 border border-neutral-200/60 hover:shadow-lg transition-all duration-300"
        >
          <div className="shrink-0 bg-[#111E38] p-5 rounded-2xl shadow-md border-none">
            {features[0].icon}
          </div>
          <div className="flex-1 text-center md:text-left">
            <span className="bg-[#FACC15] text-[#111E38] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest inline-block mb-4">
              {isId ? 'Fitur Utama' : 'Featured Capability'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111E38] mb-4">
              {features[0].title}
            </h3>
            <p className="text-neutral-500 leading-relaxed text-sm sm:text-base">
              {features[0].desc}
            </p>
          </div>
        </motion.div>

        {/* Row 2: Card 2 & 3 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="bg-white rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center border border-neutral-200/60 hover:shadow-lg transition-all duration-300"
        >
          <div className="mb-6 bg-[#111E38] p-4 rounded-2xl shadow-md border-none">
            {features[1].icon}
          </div>
          <h3 className="text-xl font-extrabold text-[#111E38] mb-3">
            {features[1].title}
          </h3>
          <p className="text-neutral-500 leading-relaxed text-sm">
            {features[1].desc}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center border border-neutral-200/60 hover:shadow-lg transition-all duration-300"
        >
          <div className="mb-6 bg-[#111E38] p-4 rounded-2xl shadow-md border-none">
            {features[2].icon}
          </div>
          <h3 className="text-xl font-extrabold text-[#111E38] mb-3">
            {features[2].title}
          </h3>
          <p className="text-neutral-500 leading-relaxed text-sm">
            {features[2].desc}
          </p>
        </motion.div>

        {/* Row 3: Card 4 & 5 (New Capabilities) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="bg-white rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center border border-neutral-200/60 hover:shadow-lg transition-all duration-300"
        >
          <div className="mb-6 bg-[#111E38] p-4 rounded-2xl shadow-md border-none">
            {features[3].icon}
          </div>
          <h3 className="text-xl font-extrabold text-[#111E38] mb-3">
            {features[3].title}
          </h3>
          <p className="text-neutral-500 leading-relaxed text-sm">
            {features[3].desc}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center border border-neutral-200/60 hover:shadow-lg transition-all duration-300"
        >
          <div className="mb-6 bg-[#111E38] p-4 rounded-2xl shadow-md border-none">
            {features[4].icon}
          </div>
          <h3 className="text-xl font-extrabold text-[#111E38] mb-3">
            {features[4].title}
          </h3>
          <p className="text-neutral-500 leading-relaxed text-sm">
            {features[4].desc}
          </p>
        </motion.div>

      </div>
    </section>
  );
}
