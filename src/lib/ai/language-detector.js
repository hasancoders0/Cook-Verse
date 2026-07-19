import { AI_CONFIG } from "./config";

/* -------------------------------------------------------------------------- */
/* Language Patterns                                                          */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Extensible registry: each supported language declares a Unicode regex     */
/* that matches its script characters.  Adding a new language (e.g. Hindi,  */
/* Arabic) requires only a new entry here — no function logic changes.      */
/*                                                                            */

const LANGUAGE_PATTERNS = {
  bn: {
    regex: /[\u0980-\u09FF]/g,
    name: "Bangla",
  },

  en: {
    regex: /[A-Za-z]/g,
    name: "English",
  },
};

/* -------------------------------------------------------------------------- */
/* Detect Language — Detailed                                                 */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Returns a rich result object with distribution, confidence, and mixed-    */
/* language detection.  The simple detectLanguage() wrapper below extracts   */
/* just the language code for backward compatibility.                        */
/*                                                                            */
/* Usage:                                                                     */
/*   const result = detectLanguageDetailed("আমি chicken biryani রান্না করব");   */
/*   // {                                                                  */
/*   //   language: "bn",                                                   */
/*   //   confidence: 0.65,                                                */
/*   //   isMixed: true,                                                   */
/*   //   distribution: { bn: 0.65, en: 0.35 },                           */
/*   //   details: { bn: 13, en: 7, other: 3, total: 23 }                 */
/*   // }                                                                  */
/*                                                                            */

export function detectLanguageDetailed(text = "") {
  /* Pipeline gate */
  if (AI_CONFIG.PIPELINE.LANGUAGE_DETECTION === false) {
    return createResult(AI_CONFIG.LANGUAGE.FALLBACK, 1, false, {});
  }

  /* Input validation */
  if (text == null || typeof text !== "string") {
    return createResult(AI_CONFIG.LANGUAGE.FALLBACK, 0, false, {});
  }

  const trimmed = text.trim();

  if (!trimmed) {
    return createResult(AI_CONFIG.LANGUAGE.DEFAULT, 1, false, {});
  }

  /* Count characters per language pattern */
  const counts = countCharacters(trimmed);

  const total = counts.total;

  /* No script characters found at all (only numbers/punctuation/whitespace) */
  if (total === 0) {
    return createResult(AI_CONFIG.LANGUAGE.DEFAULT, 0, false, counts);
  }

  /* Calculate distribution ratios */
  const distribution = buildDistribution(counts, total);

  /* Determine primary language */
  const primary = findPrimaryLanguage(distribution);

  /* Detect mixed language: two or more scripts both above threshold */
  const isMixed = detectMixed(distribution);

  /* Confidence: how dominant the primary language is (0.0 – 1.0) */
  const confidence = calculateConfidence(distribution, primary);

  /* Ensure the detected language is in the supported list.
     If not, fall back to the config default. */
  const language = AI_CONFIG.LANGUAGE.SUPPORTED.includes(primary)
    ? primary
    : AI_CONFIG.LANGUAGE.FALLBACK;

  return createResult(language, confidence, isMixed, distribution, counts);
}

/* -------------------------------------------------------------------------- */
/* Detect Language — Simple (backward-compatible)                             */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* All existing callers (generate-recipe.js, prompt-parser.js) use this     */
/* signature.  Returns a plain language code string.                         */
/*                                                                            */

export function detectLanguage(text = "") {
  return detectLanguageDetailed(text).language;
}

/* -------------------------------------------------------------------------- */
/* Convenience Predicates                                                     */
/* -------------------------------------------------------------------------- */

export function isBangla(text = "") {
  return detectLanguage(text) === "bn";
}

export function isEnglish(text = "") {
  return detectLanguage(text) === "en";
}

/* -------------------------------------------------------------------------- */
/* Character Counting                                                         */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Iterates the text once, counting characters that match each language      */
/* pattern.  "Other" counts characters that don't match any pattern          */
/* (digits, punctuation, whitespace, symbols).                              */
/*                                                                            */

function countCharacters(text) {
  const counts = { other: 0, total: 0 };

  for (const [code, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    pattern.regex.lastIndex = 0;

    const matches = text.match(pattern.regex);

    counts[code] = matches ? matches.length : 0;
  }

  for (const code of Object.keys(LANGUAGE_PATTERNS)) {
    counts.total += counts[code] ?? 0;
  }

  counts.other = text.length - counts.total;

  return counts;
}

/* -------------------------------------------------------------------------- */
/* Distribution                                                              */
/* -------------------------------------------------------------------------- */

function buildDistribution(counts, total) {
  const distribution = {};

  for (const code of Object.keys(LANGUAGE_PATTERNS)) {
    const count = counts[code] ?? 0;

    distribution[code] = total > 0 ? count / total : 0;
  }

  return distribution;
}

/* -------------------------------------------------------------------------- */
/* Primary Language                                                           */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* The language with the highest character ratio.  Ties broken by the        */
/* order languages appear in AI_CONFIG.LANGUAGE.SUPPORTED (first wins).     */
/*                                                                            */

function findPrimaryLanguage(distribution) {
  let best = AI_CONFIG.LANGUAGE.DEFAULT;
  let bestRatio = -1;

  /* Iterate in SUPPORTED order so the preferred language wins ties */
  for (const code of AI_CONFIG.LANGUAGE.SUPPORTED) {
    const ratio = distribution[code] ?? 0;

    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = code;
    }
  }

  return best;
}

/* -------------------------------------------------------------------------- */
/* Mixed Language Detection                                                   */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Text is "mixed" when two or more scripts each exceed the threshold.      */
/* A single Bangla word in an English sentence is NOT mixed (too small).   */
/* Threshold of 0.15 means a script must account for ≥15% of script chars   */
/* to count as a contributing language.                                      */
/*                                                                            */

const MIXED_THRESHOLD = 0.15;

function detectMixed(distribution) {
  let contributing = 0;

  for (const code of Object.keys(LANGUAGE_PATTERNS)) {
    if ((distribution[code] ?? 0) >= MIXED_THRESHOLD) {
      contributing++;
    }
  }

  return contributing >= 2;
}

/* -------------------------------------------------------------------------- */
/* Confidence                                                                 */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* How dominant the primary language is among all detected scripts.          */
/*   1.0 = 100% one script, 0.5 = equal split between two scripts.        */
/*                                                                            */

function calculateConfidence(distribution, primary) {
  const primaryRatio = distribution[primary] ?? 0;

  /* Sum of all non-zero ratios */
  const totalRatio = Object.values(distribution).reduce(
    (sum, r) => (r > 0 ? sum + r : sum),
    0,
  );

  if (totalRatio === 0) {
    return 0;
  }

  return Math.min(1, Math.round((primaryRatio / totalRatio) * 100) / 100);
}

/* -------------------------------------------------------------------------- */
/* Result Factory                                                             */
/* -------------------------------------------------------------------------- */

function createResult(language, confidence, isMixed, distribution, details) {
  const result = {
    language,
    confidence,
    isMixed,
    distribution: { ...distribution },
  };

  /* Attach raw character counts when available (from detailed path) */
  if (details && typeof details === "object") {
    result.details = { ...details };
  }

  return result;
}
