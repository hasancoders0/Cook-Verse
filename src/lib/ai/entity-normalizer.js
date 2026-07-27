// src/lib/ai/entity-normalizer.js

import {
  getIngredients,
  getCuisines,
  getCategories,
  getDiets,
  getAllRecipes,
} from "@/lib/recipes";
import {
  normalizeText,
  normalizeSlug,
  fuzzyIncludes,
  similarity,
} from "@/lib/utils";
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
function buildIngredientAliases() {
  return Object.fromEntries(
    getIngredients().map((item) => {
      const aliases = new Set();

      // ------------------------------------------------------------------
      // Slug
      // ------------------------------------------------------------------

      aliases.add(item.slug);

      item.slug.split("-").forEach((part) => {
        if (part) aliases.add(part);
      });

      // ------------------------------------------------------------------
      // English Name
      // ------------------------------------------------------------------

      if (item.name?.en) {
        aliases.add(item.name.en);

        // Example:
        // Ilish Fish (Hilsa)
        const cleanName = item.name.en.replace(/\(.*?\)/g, "").trim();

        aliases.add(cleanName);

        // Parentheses text
        const match = item.name.en.match(/\((.*?)\)/);

        if (match?.[1]) {
          aliases.add(match[1].trim());
        }

        // Remove common suffix words
        const shortName = cleanName
          .replace(/\b(Fish|Meat|Chicken|Beef|Mutton)\b/gi, "")
          .trim();

        if (shortName && shortName !== cleanName) {
          aliases.add(shortName);
        }
      }

      // ------------------------------------------------------------------
      // Bangla Name
      // ------------------------------------------------------------------

      if (item.name?.bn) {
        aliases.add(item.name.bn);

        const shortBn = item.name.bn
          .replace(/মাছ/g, "")
          .replace(/মাংস/g, "")
          .trim();

        if (shortBn && shortBn !== item.name.bn) {
          aliases.add(shortBn);
        }
      }

      return [item.slug, [...aliases]];
    }),
  );
}


function buildRecipeAliases() {
  return Object.fromEntries(
    getAllRecipes().map((recipe) => {
      const aliases = new Set();

      // slug
      aliases.add(recipe.slug);

      // title
      if (recipe.title?.en) aliases.add(recipe.title.en);
      if (recipe.title?.bn) aliases.add(recipe.title.bn);

      // searchTerms
      (recipe.searchTerms?.en || []).forEach((term) => aliases.add(term));
      (recipe.searchTerms?.bn || []).forEach((term) => aliases.add(term));

      return [recipe.slug, [...aliases]];
    }),
  );
}


const INGREDIENT_ALIASES = buildIngredientAliases();
const RECIPE_ALIASES = buildRecipeAliases();





/* -------------------------------------------------------------------------- */
/* Cuisine Aliases                                                            */
/* -------------------------------------------------------------------------- */
const CUISINE_ALIASES = Object.fromEntries(
  getCuisines().map((item) => [
    item.slug,
    [item.slug, item.name?.en, item.name?.bn].filter(Boolean),
  ]),
);

/* -------------------------------------------------------------------------- */
/* Category Aliases                                                          */
/* -------------------------------------------------------------------------- */

const CATEGORY_ALIASES = Object.fromEntries(
  getCategories().map((item) => [
    item.slug,
    [item.slug, item.name?.en, item.name?.bn].filter(Boolean),
  ]),
);

/* -------------------------------------------------------------------------- */
/* Diet Aliases                                                              */
/* -------------------------------------------------------------------------- */

const DIET_ALIASES = Object.fromEntries(
  getDiets().map((item) => [
    item.slug,
    [item.slug, item.name?.en, item.name?.bn].filter(Boolean),
  ]),
);

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
const RECIPE_INDEX = buildAliasIndex(RECIPE_ALIASES);

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
function resolveAlias(
  value,
  index,
  aliasMap,
  threshold = MATCH_CONFIG.ENTITY_MATCH_THRESHOLD,
) {
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

export function normalizeRecipe(value) {
  return resolveAlias(value, RECIPE_INDEX, RECIPE_ALIASES);
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
