'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { translations, Language, TranslationKey } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'sudan-freight-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Default to Arabic
  const [language, setLanguageState] = useState<Language>('ar');
  const [mounted, setMounted] = useState(false);

  // Load language preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && (stored === 'en' || stored === 'ar')) {
      setLanguageState(stored);
    }
    setMounted(true);
  }, []);

  // Update document direction and lang attribute when language changes
  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [language, mounted]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || translations.ar[key] || key;
  }, [language]);

  const isRTL = language === 'ar';

  // Prevent hydration mismatch by rendering with Arabic defaults during SSR
  if (!mounted) {
    const preloadT = (key: TranslationKey): string => {
      const value = translations.ar[key];
      return typeof value === 'string' ? value : String(key);
    };
    return (
      <LanguageContext.Provider value={{ language: 'ar', setLanguage, t: preloadT, isRTL: true }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
