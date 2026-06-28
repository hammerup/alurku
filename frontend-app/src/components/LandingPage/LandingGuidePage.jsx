import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function LandingGuidePage({ language }) {
  const [guides, setGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const tMsg = (en, id) => (language === 'id' ? id : en);

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

  return (
    <div className="py-24 bg-white dark:bg-neutral-950 text-slate-900 dark:text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 reveal-on-scroll">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[#111E38] dark:text-white mb-6">
            {language === 'id' ? (
              <>
                Pusat Panduan & Dokumentasi alur<span className="text-[#FACC15]">ku</span>.
              </>
            ) : (
              <>
                alur<span className="text-[#FACC15]">ku</span>. Help & Documentation Center
              </>
            )}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            {tMsg(
              'Find step-by-step guides, productivity tips, and comprehensive help documentation to maximize your use of alurku.',
              'Temukan panduan langkah demi langkah, tips produktivitas, dan dokumentasi bantuan lengkap untuk memaksimalkan penggunaan alurku.'
            )}
          </p>
        </div>

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
        ) : (
          /* Guides Container */
          <div className="space-y-16">
            {guides.map((section, idx) => (
              <div key={idx}>
                <h2 className="text-2xl font-black text-[#111E38] dark:text-white mb-8 border-b border-slate-100 dark:border-slate-800 pb-3">
                  {section.category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {section.articles.map((art, aIdx) => (
                    <div
                      key={aIdx}
                      className="bg-slate-50 dark:bg-neutral-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-sky-300 dark:hover:border-sky-800 transition-colors"
                    >
                      <div>
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 py-1 px-2.5 rounded-full font-bold inline-block mb-4">
                          {art.duration}
                        </span>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight">
                          <a 
                            href={`/artikel/${art.category_slug}/${art.slug}`}
                            onClick={(e) => handleArticleClick(e, art.category_slug, art.slug)}
                            className="hover:text-sky-600 dark:hover:text-[#FACC15] transition-colors"
                          >
                            {art.title}
                          </a>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                          {art.description}
                        </p>
                      </div>
                      <a 
                        href={`/artikel/${art.category_slug}/${art.slug}`}
                        onClick={(e) => handleArticleClick(e, art.category_slug, art.slug)}
                        className="text-xs font-bold bg-[#FACC15] text-[#111E38] hover:bg-yellow-500 py-2 px-4 rounded-xl text-center mt-6 flex items-center justify-center gap-2 transition-colors w-max"
                      >
                        {tMsg('Read more', 'Baca selengkapnya')} <span className="text-lg leading-none">→</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
