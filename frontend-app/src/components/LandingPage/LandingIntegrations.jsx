import React from 'react';
import { motion } from 'framer-motion';

export default function LandingIntegrations({ language }) {
  const isId = language === 'id';

  const title = isId
    ? 'Terhubung dengan aplikasi favorit Anda'
    : 'Connect with your favorite tools';

  const desc = isId
    ? 'alurku. terintegrasi secara mulus dengan aplikasi yang sudah Anda gunakan. Hubungkan semua data dalam satu ruang kerja yang terpadu.'
    : 'alurku. integrates seamlessly with the apps you already use. Bring everything together in one unified workspace.';

  const features = isId
    ? [
        'Sinkronisasi dengan Slack untuk pemberitahuan real-time',
        'Lampirkan dokumen secara langsung dari Google Drive',
        'Impor kendala dan tugas dengan mudah dari Jira',
      ]
    : [
        'Sync with Slack for real-time notifications',
        'Attach files directly from Google Drive',
        'Import issues seamlessly from Jira',
      ];

  const exploreText = isId ? 'Jelajahi semua integrasi' : 'Explore all integrations';

  return (
    <section className="w-full py-24 bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-8 lg:px-16 flex flex-col md:flex-row items-center gap-16 md:gap-20">
        
        {/* Left Side: Copy */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="w-full md:w-1/2"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111E38] mb-6 leading-tight">
            {title}
          </h2>
          <p className="text-base text-neutral-500 mb-10 leading-relaxed max-w-lg">
            {desc}
          </p>
          
          <div className="space-y-5 mb-10">
            {features.map((feat, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-6 h-6 bg-[#FACC15] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-[#111E38]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm sm:text-base font-semibold text-[#111E38]">
                  {feat}
                </p>
              </div>
            ))}
          </div>

          <a
            className="inline-flex items-center gap-2 font-bold text-[#111E38] hover:text-[#EAB308] group transition-all"
            href="#explore-integrations"
          >
            <span>{exploreText}</span>
            <svg
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </motion.div>

        {/* Right Side: Image/Visual */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="w-full md:w-1/2"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-[#111E38]/10 border border-neutral-100">
            <img
              alt="Integrations visual"
              className="w-full h-auto transform hover:scale-102 transition-transform duration-500"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPl7nVXVgGHRVR6rWlwIJtXigRnz_QQBpNQJe4sCPAqUfQGdIQgjOaWEQsT1NVybaIrAHx0YDXSrIWe1z_i068G8FSfCHv5IHw_aE2fhQ-_ktihANzdUiZqQYVatNzU9E6i9J3_3rq06uoULTsw0zczy6Yp0PX_Gev08Rl3ELtLJpoBtnkWhSR8gjyfXY3WnOFGM7aRdBpFXp_qpLAFCRjpws0eAHSQWSGaR9o1TFwYKs1ZfC9xTgmynfDgmDOhMGpbqr_v0um8VVd"
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
