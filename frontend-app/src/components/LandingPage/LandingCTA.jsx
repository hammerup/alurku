import React from 'react';
import { motion } from 'framer-motion';
import parallaxNavyBg from '../../assets/parallax_navy_bg.png';

export default function LandingCTA({ setIsLoginMode, setShowAuthForm, language }) {
  const isId = language === 'id';

  const title = isId
    ? 'Siap mencoba cara kerja baru yang lebih seimbang?'
    : "Ready to experience a healthier way of working?";

  const desc = isId
    ? 'Dapatkan akses ke Sandbox Private Beta alurku. dan jadilah bagian dari revolusi produktivitas tanpa stres.'
    : 'Get access to the alurku. Private Beta Sandbox and be part of the stress-free productivity revolution.';

  const ctaBtn = isId ? 'Gabung Akses Beta' : 'Join Beta Access';

  const handleStart = () => {
    setIsLoginMode(false);
    setShowAuthForm(true);
  };

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

      {/* Panning glow effect BEHIND the card */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full blur-[100px] sm:blur-[140px] opacity-30 dark:opacity-40 pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: 'linear-gradient(-45deg, #a5f3fc, #c084fc, #fef08a, #f472b6)',
          backgroundSize: '200% 200%',
          animation: 'gemini-glow 15s ease infinite',
        }}
      />

      <div className="max-w-[1440px] mx-auto px-8 lg:px-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-[#111E38]/85 dark:bg-[#090D16]/85 backdrop-blur-xl border border-white/10 rounded-[40px] p-12 sm:p-24 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-8 leading-tight">
              {title}
            </h2>
            <p className="text-base sm:text-lg text-neutral-300 mb-12 max-w-xl mx-auto leading-relaxed font-semibold">
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
