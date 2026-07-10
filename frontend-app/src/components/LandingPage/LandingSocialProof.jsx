import React from 'react';
import { motion } from 'framer-motion';

const logos = [
  {
    name: 'accenture',
    svg: (
      <svg viewBox="0 0 100 30" className="h-10 w-auto fill-current">
        <text y="24" fontSize="22" fontFamily="serif" fontStyle="italic" fontWeight="500">accenture</text>
        <path d="M88 5 L93 5 L90.5 10 Z" />
      </svg>
    ),
  },
  {
    name: 'Google',
    svg: (
      <svg viewBox="0 0 80 28" className="h-10 w-auto fill-current">
        <text y="22" fontSize="22" fontFamily="sans-serif" fontWeight="400" letterSpacing="-0.5">Google</text>
      </svg>
    ),
  },
  {
    name: 'IBM',
    svg: (
      <svg viewBox="0 0 50 28" className="h-10 w-auto fill-current">
        <text y="22" fontSize="26" fontFamily="monospace" fontWeight="900" letterSpacing="2">IBM</text>
      </svg>
    ),
  },
  {
    name: 'Microsoft',
    svg: (
      <svg viewBox="0 0 120 28" className="h-10 w-auto fill-current">
        <rect x="0" y="2" width="10" height="10" />
        <rect x="12" y="2" width="10" height="10" />
        <rect x="0" y="14" width="10" height="10" />
        <rect x="12" y="14" width="10" height="10" />
        <text x="28" y="20" fontSize="18" fontFamily="sans-serif" fontWeight="300">Microsoft</text>
      </svg>
    ),
  },
  {
    name: 'salesforce',
    svg: (
      <svg viewBox="0 0 120 36" className="h-11 w-auto fill-current">
        {/* Cloud shape */}
        <path d="M30 28 Q15 28 15 20 Q15 14 20 12 Q20 6 26 6 Q29 2 34 4 Q38 0 43 4 Q50 2 52 8 Q58 8 58 15 Q58 22 52 22 Q50 28 44 28 Z" fillOpacity="0.9"/>
        <text x="64" y="24" fontSize="16" fontFamily="sans-serif" fontWeight="400">salesforce</text>
      </svg>
    ),
  },
  {
    name: 'Deloitte',
    svg: (
      <svg viewBox="0 0 90 28" className="h-10 w-auto fill-current">
        <text y="22" fontSize="22" fontFamily="serif" fontWeight="400">Deloitte.</text>
      </svg>
    ),
  },
];

export default function LandingSocialProof({ language }) {
  const isId = language === 'id';

  return (
    <section className="w-full py-16 bg-white border-b border-neutral-100">
      <div className="max-w-5xl mx-auto px-6 flex flex-col items-center">
        <p className="text-sm text-neutral-400 font-medium mb-12 tracking-wide">
          {isId ? 'Dipercaya oleh organisasi terkemuka' : 'Trusted by leading organizations'}
        </p>

        <div className="flex flex-wrap justify-center items-center gap-x-14 gap-y-8">
          {logos.map((logo) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-neutral-400 hover:text-neutral-600 transition-colors duration-300"
              style={{ filter: 'grayscale(100%)', opacity: 0.6 }}
            >
              {logo.svg}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
