// src/lib/ai/recipe-matcher.js

import { flattenIngredients } from "@/lib/recipes";
import { normalizeText, fuzzyIncludes } from "@/lib/utils";
import { MATCH_CONFIG } from "./config";

/* -------------------------------------------------------------------------- */
/* Field-Level Matchers                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Check if a recipe contains ANY of the requested ingredient slugs
 * (as main or secondary ingredients). Returns the count of overlapping
 * ingredients, which recipe-ranker.js uses for scoring.
 */
function countIngredientOverlap(recipe, ingredientSlugs = []) {
  if (!ingredientSlugs.length) return 0;

  const recipeIngredients = flattenIngredients(recipe).map((item) =>
    normalizeText(item.slug),
  );

  let count = 0;
  for (const slug of ingredientSlugs) {
    if (recipeIngredients.includes(normalizeText(slug))) {
      count += 1;
    }
  }
  return count;
}

function matchesCuisine(recipe, cuisineSlug) {
  if (!cuisineSlug) return false;
  return normalizeText(recipe.cuisine?.slug) === normalizeText(cuisineSlug);
}

function matchesCategory(recipe, categorySlug) {
  if (!categorySlug) return false;
  return normalizeText(recipe.category?.slug) === normalizeText(categorySlug);
}

function matchesDiet(recipe, dietSlug) {
  if (!dietSlug) return false;
  const normalized = normalizeText(dietSlug);

  // "spicy" / "not-spicy" aren't real diet objects in recipe data —
  // approximate via tags until/unless recipes add explicit spice level.
  if (normalized === "spicy" || normalized === "not-spicy") {
    return recipe.tags?.some((tag) => normalizeText(tag.slug) === normalized) ?? false;
  }

  return recipe.diet?.some((diet) => normalizeText(diet.slug) === normalized) ?? false;
}

function matchesDifficulty(recipe, difficulty, language = "en") {
  if (!difficulty) return false;
  const recipeDifficulty = normalizeText(
    recipe.difficulty?.[language] || recipe.difficulty?.en,
  );
  return recipeDifficulty === normalizeText(difficulty);
}

function matchesMaxTime(recipe, maxTime) {
  if (maxTime == null) return false;
  const totalTime = recipe.totalTime ?? Infinity;
  return totalTime <= maxTime;
}

function matchesDish(recipe, dishSlug) {
  if (!dishSlug) return false;
  return normalizeText(recipe.slug) === normalizeText(dishSlug);
}

/* -------------------------------------------------------------------------- */
/* Free-text Fallback Matching (searchTerms / title / tags)                 */
/* -------------------------------------------------------------------------- */

/**
 * Loose free-text check against a recipe's searchable text fields —
 * used as a last-resort matcher when structured constraints (ingredient
 * slugs, cuisine slug, etc.) don't directly line up, e.g. a raw query
 * string that wasn't cleanly parsed into entities.
 */
export function matchesFreeText(recipe, query = "", language = "en") {
  if (!query) return false;
  const normalizedQuery = normalizeText(query);

  const haystacks = [
    recipe.title?.[language],
    recipe.title?.en,
    recipe.description?.[language],
    ...(recipe.searchTerms?.[language] || []),
    ...(recipe.searchTerms?.en || []),
    recipe.category?.name?.[language],
    recipe.cuisine?.name?.[language],
    ...(recipe.tags?.map((tag) => tag.name?.[language]) || []),
  ]
    .filter(Boolean)
    .map(normalizeText);

  return haystacks.some(
    (text) => text.includes(normalizedQuery) || fuzzyIncludes(text, normalizedQuery),
  );
}

/* -------------------------------------------------------------------------- */
/* Match Scoring (per-recipe overlap summary)                               */
/* -------------------------------------------------------------------------- */

/**
 * Compute a lightweight "match summary" for one recipe against the
 * constraint set — used both to decide inclusion and later passed to
 * recipe-ranker.js so it doesn't need to re-derive overlap details.
 *
 * Returns:
 * {
 *   ingredientOverlap: number,
 *   matchesDish: boolean,
 *   matchesCuisine: boolean,
 *   matchesCategory: boolean,
 *   matchesDiet: boolean,
 *   matchesDifficulty: boolean,
 *   matchesTime: boolean,
 *   matchCount: number,   // total number of criteria satisfied
 * }
 */
export function getMatchSummary(recipe, constraints = {}, language = "en") {
  const ingredientOverlap = countIngredientOverlap(recipe, constraints.ingredients);
  const dishHit = matchesDish(recipe, constraints.dish);
  const cuisineHit = matchesCuisine(recipe, constraints.cuisine);
  const categoryHit = matchesCategory(recipe, constraints.category);
  const dietHit = matchesDiet(recipe, constraints.diet);
  const difficultyHit = matchesDifficulty(recipe, constraints.difficulty, language);
  const timeHit = matchesMaxTime(recipe, constraints.maxTime);

  const matchCount =
    (ingredientOverlap > 0 ? 1 : 0) +
    (dishHit ? 1 : 0) +
    (cuisineHit ? 1 : 0) +
    (categoryHit ? 1 : 0) +
    (dietHit ? 1 : 0) +
    (difficultyHit ? 1 : 0) +
    (timeHit ? 1 : 0);

  return {
    ingredientOverlap,
    matchesDish: dishHit,
    matchesCuisine: cuisineHit,
    matchesCategory: categoryHit,
    matchesDiet: dietHit,
    matchesDifficulty: difficultyHit,
    matchesTime: timeHit,
    matchCount,
  };
}

/* -------------------------------------------------------------------------- */
/* Main Export — Candidate Filtering                                        */
/* -------------------------------------------------------------------------- */

/**
 * Filter the full recipe list down to candidates that satisfy AT LEAST
 * ONE constraint (loose OR-style matching — recipe-ranker.js handles
 * making the ordering reflect how MANY/how well constraints are met).
 *
 * This deliberately does not do strict AND-matching (e.g. requiring
 * cuisine AND ingredient both match), since real conversations layer
 * constraints incrementally ("I have chicken" -> "something spicy" ->
 * "Italian") and a strict AND would empty out results too aggressively.
 *
 * Returns an array of recipe objects (not yet ranked/scored).
 */
export function matchRecipes(allRecipes = [], constraints = {}, { language = "en" } = {}) {
  const candidates = [];

  for (const recipe of allRecipes) {
    const summary = getMatchSummary(recipe, constraints, language);
    if (summary.matchCount > 0) {
      candidates.push(recipe);
    }
  }

  return candidates;
}

/**
 * Stricter variant: only return recipes that satisfy ALL non-null
 * constraints. Useful for recommendation-engine.js if it ever wants to
 * try a strict pass first before falling back to loose matching —
 * currently unused by default but exposed for flexibility.
 */
export function matchRecipesStrict(allRecipes = [], constraints = {}, { language = "en" } = {}) {
  return allRecipes.filter((recipe) => {
    const summary = getMatchSummary(recipe, constraints, language);

    const checks = [];
    if (constraints.ingredients?.length) checks.push(summary.ingredientOverlap > 0);
    if (constraints.dish) checks.push(summary.matchesDish);
    if (constraints.cuisine) checks.push(summary.matchesCuisine);
    if (constraints.category) checks.push(summary.matchesCategory);
    if (constraints.diet) checks.push(summary.matchesDiet);
    if (constraints.difficulty) checks.push(summary.matchesDifficulty);
    if (constraints.maxTime != null) checks.push(summary.matchesTime);

    return checks.length > 0 && checks.every(Boolean);
  });
}

/**
 * Find a single recipe by exact dish slug — thin convenience wrapper
 * used by recommendation-engine.getRecommendationsForDish.
 */
export function findRecipeBySlug(allRecipes = [], slug) {
  if (!slug) return null;
  return allRecipes.find((recipe) => normalizeText(recipe.slug) === normalizeText(slug)) || null;
}