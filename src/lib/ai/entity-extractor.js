// src/lib/ai/entity-extractor.js

import { ENTITY_TYPES, TIME_KEYWORDS, DIFFICULTY_ALIASES, STOPWORDS } from "./config";
import { normalizeText, tokenize, removeStopwords, fuzzyIncludes } from "@/lib/utils";
import { normalizeIngredient, normalizeCuisine, normalizeCategory, normalizeDiet } from "./entity-normalizer";
import {
  getIngredients,
  getCuisines,
  getCategories,
  getDiets,
  getAllRecipes,
} from "@/lib/recipes";

/* -------------------------------------------------------------------------- */
/* Vocabulary Builders (derived live from recipe data)                       */
/* -------------------------------------------------------------------------- */

/**
 * Build a { slug, names: string[] } list for a given vocabulary type,
 * combining EN + BN display names so matching works in either language.
 */
function buildVocabList(items, nameField = "name") {
  return items.map((item) => ({
    slug: item.slug,
    names: [item[nameField]?.en, item[nameField]?.bn].filter(Boolean),
  }));
}

function getIngredientVocab() {
  return buildVocabList(getIngredients());
}

function getCuisineVocab() {
  return buildVocabList(getCuisines());
}

function getCategoryVocab() {
  return buildVocabList(getCategories());
}

function getDietVocab() {
  return buildVocabList(getDiets());
}

/**
 * Build a dish-name vocabulary from recipe titles + searchTerms, so a
 * message like "আমি বিরিয়ানি রান্না করতে চাই" can match "চিকেন বিরিয়ানি"
 * / "chicken biryani" even without an exact title match.
 */
function getDishVocab() {
  return getAllRecipes().map((recipe) => ({
    slug: recipe.slug,
    names: [
      recipe.title?.en,
      recipe.title?.bn,
      ...(recipe.searchTerms?.en || []),
      ...(recipe.searchTerms?.bn || []),
    ].filter(Boolean),
  }));
}

/* -------------------------------------------------------------------------- */
/* Generic Vocabulary Matching                                               */
/* -------------------------------------------------------------------------- */

/**
 * Find all vocab entries whose name appears (fuzzily) inside the text.
 * Returns an array of matched slugs (deduped), longest-name-first so
 * "chicken biryani" matches before the standalone "chicken" ingredient
 * within the same pass would over-fire.
 */
function matchVocabInText(text, vocabList, { fuzzy = true } = {}) {
  const normalized = normalizeText(text);
  const matches = [];

  const sorted = [...vocabList].sort((a, b) => {
    const maxA = Math.max(...a.names.map((n) => n.length));
    const maxB = Math.max(...b.names.map((n) => n.length));
    return maxB - maxA;
  });

  for (const entry of sorted) {
    const hit = entry.names.some((name) => {
      const normName = normalizeText(name);
      if (!normName) return false;
      if (normalized.includes(normName)) return true;
      return fuzzy && normName.length > 3 && fuzzyIncludes(normalized, normName);
    });

    if (hit) matches.push(entry.slug);
  }

  return [...new Set(matches)];
}

/* -------------------------------------------------------------------------- */
/* Ingredient Extraction                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Extract ingredient mentions from text. Returns normalized ingredient
 * slugs (e.g. "মুরগি" and "chicken" both resolve to "chicken").
 */
export function extractIngredients(text, language = "en") {
  const vocab = getIngredientVocab();
  const rawMatches = matchVocabInText(text, vocab);

  // Also run each meaningful token through the normalizer directly —
  // catches ingredient words not yet in the recipe-derived vocab list
  // (e.g. user mentions an ingredient no current recipe uses).
  const tokens = removeStopwords(tokenize(text), STOPWORDS[language] || STOPWORDS.en);
  const tokenMatches = tokens
    .map((token) => normalizeIngredient(token, language))
    .filter(Boolean);

  return [...new Set([...rawMatches, ...tokenMatches])];
}

/* -------------------------------------------------------------------------- */
/* Dish Extraction                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Extract a specific dish name mention (e.g. "chicken biryani",
 * "বিরিয়ানি"). Returns the single best-matching recipe slug, or null.
 */
export function extractDish(text) {
  const vocab = getDishVocab();
  const matches = matchVocabInText(text, vocab, { fuzzy: true });
  return matches[0] || null;
}

/* -------------------------------------------------------------------------- */
/* Cuisine / Category / Diet Extraction                                      */
/* -------------------------------------------------------------------------- */

export function extractCuisine(text) {
  const matches = matchVocabInText(text, getCuisineVocab());
  return normalizeCuisine(matches[0]) || matches[0] || null;
}

export function extractCategory(text) {
  const matches = matchVocabInText(text, getCategoryVocab());
  return normalizeCategory(matches[0]) || matches[0] || null;
}

export function extractDiet(text) {
  const matches = matchVocabInText(text, getDietVocab());
  return matches.length ? normalizeDiet(matches[0]) || matches[0] : null;
}

/* -------------------------------------------------------------------------- */
/* Difficulty Extraction                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Extract difficulty level ("easy" | "medium" | "hard") from text,
 * checking both language alias lists.
 */
export function extractDifficulty(text) {
  const normalized = normalizeText(text);

  for (const language of Object.keys(DIFFICULTY_ALIASES)) {
    const aliasMap = DIFFICULTY_ALIASES[language];
    for (const [level, aliases] of Object.entries(aliasMap)) {
      const hit = aliases.some((alias) => normalized.includes(normalizeText(alias)));
      if (hit) return level;
    }
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Time Extraction                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Extract a max-time-in-minutes constraint from text.
 * Handles:
 *  - explicit numbers: "20 minutes", "২০ মিনিটে"
 *  - keyword shortcuts: "quick", "fast", "দ্রুত"
 */
export function extractTime(text, language = "en") {
  const banglaDigits = { "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9" };

  const withWesternDigits = text.replace(/[০-৯]/g, (d) => banglaDigits[d]);

  // Match "<number> minute(s)" (en) or "<number> মিনিট" (bn)
  const numericMatch = withWesternDigits.match(/(\d{1,3})\s*(minutes?|min|মিনিট)/i);
  if (numericMatch) {
    const minutes = parseInt(numericMatch[1], 10);
    if (!Number.isNaN(minutes)) return minutes;
  }

  // Fallback to keyword-based ceilings ("quick", "দ্রুত", etc.)
  const normalized = normalizeText(text);
  const keywordMap = TIME_KEYWORDS[language] || TIME_KEYWORDS.en;

  for (const [keyword, ceilingMinutes] of Object.entries(keywordMap)) {
    if (normalized.includes(normalizeText(keyword))) {
      return ceilingMinutes;
    }
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Main Export — Full Entity Extraction                                     */
/* -------------------------------------------------------------------------- */

/**
 * Extract all recognized entities from a single user message.
 *
 * Returns:
 * {
 *   ingredients: string[],   // normalized ingredient slugs
 *   dish: string | null,     // recipe slug if a specific dish is named
 *   cuisine: string | null,  // cuisine slug
 *   category: string | null, // category slug
 *   diet: string | null,     // diet slug
 *   difficulty: string | null, // "easy" | "medium" | "hard"
 *   time: number | null,     // max minutes
 * }
 */
export function extractEntities(text, { language = "en" } = {}) {
  if (!text || !text.trim()) {
    return emptyEntities();
  }

  return {
    ingredients: extractIngredients(text, language),
    dish: extractDish(text),
    cuisine: extractCuisine(text),
    category: extractCategory(text),
    diet: extractDiet(text),
    difficulty: extractDifficulty(text),
    time: extractTime(text, language),
  };
}

function emptyEntities() {
  return {
    ingredients: [],
    dish: null,
    cuisine: null,
    category: null,
    diet: null,
    difficulty: null,
    time: null,
  };
}

/**
 * Quick check: did extraction find anything at all? Used by
 * conversation-manager.js to decide whether a message needs context
 * inheritance from the previous turn.
 */
export function hasAnyEntities(entities) {
  if (!entities) return false;
  return Boolean(
    entities.ingredients?.length ||
      entities.dish ||
      entities.cuisine ||
      entities.category ||
      entities.diet ||
      entities.difficulty ||
      entities.time != null,
  );
}