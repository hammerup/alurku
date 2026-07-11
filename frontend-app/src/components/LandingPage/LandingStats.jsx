import React from 'react';
import { motion } from 'framer-motion';
import parallaxLightBg from '../../assets/parallax_light_bg.png';

export default function LandingStats({ language }) {
  const isId = language === 'id';

  const title = isId ? 'Keberhasilan dalam Angka' : 'Success in Numbers';

  const stats = [
    {
      value: '50k+',
      label: isId ? 'Tim Percaya alurku.' : 'Teams Trust alurku.',
    },
    {
      value: '35%',
      label: isId ? 'Peningkatan Produktivitas' : 'Productivity Increase',
    },
    {
      value: '99.9%',
      label: isId ? 'Jaminan Uptime SLA' : 'Uptime SLA Guarantee',
    },
  ];

  return (
    <section 
      className="relative w-full py-32 bg-no-repeat bg-cover bg-center overflow-hidden border-t border-b border-neutral-100"
      style={{
        backgroundImage: `url(${parallaxLightBg})`,
        backgroundAttachment: 'fixed', // Desktop parallax
      }}
    >
      {/* Light overlay for clean contrast */}
      <div className="absolute inset-0 bg-neutral-100/40 dark:bg-black/35 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-8 lg:px-16 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111E38] dark:text-white mb-4">
            {title}
          </h2>
          <div className="w-20 h-1 bg-[#FACC15] mx-auto rounded-full"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.12, duration: 0.6 }}
              className="group"
            >
              <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-white/40 dark:border-neutral-800/40 rounded-[32px] p-10 text-center shadow-lg relative overflow-hidden transition-all duration-300 hover:scale-103">
                {/* Gemini-like glowing animated background gradient */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen"
                  style={{
                    backgroundImage: 'linear-gradient(-45deg, #a5f3fc, #c084fc, #fef08a, #f472b6)',
                    backgroundSize: '400% 400%',
                    animation: 'gemini-glow 15s ease infinite',
                    animationDelay: `${idx * 2}s`, // staggered starts
                  }}
                />

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{
                  backgroundImage: 'radial-gradient(circle, #111E38 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }} />

                <div className="relative z-10">
                  <span
                    className="text-5xl sm:text-6xl font-black text-[#111E38] dark:text-white mb-3 block"
                    style={{ textShadow: '0 4px 12px rgba(17, 30, 56, 0.08)' }}
                  >
                    {stat.value}
                  </span>
                  <div className="h-0.5 w-12 bg-[#FACC15] mx-auto mb-4"></div>
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-300">
                    {stat.label}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Global CSS style fallback is defined in LandingCTA.jsx, but we define it here too to make components self-contained */}
      <style>{`
        @keyframes gemini-glow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  );
}
