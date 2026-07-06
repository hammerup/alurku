import React, { useState, useEffect } from 'react';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import TermsOfServiceModal from './TermsOfServiceModal';
import AuthForms from './AuthForms';
import LandingHeader from './components/LandingPage/LandingHeader';
import LandingFooter from './components/LandingPage/LandingFooter';
import LandingHero from './components/LandingPage/LandingHero';
import LandingHeroGlass from './components/LandingPage/LandingHeroGlass';
import DoubleBezel from './components/DoubleBezel';
import LandingAISection from './components/LandingPage/LandingAISection';
import LandingFeatures from './components/LandingPage/LandingFeatures';
import LandingFAQ from './components/LandingPage/LandingFAQ';
import LandingCTA from './components/LandingPage/LandingCTA';
import LandingSocialProof from './components/LandingPage/LandingSocialProof';
import LandingTestimonials from './components/LandingPage/LandingTestimonials';
import LandingFeaturesPage from './components/LandingPage/LandingFeaturesPage';
import LandingPricingPage from './components/LandingPage/LandingPricingPage';
import LandingGuidePage from './components/LandingPage/LandingGuidePage';
import LandingAboutPage from './components/LandingPage/LandingAboutPage';
import LandingDocumentationPage from './components/LandingPage/LandingDocumentationPage';
import LandingArticlePage from './components/LandingPage/LandingArticlePage';


export default function LandingPage({
  showAuthForm,
  setShowAuthForm,
  isLoginMode,
  setIsLoginMode,
  isResetMode,
  setIsResetMode,
  setResetToken,
  isForgotMode,
  setIsForgotMode,
  loginUsername,
  setLoginUsername,
  loginPassword,
  setLoginPassword,
  regFullName,
  setRegFullName,
  regEmail,
  setRegEmail,
  regConfirmPassword,
  setRegConfirmPassword,
  forgotEmail,
  setForgotEmail,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  handleLogin,
  handleRegister,
  handleForgotPassword,
  handleResetPassword,
  loginWithGoogle,
  isInstallable,
  handleInstallClick,
  language,
  setLanguage,
}) {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isSupportAlertOpen, setIsSupportAlertOpen] = useState(false);
  const getTabFromPath = (path) => {
    if (path.startsWith('/artikel')) return 'article';
    switch (path) {
      case '/fitur': return 'features';
      case '/harga': return 'pricing';
      case '/panduan': return 'guide';
      case '/tentang': return 'about';
      case '/dokumentasi': return 'documentation';
      default: return 'home';
    }
  };

  const getPathFromTab = (tab) => {
    switch (tab) {
      case 'features': return '/fitur';
      case 'pricing': return '/harga';
      case 'guide': return '/panduan';
      case 'about': return '/tentang';
      case 'documentation': return '/dokumentasi';
      case 'article': return window.location.pathname;
      default: return '/';
    }
  };

  const [currentTab, setCurrentTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return getTabFromPath(window.location.pathname);
    }
    return 'home';
  });

  // Listen to popstate changes (browser back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/masuk') {
        setShowAuthForm(true);
        setIsLoginMode(true);
        setIsForgotMode(false);
      } else if (path === '/daftar') {
        setShowAuthForm(true);
        setIsLoginMode(false);
        setIsForgotMode(false);
      } else if (path === '/lupa-sandi') {
        setShowAuthForm(true);
        setIsLoginMode(true);
        setIsForgotMode(true);
      } else if (['/', '/fitur', '/harga', '/panduan', '/tentang', '/dokumentasi'].includes(path) || path.startsWith('/artikel/')) {
        setShowAuthForm(false);
        setCurrentTab(getTabFromPath(path));
      } else {
        setCurrentTab(getTabFromPath(path));
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setShowAuthForm, setIsLoginMode, setIsForgotMode]);

  // Sync URL path with authentication form modes (masuk, daftar, lupa-sandi)
  useEffect(() => {
    if (showAuthForm) {
      if (isResetMode) {
        return; // maintain current reset/verify parameters in URL
      }
      let targetPath = '/masuk';
      if (isForgotMode) {
        targetPath = '/lupa-sandi';
      } else if (!isLoginMode) {
        targetPath = '/daftar';
      }
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    } else {
      // Always restore the landing tab URL when auth form is closed
      const currentTabPath = getPathFromTab(currentTab);
      if (window.location.pathname !== currentTabPath) {
        window.history.pushState({}, '', currentTabPath);
      }
      window.scrollTo({ top: 0 });
    }
  }, [showAuthForm, isLoginMode, isForgotMode, isResetMode, currentTab]);

  // Handle SEO & Crawler Compliance Standards (with GEO / LLM optimization)
  useEffect(() => {
    let title = "alurku. — Kuasai Waktumu, Lancarkan Alurmu.";
    let description = "alurku. adalah asisten cerdas yang mengubah tumpukan rencana kerjamu menjadi alur eksekusi yang rapi. Fokus pada hasil, biarkan AI kami yang mengatur jadwalnya.";
    let pageUrl = window.location.origin + window.location.pathname;
    let schemaType = "WebPage";

    if (showAuthForm) {
      if (isResetMode) {
        title = "Atur Ulang Kata Sandi | alurku.";
        description = "Atur ulang kata sandi akun alurku. Anda dengan aman.";
      } else if (isForgotMode) {
        title = "Pulihkan Kata Sandi | alurku.";
        description = "Pulihkan kata sandi akun alurku. Anda yang hilang.";
      } else if (isLoginMode) {
        title = "Masuk | alurku.";
        description = "Masuk ke workspace alurku. Anda untuk mengelola rencana kerja harian secara cerdas.";
      } else {
        title = "Daftar Akun Baru | alurku.";
        description = "Buat akun alurku. baru secara gratis dan mulailah menyusun jadwal harian otomatis berbasis AI.";
      }
    } else {
      switch (currentTab) {
        case 'features':
          title = "Fitur Cerdas | alurku.";
          description = "Jelajahi asisten perencana otomatis, visualisasi beban kerja, Kanban dan Gantt chart interaktif di alurku.";
          break;
        case 'pricing':
          title = "Harga Layanan | alurku.";
          description = "Daftar harga dan paket langganan alurku. yang terjangkau untuk kebutuhan personal hingga enterprise.";
          break;
        case 'guide':
          title = "Panduan Pengguna | alurku.";
          description = "Panduan lengkap penggunaan asisten cerdas alurku. untuk mengoptimalkan alur kerja harian Anda.";
          break;
        case 'about':
          title = "Tentang Kami | alurku.";
          description = "Misi dan visi alurku. dalam menghadirkan asisten cerdas pengatur beban kerja untuk produktivitas seimbang.";
          break;
        case 'documentation':
          title = "Dokumentasi Lengkap | alurku.";
          description = "Dokumentasi teknis, API, dan petunjuk integrasi alurku. untuk pengembang.";
          break;
        case 'article':
          title = "Artikel & Edukasi | alurku.";
          description = "Kumpulan artikel edukatif mengenai produktivitas, manajemen tugas, dan kecerdasan buatan.";
          break;
        default:
          title = "alurku. — Kuasai Waktumu, Lancarkan Alurmu.";
          description = "Berhenti mengingat semua tugasmu, mulailah menyelesaikannya. Asisten cerdas pengatur beban kerja otomatis.";
          break;
      }
    }

    // Set Document Title
    document.title = title;

    // Set Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description;

    // Set Hreflang Tags
    const cleanUpElements = [];
    
    const idHreflang = document.createElement('link');
    idHreflang.rel = 'alternate';
    idHreflang.hreflang = 'id-ID';
    idHreflang.href = pageUrl;
    document.head.appendChild(idHreflang);
    cleanUpElements.push(idHreflang);

    const enHreflang = document.createElement('link');
    enHreflang.rel = 'alternate';
    enHreflang.hreflang = 'en-ID';
    enHreflang.href = pageUrl;
    document.head.appendChild(enHreflang);
    cleanUpElements.push(enHreflang);

    // Set Canonical Self-Reference
    const canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = pageUrl;
    document.head.appendChild(canonicalLink);
    cleanUpElements.push(canonicalLink);

    // Structured Data (JSON-LD) for SEO and GEO (Generative Engine Optimization)
    const jsonLdScript = document.createElement('script');
    jsonLdScript.type = 'application/ld+json';
    const schemaData = {
      "@context": "https://schema.org",
      "@type": schemaType,
      "name": title,
      "description": description,
      "url": pageUrl,
      "inLanguage": ["id-ID", "en-ID"],
      "publisher": {
        "@type": "Organization",
        "name": "alurku.",
        "logo": {
          "@type": "ImageObject",
          "url": window.location.origin + "/favicon.png"
        }
      }
    };
    jsonLdScript.text = JSON.stringify(schemaData);
    document.head.appendChild(jsonLdScript);
    cleanUpElements.push(jsonLdScript);

    // Cleanup on unmount or state change
    return () => {
      cleanUpElements.forEach(el => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    };
  }, [showAuthForm, isLoginMode, isForgotMode, isResetMode, currentTab]);

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) setShowScrollTop(true);
      else setShowScrollTop(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for scroll animations (runs on tab switch too!)
  useEffect(() => {
    if (!showAuthForm) {
      const timer = setTimeout(() => {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-up');
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.1 }
        );

        document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showAuthForm, currentTab]);

  return (
    <div className={!showAuthForm ? "bg-glass-bg backdrop-blur-xs text-[#111E38] dark:text-slate-100 font-sans transition-colors duration-200 selection:bg-blue-500/20" : ""}>
      {!showAuthForm ? (
        <>
          <style>{`
            @keyframes fade-up {
              0% { opacity: 0; transform: translateY(30px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-up {
              animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .reveal-on-scroll { opacity: 0; }
            @keyframes float {
              0% { transform: translateY(0px) rotate(-2deg); }
              50% { transform: translateY(-15px) rotate(0deg); }
              100% { transform: translateY(0px) rotate(-2deg); }
            }
            .animate-float {
              animation: float 6s ease-in-out infinite;
            }
            @keyframes float-reverse {
              0% { transform: translateY(0px) rotate(2deg); }
              50% { transform: translateY(-10px) rotate(0deg); }
              100% { transform: translateY(0px) rotate(2deg); }
            }
            .animate-float-reverse {
              animation: float-reverse 7s ease-in-out infinite;
            }
            @keyframes fade-up {
              0% { opacity: 0; transform: translateY(10px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-up {
              animation: fade-up 0.5s ease-out both;
            }
            @keyframes scroll-x {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-scroll-x {
              animation: scroll-x 32s linear infinite;
              width: max-content;
            }
            .animate-scroll-x:hover {
              animation-play-state: paused;
            }
          `}</style>
          <LandingHeader
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            setIsLoginMode={setIsLoginMode}
            setShowAuthForm={setShowAuthForm}
            isInstallable={isInstallable}
            handleInstallClick={handleInstallClick}
            language={language}
            setLanguage={setLanguage}
          />

          {currentTab === 'home' && (
            <div className="relative w-full">
              <DoubleBezel className="w-full bg-white dark:bg-[#121B2D]/40 backdrop-blur-md overflow-hidden rounded-none border-x-0">
                <LandingHero
                  setIsLoginMode={setIsLoginMode}
                  setShowAuthForm={setShowAuthForm}
                  isInstallable={isInstallable}
                  handleInstallClick={handleInstallClick}
                  language={language}
                />
              </DoubleBezel>
            </div>
          )}

          {currentTab === 'home' && (
            <>
              <LandingSocialProof language={language} />
              <LandingAISection showAuthForm={showAuthForm} language={language} />
              <LandingFeatures showAuthForm={showAuthForm} language={language} />
              <LandingTestimonials language={language} />
              <LandingFAQ language={language} />
              <LandingCTA setIsLoginMode={setIsLoginMode} setShowAuthForm={setShowAuthForm} language={language} />
            </>
          )}

          {currentTab === 'features' && <LandingFeaturesPage language={language} />}
          {currentTab === 'pricing' && <LandingPricingPage language={language} />}
          {currentTab === 'guide' && <LandingGuidePage language={language} />}
          {currentTab === 'about' && <LandingAboutPage language={language} />}
          {currentTab === 'documentation' && <LandingDocumentationPage language={language} />}
          {currentTab === 'article' && <LandingArticlePage language={language} setCurrentTab={setCurrentTab} />}


          <LandingFooter
            setIsSupportAlertOpen={setIsSupportAlertOpen}
            setIsPrivacyOpen={setIsPrivacyOpen}
            setIsTermsOpen={setIsTermsOpen}
            language={language}
            isInstallable={isInstallable}
            handleInstallClick={handleInstallClick}
          />

          {/* Jump to Top Button */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 z-100 w-12 h-12 bg-white dark:bg-neutral-800 text-black dark:text-white border border-slate-200 dark:border-slate-700 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all duration-300 ${
              showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
            }`}
            title="Jump to Top"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path>
            </svg>
          </button>

          {isPrivacyOpen && <PrivacyPolicyModal setIsPrivacyOpen={setIsPrivacyOpen} />}
          {isTermsOpen && <TermsOfServiceModal setIsTermsOpen={setIsTermsOpen} />}

          {isSupportAlertOpen && (
            <div className="fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-100 p-4 transition-opacity duration-200">
              <div className="bg-white dark:bg-neutral-950 p-6 sm:p-10 w-full max-w-sm border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl md:rounded-[2.5rem] text-center mac-animate">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-200 dark:border-blue-800/50">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a9 9 0 0118 0v6M4 16H3a1 1 0 00-1 1v3a1 1 0 001 1h1a1 1 0 001-1v-3a1 1 0 00-1-1zm16 0h1a1 1 0 011 1v3a1 1 0 01-1 1h-1a1 1 0 01-1-1v-3a1 1 0 011-1z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-black dark:text-white mb-4 tracking-tighter">
                  Coming Soon
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8 text-sm font-medium leading-relaxed">
                  IT Support contact integration for guests is coming soon! Please log in to your account to submit a
                  support ticket.
                </p>
                <button
                  onClick={() => setIsSupportAlertOpen(false)}
                  className="w-full px-4 py-4 rounded-full font-bold text-[#111E38] bg-[#FACC15] hover:opacity-90 shadow-md transition-all tracking-widest text-xs hover:-translate-y-0.5"
                >
                  Understood
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <style>{`
            @keyframes form-fade {
              0% { opacity: 0; filter: blur(4px); transform: scale(0.98); }
              100% { opacity: 1; filter: blur(0); transform: scale(1); }
            }
            .form-animate {
              animation: form-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}</style>
          <AuthForms
            isLoginMode={isLoginMode}
            setIsLoginMode={setIsLoginMode}
            isResetMode={isResetMode}
            setIsResetMode={setIsResetMode}
            setResetToken={setResetToken}
            isForgotMode={isForgotMode}
            setIsForgotMode={setIsForgotMode}
            loginUsername={loginUsername}
            setLoginUsername={setLoginUsername}
            loginPassword={loginPassword}
            setLoginPassword={setLoginPassword}
            regFullName={regFullName}
            setRegFullName={setRegFullName}
            regEmail={regEmail}
            setRegEmail={setRegEmail}
            regConfirmPassword={regConfirmPassword}
            setRegConfirmPassword={setRegConfirmPassword}
            forgotEmail={forgotEmail}
            setForgotEmail={setForgotEmail}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            handleLogin={handleLogin}
            handleRegister={handleRegister}
            handleForgotPassword={handleForgotPassword}
            handleResetPassword={handleResetPassword}
            loginWithGoogle={loginWithGoogle}
            setIsPrivacyOpen={setIsPrivacyOpen}
            setIsTermsOpen={setIsTermsOpen}
            setShowAuthForm={setShowAuthForm}
            language={language}
            setLanguage={setLanguage}
          />
          {isPrivacyOpen && <PrivacyPolicyModal setIsPrivacyOpen={setIsPrivacyOpen} />}
          {isTermsOpen && <TermsOfServiceModal setIsTermsOpen={setIsTermsOpen} />}
        </>
      )}
    </div>
  );
}
