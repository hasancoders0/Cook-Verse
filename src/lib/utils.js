// src/lib/utils.js

/* -------------------------------------------------------------------------- */
/* Text Normalization                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Normalize any string for comparison: lowercase, trim, collapse whitespace.
 * Safe for both English and Bangla text.
 */
export function normalizeText(value = "") {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalize a slug-like string: lowercase, dashes instead of spaces, no punctuation.
 */
export function normalizeSlug(value = "") {
  return normalizeText(value)
    .replace(/[^\w\u0980-\u09FF\s-]/g, "")
    .replace(/\s+/g, "-");
}

/**
 * Strip common punctuation/symbols from a raw user prompt before tokenizing.
 * Keeps Bangla unicode range (\u0980-\u09FF) and basic word characters.
 */
export function stripPunctuation(value = "") {
  return String(value ?? "")
    .replace(/[.,!?;:"'`~@#$%^&*()_+=\[\]{}|\\/<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Split a sentence into normalized word tokens (EN + BN aware).
 * Filters out empty tokens and very short noise (single stray characters),
 * but keeps single Bangla characters since conjuncts can be meaningful.
 */
export function tokenize(value = "") {
  const cleaned = stripPunctuation(normalizeText(value));
  if (!cleaned) return [];

  return cleaned
    .split(" ")
    .filter(Boolean)
    .filter((tok) => tok.length > 1 || /[\u0980-\u09FF]/.test(tok));
}

/**
 * Remove a list of stopwords (already-normalized) from a token array.
 */
export function removeStopwords(tokens = [], stopwords = []) {
  const stopSet = new Set(stopwords.map(normalizeText));
  return tokens.filter((tok) => !stopSet.has(tok));
}

/* -------------------------------------------------------------------------- */
/* Fuzzy Matching                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Classic Levenshtein edit distance between two strings.
 */
export function levenshtein(a = "", b = "") {
  const s1 = normalizeText(a);
  const s2 = normalizeText(b);

  if (s1 === s2) return 0;
  if (!s1.length) return s2.length;
  if (!s2.length) return s1.length;

  let prevRow = Array.from({ length: s2.length + 1 }, (_, i) => i);

  for (let i = 1; i <= s1.length; i++) {
    const currRow = [i];
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        currRow[j - 1] + 1, // insertion
        prevRow[j] + 1, // deletion
        prevRow[j - 1] + cost, // substitution
      );
    }
    prevRow = currRow;
  }

  return prevRow[s2.length];
}

/**
 * Similarity score between 0 (no match) and 1 (identical), based on Levenshtein
 * distance normalized by the longer string's length.
 */
export function similarity(a = "", b = "") {
  const s1 = normalizeText(a);
  const s2 = normalizeText(b);
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(s1, s2) / maxLen;
}

/**
 * Returns true if `text` contains `query` as a fuzzy substring match —
 * exact substring match short-circuits, otherwise falls back to a
 * similarity threshold (useful for typo-tolerant ingredient/dish matching).
 */
export function fuzzyIncludes(text = "", query = "", threshold = 0.72) {
  const t = normalizeText(text);
  const q = normalizeText(query);
  if (!q) return true;
  if (t.includes(q)) return true;
  return similarity(t, q) >= threshold;
}

/**
 * Find the best matching item in a list of strings for a query, using fuzzy
 * similarity. Returns { value, score } or null if nothing clears the threshold.
 */
export function bestFuzzyMatch(query = "", candidates = [], threshold = 0.6) {
  let best = null;

  for (const candidate of candidates) {
    const score = similarity(query, candidate);
    if (score >= threshold && (!best || score > best.score)) {
      best = { value: candidate, score };
    }
  }

  return best;
}

/* -------------------------------------------------------------------------- */
/* Array Helpers                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Remove duplicate primitives from an array while preserving order.
 */
export function unique(array = []) {
  return [...new Set(array)];
}

/**
 * Remove duplicate objects from an array by a key, preserving first occurrence.
 */
export function uniqueBy(array = [], key) {
  const seen = new Set();
  const result = [];
  for (const item of array) {
    const k = item?.[key];
    if (k == null || seen.has(k)) continue;
    seen.add(k);
    result.push(item);
  }
  return result;
}

/**
 * Split an array into chunks of a given size.
 */
export function chunk(array = [], size = 1) {
  if (size <= 0) return [array];
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * Return the intersection of two arrays (by value or by key selector).
 */
export function intersect(a = [], b = [], keyFn = (x) => x) {
  const bKeys = new Set(b.map(keyFn));
  return a.filter((item) => bKeys.has(keyFn(item)));
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Simple weighted shuffle-free "top N" picker — returns first `n` items,
 * useful for capping suggestion/recipe lists consistently across the pipeline.
 */
export function takeTop(array = [], n = 3) {
  return array.slice(0, Math.max(0, n));
}

/* -------------------------------------------------------------------------- */
/* Object Helpers                                                            */
/* -------------------------------------------------------------------------- */

export function deepClone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

export function pick(obj = {}, keys = []) {
  return keys.reduce((acc, key) => {
    if (key in obj) acc[key] = obj[key];
    return acc;
  }, {});
}

export function omit(obj = {}, keys = []) {
  const excluded = new Set(keys);
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !excluded.has(key)),
  );
}

export function isEmptyObject(obj) {
  return !obj || typeof obj !== "object" || Object.keys(obj).length === 0;
}

/* -------------------------------------------------------------------------- */
/* IDs & Timing                                                              */
/* -------------------------------------------------------------------------- */

let idCounter = 0;

/**
 * Generate a reasonably unique id for messages/session objects.
 * Not cryptographically secure — just for React keys & memory entries.
 */
export function generateId(prefix = "id") {
  idCounter = (idCounter + 1) % Number.MAX_SAFE_INTEGER;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

export function sleep(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce a function call.
 */
export function debounce(fn, wait = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), wait);
  };
}

/* -------------------------------------------------------------------------- */
/* Number Formatting (EN <-> BN numerals)                                    */
/* -------------------------------------------------------------------------- */

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/**
 * Convert Western digits (0-9) in a string/number to Bangla numerals.
 */
export function toBanglaNumerals(value) {
  return String(value).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

/**
 * Convert Bangla numerals in a string back to Western digits.
 */
export function fromBanglaNumerals(value) {
  return String(value).replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}

/**
 * Format a number/time value in the given language ("en" | "bn").
 */
export function formatNumber(value, language = "en") {
  return language === "bn" ? toBanglaNumerals(value) : String(value);
}

/* -------------------------------------------------------------------------- */
/* Date & Day Formatting (EN / BN / Arabic-Hijri)                            */
/* -------------------------------------------------------------------------- */

const DAY_NAMES = {
  en: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  bn: ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"],
};

const MONTH_NAMES = {
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  bn: [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ],
};

/**
 * Get the day name for a given date in the requested language.
 */
export function getDayName(date = new Date(), language = "en") {
  const names = DAY_NAMES[language] || DAY_NAMES.en;
  return names[date.getDay()];
}

/**
 * Format a Gregorian date as "Month D, YYYY" (en) or "D Month, YYYY" (bn),
 * with numerals localized.
 */
export function formatGregorianDate(date = new Date(), language = "en") {
  const day = date.getDate();
  const month = (MONTH_NAMES[language] || MONTH_NAMES.en)[date.getMonth()];
  const year = date.getFullYear();

  if (language === "bn") {
    return `${formatNumber(day, "bn")} ${month}, ${formatNumber(year, "bn")}`;
  }
  return `${month} ${day}, ${year}`;
}

/**
 * Format the Hijri (Arabic Islamic calendar) date using the built-in
 * Intl API — no external dependency required. Falls back gracefully
 * if the runtime doesn't support the calendar.
 */
export function formatHijriDate(date = new Date()) {
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return null;
  }
}

/**
 * Build the full "today's date" payload MealMuse needs when a user asks
 * what day/date it is — Gregorian in EN & BN, plus the Hijri/Arabic date.
 *
 * Returns:
 * {
 *   day: { en: "Thursday", bn: "বৃহস্পতিবার" },
 *   gregorian: { en: "July 23, 2026", bn: "২৩ জুলাই, ২০২৬" },
 *   hijri: "٩ محرم ١٤٤٨ هـ" | null
 * }
 */
export function getFormattedToday(date = new Date()) {
  return {
    day: {
      en: getDayName(date, "en"),
      bn: getDayName(date, "bn"),
    },
    gregorian: {
      en: formatGregorianDate(date, "en"),
      bn: formatGregorianDate(date, "bn"),
    },
    hijri: formatHijriDate(date),
  };
}

/**
 * Check whether a given day name (in either language, case-insensitive)
 * matches today's actual day — used to correct users like
 * "আজ শুক্রবার?" -> "আজ শুক্রবার নয়, আজ সোমবার।"
 */
export function isDayNameToday(dayNameGuess = "", date = new Date()) {
  const guess = normalizeText(dayNameGuess);
  const todayEn = normalizeText(getDayName(date, "en"));
  const todayBn = normalizeText(getDayName(date, "bn"));
  return guess === todayEn || guess === todayBn;
}

/* -------------------------------------------------------------------------- */
/* Misc                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Safe getter for deeply nested values without throwing, e.g.
 * safeGet(recipe, "nutrition.calories", 0)
 */
export function safeGet(obj, path = "", fallback = undefined) {
  const parts = path.split(".").filter(Boolean);
  let current = obj;
  for (const part of parts) {
    if (current == null) return fallback;
    current = current[part];
  }
  return current === undefined ? fallback : current;
}

/**
 * Guard to ensure a value is a non-empty, trimmed string.
 */
export function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}