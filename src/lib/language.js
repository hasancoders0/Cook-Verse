export const DEFAULT_LANGUAGE = "en";

export function getLocalizedValue(value, language = DEFAULT_LANGUAGE) {
  if (value == null) return "";

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return (
      value[language] ?? value.en ?? Object.values(value).find(Boolean) ?? ""
    );
  }

  return value;
}
