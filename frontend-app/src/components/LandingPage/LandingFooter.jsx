import React from 'react';

const navLinks = {
  product: {
    title: { id: 'Produk', en: 'Product' },
    links: [
      { label: { id: 'Fitur', en: 'Features' }, href: '/fitur' },
      { label: { id: 'Harga', en: 'Pricing' }, href: '/harga' },
      { label: { id: 'Panduan', en: 'Guide' }, href: '/panduan' },
      { label: { id: 'Catatan Rilis', en: 'Release Notes' }, href: '#' },
    ]
  },
  company: {
    title: { id: 'Perusahaan', en: 'Company' },
    links: [
      { label: { id: 'Tentang Kami', en: 'About Us' }, href: '/tentang' },
      { label: { id: 'Blog', en: 'Blog' }, href: '#' },
      { label: { id: 'Karir', en: 'Careers' }, href: '#' },
      { label: { id: 'Press Kit', en: 'Press Kit' }, href: '#' },
    ]
  },
  legal: {
    title: { id: 'Legal', en: 'Legal' },
    links: [
      { label: { id: 'Kebijakan Privasi', en: 'Privacy Policy' }, isModal: 'privacy' },
      { label: { id: 'Syarat Layanan', en: 'Terms of Service' }, isModal: 'terms' },
      { label: { id: 'Keamanan Data', en: 'Data Security' }, href: '#' },
      { label: { id: 'Dukungan', en: 'Support' }, isModal: 'support' },
    ]
  }
};

const socialLinks = [
  {
    label: 'Facebook',
    href: '#',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    )
  },
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    )
  },
  {
    label: 'TikTok',
    href: '#',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    )
  },
];

export default function LandingFooter({ setIsSupportAlertOpen, setIsPrivacyOpen, setIsTermsOpen, language, isInstallable, handleInstallClick }) {
  const t = (en, id) => (language === 'id' ? id : en);
  const year = new Date().getFullYear();

  const handleLinkClick = (link) => {
    if (link.isModal === 'privacy') setIsPrivacyOpen(true);
    else if (link.isModal === 'terms') setIsTermsOpen(true);
    else if (link.isModal === 'support') setIsSupportAlertOpen(true);
  };

  return (
    <footer className="bg-[#111E38] text-white relative z-10 border-t border-slate-800">
      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-6">

          {/* Brand Column (takes 2 cols on lg) */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#FACC15] rounded-lg flex items-center justify-center">
                <span className="text-[#111E38] font-black text-[28px] leading-none pb-1">a</span>
              </div>
              <span className="font-black text-lg tracking-tight text-white select-none">
                alur<span className="text-[#FACC15]">ku</span>.
              </span>
            </div>

            {/* Tagline */}
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs">
              {t(
                'Your smart work assistant that transforms your pile of plans into a clean execution flow.',
                'Asisten kerja cerdas yang mengubah tumpukan rencana kerjamu menjadi alur eksekusi yang rapi.'
              )}
            </p>

            {/* Install App Button — shown only when PWA install is available */}
            {isInstallable ? (
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FACC15] border border-[#EAB308] rounded-full w-max text-[11px] font-black text-[#111E38] hover:bg-[#F5C200] transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {t('Install App', 'Pasang Aplikasi')}
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full w-max text-[11px] font-bold text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {t('Available as PWA', 'Tersedia sebagai PWA')}
              </div>
            )}

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-1">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-[#FACC15] hover:text-[#111E38] hover:border-[#FACC15] transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          {Object.entries(navLinks).map(([key, section]) => (
            <div key={key} className="flex flex-col gap-4">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                {t(section.title.en, section.title.id)}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    {link.isModal ? (
                      <button
                        onClick={() => handleLinkClick(link)}
                        className="text-sm font-medium text-slate-400 hover:text-white transition-colors text-left"
                      >
                        {t(link.label.en, link.label.id)}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                      >
                        {t(link.label.en, link.label.id)}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] font-medium text-slate-500">
            © {year} alurku. — {t('All rights reserved.', 'Semua hak dilindungi.')}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
            <span>{t('Made with', 'Dibuat dengan')}</span>
            <svg className="w-3.5 h-3.5 text-[#FACC15]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>{t('in Indonesia', 'di Indonesia')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
