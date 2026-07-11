import React from 'react';
import { motion } from 'framer-motion';
import parallaxBg from '../../assets/parallax_bg.png';

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
      className="relative w-full py-32 bg-no-repeat bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: `url(${parallaxBg})`,
        backgroundAttachment: 'fixed', // Desktop parallax
      }}
    >
      {/* Dark overlay to ensure text readability */}
      <div className="absolute inset-0 bg-[#090D16]/40 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-8 lg:px-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-[#111E38]/90 dark:bg-[#090D16]/90 backdrop-blur-lg border border-white/10 rounded-[40px] p-12 sm:p-24 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Subtle grid accent inside the card */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, #FACC15 1px, transparent 1px)',
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
              className="bg-[#FACC15] hover:bg-[#EAB308] text-[#111E38] text-base sm:text-lg font-bold px-12 py-5 rounded-full hover:scale-105 transition-all shadow-xl shadow-[#FACC15]/30"
            >
              {ctaBtn}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
