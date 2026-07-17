export const DEFAULT_LANGUAGE = "en";

let currentLanguage = DEFAULT_LANGUAGE;

export function setLanguage(language = DEFAULT_LANGUAGE) {
  currentLanguage = language;
}

export function getLanguage() {
  return currentLanguage;
}

export function getLocalizedValue(value, language = currentLanguage) {
  if (value == null) return "";

  // Normal string
  if (typeof value === "string") {
    return value;
  }

  // Localized object
  if (typeof value === "object") {
    if (value[language]) return value[language];

    if (value.en) return value.en;

    const first = Object.values(value).find(Boolean);

    return first || "";
  }

  return value;
}