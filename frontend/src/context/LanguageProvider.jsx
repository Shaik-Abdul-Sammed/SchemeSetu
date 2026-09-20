import React, { useState, useEffect } from 'react';
import { LanguageContext } from './useLanguage';
import { translations, AVAILABLE_LANGUAGES, getTranslation } from './languageStore';
import { translateText } from '../services/translateService';

/**
 * Map SchemeSetu 2-letter lang codes to Google Translate BCP-47 language codes.
 * Used to sync the Google Translate widget with the app's language selector.
 */
const GOOGLE_LANG_MAP = {
  EN: 'en', HI: 'hi', TE: 'te', TA: 'ta', KN: 'kn',
  ML: 'ml', MR: 'mr', BN: 'bn', PA: 'pa', GU: 'gu',
  UR: 'ur', OR: 'or', AS: 'as'
};

/**
 * Set the googtrans cookie so Google Translate picks up the language choice
 * on the current page (and on page navigation within the SPA).
 */
function setGoogleTranslateCookie(langCode) {
  if (typeof document === 'undefined') return;
  const googleLang = GOOGLE_LANG_MAP[langCode] || 'en';
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
  if (googleLang === 'en') {
    // Clear the translation cookie to restore English
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/`;
  } else {
    document.cookie = `googtrans=/en/${googleLang}; expires=${expires}; path=/`;
    document.cookie = `googtrans=/en/${googleLang}; expires=${expires}; domain=${window.location.hostname}; path=/`;
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('schemesetu_lang');
    if (saved) return saved;
    if (typeof navigator !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.includes('te')) return 'TE';
      if (browserLang.includes('hi')) return 'HI';
      if (browserLang.includes('ta')) return 'TA';
      if (browserLang.includes('kn')) return 'KN';
      if (browserLang.includes('mr')) return 'MR';
      if (browserLang.includes('bn')) return 'BN';
      if (browserLang.includes('ml')) return 'ML';
    }
    return 'EN';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang.toLowerCase();
      // Sync Google Translate cookie with current language
      setGoogleTranslateCookie(lang);
    }
  }, [lang]);

  const changeLanguage = (newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
      localStorage.setItem('schemesetu_lang', newLang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLang.toLowerCase();
        setGoogleTranslateCookie(newLang);
      }

      // Trigger the Google Translate widget programmatically via combo select
      setTimeout(() => {
        const googleLang = GOOGLE_LANG_MAP[newLang] || 'en';
        const sel = document.querySelector('.goog-te-combo');
        if (sel) {
          sel.value = googleLang;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, 200);
    }
  };

  const t = (key, fallback) => {
    return getTranslation(lang, key, fallback);
  };

  const translateDynamic = async (text) => {
    if (!text || lang === 'EN') return text;
    return await translateText(text, lang);
  };

  return (
    <LanguageContext.Provider value={{ 
      lang, 
      changeLanguage, 
      t, 
      translateDynamic, 
      availableLanguages: AVAILABLE_LANGUAGES 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageProvider;
