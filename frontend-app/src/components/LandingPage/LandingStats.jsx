import React from 'react';
import { motion } from 'framer-motion';

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
    <section className="w-full py-32 bg-[#111E38] text-white relative overflow-hidden">
      {/* Decorative blurred backgrounds */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FACC15] rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FACC15] rounded-full filter blur-[100px]"></div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 lg:px-16 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            {title}
          </h2>
          <div className="w-20 h-1 bg-[#FACC15] mx-auto rounded-full"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              className="text-center group"
            >
              <div
                className="mb-6 relative inline-block p-10 rounded-full transition-transform group-hover:scale-105 duration-500"
                style={{
                  background: 'radial-gradient(circle, rgba(250, 204, 21, 0.1) 0%, rgba(17, 30, 56, 0) 70%)',
                }}
              >
                <span
                  className="text-5xl sm:text-6xl font-black text-[#FACC15] mb-2 block"
                  style={{ textShadow: '0 0 20px rgba(250, 204, 21, 0.3)' }}
                >
                  {stat.value}
                </span>
                <div className="h-0.5 w-12 bg-white/10 mx-auto mb-4"></div>
                <p className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-neutral-300">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
