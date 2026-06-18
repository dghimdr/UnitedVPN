"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { isLanguage, type Language } from "@/lib/i18n";

type LanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  const [hasLoadedStoredLang, setHasLoadedStoredLang] = useState(false);

  useEffect(() => {
    const storedLang = window.localStorage.getItem("lang");

    if (isLanguage(storedLang)) {
      setLang(storedLang);
    }

    setHasLoadedStoredLang(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredLang) {
      return;
    }

    window.localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [hasLoadedStoredLang, lang]);

  const value = useMemo(() => ({ lang, setLang }), [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const value = useContext(LanguageContext);

  if (!value) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return value;
}
