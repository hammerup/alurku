import React from 'react';
import { motion } from 'framer-motion';

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
    <section className="w-full py-24 bg-[#F3F4F6]">
      <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white border border-neutral-200 rounded-[40px] p-12 sm:p-24 text-center shadow-xl shadow-[#111E38]/5 relative overflow-hidden"
        >
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#111E38] mb-8 leading-tight">
              {title}
            </h2>
            <p className="text-base sm:text-lg text-neutral-500 mb-12 max-w-xl mx-auto leading-relaxed font-medium">
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
    </section>
  );
}
