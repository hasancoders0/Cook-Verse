// src/lib/ai/recommendation-engine.js

import { getAllRecipes } from "@/lib/recipes";
import { MATCH_CONFIG } from "./config";
import { matchRecipes } from "./recipe-matcher";
import { rankRecipes } from "./recipe-ranker";

/* -------------------------------------------------------------------------- */
/* Constraint Shape                                                          */
/* -------------------------------------------------------------------------- */

/**
 * A "constraint set" is the normalized search filter object passed to
 * recipe-matcher.js / recipe-ranker.js. Built from merged entities
 * (current message + inherited context, resolved by
 * conversation-manager.resolveFollowUpEntities).
 *
 * {
 *   ingredients: string[],   // canonical ingredient slugs
 *   dish: string | null,     // recipe slug if a specific dish was named
 *   cuisine: string | null,
 *   category: string | null,
 *   diet: string | null,
 *   difficulty: string | null,
 *   maxTime: number | null,  // minutes ceiling
 * }
 */

export function buildConstraints(entities = {}) {
  return {
    ingredients: entities.ingredients || [],
    dish: entities.dish || null,
    cuisine: entities.cuisine || null,
    category: entities.category || null,
    diet: entities.diet || null,
    difficulty: entities.difficulty || null,
    maxTime: entities.time ?? null,
  };
}

/**
 * Returns true if a constraint set has nothing usable to search with.
 */
export function isEmptyConstraints(constraints) {
  if (!constraints) return true;
  return (
    !constraints.ingredients?.length &&
    !constraints.dish &&
    !constraints.cuisine &&
    !constraints.category &&
    !constraints.diet &&
    !constraints.difficulty &&
    constraints.maxTime == null
  );
}

/* -------------------------------------------------------------------------- */
/* Main Orchestration                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Run the full search pipeline: match candidates against constraints,
 * rank them by relevance, and return the top results plus a fallback
 * set of "closest matches" if nothing scored well enough.
 *
 * Returns:
 * {
 *   results: RankedRecipe[],       // top matches (empty if truly nothing fits)
 *   isFallback: boolean,           // true if `results` are "closest match" picks
 *   totalCandidates: number,       // how many recipes were considered a match at all
 * }
 *
 * RankedRecipe = original recipe object + { score, reasons: string[] }
 */
export function getRecommendations(constraints, { language = "en" } = {}) {
  const allRecipes = getAllRecipes();

  if (isEmptyConstraints(constraints)) {
    // Nothing to search with — surface featured/top-rated recipes instead
    // of an empty screen, ranked with no specific reasons.
    const ranked = rankRecipes(allRecipes, constraints, language);
    return {
      results: [],
      isFallback: false,
      totalCandidates: 0,
      reason: "NO_SEARCH_CONSTRAINTS",
    };
  }

  const candidates = matchRecipes(allRecipes, constraints);

  if (candidates.length > 0) {
    const ranked = rankRecipes(candidates, constraints, language);
    return {
      results: ranked.slice(0, MATCH_CONFIG.MAX_RESULTS),
      isFallback: false,
      totalCandidates: candidates.length,
    };
  }

  // No exact matches — per spec, never return a hard empty result.
  // Fall back to ranking ALL recipes against whatever constraints we
  // have, so the closest possible matches still surface.
  const fallbackRanked = rankRecipes(allRecipes, constraints, language);
  return {
    results: [],
    isFallback: false,
    totalCandidates: 0,
    reason: "NO_MATCH_FOUND",
  };
}

/* -------------------------------------------------------------------------- */
/* Dish-Specific Lookup (e.g. "chicken biryani" named directly)             */
/* -------------------------------------------------------------------------- */

/**
 * When entity-extractor found a specific dish slug, prefer resolving
 * directly to that recipe (plus close siblings, e.g. beef biryani
 * alongside chicken biryani) rather than running the full constraint
 * pipeline — matches your "চিকেন বিরিয়ানি এবং বিফ বিরিয়ানিসহ" example.
 */
export function getRecommendationsForDish(
  dishSlug,
  constraints,
  { language = "en" } = {},
) {
  const allRecipes = getAllRecipes();

  // Find the exact recipe by slug
  const exact = allRecipes.find((recipe) => recipe.slug === dishSlug);

  // If no exact recipe exists, fall back to the normal search pipeline
  if (!exact) {
    return getRecommendations(constraints, { language });
  }

  // Return ONLY the exact recipe.
  // Related recipes will be handled separately in future ("Show more", "Related", etc.)
  return {
    results: [
      {
        ...exact,
        matchType: "exact",
      },
    ],
    isFallback: false,
    totalCandidates: 1,
    searchMode: "exact",
  };
}

/* -------------------------------------------------------------------------- */
/* Suggestion Chip Generation                                                */
/* -------------------------------------------------------------------------- */

/**
 * Build a list of dish-name suggestion labels from the current result
 * set, for use as follow-up chips (per the spec's "Note: Should show
 * here name recipe list dish name..." annotations).
 */
export function buildDishSuggestions(results = [], language = "en") {
  return results
    .slice(0, MATCH_CONFIG.MAX_SUGGESTIONS)
    .map((recipe) => recipe.title?.[language] || recipe.title?.en)
    .filter(Boolean);
}

/**
 * Build ingredient-based suggestions from the matched recipes'
 * ingredient lists — e.g. "you could also try X, Y, Z" using the
 * user's given ingredients.
 */
export function buildIngredientBasedDishNames(results = [], language = "en") {
  return buildDishSuggestions(results, language);
}
