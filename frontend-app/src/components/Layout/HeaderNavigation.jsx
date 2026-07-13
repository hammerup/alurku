import React from 'react';
import { Avatar } from '../../SharedUI';

export default function HeaderNavigation({
  isDarkMode,
  setIsDarkMode,
  language,
  setLanguage,
  currentUser,
  avatarsMap = {},
  onLogoClick,
  onNavClick,
}) {
  const tMsg = (en, id) => (language === 'id' ? id : en);

  const handleNavClick = (e, destination) => {
    e.preventDefault();
    if (onNavClick) {
      onNavClick(destination);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 flex justify-between items-center w-full px-8 md:px-12 h-20 z-40 border-b transition-colors duration-700 ease-in-out ${
        isDarkMode ? 'bg-[#090D16]/60 border-white/5' : 'bg-[#F3F4F6]/60 border-black/5'
      } backdrop-blur-md`}
    >
      <div className="flex items-center gap-12">
        {/* Logo matching alurku. style */}
        <div
          onClick={onLogoClick}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity select-none"
        >
          <span className={`font-black text-2xl tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-[#001f3f]'}`}>
            alur<span className="text-[#FACC15]">ku</span>.
          </span>
        </div>

        {/* Top navigation links */}
        <nav className="hidden md:flex gap-8">
          <a
            href="#dashboard"
            onClick={(e) => handleNavClick(e, 'dashboard')}
            className={`transition-colors font-semibold text-sm cursor-pointer ${
              isDarkMode ? 'text-white/40 hover:text-white' : 'text-[#0b1c30]/60 hover:text-[#001f3f]'
            }`}
          >
            Dashboard
          </a>
          <a
            href="#projects"
            onClick={(e) => handleNavClick(e, 'projects')}
            className={`transition-colors font-semibold text-sm cursor-pointer ${
              isDarkMode ? 'text-white/40 hover:text-white' : 'text-[#0b1c30]/60 hover:text-[#001f3f]'
            }`}
          >
            Projects
          </a>
          <a
            href="#team"
            onClick={(e) => handleNavClick(e, 'team')}
            className={`transition-colors font-semibold text-sm cursor-pointer ${
              isDarkMode ? 'text-white/40 hover:text-white' : 'text-[#0b1c30]/60 hover:text-[#001f3f]'
            }`}
          >
            Team
          </a>
          <a
            href="#reports"
            onClick={(e) => handleNavClick(e, 'reports')}
            className={`transition-colors font-semibold text-sm cursor-pointer ${
              isDarkMode ? 'text-white/40 hover:text-white' : 'text-[#0b1c30]/60 hover:text-[#001f3f]'
            }`}
          >
            Reports
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        {/* Stylish Light/Dark Theme Switch Toggle */}
        <div className="flex items-center">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`relative w-14 h-8 rounded-full transition-all duration-500 ease-in-out p-1 flex items-center shadow-inner ${
              isDarkMode ? 'bg-neutral-800 border border-white/5' : 'bg-neutral-200 border border-black/5'
            }`}
            aria-label="Toggle theme"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out shadow-md ${
                isDarkMode 
                  ? 'translate-x-6 bg-[#001f3f] text-[#FACC15]' 
                  : 'translate-x-0 bg-white text-[#FACC15]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] select-none font-bold">
                {isDarkMode ? 'dark_mode' : 'light_mode'}
              </span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${
              isDarkMode
                ? 'border-white/10 hover:border-white/30 text-white bg-white/5'
                : 'border-[#0b1c30]/10 hover:border-[#0b1c30]/30 text-[#001f3f] bg-black/5'
            }`}
          >
            {language}
          </button>
        </div>

        <button className={`p-2 transition-colors ${isDarkMode ? 'text-white/40 hover:text-white' : 'text-[#0b1c30]/60 hover:text-[#001f3f]'}`}>
          <span className="material-symbols-outlined flex items-center">search</span>
        </button>

        <button className={`p-2 transition-colors ${isDarkMode ? 'text-white/40 hover:text-white' : 'text-[#0b1c30]/60 hover:text-[#001f3f]'}`}>
          <span className="material-symbols-outlined flex items-center">notifications</span>
        </button>

        <div className="w-9 h-9 rounded-full border border-white/10 overflow-hidden cursor-pointer hover:border-white/30 transition-colors">
          <Avatar
            name={currentUser}
            url={avatarsMap[currentUser]}
            size="w-9 h-9"
            textClass="text-xs"
          />
        </div>
      </div>
    </header>
  );
}
