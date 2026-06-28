import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function LandingArticlePage({ language, setCurrentTab }) {
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const tMsg = (en, id) => (language === 'id' ? id : en);

  // Extract category and slug from path "/artikel/:category/:slug"
  useEffect(() => {
    if (!window.location.pathname.startsWith('/artikel')) return;

    const fetchArticleDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        // pathSegments = ["artikel", "category-slug", "post-slug"]
        if (pathSegments.length >= 3) {
          const categorySlug = pathSegments[1];
          const slug = pathSegments[2];
          const response = await axios.get(`/api/articles/${categorySlug}/${slug}`);
          setArticle(response.data);
        } else {
          setError(tMsg('Invalid article URL path.', 'Format URL artikel tidak valid.'));
        }
      } catch (err) {
        console.error('Failed to fetch article:', err);
        setError(
          err.response?.status === 404
            ? tMsg('Article not found.', 'Artikel tidak ditemukan.')
            : tMsg('Failed to load article detail.', 'Gagal memuat artikel panduan.')
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticleDetail();
  }, [window.location.pathname, language]);

  const handleBackToGuides = (e) => {
    e.preventDefault();
    window.history.pushState({}, '', '/panduan');
    window.dispatchEvent(new PopStateEvent('popstate'));
    setCurrentTab('guide');
    window.scrollTo({ top: 0 });
  };

  if (isLoading) {
    return (
      <div className="py-32 bg-white dark:bg-neutral-950 text-slate-900 dark:text-white transition-colors duration-200 min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            {tMsg('Loading article... ⏳', 'Memuat artikel panduan... ⏳')}
          </p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="py-32 bg-white dark:bg-neutral-950 text-slate-900 dark:text-white transition-colors duration-200 min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-black mb-3 text-slate-900 dark:text-white">
            {tMsg('Oops! Something went wrong', 'Aduh! Terjadi kesalahan')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8">
            {error || tMsg('Could not retrieve article details.', 'Tidak dapat memuat rincian artikel.')}
          </p>
          <a
            href="/panduan"
            onClick={handleBackToGuides}
            className="inline-flex items-center gap-2 text-xs font-bold bg-[#FACC15] text-[#111E38] hover:bg-yellow-500 py-2.5 px-6 rounded-full shadow-md transition-colors"
          >
            ← {tMsg('Back to Guides', 'Kembali ke Panduan')}
          </a>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const cleanDate = dateStr.split(' ')[0]; // YYYY-MM-DD
    const parts = cleanDate.split('-');
    if (parts.length !== 3) return cleanDate;
    
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const monthsId = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthLabel = language === 'id' ? monthsId[monthIdx] : monthsEn[monthIdx];
    return `${day} ${monthLabel} ${year}`;
  };

  return (
    <div className="py-24 bg-white dark:bg-neutral-950 text-slate-900 dark:text-white transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        
        {/* Back Button */}
        <div className="mb-10">
          <a
            href="/panduan"
            onClick={handleBackToGuides}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#111E38] dark:text-sky-400 hover:text-sky-600 dark:hover:text-[#FACC15] transition-colors"
          >
            ← {tMsg('Back to Guides', 'Kembali ke Panduan')}
          </a>
        </div>

        {/* Article Meta Header */}
        <div className="mb-10 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-widest">
            <span className="bg-slate-100 dark:bg-neutral-900 py-1 px-3 rounded-full border border-slate-200/50 dark:border-slate-800">
              {article.category}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>{article.duration}</span>
            {article.created_at && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span>{formatDate(article.created_at)}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#111E38] dark:text-white mb-6 leading-tight">
            {article.title}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            {article.description}
          </p>
        </div>

        {/* Article Body Content */}
        <article className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-base font-medium">
          {/* Main Content Area */}
          <div 
            className="space-y-6 md:space-y-8"
            dangerouslySetInnerHTML={{ __html: article.content }}
          ></div>
        </article>

        {/* Footer Note */}
        <div className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
              {tMsg('Need more technical reference?', 'Butuh dokumentasi teknis mendalam?')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {tMsg(
                'Explore the alurku. Platform White Paper and system specifications.',
                'Kunjungi halaman White Paper dan Spesifikasi Sistem alurku. lengkap.'
              )}
            </p>
          </div>
          <a
            href="/dokumentasi"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/dokumentasi');
              window.dispatchEvent(new PopStateEvent('popstate'));
              setCurrentTab('documentation');
              window.scrollTo({ top: 0 });
            }}
            className="inline-flex items-center gap-2 text-xs font-bold bg-[#FACC15] text-[#111E38] hover:bg-yellow-500 py-3 px-6 rounded-full shadow-md transition-colors shrink-0"
          >
            📖 {tMsg('Read System White Paper', 'Baca White Paper Sistem')}
          </a>
        </div>

      </div>
    </div>
  );
}
