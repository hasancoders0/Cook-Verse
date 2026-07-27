// src/lib/ai/recipe-matcher.js

import { flattenIngredients } from "@/lib/recipes";
import {
  normalizeText,
  fuzzyIncludes,
  similarity,
  tokenize,
} from "@/lib/utils";

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

  const recipeIngredients = new Set(
    flattenIngredients(recipe).map((item) => normalizeText(item.slug)),
  );

  let matched = 0;

  for (const slug of ingredientSlugs) {
    if (recipeIngredients.has(normalizeText(slug))) {
      matched++;
    }
  }

  // If user searched with 3 or more ingredients,
  // require at least 2 ingredients to match.
  if (matched === 0) {
    return 0;
  }

  return matched;
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
    return (
      recipe.tags?.some((tag) => normalizeText(tag.slug) === normalized) ??
      false
    );
  }

  return (
    recipe.diet?.some((diet) => normalizeText(diet.slug) === normalized) ??
    false
  );
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

  const q = normalizeText(query);

  const tokens = tokenize(q).filter((token) => token.length > 2);

  const titleEn = normalizeText(recipe.title?.en || "");
  const titleBn = normalizeText(recipe.title?.bn || "");

  const searchTerms = [
    ...(recipe.searchTerms?.en || []),
    ...(recipe.searchTerms?.bn || []),
  ].map(normalizeText);

  const searchable = [
    recipe.slug,

    recipe.title?.en,
    recipe.title?.bn,

    ...(recipe.searchTerms?.en || []),
    ...(recipe.searchTerms?.bn || []),

    recipe.description?.en,
    recipe.description?.bn,

    recipe.category?.name?.en,
    recipe.category?.name?.bn,

    recipe.cuisine?.name?.en,
    recipe.cuisine?.name?.bn,

    ...(recipe.tags?.map((tag) => tag.name?.en) || []),
    ...(recipe.tags?.map((tag) => tag.name?.bn) || []),
  ]
    .filter(Boolean)
    .map(normalizeText);

  if (titleEn === q || titleBn === q) {
    return true;
  }

  if (searchTerms.includes(q)) {
    return true;
  }

  return searchable.some((item) => {
    // Full query
    if (item === q || item.includes(q) || fuzzyIncludes(item, q)) {
      return true;
    }

    // Token match
    return tokens.every((token) => {
      return item.includes(token) || fuzzyIncludes(item, token);
    });
  });
}

export function smartSearch(recipe, query = "") {
  if (!query) return false;

  const q = normalizeText(query);

  // 1. Exact slug
  if (normalizeText(recipe.slug) === q) {
    return true;
  }

  // 2. Exact title
  const titles = [recipe.title?.en, recipe.title?.bn]
    .filter(Boolean)
    .map(normalizeText);

  if (titles.includes(q)) {
    return true;
  }

  // 3. searchTerms
  const searchTerms = [
    ...(recipe.searchTerms?.en || []),
    ...(recipe.searchTerms?.bn || []),
  ].map(normalizeText);

  if (searchTerms.includes(q)) {
    return true;
  }

  // 4. Main Ingredients
  const mainIngredients = (recipe.ingredientGroups || [])
    .flatMap((group) => group.items || [])
    .filter((item) => item.isMainIngredient)
    .flatMap((item) => [item.slug, item.name?.en, item.name?.bn])
    .filter(Boolean)
    .map(normalizeText);

  if (mainIngredients.includes(q)) {
    return true;
  }

  // 5. Tags
  const tags = (recipe.tags || [])
    .flatMap((tag) => [tag.slug, tag.name?.en, tag.name?.bn])
    .filter(Boolean)
    .map(normalizeText);

  if (tags.includes(q)) {
    return true;
  }

  // 6. Cuisine
  const cuisine = [
    recipe.cuisine?.slug,
    recipe.cuisine?.name?.en,
    recipe.cuisine?.name?.bn,
  ]
    .filter(Boolean)
    .map(normalizeText);

  if (cuisine.includes(q)) {
    return true;
  }

  // 7. Category
  const category = [
    recipe.category?.slug,
    recipe.category?.name?.en,
    recipe.category?.name?.bn,
  ]
    .filter(Boolean)
    .map(normalizeText);

  if (category.includes(q)) {
    return true;
  }

  // 8. Description
  const descriptions = [recipe.description?.en, recipe.description?.bn]
    .filter(Boolean)
    .map(normalizeText);

  if (descriptions.some((text) => text.includes(q))) {
    return true;
  }

  // 9. Fuzzy
  const allTexts = [
    ...titles,
    ...searchTerms,
    ...mainIngredients,
    ...tags,
    ...cuisine,
    ...category,
  ];

  return allTexts.some((text) => similarity(text, q) >= 0.75);
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
  const ingredientOverlap = countIngredientOverlap(
    recipe,
    constraints.ingredients,
  );
  const dishHit = matchesDish(recipe, constraints.dish);
  const cuisineHit = matchesCuisine(recipe, constraints.cuisine);
  const categoryHit = matchesCategory(recipe, constraints.category);
  const dietHit = matchesDiet(recipe, constraints.diet);
  const difficultyHit = matchesDifficulty(
    recipe,
    constraints.difficulty,
    language,
  );
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
export function matchRecipes(
  allRecipes = [],
  constraints = {},
  { language = "en" } = {},
) {
  const candidates = [];

  for (const recipe of allRecipes) {
    const summary = getMatchSummary(recipe, constraints, language);
    const query = normalizeText(constraints.query || "");

    const queryMatched =
      query && matchesFreeText(recipe, constraints.query, language);

    if (
      constraints.ingredients?.length > 0 &&
      summary.ingredientOverlap === 0
    ) {
      continue;
    }

    // Difficulty filter (must match)
    if (constraints.difficulty && !summary.matchesDifficulty) {
      continue;
    }

    // Cuisine filter (must match)
    if (constraints.cuisine && !summary.matchesCuisine) {
      continue;
    }

    // Category filter (must match)
    if (constraints.category && !summary.matchesCategory) {
      continue;
    }

    // Diet filter (must match)
    if (constraints.diet && !summary.matchesDiet) {
      continue;
    }

    // Time filter (must match)
    if (constraints.maxTime != null && !summary.matchesTime) {
      continue;
    }

    const shouldInclude = summary.matchCount > 0 || queryMatched;

    if (shouldInclude) {
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
export function matchRecipesStrict(
  allRecipes = [],
  constraints = {},
  { language = "en" } = {},
) {
  return allRecipes.filter((recipe) => {
    const summary = getMatchSummary(recipe, constraints, language);

    const checks = [];
    if (constraints.ingredients?.length)
      checks.push(summary.ingredientOverlap > 0);
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
  return (
    allRecipes.find(
      (recipe) => normalizeText(recipe.slug) === normalizeText(slug),
    ) || null
  );
}
