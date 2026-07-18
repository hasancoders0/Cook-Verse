"use client";

import { createContext, useContext, useEffect, useState } from "react";

const DEFAULT_LANGUAGE = "en";

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  changeLanguage: () => {},
});

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);

  // Load saved language on first mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");

    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Change language
  const changeLanguage = (lang) => {
    if (lang === language) return;

    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
