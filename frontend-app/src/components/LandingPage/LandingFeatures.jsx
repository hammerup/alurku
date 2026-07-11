import React from 'react';
import { motion } from 'framer-motion';

// Geometric AI Node Network icon (AI Planning) — clean, professional, and symmetrical SaaS design
const IconAI = () => (
  <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
    {/* Central core node */}
    <circle cx="40" cy="40" r="8" stroke="#111E38" strokeWidth="2.5" fill="white" />
    <circle cx="40" cy="40" r="3" fill="#111E38" />

    {/* Symmetrical digital grid / network links */}
    <line x1="40" y1="16" x2="40" y2="32" stroke="#111E38" strokeWidth="2" strokeLinecap="round" />
    <line x1="40" y1="48" x2="40" y2="64" stroke="#111E38" strokeWidth="2" strokeLinecap="round" />
    <line x1="16" y1="40" x2="32" y2="40" stroke="#111E38" strokeWidth="2" strokeLinecap="round" />
    <line x1="48" y1="40" x2="64" y2="40" stroke="#111E38" strokeWidth="2" strokeLinecap="round" />

    {/* Diagonal dotted connection lines */}
    <line x1="23.03" y1="23.03" x2="34.34" y2="34.34" stroke="#111E38" strokeWidth="1.5" strokeDasharray="3 2" />
    <line x1="56.97" y1="56.97" x2="45.66" y2="45.66" stroke="#111E38" strokeWidth="1.5" strokeDasharray="3 2" />
    <line x1="56.97" y1="23.03" x2="45.66" y2="34.34" stroke="#111E38" strokeWidth="1.5" strokeDasharray="3 2" />
    <line x1="23.03" y1="56.97" x2="34.34" y2="45.66" stroke="#111E38" strokeWidth="1.5" strokeDasharray="3 2" />

    {/* Outer peripheral nodes */}
    <circle cx="40" cy="12" r="4" fill="#111E38" />
    <circle cx="40" cy="68" r="4" fill="#111E38" />
    <circle cx="12" cy="40" r="4" fill="#111E38" />
    <circle cx="68" cy="40" r="4" fill="#111E38" />

    <circle cx="21" cy="21" r="3" fill="white" stroke="#111E38" strokeWidth="1.5" />
    <circle cx="59" cy="59" r="3" fill="white" stroke="#111E38" strokeWidth="1.5" />
    <circle cx="59" cy="21" r="3" fill="white" stroke="#111E38" strokeWidth="1.5" />
    <circle cx="21" cy="59" r="3" fill="white" stroke="#111E38" strokeWidth="1.5" />

    {/* Outer orbit/ring indicating system processing */}
    <circle cx="40" cy="40" r="28" stroke="#111E38" strokeWidth="1.5" strokeDasharray="5 4" strokeOpacity="0.4" />
  </svg>
);

// Calendar + clock icon (Timelines) — navy only
const IconTimeline = () => (
  <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
    {/* Calendar body */}
    <rect x="12" y="20" width="44" height="40" rx="4" stroke="#111E38" strokeWidth="2"/>
    <line x1="12" y1="32" x2="56" y2="32" stroke="#111E38" strokeWidth="2"/>
    <line x1="24" y1="14" x2="24" y2="26" stroke="#111E38" strokeWidth="2" strokeLinecap="round"/>
    <line x1="44" y1="14" x2="44" y2="26" stroke="#111E38" strokeWidth="2" strokeLinecap="round"/>
    {/* Grid dots */}
    {[22, 34, 46].map(x => [40, 50, 60].map(y => (
      <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" rx="1" fill="#111E38" fillOpacity="0.3"/>
    )))}
    {/* Clock (navy, overlapping bottom-right) */}
    <circle cx="58" cy="56" r="14" fill="white" stroke="#111E38" strokeWidth="2"/>
    <circle cx="58" cy="56" r="14" fill="#111E38" fillOpacity="0.06"/>
    <line x1="58" y1="50" x2="58" y2="56" stroke="#111E38" strokeWidth="2" strokeLinecap="round"/>
    <line x1="58" y1="56" x2="63" y2="60" stroke="#111E38" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="58" cy="56" r="2" fill="#111E38"/>
  </svg>
);

// People / team icon (Workspace) — navy only
const IconTeam = () => (
  <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
    {/* Center person */}
    <circle cx="40" cy="28" r="10" stroke="#111E38" strokeWidth="2"/>
    <path d="M22 66 Q22 50 40 50 Q58 50 58 66" stroke="#111E38" strokeWidth="2" strokeLinecap="round"/>
    {/* Left person (smaller) */}
    <circle cx="18" cy="34" r="7" stroke="#111E38" strokeWidth="1.5" fillOpacity="0"/>
    <path d="M6 62 Q6 50 18 50 Q24 50 28 54" stroke="#111E38" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Right person (smaller) */}
    <circle cx="62" cy="34" r="7" stroke="#111E38" strokeWidth="1.5" fillOpacity="0"/>
    <path d="M74 62 Q74 50 62 50 Q56 50 52 54" stroke="#111E38" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Navy triangle/badge between them */}
    <path d="M40 40 L36 48 L44 48 Z" fill="#111E38" fillOpacity="0.5"/>
    {/* Connection lines */}
    <line x1="25" y1="34" x2="30" y2="34" stroke="#111E38" strokeWidth="1.5" strokeDasharray="2 1"/>
    <line x1="50" y1="34" x2="55" y2="34" stroke="#111E38" strokeWidth="1.5" strokeDasharray="2 1"/>
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
        ? 'Visualisasikan progres proyek, kelola tenggat waktu, dan sesuaikan jadwal dengan antarmuka drag-and-drop.'
        : 'Visualize project progress, manage deadlines, and adjust schedules in a drag-and-drop interface.',
    },
    {
      icon: <IconTeam />,
      title: isId ? 'Ruang Kerja Tim Terpadu' : 'Unified Team Workspace',
      desc: isId
        ? 'Pusatkan komunikasi, berbagi file, dan umpan balik agar seluruh anggota tim tetap selaras.'
        : 'Centralize communication, file sharing, and feedback to keep everyone aligned.',
    },
  ];

  return (
    <section className="w-full py-24 px-8 lg:px-16 bg-white flex justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Row 1: Highlight Card (AI Planning) spanning both columns */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2 bg-neutral-50 rounded-[40px] p-8 sm:p-12 flex flex-col md:flex-row items-center md:items-start gap-8 border border-neutral-100 hover:shadow-lg transition-all duration-300"
        >
          <div className="shrink-0 bg-white p-5 rounded-2xl shadow-sm border border-neutral-100">
            {features[0].icon}
          </div>
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block bg-[#FACC15]/20 text-[#111E38] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-4">
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

        {/* Row 2: Left Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="bg-neutral-50 rounded-[40px] p-8 sm:p-10 flex flex-col items-center text-center border border-neutral-100 hover:shadow-lg transition-all duration-300"
        >
          <div className="mb-6 bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
            {features[1].icon}
          </div>
          <h3 className="text-xl font-extrabold text-[#111E38] mb-3">
            {features[1].title}
          </h3>
          <p className="text-neutral-500 leading-relaxed text-sm">
            {features[1].desc}
          </p>
        </motion.div>

        {/* Row 2: Right Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-neutral-50 rounded-[40px] p-8 sm:p-10 flex flex-col items-center text-center border border-neutral-100 hover:shadow-lg transition-all duration-300"
        >
          <div className="mb-6 bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
            {features[2].icon}
          </div>
          <h3 className="text-xl font-extrabold text-[#111E38] mb-3">
            {features[2].title}
          </h3>
          <p className="text-neutral-500 leading-relaxed text-sm">
            {features[2].desc}
          </p>
        </motion.div>

      </div>
    </section>
  );
}
