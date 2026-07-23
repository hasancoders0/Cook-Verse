// src/lib/ai/language-detector.js

import { LANGUAGES, DEFAULT_LANGUAGE } from "./config";

/* -------------------------------------------------------------------------- */
/* Unicode Ranges                                                             */
/* -------------------------------------------------------------------------- */

// Bangla block: U+0980–U+09FF
const BANGLA_REGEX = /[\u0980-\u09FF]/;
const BANGLA_GLOBAL_REGEX = /[\u0980-\u09FF]/g;

// Basic Latin letters (used to detect English content in mixed strings)
const LATIN_REGEX = /[A-Za-z]/g;

/* -------------------------------------------------------------------------- */
/* Core Detection                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Detect the language of a given text based on script composition.
 *
 * Strategy:
 *  1. Count Bangla vs Latin characters in the string.
 *  2. Whichever script has more characters "wins".
 *  3. If there are no alphabetic characters at all (e.g. "123", "😀", ""),
 *     fall back to the previous language if provided, else DEFAULT_LANGUAGE.
 *
 * This handles mixed-script input gracefully, e.g.:
 *  - "আমার কাছে chicken আছে" -> bn (more Bangla chars)
 *  - "I want চিকেন বিরিয়ানি" -> bn
 *  - "chicken biryani" -> en
 */
export function detectLanguage(text = "", previousLanguage = DEFAULT_LANGUAGE) {
  if (!text || typeof text !== "string") {
    return previousLanguage || DEFAULT_LANGUAGE;
  }

  const banglaMatches = text.match(BANGLA_GLOBAL_REGEX) || [];
  const latinMatches = text.match(LATIN_REGEX) || [];

  const banglaCount = banglaMatches.length;
  const latinCount = latinMatches.length;

  // No alphabetic signal at all — keep whatever language the conversation
  // was already in, rather than snapping back to English.
  if (banglaCount === 0 && latinCount === 0) {
    return previousLanguage || DEFAULT_LANGUAGE;
  }

  if (banglaCount > latinCount) return LANGUAGES.BN;
  if (latinCount > banglaCount) return LANGUAGES.EN;

  // Tie: prefer whichever script appears first in the string.
  const firstBangla = text.search(BANGLA_REGEX);
  const firstLatin = text.search(/[A-Za-z]/);

  if (firstBangla === -1) return LANGUAGES.EN;
  if (firstLatin === -1) return LANGUAGES.BN;

  return firstBangla < firstLatin ? LANGUAGES.BN : LANGUAGES.EN;
}

/**
 * Returns true if the given text contains any Bangla script characters.
 * Useful as a cheap check before running full detection.
 */
export function containsBangla(text = "") {
  return BANGLA_REGEX.test(text);
}

/**
 * Returns true if the given text contains any Latin script characters.
 */
export function containsLatin(text = "") {
  return /[A-Za-z]/.test(text);
}

/**
 * Returns the ratio (0-1) of Bangla characters among all alphabetic
 * characters in the text. Useful for confidence scoring / debugging.
 */
export function banglaRatio(text = "") {
  const banglaCount = (text.match(BANGLA_GLOBAL_REGEX) || []).length;
  const latinCount = (text.match(LATIN_REGEX) || []).length;
  const total = banglaCount + latinCount;
  if (total === 0) return 0;
  return banglaCount / total;
}

/**
 * Normalize/validate a language code, falling back to default if invalid.
 */
export function resolveLanguage(lang) {
  if (lang === LANGUAGES.EN || lang === LANGUAGES.BN) return lang;
  return DEFAULT_LANGUAGE;
}