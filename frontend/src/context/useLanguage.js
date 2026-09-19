import { createContext, useContext } from 'react';

const fallbackLanguageContext = {
  lang: 'EN',
  changeLanguage: () => {},
  t: (key, fallback = '') => fallback || key,
  translateDynamic: async (text) => text,
  availableLanguages: [
    { code: 'EN', name: 'English', nativeName: 'English' },
    { code: 'HI', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'TE', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'TA', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'KN', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ML', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'BN', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'MR', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'GON', name: 'Gondi', nativeName: 'గోండీ' },
    { code: 'BHI', name: 'Bhili', nativeName: 'भीली' }
  ]
};

export const LanguageContext = createContext(fallbackLanguageContext);

export function useLanguage() {
  const context = useContext(LanguageContext);
  return context || fallbackLanguageContext;
}

export default useLanguage;
