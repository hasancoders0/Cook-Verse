// src/lib/ai/entity-normalizer.js

import { normalizeText, normalizeSlug, fuzzyIncludes, similarity } from "@/lib/utils";
import { MATCH_CONFIG } from "./config";

/* -------------------------------------------------------------------------- */
/* Ingredient Aliases                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Canonical ingredient slug -> alternate spellings/names in EN & BN.
 * Add new ingredients here as recipe data grows; entity-extractor.js
 * will pick them up automatically once a matching slug also exists in
 * a recipe's ingredientGroups.
 */
const INGREDIENT_ALIASES = {
  chicken: ["chicken", "মুরগি", "মুরগীর মাংস", "মুরগীর", "মুরগি মাংস"],
  beef: ["beef", "গরুর মাংস", "গরু", "গরুর গোশত"],
  mutton: ["mutton", "খাসির মাংস", "খাসি", "ছাগলের মাংস"],
  fish: ["fish", "মাছ"],
  egg: ["egg", "eggs", "ডিম"],
  potato: ["potato", "potatoes", "aloo", "আলু"],
  onion: ["onion", "onions", "পেঁয়াজ", "পিয়াজ"],
  "red-onion": ["red onion", "লাল পেঁয়াজ"],
  garlic: ["garlic", "রসুন"],
  ginger: ["ginger", "আদা"],
  tomato: ["tomato", "tomatoes", "টমেটো"],
  cucumber: ["cucumber", "শসা"],
  carrot: ["carrot", "carrots", "গাজর"],
  lettuce: ["lettuce", "লেটুস"],
  rice: ["rice", "চাল", "ভাত"],
  "basmati-rice": ["basmati rice", "বাসমতি চাল"],
  flour: ["flour", "ময়দা", "আটা"],
  sugar: ["sugar", "চিনি"],
  salt: ["salt", "লবণ"],
  "black-pepper": ["black pepper", "pepper", "গোলমরিচ"],
  "olive-oil": ["olive oil", "অলিভ অয়েল"],
  oil: ["oil", "cooking oil", "তেল"],
  "lemon-juice": ["lemon juice", "লেবুর রস"],
  lemon: ["lemon", "লেবু"],
  yogurt: ["yogurt", "yoghurt", "দই"],
  cheese: ["cheese", "চিজ", "পনির"],
  butter: ["butter", "মাখন"],
  bun: ["bun", "buns", "বান"],
  lentil: ["lentil", "lentils", "ডাল"],
  cumin: ["cumin", "জিরা"],
  coriander: ["coriander", "cilantro", "ধনিয়া", "ধনেপাতা"],
  turmeric: ["turmeric", "হলুদ"],
  "chili-powder": ["chili powder", "chilli powder", "মরিচ গুঁড়া"],
  "green-chili": ["green chili", "green chilli", "কাঁচা মরিচ"],
};

/* -------------------------------------------------------------------------- */
/* Cuisine Aliases                                                            */
/* -------------------------------------------------------------------------- */

const CUISINE_ALIASES = {
  bangladeshi: ["bangladeshi", "bangla", "দেশি", "বাংলাদেশি"],
  indian: ["indian", "ভারতীয়"],
  italian: ["italian", "ইতালিয়ান", "ইতালীয়"],
  chinese: ["chinese", "চাইনিজ", "চীনা"],
  american: ["american", "আমেরিকান"],
  mexican: ["mexican", "মেক্সিকান"],
  thai: ["thai", "থাই"],
  international: ["international", "আন্তর্জাতিক"],
  arab: ["arab", "arabic", "middle eastern", "আরবি"],
};

/* -------------------------------------------------------------------------- */
/* Category Aliases                                                          */
/* -------------------------------------------------------------------------- */

const CATEGORY_ALIASES = {
  breakfast: ["breakfast", "নাস্তা", "সকালের নাস্তা"],
  lunch: ["lunch", "দুপুরের খাবার"],
  dinner: ["dinner", "রাতের খাবার"],
  salad: ["salad", "সালাদ"],
  dessert: ["dessert", "sweet", "মিষ্টি"],
  snack: ["snack", "snacks", "নাস্তা", "স্ন্যাক্স"],
  "main-course": ["main course", "main dish", "প্রধান খাবার"],
  soup: ["soup", "স্যুপ"],
  "fast-food": ["fast food", "ফাস্ট ফুড"],
};

/* -------------------------------------------------------------------------- */
/* Diet Aliases                                                              */
/* -------------------------------------------------------------------------- */

const DIET_ALIASES = {
  vegetarian: ["vegetarian", "veg", "নিরামিষ"],
  vegan: ["vegan", "ভেগান"],
  "low-calorie": ["low calorie", "low-calorie", "diet food", "কম ক্যালোরি"],
  "gluten-free": ["gluten free", "gluten-free", "গ্লুটেন ফ্রি"],
  "high-protein": ["high protein", "high-protein", "উচ্চ প্রোটিন"],
  healthy: ["healthy", "স্বাস্থ্যকর"],
  spicy: ["spicy", "hot", "ঝাল", "মসলাদার"],
  "not-spicy": ["not spicy", "mild", "ঝাল ছাড়া", "কম ঝাল"],
};

/* -------------------------------------------------------------------------- */
/* Generic Alias Resolution                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Build a flat lookup of normalized-alias -> canonical slug for a given
 * alias map, so exact lookups are O(1).
 */
function buildAliasIndex(aliasMap) {
  const index = new Map();
  for (const [canonical, aliases] of Object.entries(aliasMap)) {
    for (const alias of aliases) {
      index.set(normalizeText(alias), canonical);
    }
  }
  return index;
}

const INGREDIENT_INDEX = buildAliasIndex(INGREDIENT_ALIASES);
const CUISINE_INDEX = buildAliasIndex(CUISINE_ALIASES);
const CATEGORY_INDEX = buildAliasIndex(CATEGORY_ALIASES);
const DIET_INDEX = buildAliasIndex(DIET_ALIASES);

/**
 * Resolve a raw value (word, phrase, or already-a-slug) against an alias
 * index. Tries in order:
 *  1. Exact normalized match
 *  2. Already-canonical slug (value is itself a key in aliasMap)
 *  3. Fuzzy match against all known aliases (typo tolerance)
 */
function resolveAlias(value, index, aliasMap, threshold = MATCH_CONFIG.ENTITY_MATCH_THRESHOLD) {
  if (!value) return null;

  const normalized = normalizeText(value);

  // 1. Exact alias match
  if (index.has(normalized)) return index.get(normalized);

  // 2. Already a canonical slug
  const asSlug = normalizeSlug(value);
  if (aliasMap[asSlug]) return asSlug;

  // 3. Fuzzy match against all aliases
  let best = null;
  for (const [alias, canonical] of index.entries()) {
    if (alias.length < 3) continue; // skip too-short aliases (noisy fuzzy matches)
    const score = similarity(normalized, alias);
    if (score >= threshold && (!best || score > best.score)) {
      best = { canonical, score };
    }
  }

  return best?.canonical || null;
}

/* -------------------------------------------------------------------------- */
/* Public Normalizers                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Normalize a single ingredient mention (word or short phrase) to its
 * canonical slug, e.g. "মুরগি" -> "chicken", "Aloo" -> "potato".
 * Returns null if nothing resolves confidently.
 */
export function normalizeIngredient(value) {
  return resolveAlias(value, INGREDIENT_INDEX, INGREDIENT_ALIASES);
}

/**
 * Normalize a cuisine mention/slug to its canonical slug.
 */
export function normalizeCuisine(value) {
  return resolveAlias(value, CUISINE_INDEX, CUISINE_ALIASES);
}

/**
 * Normalize a category mention/slug to its canonical slug.
 */
export function normalizeCategory(value) {
  return resolveAlias(value, CATEGORY_INDEX, CATEGORY_ALIASES);
}

/**
 * Normalize a diet mention/slug to its canonical slug.
 */
export function normalizeDiet(value) {
  return resolveAlias(value, DIET_INDEX, DIET_ALIASES);
}

/* -------------------------------------------------------------------------- */
/* Batch Helpers                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Normalize an array of raw ingredient tokens/phrases, dropping
 * anything that doesn't resolve and de-duplicating the result.
 */
export function normalizeIngredientList(values = []) {
  const resolved = values.map(normalizeIngredient).filter(Boolean);
  return [...new Set(resolved)];
}

/**
 * Check whether two ingredient mentions refer to the same canonical
 * ingredient, regardless of language/spelling — useful when comparing
 * a new message's ingredients against session context.
 */
export function isSameIngredient(a, b) {
  const normA = normalizeIngredient(a);
  const normB = normalizeIngredient(b);
  if (!normA || !normB) return false;
  return normA === normB;
}

/* -------------------------------------------------------------------------- */
/* Introspection (useful for debugging / admin tooling later)                */
/* -------------------------------------------------------------------------- */

export function getKnownIngredientSlugs() {
  return Object.keys(INGREDIENT_ALIASES);
}

export function getKnownCuisineSlugs() {
  return Object.keys(CUISINE_ALIASES);
}

export function getKnownCategorySlugs() {
  return Object.keys(CATEGORY_ALIASES);
}

export function getKnownDietSlugs() {
  return Object.keys(DIET_ALIASES);
}