import React, { useState, useEffect } from 'react';
import { LanguageContext } from './useLanguage';
import { translations, AVAILABLE_LANGUAGES, getTranslation } from './languageStore';
import { translateText } from '../services/translateService';

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('schemesetu_lang') || 'EN';
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
