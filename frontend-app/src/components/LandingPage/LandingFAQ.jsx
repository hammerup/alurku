import React from 'react';
import { motion } from 'framer-motion';

export default function LandingFAQ({ language }) {
  const isId = language === 'id';

  const title = isId ? 'Pertanyaan yang Sering Diajukan' : 'Frequently Asked Questions';
  const subtitle = isId
    ? 'Segala hal yang perlu Anda ketahui tentang alurku.'
    : 'Everything you need to know about alurku.';

  const faqs = isId
    ? [
        {
          q: 'Apakah tersedia uji coba gratis?',
          a: 'Ya! Kami menawarkan paket gratis selamanya untuk tim kecil, dan uji coba gratis 14 hari untuk fitur Enterprise kami. Tidak memerlukan kartu kredit untuk memulai.',
        },
        {
          q: 'Apakah saya bisa menghubungkan aplikasi kerja saya?',
          a: 'Tentu saja. alurku. terhubung dengan Slack, Google Workspace, GitHub, Jira, dan lebih dari 50 aplikasi bisnis populer lainnya.',
        },
        {
          q: 'Seberapa aman data saya di alurku.?',
          a: 'Kami mengutamakan keamanan dengan enkripsi AES-256, kepatuhan SOC2, dan audit berkala oleh pihak ketiga. Privasi data Anda adalah prioritas utama kami.',
        },
      ]
    : [
        {
          q: 'Is there a free trial available?',
          a: 'Yes! We offer a completely free tier for small teams, and a 14-day free trial of our Enterprise features. No credit card required to start.',
        },
        {
          q: 'Can I integrate my existing tools?',
          a: 'Absolutely. alurku. connects with Slack, Google Workspace, GitHub, Jira, and over 50 other popular business applications.',
        },
        {
          q: 'How secure is my data?',
          a: 'We prioritize security with AES-256 encryption, SOC2 compliance, and regular third-party audits. Your data privacy is our top priority.',
        },
      ];

  return (
    <section className="w-full py-24 bg-white">
      <div className="max-w-3xl mx-auto px-8 sm:px-16">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111E38] mb-6">
            {title}
          </h2>
          <p className="text-base text-neutral-500 font-medium">
            {subtitle}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <details
                className="group border border-neutral-200 rounded-2xl overflow-hidden transition-all duration-300 open:shadow-lg open:shadow-[#111E38]/5"
                defaultOpen={idx === 0}
              >
                <summary className="flex justify-between items-center text-base sm:text-lg font-bold text-[#111E38] cursor-pointer p-6 hover:bg-neutral-50/50 transition-colors list-none select-none [&::-webkit-details-marker]:hidden">
                  <span>{faq.q}</span>
                  <svg
                    className="w-5 h-5 text-[#EAB308] group-open:rotate-180 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-sm sm:text-base text-neutral-500 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
