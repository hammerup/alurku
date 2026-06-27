import React, { useState } from 'react';

export default function LandingHeader({
  currentTab,
  setCurrentTab,
  setIsLoginMode,
  setShowAuthForm,
  isInstallable,
  handleInstallClick,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const tabs = [
    { id: 'home', label: 'Beranda', path: '/' },
    { id: 'features', label: 'Fitur', path: '/fitur' },
    { id: 'pricing', label: 'Harga', path: '/harga' },
    { id: 'guide', label: 'Panduan', path: '/panduan' },
    { id: 'about', label: 'Tentang Kami', path: '/tentang' },
  ];

  return (
    <header className="sticky top-0 z-[100] w-full bg-[#111E38] text-white border-b border-slate-900/50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo with favicon image icon */}
        <div
          onClick={() => setCurrentTab('home')}
          className="flex items-center gap-3 cursor-pointer hover:opacity-95 transition-opacity font-sans font-extrabold text-3xl lg:text-4xl tracking-tight select-none"
        >
          <img src="/favicon.png" alt="Alurku" className="w-8 h-8 md:w-9 md:h-9 rounded-xl object-cover shadow-sm" />
          <span className="text-white">
            alur<span className="text-[#FACC15]">ku</span>.
          </span>
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
              Install App
            </button>
          )}
          <button
            onClick={() => {
              setIsLoginMode(true);
              setShowAuthForm(true);
            }}
            className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
          >
            Masuk
          </button>
          <button
            onClick={() => {
              setIsLoginMode(false);
              setShowAuthForm(true);
            }}
            className="bg-[#FACC15] hover:bg-[#F5C200] text-[#111E38] font-extrabold py-2.5 px-6 rounded-full shadow-md transition-all text-sm flex items-center gap-1.5 group border border-[#EAB308]"
          >
            Coba Gratis
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
                Install App
              </button>
            )}
            <button
              onClick={() => {
                setIsLoginMode(true);
                setShowAuthForm(true);
                setIsOpen(false);
              }}
              className="text-left text-sm font-bold text-slate-300 hover:text-white"
            >
              Masuk
            </button>
            <button
              onClick={() => {
                setIsLoginMode(false);
                setShowAuthForm(true);
                setIsOpen(false);
              }}
              className="w-full bg-[#FACC15] text-[#111E38] hover:bg-[#F5C200] text-center font-extrabold py-3 rounded-full text-sm shadow-md border border-[#EAB308]"
            >
              Coba Gratis
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
