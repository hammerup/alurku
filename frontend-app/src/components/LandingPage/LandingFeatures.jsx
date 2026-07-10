import React from 'react';
import { motion } from 'framer-motion';

/* ── Dual-tone illustrations matching Stitch screenshot ── */

// Magic wand + sparkles icon (AI Planning) — clean, recognizable AI symbol
const IconAI = () => (
  <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
    {/* Wand body — diagonal from bottom-left to upper-right */}
    <line x1="16" y1="64" x2="52" y2="28" stroke="#111E38" strokeWidth="3" strokeLinecap="round"/>
    {/* Wand tip star */}
    <circle cx="54" cy="26" r="4" fill="#111E38"/>
    {/* Wand handle grip lines */}
    <line x1="16" y1="64" x2="22" y2="58" stroke="#111E38" strokeWidth="5" strokeLinecap="round" strokeOpacity="0.25"/>
    {/* Sparkle — large top-right */}
    <path d="M62 14 L63.2 18.8 L68 20 L63.2 21.2 L62 26 L60.8 21.2 L56 20 L60.8 18.8 Z" fill="#111E38"/>
    {/* Sparkle — medium left */}
    <path d="M24 26 L24.9 29.1 L28 30 L24.9 30.9 L24 34 L23.1 30.9 L20 30 L23.1 29.1 Z" fill="#111E38" fillOpacity="0.5"/>
    {/* Sparkle — small bottom-right */}
    <path d="M58 50 L58.6 52.4 L61 53 L58.6 53.6 L58 56 L57.4 53.6 L55 53 L57.4 52.4 Z" fill="#111E38" fillOpacity="0.35"/>
    {/* Sparkle — tiny top-left */}
    <path d="M32 14 L32.4 15.6 L34 16 L32.4 16.4 L32 18 L31.6 16.4 L30 16 L31.6 15.6 Z" fill="#111E38" fillOpacity="0.4"/>
    {/* Dashed arc hinting at AI generative flow */}
    <path d="M36 52 Q44 40 56 38" stroke="#111E38" strokeWidth="1.5" strokeDasharray="3 2" strokeLinecap="round" fillOpacity="0" fill="none" strokeOpacity="0.4"/>
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
        ? 'Buat rencana proyek secara otomatis dan pecah tugas menggunakan asisten AI canggih kami.'
        : 'Automatically generate project plans and break down tasks with our advanced AI assistant.',
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
    <section className="w-full py-24 px-6 lg:px-12 bg-white flex justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.12, duration: 0.55 }}
            className="bg-neutral-50 rounded-2xl p-10 flex flex-col items-center text-center border border-neutral-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            {/* Illustration */}
            <div className="mb-8">
              {feat.icon}
            </div>
            <h3 className="text-xl font-bold text-[#111E38] mb-4 leading-snug">
              {feat.title}
            </h3>
            <p className="text-neutral-500 leading-relaxed text-[15px]">
              {feat.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
