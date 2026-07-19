/* -------------------------------------------------------------------------- */
/* AI Utility Functions                                                       */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Shared low-level helpers used across multiple AI pipeline modules.         */
/* Import from here instead of duplicating in each file.                     */
/*                                                                            */
/* Usage in pipeline modules:                                                */
/*   import { escapeRegex, unique, clamp, containsPhrase }                  */
/*     from "@/lib/ai/utils";                                                */
/*                                                                            */

import { getLocalizedValue as getLocalizedValueFromLib } from "@/lib/language";

/* -------------------------------------------------------------------------- */
/* Text — Escape Regex                                                        */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Escapes all special regex characters in a string so it can be used       */
/* as a literal match inside a RegExp constructor.                          */
/*                                                                            */

export function escapeRegex(text) {
  if (!text || typeof text !== "string") return "";
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* -------------------------------------------------------------------------- */
/* Text — Normalize                                                           */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Trims, collapses whitespace, and lowercases a string.  Safe for any       */
/* input type — returns "" for null, undefined, non-strings.               */
/*                                                                            */

export function normalizeText(value) {
  if (!value || typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

/* -------------------------------------------------------------------------- */
/* Text — Tokenize                                                            */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Splits on whitespace, trims, filters by minimum length, and              */
/* deduplicates.  Returns a stable array (order preserved).                 */
/*                                                                            */

export function tokenize(text, minLength = 1) {
  if (!text || typeof text !== "string") return [];

  return unique(
    text
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= minLength),
  );
}

/* -------------------------------------------------------------------------- */
/* Text — Phrase Match                                                        */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Unicode-aware word-boundary matching.  Matches `phrase` only when it     */
/* appears as a complete word/token in `text`, not as a substring of a      */
/* longer word.                                                              */
/*                                                                            */
/* Options:                                                                   */
/*   lowercase {boolean} — lowercase both text and phrase before matching  */
/*                            (default: false — caller should pre-normalize) */
/*                                                                            */
/* Used by: entity-extractor.js (exactPhraseMatch),                         */
/*          recipe-matcher.js (containsPhrase),                             */
/*          prompt-parser.js (exactWordMatch)                                */
/*                                                                            */

export function containsPhrase(text, phrase, options = {}) {
  if (!text || !phrase) return false;

  const { lowercase = false } = options;

  const haystack = lowercase ? String(text).toLowerCase() : text;
  const needle = lowercase ? String(phrase).toLowerCase() : phrase;

  const escaped = escapeRegex(needle);

  const regex = new RegExp(
    `(^|[^\\p{L}\\p{N}])${escaped}(?=[^\\p{L}\\p{N}]|$)`,
    "iu",
  );

  return regex.test(haystack);
}

/* -------------------------------------------------------------------------- */
/* Array — Unique                                                             */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Deduplicates an array while preserving insertion order.                   */
/* Safe for non-array inputs — returns [].                                   */
/*                                                                            */

export function unique(values) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values)];
}

/* -------------------------------------------------------------------------- */
/* Array — Deduplicate by Key                                                 */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Removes duplicate objects by a nested key path.  Keeps the first         */
/* occurrence.                                                               */
/*                                                                            */
/*   deduplicateByKey([{ id: 1 }, { id: 2 }, { id: 1 }], "id")            */
/*   // => [{ id: 1 }, { id: 2 }]                                          */
/*                                                                            */

export function deduplicateByKey(array, keyPath) {
  if (!Array.isArray(array) || array.length === 0) return array;
  if (!keyPath) return unique(array);

  const seen = new Set();

  return array.filter((item) => {
    const value = getNestedValue(item, keyPath);
    if (value == null || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/* -------------------------------------------------------------------------- */
/* Numeric — Clamp                                                            */
/* -------------------------------------------------------------------------- */

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/* -------------------------------------------------------------------------- */
/* Numeric — Validate Positive Number                                         */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Returns the number if it's a valid positive finite number,               */
/* otherwise returns null.                                                  */
/*                                                                            */

export function validatePositiveNumber(value) {
  if (typeof value !== "number" || !isFinite(value) || value <= 0) {
    return null;
  }
  return value;
}

/* -------------------------------------------------------------------------- */
/* Object — Get Nested Value                                                  */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Safely reads a deeply nested value by dot-separated key path.            */
/*                                                                            */
/*   getNestedValue({ a: { b: { c: 42 } } }, "a.b.c")  // => 42          */
/*   getNestedValue({ a: {} }, "a.b.c")                // => undefined    */
/*                                                                            */

export function getNestedValue(obj, path) {
  if (!obj || !path || typeof path !== "string") return undefined;

  return path
    .split(".")
    .reduce(
      (current, key) => (current != null ? current[key] : undefined),
      obj,
    );
}

/* -------------------------------------------------------------------------- */
/* Object — Clean                                                             */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Removes null, undefined, and empty-string values from an object.         */
/* Returns a new object.                                                    */
/*                                                                            */

export function cleanObject(object) {
  if (!object || typeof object !== "object" || Array.isArray(object)) {
    return {};
  }

  const result = {};

  for (const [key, value] of Object.entries(object)) {
    if (value === undefined || value === null || value === "") continue;
    result[key] = value;
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Object — Is Empty                                                          */
/* -------------------------------------------------------------------------- */

export function isEmpty(value) {
  if (value == null) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/* -------------------------------------------------------------------------- */
/* String — Capitalize First Letter                                           */
/* -------------------------------------------------------------------------- */

export function capitalize(str) {
  if (!str || typeof str !== "string") return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* -------------------------------------------------------------------------- */
/* Localization — Get Localized Value                                         */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Re-exported from @/lib/language for convenience.  AI modules can          */
/* import from here to avoid reaching into the shared lib layer.             */
/*                                                                            */
/* Handles: string, { en, bn, ... } objects, and null/undefined.            */
/*                                                                            */

export { getLocalizedValueFromLib as getLocalizedValue };

/* -------------------------------------------------------------------------- */
/* Array — Push Unique                                                        */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Adds an item to an array only if no existing item has the same           */
/* keyPath value.  If keyPath is null, uses reference equality.            */
/*                                                                            */

export function pushUnique(array, item, keyPath) {
  if (!item) return;

  if (!keyPath) {
    if (!array.includes(item)) array.push(item);
    return;
  }

  const keyValue = getNestedValue(item, keyPath);
  const exists = array.some(
    (existing) => getNestedValue(existing, keyPath) === keyValue,
  );

  if (!exists) array.push(item);
}

/* -------------------------------------------------------------------------- */
/* Array — Map to Slugs                                                       */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Extracts .slug from an array of objects, handling mixed string/object    */
/* entries safely.                                                          */
/*                                                                            */

export function mapToSlugs(items) {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item != null)
    .map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && item.slug) return item.slug;
      return null;
    })
    .filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/* Array — Map to Names                                                       */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Extracts .name (string or localized object → english) from an array     */
/* of objects.                                                              */
/*                                                                            */

export function mapToNames(items) {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item != null)
    .map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && item.name) {
        return typeof item.name === "string" ? item.name : item.name.en;
      }
      return null;
    })
    .filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/* String — Strings Intersect                                                 */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Checks if two string arrays share any common element.                    */
/* Optimized for small arrays (1-5 items) — avoids Set overhead.           */
/*                                                                            */

export function stringsIntersect(a, b) {
  if (a.length === 0 || b.length === 0) return false;

  for (const sa of a) {
    for (const sb of b) {
      if (sa === sb) return true;
    }
  }

  return false;
}

/* -------------------------------------------------------------------------- */
/* String — Get Matchable Strings                                             */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Extracts all lowercase string representations from an entity for         */
/* comparison.  Used by the matcher for slug + name matching.              */
/*                                                                            */
/* Input:  { slug: "ground-beef", name: { en: "Ground Beef", bn: "..." } } */
/* Output: ["ground-beef", "ground beef", "..."]                             */
/*                                                                            */

export function getMatchableStrings(entity) {
  if (!entity || typeof entity !== "object") return [];

  const strings = [];

  if (entity.slug && typeof entity.slug === "string") {
    strings.push(entity.slug.toLowerCase());
  }

  if (entity.name && typeof entity.name === "object") {
    for (const value of Object.values(entity.name)) {
      if (typeof value === "string" && value.trim()) {
        strings.push(value.toLowerCase());
      }
    }
  } else if (typeof entity.name === "string" && entity.name.trim()) {
    strings.push(entity.name.toLowerCase());
  }

  return strings;
}

/**
 * Variant for flat localized objects without a slug property.
 *
 * Input:  { en: "Easy", bn: "সহজ" }
 * Output: ["easy", "সহজ"]
 */
export function getMatchableStringsFromLocalized(localized) {
  if (!localized || typeof localized !== "object") return [];

  const strings = [];

  for (const value of Object.values(localized)) {
    if (typeof value === "string" && value.trim()) {
      strings.push(value.toLowerCase());
    }
  }

  return strings;
}

/* -------------------------------------------------------------------------- */
/* String — Get First English Value                                           */
/* -------------------------------------------------------------------------- */

export function getFirstEnglish(localized) {
  if (!localized || typeof localized !== "object") return null;
  if (typeof localized === "string") return localized;
  return localized.en ?? Object.values(localized).find(Boolean) ?? null;
}

/* -------------------------------------------------------------------------- */
/* Numeric — Levenshtein Distance                                             */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Single-row DP implementation.  Returns the edit distance between         */
/* two strings.                                                             */
/*                                                                            */

export function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;

  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array(n + 1);

  for (let j = 0; j <= n; j++) {
    prev[j] = j;
  }

  for (let i = 1; i <= m; i++) {
    const curr = new Array(n + 1);
    curr[0] = i;

    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] !== b[j - 1] ? 1 : 0;

      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }

    prev = curr;
  }

  return prev[n];
}

/* -------------------------------------------------------------------------- */
/* Numeric — Levenshtein Similarity                                           */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Returns 0.0–1.0 similarity ratio (1.0 = identical).                      */
/*                                                                            */

export function levenshteinSimilarity(a, b) {
  if (a === b) return 1;

  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;

  return 1 - levenshteinDistance(a, b) / maxLen;
}
