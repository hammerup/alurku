import React from 'react';
import { motion } from 'framer-motion';
import parallaxNavyBg from '../../assets/parallax_navy_bg.png';

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
      className="relative w-full py-32 bg-no-repeat bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: `url(${parallaxNavyBg})`,
        backgroundAttachment: 'fixed', // Desktop parallax
      }}
    >
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-[#090D16]/30 pointer-events-none" />

      {/* Panning glow effect BEHIND the cards */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] sm:w-[900px] sm:h-[500px] rounded-full blur-[100px] sm:blur-[140px] opacity-30 dark:opacity-40 pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: 'linear-gradient(-45deg, #a5f3fc, #c084fc, #fef08a, #f472b6)',
          backgroundSize: '200% 200%',
          animation: 'gemini-glow 15s ease infinite',
        }}
      />

      <div className="max-w-[1440px] mx-auto px-8 lg:px-16 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            {title}
          </h2>
          <div className="w-20 h-1 bg-[#FACC15] mx-auto rounded-full"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.12, duration: 0.6 }}
              className="group"
            >
              <div className="bg-[#111E38]/85 dark:bg-[#090D16]/85 backdrop-blur-xl border border-white/10 rounded-[32px] p-10 text-center shadow-lg relative overflow-hidden transition-all duration-300 hover:scale-103">
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                  backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }} />

                <div className="relative z-10">
                  <span
                    className="text-5xl sm:text-6xl font-black text-white mb-3 block"
                    style={{ textShadow: '0 4px 12px rgba(255, 255, 255, 0.05)' }}
                  >
                    {stat.value}
                  </span>
                  <div className="h-0.5 w-12 bg-[#FACC15] mx-auto mb-4"></div>
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-neutral-300">
                    {stat.label}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

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
