import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IconRobot = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

const IconMarkdown = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconBookOpen = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

export default function LandingArticlePage({ language, setCurrentTab }) {
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isMarkdownView, setIsMarkdownView] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const tMsg = (en, id) => (language === 'id' ? id : en);

  // Sync state with popstate event for SPA URL changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Convert HTML content from DB to clean markdown for display/LLM copy
  const htmlToMarkdown = (html) => {
    if (!html) return '';
    let md = html;
    md = md.replace(/<p>/g, '').replace(/<\/p>/g, '\n\n');
    md = md.replace(/<h2>/g, '## ').replace(/<\/h2>/g, '\n\n');
    md = md.replace(/<h1>/g, '# ').replace(/<\/h1>/g, '\n\n');
    md = md.replace(/<strong>/g, '**').replace(/<\/strong>/g, '**');
    md = md.replace(/<ul>/g, '').replace(/<\/ul>/g, '\n');
    md = md.replace(/<li>/g, '* ').replace(/<\/li>/g, '\n');
    md = md.replace(/<em>/g, '*').replace(/<\/em>/g, '*');
    return md.trim();
  };

  // Fetch detail based on currentPath
  const fetchArticleDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const pathSegments = currentPath.split('/').filter(Boolean);
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

  useEffect(() => {
    if (!currentPath.startsWith('/artikel')) return;
    fetchArticleDetail();
  }, [currentPath]);

  // Sync language toggle: Redirect slug when user changes language
  useEffect(() => {
    if (article && article.translations && article.translations[language]) {
      const trans = article.translations[language];
      const newPath = `/artikel/${trans.category_slug}/${trans.slug}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState({}, '', newPath);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
  }, [language, article]);

  // Inject SEO schema markup, hreflang alternates, and update document title/meta description
  useEffect(() => {
    if (!article) return;

    // Inject JSON-LD Schema
    const schemaId = 'article-jsonld-schema';
    let script = document.getElementById(schemaId);
    if (!script) {
      script = document.createElement('script');
      script.id = schemaId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "headline": article.title,
      "description": article.description,
      "inLanguage": article.language,
      "datePublished": article.created_at ? article.created_at.replace(' ', 'T') + 'Z' : new Date().toISOString(),
      "author": {
        "@type": "Organization",
        "name": "alurku."
      },
      "publisher": {
        "@type": "Organization",
        "name": "alurku.",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/logo.png`
        }
      }
    };
    script.text = JSON.stringify(schemaData);

    // Inject hreflang alternate links (Country ID Language ID, Country ID Language EN)
    const hreflangId = 'article-hreflang-id';
    const hreflangEn = 'article-hreflang-en';
    
    let linkId = document.getElementById(hreflangId);
    let linkEn = document.getElementById(hreflangEn);
    
    if (article.translations) {
      const origin = window.location.origin;
      
      if (article.translations.id) {
        if (!linkId) {
          linkId = document.createElement('link');
          linkId.id = hreflangId;
          linkId.rel = 'alternate';
          linkId.hreflang = 'id-ID';
          document.head.appendChild(linkId);
        }
        linkId.href = `${origin}/artikel/${article.translations.id.category_slug}/${article.translations.id.slug}`;
      }
      
      if (article.translations.en) {
        if (!linkEn) {
          linkEn = document.createElement('link');
          linkEn.id = hreflangEn;
          linkEn.rel = 'alternate';
          linkEn.hreflang = 'en-ID';
          document.head.appendChild(linkEn);
        }
        linkEn.href = `${origin}/artikel/${article.translations.en.category_slug}/${article.translations.en.slug}`;
      }
    }

    // Update Title and Meta Description
    const oldTitle = document.title;
    document.title = `${article.title} | alurku. Panduan`;

    let metaDesc = document.querySelector('meta[name="description"]');
    const oldMetaDesc = metaDesc ? metaDesc.getAttribute('content') : '';
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', article.description);

    return () => {
      const targetScript = document.getElementById(schemaId);
      if (targetScript) targetScript.remove();
      
      const targetLinkId = document.getElementById(hreflangId);
      const targetLinkEn = document.getElementById(hreflangEn);
      if (targetLinkId) targetLinkId.remove();
      if (targetLinkEn) targetLinkEn.remove();

      document.title = oldTitle;
      if (metaDesc) {
        if (oldMetaDesc) metaDesc.setAttribute('content', oldMetaDesc);
        else metaDesc.remove();
      }
    };
  }, [article]);

  const handleBackToGuides = (e) => {
    e.preventDefault();
    window.history.pushState({}, '', '/panduan');
    window.dispatchEvent(new PopStateEvent('popstate'));
    setCurrentTab('guide');
    window.scrollTo({ top: 0 });
  };

  const handleCopyForLLM = () => {
    const md = htmlToMarkdown(article.content);
    const textToCopy = `[Context: alurku. Platform Guide]
Title: ${article.title}
Category: ${article.category}
Description: ${article.description}

[Content]
${md}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            
            {/* LLM & Markdown Operations */}
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              onClick={handleCopyForLLM}
              className="text-[#111E38] dark:text-sky-400 hover:text-sky-600 dark:hover:text-[#FACC15] transition-colors flex items-center gap-1.5 normal-case font-bold"
            >
              <IconRobot className="w-4 h-4 shrink-0" /> {copied ? tMsg('Copied! ✓', 'Disalin! ✓') : tMsg('Copy for LLM', 'Salin untuk LLM')}
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              onClick={() => setIsMarkdownView(!isMarkdownView)}
              className="text-[#111E38] dark:text-sky-400 hover:text-sky-600 dark:hover:text-[#FACC15] transition-colors flex items-center gap-1.5 normal-case font-bold"
            >
              <IconMarkdown className="w-4 h-4 shrink-0" /> {isMarkdownView ? tMsg('View Rendered', 'Lihat Tampilan') : tMsg('View as Markdown', 'Lihat Markdown')}
            </button>
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
          {isMarkdownView ? (
            /* Markdown Raw View Mode */
            <div className="bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl font-mono text-sm overflow-x-auto whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-300">
              {htmlToMarkdown(article.content)}
            </div>
          ) : (
            /* Rendered HTML Mode */
            <div 
              className="space-y-6 md:space-y-8"
              dangerouslySetInnerHTML={{ __html: article.content }}
            ></div>
          )}
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
            <IconBookOpen className="w-4 h-4 shrink-0 text-[#111E38]" /> {tMsg('Read System White Paper', 'Baca White Paper Sistem')}
          </a>
        </div>

      </div>
    </div>
  );
}
