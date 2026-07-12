import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSEO } from '../../hooks/useSEO';

export default function LandingGuidePage({ language }) {
  const [guides, setGuides] = useState([]);
  const [flatGuides, setFlatGuides] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const tMsg = (en, id) => (language === 'id' ? id : en);

  useSEO({
    title: tMsg('Help & Guides', 'Pusat Panduan & Bantuan'),
    description: tMsg(
      'Find step-by-step guides, productivity tips, and comprehensive help documentation to maximize your use of alurku.',
      'Temukan panduan langkah demi langkah, tips produktivitas, dan dokumentasi bantuan lengkap untuk memaksimalkan penggunaan alurku.'
    ),
    path: '/panduan',
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": tMsg("alurku. Guide Center", "Pusat Panduan alurku."),
      "description": tMsg(
        "A resource hub containing tutorial articles and user guides for alurku.",
        "Pusat sumber daya yang berisi artikel tutorial dan panduan pengguna untuk alurku."
      )
    }
  });

  // Fetch articles from the database on mount/language switch
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/articles?lang=${language}`);
        
        // Group articles by category for rendering sections
        const grouped = response.data.reduce((acc, article) => {
          const categoryName = article.category;
          let catSection = acc.find(section => section.category === categoryName);
          if (!catSection) {
            catSection = { category: categoryName, articles: [] };
            acc.push(catSection);
          }
          catSection.articles.push(article);
          return acc;
        }, []);
        setGuides(grouped);
        setFlatGuides(response.data);
      } catch (err) {
        console.error('Failed to fetch guide articles:', err);
        setError(tMsg('Failed to load guide database.', 'Gagal memuat basis data panduan.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [language]);

  const handleArticleClick = (e, categorySlug, slug) => {
    e.preventDefault();
    const articlePath = `/artikel/${categorySlug}/${slug}`;
    window.history.pushState({}, '', articlePath);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0 });
  };

  const getSearchResults = (query) => {
    if (!query.trim()) return [];
    const keywords = query.toLowerCase().trim().split(/\s+/);
    return flatGuides.filter(art => {
      const title = (art.title || '').toLowerCase();
      const desc = (art.description || '').toLowerCase();
      return keywords.every(kw => title.includes(kw) || desc.includes(kw));
    });
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim()) {
      setSuggestions(getSearchResults(val).slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      if (submittedQuery) setSubmittedQuery('');
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key && e.key !== 'Enter') return;
    setShowSuggestions(false);
    setSubmittedQuery(searchQuery.trim());
  };

return (
    <div className="bg-[#f8f9ff] text-slate-900 dark:bg-neutral-950 dark:text-white transition-colors duration-200">
      <style>{`
        .pattern-bg {
            background-image: radial-gradient(circle at 2px 2px, #E2E8F0 1px, transparent 0);
            background-size: 32px 32px;
        }
        .dark .pattern-bg {
            background-image: radial-gradient(circle at 2px 2px, #1e293b 1px, transparent 0);
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block;
            vertical-align: middle;
        }
      `}</style>
      
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-white dark:bg-neutral-950 pattern-bg border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-[#111E38] dark:text-white mb-6 tracking-tight">
            {language === 'id' ? (
              <>
                Pusat Panduan &amp; <br/>Dokumentasi alur<span className="text-[#FACC15]">ku</span>.
              </>
            ) : (
              <>
                alur<span className="text-[#FACC15]">ku</span>. <br/>Help &amp; Documentation Center
              </>
            )}
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 font-medium">
            {tMsg(
              'Find step-by-step guides, productivity tips, and comprehensive help documentation to maximize your use of alurku.',
              'Temukan panduan langkah demi langkah, tips produktivitas, dan dokumentasi bantuan lengkap untuk memaksimalkan penggunaan alurku.'
            )}
          </p>
          <div className="mt-12 flex justify-center">
            <div className="relative w-full max-w-xl group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
              <input 
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-[#111E38] outline-none shadow-sm transition-all" 
                placeholder={tMsg("Search topics or help...", "Cari topik atau bantuan...")} 
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchSubmit}
                onFocus={() => { if (searchQuery.trim()) setShowSuggestions(true); }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-20 text-left">
                  {suggestions.map((sug, i) => (
                    <a
                      key={i}
                      href={`/artikel/${sug.category_slug}/${sug.slug}`}
                      onClick={(e) => handleArticleClick(e, sug.category_slug, sug.slug)}
                      className="block px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                      <h4 className="font-semibold text-[#111E38] dark:text-white mb-1">{sug.title}</h4>
                      <p className="text-sm text-slate-500 line-clamp-1">{sug.description}</p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 space-y-24">
        {/* Loading & Error States */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-400">
              {tMsg('Fetching guide articles... ⏳', 'Mengambil daftar panduan... ⏳')}
            </p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-sm font-bold text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-xs bg-[#FACC15] text-[#111E38] font-bold py-2 px-6 rounded-full hover:bg-yellow-500 transition-colors"
            >
              {tMsg('Try Again', 'Coba Lagi')}
            </button>
          </div>
        ) : submittedQuery ? (
          /* Search Results View */
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-[#111E38] dark:text-white">
                {tMsg("Search Results for", "Hasil Pencarian untuk")} "{submittedQuery}"
              </h2>
              <button 
                onClick={() => { setSubmittedQuery(''); setSearchQuery(''); }}
                className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span> {tMsg("Clear", "Bersihkan")}
              </button>
            </div>
            
            {(() => {
              const results = getSearchResults(submittedQuery);
              if (results.length === 0) {
                return (
                  <div className="text-center py-20">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">search_off</span>
                    <p className="text-slate-500">{tMsg("No articles found matching your criteria.", "Tidak ada artikel yang cocok dengan kriteria Anda.")}</p>
                  </div>
                );
              }
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.map((art, aIdx) => (
                    <div
                      key={aIdx}
                      className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-[0_4px_20px_rgba(0,31,63,0.08)] dark:shadow-none border border-slate-200 dark:border-slate-800 hover:-translate-y-1 hover:border-sky-500 dark:hover:border-sky-500 hover:ring-2 hover:ring-sky-500/20 transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        <span className="inline-block bg-[#e5eeff] dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 mb-6">
                          {art.duration || "3 menit"}
                        </span>
                        <h3 className="text-xl font-semibold text-[#111E38] dark:text-white mb-4 leading-tight">
                          <a 
                            href={`/artikel/${art.category_slug}/${art.slug}`}
                            onClick={(e) => handleArticleClick(e, art.category_slug, art.slug)}
                            className="hover:text-sky-500 dark:hover:text-sky-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors"
                          >
                            {art.title}
                          </a>
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-8 line-clamp-3">
                          {art.description}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => handleArticleClick(e, art.category_slug, art.slug)}
                        className="w-fit bg-[#FACC15] text-[#111E38] font-bold px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                      >
                        {tMsg('Read more →', 'Baca selengkapnya →')}
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        ) : (
          /* Guides Container */
          <div className="space-y-16">
            {guides.map((section, idx) => (
              <section key={idx}>
                <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                  <h2 className="text-2xl font-bold text-[#111E38] dark:text-white">
                    {section.category}
                  </h2>
                  <a className="text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 font-bold hover:underline" href="#">
                    {tMsg("See All", "Lihat Semua")}
                  </a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {section.articles.map((art, aIdx) => (
                    <div
                      key={aIdx}
                      className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-[0_4px_20px_rgba(0,31,63,0.08)] dark:shadow-none border border-slate-200 dark:border-slate-800 hover:-translate-y-1 hover:border-sky-500 dark:hover:border-sky-500 hover:ring-2 hover:ring-sky-500/20 transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        <span className="inline-block bg-[#e5eeff] dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 mb-6">
                          {art.duration || "3 menit"}
                        </span>
                        <h3 className="text-xl font-semibold text-[#111E38] dark:text-white mb-4 leading-tight">
                          <a 
                            href={`/artikel/${art.category_slug}/${art.slug}`}
                            onClick={(e) => handleArticleClick(e, art.category_slug, art.slug)}
                            className="hover:text-sky-500 dark:hover:text-sky-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors"
                          >
                            {art.title}
                          </a>
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-8 line-clamp-3">
                          {art.description}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => handleArticleClick(e, art.category_slug, art.slug)}
                        className="w-fit bg-[#FACC15] text-[#111E38] font-bold px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                      >
                        {tMsg('Read more →', 'Baca selengkapnya →')}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Help Banner */}
      <section className="bg-[#0d172b] text-white py-20 mt-16 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">
            {tMsg("Still Need Help?", "Masih Butuh Bantuan?")}
          </h2>
          <p className="text-slate-300 mb-10 max-w-xl mx-auto">
            {tMsg(
              "Our support team is ready to help you 24/7. Contact us through any of the support channels below.", 
              "Tim dukungan kami siap membantu Anda 24/7. Hubungi kami melalui kanal bantuan apa pun di bawah ini."
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <button className="bg-white text-[#111E38] font-bold px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-slate-100 transition-colors">
              <span className="material-symbols-outlined">chat</span> {tMsg("Contact Support", "Hubungi Support")}
            </button>
            <button className="border border-white text-white font-bold px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-white hover:text-[#111E38] transition-colors">
              <span className="material-symbols-outlined">forum</span> {tMsg("Join Community", "Gabung Komunitas")}
            </button>
          </div>
        </div>
        <div className="absolute right-0 md:right-[15%] top-1/2 -translate-y-1/2 opacity-90 pointer-events-none">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1", fontSize: '400px', lineHeight: 1 }}>help</span>
        </div>
      </section>
    </div>
  );
}
