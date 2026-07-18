import React from 'react';
import { Avatar } from '../../SharedUI';
import { useAppContext } from '../../contexts/AppContext';

export default function HeaderNavigation({
  currentPath = '',
  isDarkMode,
  setIsDarkMode,
  language,
  setLanguage,
  currentUser,
  avatarsMap = {},
  onLogoClick,
  onNavClick,
}) {
  const { setIsMobileMenuOpen, selectedBoard, boards, setSelectedBoard, setViewMode, activeWorkspace } = useAppContext();
  const [isProjectsDropdownOpen, setIsProjectsDropdownOpen] = React.useState(false);
  const tMsg = (en, id) => (language === 'id' ? id : en);

  const handleNavClick = (e, destination) => {
    e.preventDefault();
    if (onNavClick) {
      onNavClick(destination);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 flex justify-between items-center w-full px-4 md:px-12 h-20 z-40 border-b transition-colors duration-700 ease-in-out ${
        isDarkMode ? 'bg-[#090D16]/60 border-white/5' : 'bg-[#F3F4F6]/60 border-black/5'
      } backdrop-blur-md`}
    >
      <div className="flex items-center gap-3 md:gap-12">
        {/* Hamburger Menu on Mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden p-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        {/* Logo matching alurku. style */}
        <div
          onClick={onLogoClick}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity select-none"
        >
          <span className={`font-black text-2xl tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-[#001f3f]'}`}>
            alur<span className="text-[#FACC15]">ku</span>.
          </span>
        </div>

        {/* Breadcrumbs penunjuk lokasi aktif (Sidebar-Centric Utility) */}
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 select-none">
          <span
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            onClick={() => {
              setSelectedBoard(null);
              setViewMode('overview');
              const slug = activeWorkspace?.name 
                ? activeWorkspace.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') 
                : 'main';
              window.history.pushState({}, '', `/workspace/${slug}`);
              window.dispatchEvent(new CustomEvent('alurku-navigate'));
            }}
          >
            {activeWorkspace ? activeWorkspace.name : 'Workspace'}
          </span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-slate-900 dark:text-white font-extrabold">
            {selectedBoard ? selectedBoard.name : tMsg('Overview', 'Ringkasan')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-6">
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
