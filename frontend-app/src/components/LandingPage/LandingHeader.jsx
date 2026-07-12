import React, { useState } from 'react';
import DoubleBezel from '../DoubleBezel';

export default function LandingHeader({
  currentTab,
  setCurrentTab,
  setIsLoginMode,
  setShowAuthForm,
  isInstallable,
  handleInstallClick,
  language,
  setLanguage,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const tabs = [
    { id: 'home', label: language === 'id' ? 'Beranda' : 'Home', path: '/' },
    { id: 'features', label: language === 'id' ? 'Fitur' : 'Features', path: '/fitur' },
    { id: 'pricing', label: language === 'id' ? 'Harga' : 'Pricing', path: '/harga' },
    { id: 'guide', label: language === 'id' ? 'Panduan' : 'Guide', path: '/panduan' },
    { id: 'about', label: language === 'id' ? 'Tentang Kami' : 'About Us', path: '/tentang' },
  ];

  return (
    <>
      <div className="w-full bg-[#FACC15] text-[#111E38] text-center py-2.5 px-4 text-xs md:text-sm font-bold relative z-50 select-none shadow-sm">
        {language === 'id' 
          ? '🚀 alurku. saat ini dalam tahap Private Beta. Daftar sekarang untuk mendapatkan akses awal gratis!' 
          : '🚀 alurku. is currently in Closed Beta. Sign up now for free early access!'}
      </div>
      <header className="sticky top-0 z-50 w-full bg-[#111E38] border-b border-white/5 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo — squircle monogram badge matching footer style */}
        <div
          onClick={() => setCurrentTab('home')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity select-none"
        >
          <div className="w-9 h-9 md:w-10 md:h-10 bg-[#FACC15] rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <span className="text-[#111E38] font-black text-[32px] md:text-[36px] leading-none pb-1">a</span>
          </div>
          <div className="flex flex-col justify-center leading-none">
            <span className="font-black text-2xl md:text-3xl tracking-tight text-white leading-none">
              alur<span className="text-[#FACC15]">ku</span>.
            </span>
            <span className="text-[9px] text-white/80 font-bold self-end mt-0.5 leading-none pr-1">
              Beta
            </span>
          </div>
        </div>

        {/* Desktop Navigation with pathname permalinks */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold">
          {tabs.map((tab) => (
            <a
              key={tab.id}
              href={tab.path}
              onClick={(e) => {
                e.preventDefault();
                setCurrentTab(tab.id);
              }}
              className={`transition-colors py-1 ${
                currentTab === tab.id
                  ? 'text-[#FACC15] border-b-2 border-[#FACC15]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {tab.label}
            </a>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="hidden md:flex items-center gap-6">
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="flex text-sm font-bold text-slate-300 hover:text-white transition-colors items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-3 3m0 0l-3-3m3 3V4"
                ></path>
              </svg>
              {language === 'id' ? 'Pasang Aplikasi' : 'Install App'}
            </button>
          )}

          {/* Language Toggle Button */}
          <button
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-700 hover:border-slate-500 text-xs font-bold transition-all text-slate-300 hover:text-white bg-slate-800/40"
            title={language === 'id' ? 'Ubah ke Bahasa Inggris' : 'Switch to Indonesian'}
          >
            <span>🌐</span>
            <span className="uppercase">{language || 'id'}</span>
          </button>

          <button
            onClick={() => {
              setIsLoginMode(true);
              setShowAuthForm(true);
            }}
            className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
          >
            {language === 'id' ? 'Masuk' : 'Login'}
          </button>
          <button
            onClick={() => {
              setIsLoginMode(false);
              setShowAuthForm(true);
            }}
            className="bg-[#FACC15] hover:bg-[#F5C200] text-[#111E38] font-extrabold py-2.5 px-6 rounded-full shadow-md transition-all text-sm flex items-center gap-1.5 group border border-[#EAB308]"
          >
            {language === 'id' ? 'Coba Gratis' : 'Try Free'}
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>

        {/* Hamburger Menu Toggle (Mobile) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#111E38] border-t border-slate-800/80 px-6 py-4 space-y-4">
          <div className="flex flex-col gap-3 font-bold">
            {tabs.map((tab) => (
              <a
                key={tab.id}
                href={tab.path}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentTab(tab.id);
                  setIsOpen(false);
                }}
                className={`text-left text-sm py-1.5 ${
                  currentTab === tab.id
                    ? 'text-[#FACC15] font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </a>
            ))}
          </div>
          <hr className="border-slate-800" />
          <div className="flex flex-col gap-4">
            {isInstallable && (
              <button
                onClick={handleInstallClick}
                className="flex text-sm font-bold text-slate-300 hover:text-white items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-3 3m0 0l-3-3m3 3V4"
                  ></path>
                </svg>
                {language === 'id' ? 'Pasang Aplikasi' : 'Install App'}
              </button>
            )}

            {/* Mobile Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              className="flex items-center gap-1.5 text-sm font-bold text-slate-300 hover:text-white text-left"
            >
              <span>🌐</span>
              <span>{language === 'id' ? 'Bahasa: Indonesia (Ubah)' : 'Language: English (Change)'}</span>
            </button>

            <button
              onClick={() => {
                setIsLoginMode(true);
                setShowAuthForm(true);
                setIsOpen(false);
              }}
              className="text-left text-sm font-bold text-slate-300 hover:text-white"
            >
              {language === 'id' ? 'Masuk' : 'Login'}
            </button>
            <button
              onClick={() => {
                setIsLoginMode(false);
                setShowAuthForm(true);
                setIsOpen(false);
              }}
              className="w-full bg-[#FACC15] text-[#111E38] hover:bg-[#F5C200] text-center font-extrabold py-3 rounded-full text-sm shadow-md border border-[#EAB308]"
            >
              {language === 'id' ? 'Coba Gratis' : 'Try Free'}
            </button>
          </div>
        </div>
      )}
    </header>
    </>
  );
}
