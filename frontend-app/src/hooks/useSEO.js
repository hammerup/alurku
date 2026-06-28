import { useEffect } from 'react';

/**
 * Reusable Hook to automatically inject and manage page-specific SEO tags:
 * - document.title
 * - <meta name="description">
 * - <link rel="canonical">
 * - <link rel="alternate" hreflang="id-ID">
 * - <link rel="alternate" hreflang="en-ID">
 * - JSON-LD Schema markup
 * 
 * @param {Object} seoConfig Configuration parameters
 * @param {string} seoConfig.title Page-specific title
 * @param {string} seoConfig.description Page-specific meta description
 * @param {string} seoConfig.path Canonical path of the page (e.g., "/tentang", "/harga")
 * @param {Object} seoConfig.schemaData Optional JSON-LD schema object
 * @param {Object} seoConfig.articleTranslations Optional map of translations for dynamic article routes
 */
export function useSEO({ title, description, path, schemaData, articleTranslations }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const origin = window.location.origin;
    const currentUrl = `${origin}${path}`;

    // 1. Update document.title
    const oldTitle = document.title;
    document.title = title ? `${title} | alurku.` : 'alurku. - Workload-Aware Task Assistant';

    // 2. Manage <meta name="description">
    let metaDesc = document.querySelector('meta[name="description"]');
    const oldMetaDesc = metaDesc ? metaDesc.getAttribute('content') : '';
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description || '');

    // 3. Manage <link rel="canonical">
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', currentUrl);

    // 4. Manage <link rel="alternate" hreflang="id-ID" / "en-ID">
    const hreflangId = 'global-hreflang-id';
    const hreflangEn = 'global-hreflang-en';

    let linkId = document.getElementById(hreflangId);
    let linkEn = document.getElementById(hreflangEn);

    if (!linkId) {
      linkId = document.createElement('link');
      linkId.id = hreflangId;
      linkId.setAttribute('rel', 'alternate');
      linkId.setAttribute('hreflang', 'id-ID');
      document.head.appendChild(linkId);
    }

    if (!linkEn) {
      linkEn = document.createElement('link');
      linkEn.id = hreflangEn;
      linkEn.setAttribute('rel', 'alternate');
      linkEn.setAttribute('hreflang', 'en-ID');
      document.head.appendChild(linkEn);
    }

    // If dynamic article translations are provided, use them. Otherwise default to current path.
    if (articleTranslations) {
      if (articleTranslations.id) {
        linkId.setAttribute('href', `${origin}/artikel/${articleTranslations.id.category_slug}/${articleTranslations.id.slug}`);
      }
      if (articleTranslations.en) {
        linkEn.setAttribute('href', `${origin}/artikel/${articleTranslations.en.category_slug}/${articleTranslations.en.slug}`);
      }
    } else {
      linkId.setAttribute('href', currentUrl);
      linkEn.setAttribute('href', currentUrl);
    }

    // 5. Manage JSON-LD Schema Markup
    const schemaId = 'global-jsonld-schema';
    let script = document.getElementById(schemaId);
    if (schemaData) {
      if (!script) {
        script = document.createElement('script');
        script.id = schemaId;
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(schemaData);
    } else {
      if (script) script.remove();
    }

    // Cleanup tags on component unmount
    return () => {
      document.title = oldTitle;
      if (metaDesc) {
        if (oldMetaDesc) metaDesc.setAttribute('content', oldMetaDesc);
        else metaDesc.remove();
      }
      if (linkCanonical) linkCanonical.remove();
      
      const targetLinkId = document.getElementById(hreflangId);
      const targetLinkEn = document.getElementById(hreflangEn);
      if (targetLinkId) targetLinkId.remove();
      if (targetLinkEn) targetLinkEn.remove();

      const targetScript = document.getElementById(schemaId);
      if (targetScript) targetScript.remove();
    };
  }, [title, description, path, JSON.stringify(schemaData), JSON.stringify(articleTranslations)]);
}
