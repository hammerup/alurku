import React from 'react';
import { motion } from 'framer-motion';
import parallaxLightBg from '../../assets/parallax_light_bg.png';

export default function LandingCTA({ setIsLoginMode, setShowAuthForm, language }) {
  const isId = language === 'id';

  const title = isId
    ? 'Siap untuk meningkatkan produktivitas tim Anda?'
    : "Ready to boost your team's productivity?";

  const desc = isId
    ? 'Bergabunglah dengan ribuan tim yang telah menggunakan alurku. untuk merapikan rencana kerja harian dan menyelesaikan proyek lebih cepat.'
    : 'Join thousands of teams already using alurku. to streamline their workflow and deliver projects faster.';

  const ctaBtn = isId ? 'Mulai Rapikan alurku.' : 'Start for Free';

  const handleStart = () => {
    setIsLoginMode(false);
    setShowAuthForm(true);
  };

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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-white/40 dark:border-neutral-800/40 rounded-[40px] p-12 sm:p-24 text-center shadow-xl relative overflow-hidden"
        >
          {/* Gemini-like glowing animated background gradient */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen"
            style={{
              backgroundImage: 'linear-gradient(-45deg, #a5f3fc, #c084fc, #fef08a, #f472b6)',
              backgroundSize: '400% 400%',
              animation: 'gemini-glow 15s ease infinite',
            }}
          />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, #111E38 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#111E38] dark:text-white mb-8 leading-tight">
              {title}
            </h2>
            <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-300 mb-12 max-w-xl mx-auto leading-relaxed font-semibold">
              {desc}
            </p>
            <button
              onClick={handleStart}
              className="bg-[#FACC15] hover:bg-[#EAB308] text-[#111E38] text-base sm:text-lg font-bold px-12 py-5 rounded-full hover:scale-105 transition-all shadow-xl shadow-[#FACC15]/20"
            >
              {ctaBtn}
            </button>
          </div>
        </motion.div>
      </div>

      {/* CSS Keyframes for Gemini Panning Glow */}
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
