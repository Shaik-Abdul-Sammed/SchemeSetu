import React, { useState, useEffect } from 'react';
import { LanguageContext } from './useLanguage';
import { translations, AVAILABLE_LANGUAGES, getTranslation } from './languageStore';
import { translateText } from '../services/translateService';

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
    }
  }, [lang]);

  const changeLanguage = (newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
      localStorage.setItem('schemesetu_lang', newLang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLang.toLowerCase();
      }
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
