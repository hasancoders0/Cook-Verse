"use client";

import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedValue } from "@/lib/language";

export default function useTranslation() {
  const { language } = useLanguage();

  function t(value) {
    return getLocalizedValue(value, language);
  }

  return {
    language,
    t,
  };
}