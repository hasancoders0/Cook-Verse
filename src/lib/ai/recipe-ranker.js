// src/lib/ai/recipe-ranker.js

import { getMatchSummary } from "./recipe-matcher";
import { RANKING_WEIGHTS } from "./config";
import { normalizeText } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Reason Text Templates (localized)                                        */
/* -------------------------------------------------------------------------- */

const REASON_TEMPLATES = {
  dish: {
    en: "Matches the dish you asked for",
    bn: "আপনি যা খুঁজছেন তার সাথে মিলে যায়",
  },
  ingredient: {
    en: (count) =>
      count > 1
        ? `Uses ${count} ingredients you have`
        : "Uses an ingredient you have",
    bn: (count) =>
      count > 1
        ? `আপনার কাছে থাকা ${count}টি উপকরণ ব্যবহার করা হয়েছে`
        : "আপনার কাছে থাকা উপকরণ ব্যবহার করা হয়েছে",
  },
  cuisine: {
    en: "Matches your preferred cuisine",
    bn: "আপনার পছন্দের রান্নার ধরনের সাথে মিলে যায়",
  },
  category: {
    en: "Fits the meal type you're looking for",
    bn: "আপনার পছন্দের ক্যাটাগরির সাথে মিলে যায়",
  },
  diet: {
    en: "Fits your dietary preference",
    bn: "আপনার খাদ্যাভ্যাসের সাথে মিলে যায়",
  },
  difficulty: {
    en: "Matches your preferred difficulty level",
    bn: "আপনার পছন্দের কঠিনতা লেভেলের সাথে মিলে যায়",
  },
  time: {
    en: (minutes) => `Ready in ${minutes} minutes or less`,
    bn: (minutes) => `${minutes} মিনিট বা তার কম সময়ে তৈরি হয়`,
  },
  featured: {
    en: "A popular pick among users",
    bn: "ব্যবহারকারীদের মধ্যে জনপ্রিয় একটি রেসিপি",
  },
  rating: {
    en: "Highly rated by other users",
    bn: "অন্যান্য ব্যবহারকারীদের কাছে উচ্চ রেটিংপ্রাপ্ত",
  },
  fallback: {
    en: "A recipe you might also enjoy",
    bn: "আপনি এটিও পছন্দ করতে পারেন",
  },
};

function resolveReasonText(key, language, ...args) {
  const template = REASON_TEMPLATES[key]?.[language] || REASON_TEMPLATES[key]?.en;
  if (typeof template === "function") return template(...args);
  return template || "";
}

/* -------------------------------------------------------------------------- */
/* Scoring                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Compute a numeric relevance score + human-readable reasons for a
 * single recipe against the given constraints.
 *
 * Returns { score: number, reasons: string[] }
 */
function scoreRecipe(recipe, constraints, language) {
  const summary = getMatchSummary(recipe, constraints, language);
  const reasons = [];
  let score = 0;

  if (summary.matchesDish) {
    score += RANKING_WEIGHTS.DISH_NAME_MATCH;
    reasons.push(resolveReasonText("dish", language));
  }

  if (summary.ingredientOverlap > 0) {
    const mainIngredientBonus = countMainIngredientOverlap(recipe, constraints.ingredients);
    const secondaryOverlap = summary.ingredientOverlap - mainIngredientBonus;

    score +=
      mainIngredientBonus * RANKING_WEIGHTS.MAIN_INGREDIENT_MATCH +
      Math.max(secondaryOverlap, 0) * RANKING_WEIGHTS.SECONDARY_INGREDIENT_MATCH;

    reasons.push(resolveReasonText("ingredient", language, summary.ingredientOverlap));
  }

  if (summary.matchesCuisine) {
    score += RANKING_WEIGHTS.CUISINE_MATCH;
    reasons.push(resolveReasonText("cuisine", language));
  }

  if (summary.matchesCategory) {
    score += RANKING_WEIGHTS.CATEGORY_MATCH;
    reasons.push(resolveReasonText("category", language));
  }

  if (summary.matchesDiet) {
    score += RANKING_WEIGHTS.DIET_MATCH;
    reasons.push(resolveReasonText("diet", language));
  }

  if (summary.matchesDifficulty) {
    score += RANKING_WEIGHTS.DIFFICULTY_MATCH;
    reasons.push(resolveReasonText("difficulty", language));
  }

  if (summary.matchesTime) {
    score += RANKING_WEIGHTS.TIME_CONSTRAINT_MATCH;
    reasons.push(resolveReasonText("time", language, recipe.totalTime));
  }

  // Tag / search-term overlap as a minor tiebreaker signal (not
  // reflected in getMatchSummary directly — approximate via free text
  // constraints if present, e.g. leftover query terms).
  if (constraints.dish == null && summary.matchCount === 0 && recipe.featured) {
    // Only relevant in the truly-unconstrained fallback case (handled below).
  }

  // Quality boosts — always applied, not overlap-dependent.
  if (recipe.rating?.average) {
    score += recipe.rating.average * RANKING_WEIGHTS.RATING_BOOST;
  }
  if (recipe.featured) {
    score += RANKING_WEIGHTS.FEATURED_BOOST;
  }

  // If nothing structural matched at all (pure fallback ranking case),
  // give a generic reason so the UI never shows an empty reasons list.
  if (reasons.length === 0) {
    if (recipe.featured) {
      reasons.push(resolveReasonText("featured", language));
    } else if (recipe.rating?.average >= 4.5) {
      reasons.push(resolveReasonText("rating", language));
    } else {
      reasons.push(resolveReasonText("fallback", language));
    }
  }

  return { score, reasons };
}

/**
 * Count how many of the requested ingredients match this recipe's
 * MAIN ingredients specifically (vs. any ingredient) — main ingredient
 * matches are weighted higher since they're more central to the dish.
 */
function countMainIngredientOverlap(recipe, ingredientSlugs = []) {
  if (!ingredientSlugs.length) return 0;

  const mainSlugs = new Set(
    (recipe.ingredientGroups || [])
      .flatMap((group) => group.items || [])
      .filter((item) => item.isMainIngredient)
      .map((item) => normalizeText(item.slug)),
  );

  return ingredientSlugs.filter((slug) => mainSlugs.has(normalizeText(slug))).length;
}

/* -------------------------------------------------------------------------- */
/* Main Export — Rank a Candidate List                                      */
/* -------------------------------------------------------------------------- */

/**
 * Rank a list of candidate recipes against constraints, returning them
 * sorted best-first with `.score` and `.reasons` attached.
 *
 * Does NOT filter — assumes recipe-matcher.js already narrowed the
 * candidate pool (or passed in the full list for fallback ranking).
 *
 * Returns: Array<Recipe & { score: number, reasons: string[] }>
 */
export function rankRecipes(candidates = [], constraints = {}, language = "en") {
  const scored = candidates.map((recipe) => {
    const { score, reasons } = scoreRecipe(recipe, constraints, language);
    return { ...recipe, score, reasons };
  });

  return scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Tiebreaker: higher rating wins
    const ratingA = a.rating?.average ?? 0;
    const ratingB = b.rating?.average ?? 0;
    if (ratingB !== ratingA) return ratingB - ratingA;
    // Final tiebreaker: featured recipes first
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });
}

/**
 * Rank and return just the single best match — convenience wrapper for
 * callers that only care about the top pick (e.g. a quick "what should
 * I cook" single-recipe response).
 */
export function getTopRecipe(candidates = [], constraints = {}, language = "en") {
  const ranked = rankRecipes(candidates, constraints, language);
  return ranked[0] || null;
}