import { useState, useEffect } from 'react';
import axios from 'axios';


export default function ChangelogPage({ language, setLanguage, isInsideApp = false }) {
  const [changelogs, setChangelogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [expandedVersions, setExpandedVersions] = useState(new Set());

  const tMsg = (en, id) => (language === 'id' ? id : en);

  // Vendor names filter to guarantee no internal provider names are ever exposed to users
  const sanitizeVendorNames = (str) => {
    if (!str || typeof str !== 'string') return str;
    return str
      .replace(/\bgroq\b/gi, 'AI')
      .replace(/\bgemini\b/gi, 'AI')
      .replace(/antara AI dan AI/gi, 'antar-mesin AI')
      .replace(/between AI and AI/gi, 'between AI engines');
  };

  // Fetch changelogs from database backend
  useEffect(() => {
    let isMounted = true;
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const params = { lang: language };
        if (selectedType && selectedType !== 'all') {
          params.type = selectedType;
        }
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        const res = await axios.get('/api/changelogs', { params });
        if (isMounted) {
          const sanitizedLogs = (res.data || []).map((log) => ({
            ...log,
            title: sanitizeVendorNames(log.title),
            changes: Array.isArray(log.changes) ? log.changes.map(sanitizeVendorNames) : [],
          }));
          setChangelogs(sanitizedLogs);
        }
      } catch (err) {
        console.error('Failed to load changelogs from database', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLogs();
    return () => {
      isMounted = false;
    };
  }, [language, selectedType, searchQuery]);

  // SEO & Metadata Management
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const originalTitle = document.title;
    const titleText = language === 'id'
      ? 'Catatan Rilis & Riwayat Versi | alurku.'
      : 'Release Notes & Changelog | alurku.';
    const descText = language === 'id'
      ? 'Pelajari pembaruan fitur, peningkatan arsitektur, dan perbaikan sistem alurku. terlengkap dari awal pengembangan hingga rilis terkini.'
      : 'Explore product updates, new features, architectural improvements, and bug fixes across all versions of alurku.';

    document.title = titleText;

    let metaDesc = document.querySelector('meta[name="description"]');
    let createdDesc = false;
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
      createdDesc = true;
    }
    const originalDesc = metaDesc.getAttribute('content') || '';
    metaDesc.setAttribute('content', descText);

    // Canonical link
    const canonicalUrl = window.location.origin + '/catatan-rilis';
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    let createdCanonical = false;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
      createdCanonical = true;
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // JSON-LD Structured Data
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.id = 'changelog-schema';
    schemaScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: titleText,
      description: descText,
      url: canonicalUrl,
      author: {
        '@type': 'Organization',
        name: 'alurku.',
        url: window.location.origin,
      },
      publisher: {
        '@type': 'Organization',
        name: 'alurku.',
        logo: {
          '@type': 'ImageObject',
          url: window.location.origin + '/favicon.ico',
        },
      },
    });
    document.head.appendChild(schemaScript);

    return () => {
      document.title = originalTitle;
      if (createdDesc && metaDesc) {
        metaDesc.remove();
      } else if (metaDesc) {
        metaDesc.setAttribute('content', originalDesc);
      }
      if (createdCanonical && canonicalLink) {
        canonicalLink.remove();
      }
      const existingSchema = document.getElementById('changelog-schema');
      if (existingSchema) existingSchema.remove();
    };
  }, [language]);

  const toggleExpand = (version) => {
    setExpandedVersions((prev) => {
      const next = new Set(prev);
      if (next.has(version)) {
        next.delete(version);
      } else {
        next.add(version);
      }
      return next;
    });
  };

  const handleBackToApp = () => {
    const targetUrl = isInsideApp ? '/dashboard' : '/';
    window.history.pushState({}, '', targetUrl);
    window.dispatchEvent(new CustomEvent('alurku-navigate'));
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const typePills = [
    { id: 'all', label: tMsg('All Updates', 'Semua Pembaruan') },
    { id: 'major', label: tMsg('Major Releases', 'Rilis Utama') },
    { id: 'feature', label: tMsg('Features', 'Fitur Baru') },
    { id: 'release', label: tMsg('Milestones', 'Milestone') },
  ];

  return (
    <div className={`min-h-screen bg-[#F3F4F6] dark:bg-[#0d0f11] text-[#111E38] dark:text-slate-100 ${isInsideApp ? 'pb-20 pt-6 px-4 md:px-8' : 'pb-24 pt-12 px-4 sm:px-6 lg:px-8'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumbs & Back Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            <button
              onClick={handleBackToApp}
              className="hover:text-[#111E38] dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>{isInsideApp ? tMsg('Dashboard', 'Dasbor') : tMsg('Home', 'Beranda')}</span>
            </button>
            <span>/</span>
            <span className="text-[#111E38] dark:text-[#FACC15] font-bold">
              {tMsg('Changelog', 'Catatan Rilis')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {setLanguage && (
              <button
                onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                className="px-3 py-1.5 rounded-full text-xs font-bold border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-[#111E38] dark:hover:border-[#FACC15] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                title={tMsg('Switch Language', 'Ganti Bahasa')}
              >
                <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span>{language === 'id' ? 'English (EN)' : 'Bahasa (ID)'}</span>
              </button>
            )}
            <button
              onClick={handleBackToApp}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#111E38] dark:bg-[#FACC15] text-white dark:text-[#111E38] hover:opacity-90 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isInsideApp ? tMsg('Back to Dashboard', 'Kembali ke Dasbor') : tMsg('Back to Home', 'Kembali ke Beranda')}</span>
            </button>
          </div>
        </div>

        {/* Hero Header */}
        <div className="mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 mb-3 shadow-xs">
            <svg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>{tMsg('Product Evolution & Release History', 'Evolusi Produk & Riwayat Rilis')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#111E38] dark:text-white mb-3">
            {tMsg('Changelog', 'Catatan Rilis')}
            <span className="text-[#FACC15]">.</span>
          </h1>

          <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-300 max-w-2xl leading-relaxed font-normal">
            {tMsg(
              'A complete, verifiable record of all features, architecture upgrades, and fixes added to alurku., directly synchronized with our repository commit milestones.',
              'Catatan lengkap dan transparan dari setiap fitur baru, peningkatan arsitektur, dan perbaikan sistem di alurku., disinkronkan langsung dari tonggak commit repositori kami.'
            )}
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-4 md:p-5 shadow-xs mb-10">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <svg className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tMsg('Search updates, features, or bug fixes...', 'Cari pembaruan, fitur, atau perbaikan...')}
                className="w-full pl-10 pr-10 py-2 rounded-xl text-xs font-medium bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-[#111E38] dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Type Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {typePills.map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedType(pill.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedType === pill.id
                      ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Changelog Timeline Feed */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-neutral-300 dark:border-neutral-700 border-t-[#111E38] dark:border-t-[#FACC15] rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-bold tracking-widest text-neutral-500 uppercase animate-pulse">
              {tMsg('Loading Changelog Records...', 'Memuat Catatan Rilis dari Database...')}
            </p>
          </div>
        ) : changelogs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-xs">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-[#111E38] dark:text-white mb-1">
              {tMsg('No Release Notes Found', 'Tidak Ada Catatan Rilis Ditemukan')}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {tMsg('Try adjusting your search query or filter criteria.', 'Coba sesuaikan kata kunci pencarian atau filter yang dipilih.')}
            </p>
          </div>
        ) : (
          <div className="relative pl-6 md:pl-8 space-y-10">
            {/* Timeline Vertical Line */}
            <div className="absolute left-2.5 md:left-3.5 top-3 bottom-6 w-0.5 bg-neutral-200 dark:border-neutral-800 rounded-full"></div>

            {changelogs.map((log, index) => {
              const isMajor = log.type === 'major';
              const isFeature = log.type === 'feature';
              const isExpanded = expandedVersions.has(log.version) || index < 3; // First 3 expanded by default

              return (
                <div key={log.id || log.version} className="relative group">
                  {/* Timeline Dot Indicator */}
                  <div
                    className={`absolute -left-[19px] md:-left-[23px] top-4 w-4 h-4 rounded-full border-2 border-white dark:border-[#0d0f11] shadow-xs flex items-center justify-center ${
                      isMajor
                        ? 'bg-[#111E38] dark:bg-[#FACC15] ring-2 ring-amber-400/40'
                        : isFeature
                        ? 'bg-emerald-500 ring-2 ring-emerald-400/30'
                        : 'bg-blue-500 ring-2 ring-blue-400/30'
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#111E38]"></div>
                  </div>

                  {/* Card Container */}
                  <div className="bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 md:p-8 shadow-xs hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
                    {/* Header: Version + Date + Type Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-neutral-100 dark:border-neutral-800/60">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-lg text-sm font-black tracking-tight bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs">
                          {log.version}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase ${
                          isMajor
                            ? 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50'
                            : isFeature
                            ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50'
                            : 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'
                        }`}>
                          {isMajor ? tMsg('Major Release', 'Rilis Utama') : isFeature ? tMsg('New Feature', 'Fitur Baru') : tMsg('Milestone', 'Milestone')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{log.release_date}</span>
                      </div>
                    </div>

                    {/* Release Title */}
                    <h2 className="text-lg md:text-xl font-black text-[#111E38] dark:text-white tracking-tight mb-4">
                      {log.title}
                    </h2>

                    {/* Change Items */}
                    {log.changes && log.changes.length > 0 && (
                      <div className="space-y-3">
                        <ul className="space-y-2.5">
                          {(isExpanded ? log.changes : log.changes.slice(0, 3)).map((item, idx) => {
                            const [highlight, ...rest] = item.split(':');
                            const hasColon = rest.length > 0;

                            return (
                              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                                <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </span>
                                <div>
                                  {hasColon ? (
                                    <>
                                      <strong className="font-bold text-[#111E38] dark:text-slate-100">
                                        {highlight}:
                                      </strong>
                                      <span>{rest.join(':')}</span>
                                    </>
                                  ) : (
                                    <span>{item}</span>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>

                        {log.changes.length > 3 && (
                          <div className="pt-2">
                            <button
                              onClick={() => toggleExpand(log.version)}
                              className="text-xs font-bold text-indigo-600 dark:text-[#FACC15] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>
                                {isExpanded
                                  ? tMsg('Show fewer changes', 'Sembunyikan sebagian')
                                  : tMsg(`Show all ${log.changes.length} changes`, `Tampilkan semua ${log.changes.length} pembaruan`)}
                              </span>
                              <svg
                                className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA to Return */}
        <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center flex-wrap gap-4">
          <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">
            {tMsg(
              'Continuous improvement powered by user feedback and autonomous testing.',
              'Penyempurnaan berkelanjutan didorong oleh masukan pengguna dan pengujian otomatis.'
            )}
          </p>

          <button
            onClick={handleBackToApp}
            className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#111E38] dark:bg-[#FACC15] text-white dark:text-[#111E38] hover:opacity-90 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>{isInsideApp ? tMsg('Back to Workspace Dashboard', 'Kembali ke Dasbor Workspace') : tMsg('Return to Homepage', 'Kembali ke Beranda')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
