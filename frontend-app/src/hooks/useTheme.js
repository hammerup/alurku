import { useState } from 'react';

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('innocean_auth') !== 'true') return false; // Landing Page default light
      if ('theme' in localStorage) {
        return localStorage.getItem('theme') === 'dark';
      }
      return false; // Default to light theme for new visitors
    }
    return false;
  });
  const [appTheme, setAppTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('innocean_auth') !== 'true') return '';
      return localStorage.getItem('innocean_app_theme') || '';
    }
    return '';
  });
  const [appBgImage, setAppBgImage] = useState(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('innocean_auth') !== 'true') return '';
      return localStorage.getItem('innocean_app_bg_image') || '';
    }
    return '';
  });
  const [appTexture, setAppTexture] = useState(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('innocean_auth') !== 'true') return '';
      return localStorage.getItem('innocean_app_texture') || '';
    }
    return '';
  });
  const [cardTheme, setCardTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('innocean_auth') !== 'true') return '';
      return localStorage.getItem('innocean_card_theme') || '';
    }
    return '';
  });
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('innocean_lang') || 'id';
    return 'id';
  });

  return {
    isDarkMode, setIsDarkMode,
    appTheme, setAppTheme,
    appBgImage, setAppBgImage,
    appTexture, setAppTexture,
    cardTheme, setCardTheme,
    language, setLanguage,
  };
}
