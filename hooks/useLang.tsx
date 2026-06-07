'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '@/lib/i18n';

interface LangContextType {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LangContext = createContext<LangContextType>({ lang: 'uz', setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('uz');

  useEffect(() => {
    const saved = localStorage.getItem('megaai_lang') as Language;
    if (saved && ['uz', 'en', 'ru'].includes(saved)) setLangState(saved);
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('megaai_lang', l);
  };

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
