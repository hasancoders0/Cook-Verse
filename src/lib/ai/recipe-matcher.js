import { AI_CONFIG } from "./config";

import { getSearchIndex } from "@/lib/search/search-index";

/* -------------------------------------------------------------------------- */
/* Penalty Thresholds                                                         */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Matcher-specific thresholds for when penalty weights apply.               */
/* The weights themselves live in AI_CONFIG.PENALTY.                         */
/*                                                                            */

const LOW_RATING_THRESHOLD = 3.5;

const LONG_COOK_TIME_THRESHOLD = 90;

const HIGH_RATING_THRESHOLD = 4.5;

/* -------------------------------------------------------------------------- */
/* Match Recipes — Public API                                                 */
/* -------------------------------------------------------------------------- */

export function matchRecipes(constraints = {}) {
  /* Pipeline gate */
  if (AI_CONFIG.PIPELINE.RECIPE_MATCHING === false) {
    return [];
  }

  const results = [];

  const searchIndex = getSearchIndex();

  for (const item of searchIndex) {
    const result = evaluateRecipe(item.recipe, item.searchable, constraints);

    if (result.matched) {
      results.push(result);
    }
  }

  /* Lightweight pre-sort by score.  The ranker does a more sophisticated
     multi-field sort later — this just puts the best candidates first
     for the ranker's input. */
  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return (
      Number(Boolean(b.recipe?.featured)) - Number(Boolean(a.recipe?.featured))
    );
  });

  return results;
}

/* -------------------------------------------------------------------------- */
/* Evaluate Recipe                                                            */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Parameters:                                                                */
/*   recipe    — the original recipe object (kept for the result output)     */
/*   searchable — the flattened search index entry built by search-index.js  */
/*   constraints — the built constraint object from constraint-builder.js    */
/*                                                                            */

function evaluateRecipe(recipe, searchable, constraints) {
  const matches = createMatchRecord();

  const reasons = [];

  /* --- Positive scoring --- */

  let score = 0;

  score += matchTitle(searchable, constraints, matches, reasons);

  score += matchSearchTerms(searchable, constraints, matches, reasons);

  score += matchIngredients(searchable, constraints, matches, reasons);

  score += matchCategory(searchable, constraints, matches, reasons);

  score += matchCuisine(searchable, constraints, matches, reasons);

  score += matchDiet(searchable, constraints, matches, reasons);

  score += matchTags(searchable, constraints, matches, reasons);

  score += matchDifficulty(searchable, constraints, matches, reasons);

  score += matchCookTime(searchable, constraints, reasons);

  score += matchServings(searchable, constraints, reasons);

  /* --- Bonus scoring --- */

  score += calculateBonus(matches, searchable);

  /* --- Penalty scoring (only applied when there are positive matches,
     and final score is clamped to zero to avoid negative results) --- */

  if (score > 0) {
    score += calculatePenalty(searchable);

    score = Math.max(0, score);
  }

  const minScore = AI_CONFIG.THRESHOLD.MIN_MATCH_SCORE ?? 1;

  return {
    matched: score >= minScore,
    recipe,
    searchable,
    score,
    reasons,
    matches,
    metadata: {
      matchedFields: Object.values(matches).filter((value) => value.length > 0)
        .length,
      totalMatches: Object.values(matches).reduce(
        (total, value) => total + value.length,
        0,
      ),
      totalReasons: reasons.length,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Match Record                                                               */
/* -------------------------------------------------------------------------- */

function createMatchRecord() {
  return {
    title: [],

    searchTerms: [],

    ingredients: [],

    categories: [],

    cuisines: [],

    diets: [],

    tags: [],

    difficulty: [],
  };
}

/* -------------------------------------------------------------------------- */
/* Match — Title                                                              */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Checks if any localized title appears in the user's prompt.               */
/* Titles are the strongest signal — a direct title match means the user    */
/* is almost certainly looking for that specific recipe.                    */
/*                                                                            */

function matchTitle(searchable, constraints, matches, reasons) {
  let score = 0;

  const query = getPrompt(constraints);

  for (const title of searchable.title ?? []) {
    if (!title) continue;

    if (containsPhrase(query, title)) {
      score += AI_CONFIG.SCORE.TITLE;

      matches.title.push(title);

      reasons.push({
        type: "title",

        value: title,
      });
    }
  }

  return score;
}

/* -------------------------------------------------------------------------- */
/* Match — Search Terms                                                       */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Checks if any of the recipe's hand-curated search terms appear in        */
/* the user's prompt.  Search terms are the richest text-matching signal    */
/* — they include synonyms, transliterations, and compound variants.        */
/*                                                                            */

function matchSearchTerms(searchable, constraints, matches, reasons) {
  let score = 0;

  const query = getPrompt(constraints);

  for (const term of searchable.searchTerms ?? []) {
    if (!term) continue;

    if (containsPhrase(query, term)) {
      score += AI_CONFIG.SCORE.SEARCH_TERM;

      matches.searchTerms.push(term);

      reasons.push({
        type: "searchTerm",

        value: term,
      });
    }
  }

  return score;
}

/* -------------------------------------------------------------------------- */
/* Match — Ingredients                                                        */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Compares requested ingredients (from constraints) against the recipe's   */
/* ingredient list.  Uses slug comparison first, then falls back to         */
/* name-string comparison to handle cases where the entity index produces   */
/* a name-based slug that doesn't match the recipe's hyphenated slug.       */
/*                                                                            */
/* Example mismatch this fixes:                                              */
/*   Entity index:  "ground beef" (from name.en)                             */
/*   Constraint:     { slug: "ground beef" }                                 */
/*   Recipe slug:    "ground-beef"                                           */
/*   Recipe name.en: "Ground Beef"                                           */
/*   → Slug fails, but name-string "ground beef" matches "ground beef"       */
/*                                                                            */

function matchIngredients(searchable, constraints, matches, reasons) {
  let score = 0;

  const ingredients = searchable.ingredients ?? [];

  for (const requested of constraints.ingredients ?? []) {
    const found = findIngredientMatch(ingredients, requested);

    if (!found) continue;

    score += AI_CONFIG.SCORE.INGREDIENT;

    matches.ingredients.push(found);

    reasons.push({
      type: "ingredient",

      value: found.slug,
    });
  }

  return score;
}

function findIngredientMatch(ingredients, requested) {
  const requestedStrings = getMatchableStrings(requested);

  if (requestedStrings.length === 0) return null;

  return ingredients.find((ingredient) => {
    const ingredientStrings = getMatchableStrings(ingredient);

    return ingredientStrings.some((is) => requestedStrings.includes(is));
  });
}

/* -------------------------------------------------------------------------- */
/* Match — Category                                                           */
/* -------------------------------------------------------------------------- */

function matchCategory(searchable, constraints, matches, reasons) {
  let score = 0;

  if (!constraints.categories?.length || !searchable.category) {
    return score;
  }

  const searchableStrings = getMatchableStrings(searchable.category);

  for (const category of constraints.categories) {
    const categoryStrings = getMatchableStrings(category);

    if (stringsIntersect(searchableStrings, categoryStrings)) {
      score += AI_CONFIG.SCORE.CATEGORY;

      matches.categories.push(searchable.category);

      reasons.push({
        type: "category",

        value: searchable.category.slug,
      });

      break;
    }
  }

  return score;
}

/* -------------------------------------------------------------------------- */
/* Match — Cuisine                                                            */
/* -------------------------------------------------------------------------- */

function matchCuisine(searchable, constraints, matches, reasons) {
  let score = 0;

  if (!constraints.cuisines?.length || !searchable.cuisine) {
    return score;
  }

  const searchableStrings = getMatchableStrings(searchable.cuisine);

  for (const cuisine of constraints.cuisines) {
    const cuisineStrings = getMatchableStrings(cuisine);

    if (stringsIntersect(searchableStrings, cuisineStrings)) {
      score += AI_CONFIG.SCORE.CUISINE;

      matches.cuisines.push(searchable.cuisine);

      reasons.push({
        type: "cuisine",

        value: searchable.cuisine.slug,
      });

      break;
    }
  }

  return score;
}

/* -------------------------------------------------------------------------- */
/* Match — Diet                                                               */
/* -------------------------------------------------------------------------- */

function matchDiet(searchable, constraints, matches, reasons) {
  let score = 0;

  if (!constraints.diets?.length) {
    return score;
  }

  const diets = searchable.diets ?? [];

  for (const requested of constraints.diets) {
    const requestedStrings = getMatchableStrings(requested);

    const found = diets.find((diet) => {
      const dietStrings = getMatchableStrings(diet);

      return stringsIntersect(dietStrings, requestedStrings);
    });

    if (!found) continue;

    score += AI_CONFIG.SCORE.DIET;

    matches.diets.push(found);

    reasons.push({
      type: "diet",

      value: found.slug,
    });
  }

  return score;
}

/* -------------------------------------------------------------------------- */
/* Match — Tags                                                               */
/* -------------------------------------------------------------------------- */

function matchTags(searchable, constraints, matches, reasons) {
  let score = 0;

  if (!constraints.tags?.length) {
    return score;
  }

  const tags = searchable.tags ?? [];

  for (const requested of constraints.tags) {
    const requestedStrings = getMatchableStrings(requested);

    const found = tags.find((tag) => {
      const tagStrings = getMatchableStrings(tag);

      return stringsIntersect(tagStrings, requestedStrings);
    });

    if (!found) continue;

    score += AI_CONFIG.SCORE.TAG;

    matches.tags.push(found);

    reasons.push({
      type: "tag",

      value: found.slug,
    });
  }

  return score;
}

/* -------------------------------------------------------------------------- */
/* Match — Difficulty                                                         */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Difficulty in the searchable object is { en: "Easy", bn: "সহজ" }.       */
/* Constraints produce { name: { en: "Easy", bn: "সহজ" } } objects.         */
/* Comparison is done via matchable strings (extracted + lowercased).       */
/*                                                                            */

function matchDifficulty(searchable, constraints, matches, reasons) {
  let score = 0;

  if (!constraints.difficulties?.length || !searchable.difficulty) {
    return score;
  }

  const searchableStrings = getMatchableStringsFromLocalized(
    searchable.difficulty,
  );

  for (const difficulty of constraints.difficulties) {
    const difficultyStrings = getMatchableStrings(difficulty);

    if (stringsIntersect(searchableStrings, difficultyStrings)) {
      score += AI_CONFIG.SCORE.DIFFICULTY;

      matches.difficulty.push(searchable.difficulty);

      reasons.push({
        type: "difficulty",

        value: getFirstEnglish(searchable.difficulty),
      });

      break;
    }
  }

  return score;
}

/* -------------------------------------------------------------------------- */
/* Match — Cook Time                                                          */
/* -------------------------------------------------------------------------- */

function matchCookTime(searchable, constraints, reasons) {
  if (!constraints.maxCookTime) {
    return 0;
  }

  const cookTime = searchable.cookTime ?? 0;

  if (cookTime <= constraints.maxCookTime) {
    reasons.push({
      type: "cookTime",

      value: cookTime,

      filter: constraints.maxCookTime,
    });

    return AI_CONFIG.SCORE.COOK_TIME;
  }

  return 0;
}

/* -------------------------------------------------------------------------- */
/* Match — Servings                                                           */
/* -------------------------------------------------------------------------- */

function matchServings(searchable, constraints, reasons) {
  if (!constraints.servings) {
    return 0;
  }

  const servings = searchable.servings ?? 0;

  if (servings >= constraints.servings) {
    reasons.push({
      type: "servings",

      value: servings,

      filter: constraints.servings,
    });

    return AI_CONFIG.SCORE.SERVINGS;
  }

  return 0;
}

/* -------------------------------------------------------------------------- */
/* Bonus Calculation                                                         */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Extra points awarded when multiple fields match the same recipe,         */
/* signalling a strong overall fit.  All bonus keys from AI_CONFIG.BONUS   */
/* are checked explicitly.  New keys added to config are automatically       */
/* picked up when this function is updated — but since bonus conditions     */
/* are custom per key, each needs an explicit check.                        */
/*                                                                            */

function calculateBonus(matches, searchable) {
  let score = 0;

  const bonus = AI_CONFIG.BONUS;

  if (!bonus || typeof bonus !== "object") {
    return score;
  }

  /* --- Ingredient multi-match bonuses (stacking: 4+ gives all three) --- */

  const ingredientCount = matches.ingredients.length;

  if (ingredientCount >= 4 && bonus.FOUR_PLUS_INGREDIENTS) {
    score += bonus.FOUR_PLUS_INGREDIENTS;
  }

  if (ingredientCount >= 3 && bonus.THREE_INGREDIENTS) {
    score += bonus.THREE_INGREDIENTS;
  }

  if (ingredientCount >= 2 && bonus.TWO_INGREDIENTS) {
    score += bonus.TWO_INGREDIENTS;
  }

  /* --- Field-presence bonuses --- */

  if (matches.categories.length > 0 && bonus.CATEGORY_MATCH) {
    score += bonus.CATEGORY_MATCH;
  }

  if (matches.cuisines.length > 0 && bonus.CUISINE_MATCH) {
    score += bonus.CUISINE_MATCH;
  }

  if (matches.diets.length > 0 && bonus.DIET_MATCH) {
    score += bonus.DIET_MATCH;
  }

  /* --- Multi-tag bonus --- */

  if (matches.tags.length >= 2 && bonus.TAG_MATCH_MULTI) {
    score += bonus.TAG_MATCH_MULTI;
  }

  /* --- Featured recipe bonus --- */

  if (searchable.featured === true && bonus.FEATURED_RECIPE) {
    score += bonus.FEATURED_RECIPE;
  }

  /* --- High rating bonus --- */

  if (bonus.HIGH_RATING) {
    const average = searchable.rating?.average ?? 0;

    if (average >= HIGH_RATING_THRESHOLD) {
      score += bonus.HIGH_RATING;
    }
  }

  return score;
}

/* -------------------------------------------------------------------------- */
/* Penalty Calculation                                                       */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Points subtracted from matched recipes that carry undesirable signals.    */
/* Only applied when the recipe already has a positive score.                */
/* Final score is clamped to 0 to prevent negative results.                 */
/*                                                                            */

function calculatePenalty(searchable) {
  let penalty = 0;

  const pen = AI_CONFIG.PENALTY;

  if (!pen || typeof pen !== "object") {
    return penalty;
  }

  /* Low rating: recipe has a rating below the threshold */
  if (pen.LOW_RATING) {
    const average = searchable.rating?.average ?? 0;

    if (average > 0 && average < LOW_RATING_THRESHOLD) {
      penalty += pen.LOW_RATING;
    }
  }

  /* Long cook time: recipe takes significantly long when no time
     constraint was specified (if a time constraint exists, the
     cookTime match function already handled it) */
  if (pen.LONG_COOK_TIME) {
    const cookTime = searchable.cookTime ?? 0;

    if (cookTime > LONG_COOK_TIME_THRESHOLD) {
      penalty += pen.LONG_COOK_TIME;
    }
  }

  return penalty;
}

/* -------------------------------------------------------------------------- */
/* Phrase Matching                                                            */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Unicode-aware word-boundary matching.  Matches `phrase` only when it     */
/* appears as a complete word/token in `text`, not as a substring of a      */
/* longer word.                                                              */
/*                                                                            */

function containsPhrase(text, phrase) {
  if (!text || !phrase) {
    return false;
  }

  const escaped = escapeRegex(String(phrase).toLowerCase());

  const regex = new RegExp(
    `(^|[^\\p{L}\\p{N}])${escaped}(?=[^\\p{L}\\p{N}]|$)`,
    "iu",
  );

  return regex.test(text);
}

/* -------------------------------------------------------------------------- */
/* Prompt Accessor                                                            */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Priority: normalizedPrompt (cleaned by parser) > rawPrompt > prompt.     */
/* The normalized prompt has punctuation removed and is lowercased, which   */
/* makes it the most reliable source for text matching.                     */
/*                                                                            */

function getPrompt(constraints) {
  if (constraints.normalizedPrompt) {
    return constraints.normalizedPrompt;
  }

  if (constraints.rawPrompt) {
    return constraints.rawPrompt.toLowerCase();
  }

  return (constraints.prompt ?? "").toLowerCase();
}

/* -------------------------------------------------------------------------- */
/* Matchable Strings                                                          */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Extracts all lowercase string representations from an entity for         */
/* comparison.  Handles:                                                     */
/*   - Plain strings:  "ground-beef" → ["ground-beef"]                      */
/*   - Slug objects:   { slug: "x", name: { en: "X", bn: "Y" } }           */
/*                       → ["x", "x", "y"]                                  */
/*   - Localized only: { en: "Easy", bn: "সহজ" }                           */
/*                       → ["easy", "সহজ"]                                   */
/*                                                                            */

function getMatchableStrings(entity) {
  if (!entity || typeof entity !== "object") {
    return [];
  }

  const strings = [];

  /* Slug */
  if (entity.slug && typeof entity.slug === "string") {
    strings.push(entity.slug.toLowerCase());
  }

  /* Localized name */
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
 * Variant for flat localized objects like difficulty: { en: "Easy", bn: "সহজ" }
 * that don't have a slug property.
 */
function getMatchableStringsFromLocalized(localized) {
  if (!localized || typeof localized !== "object") {
    return [];
  }

  const strings = [];

  for (const value of Object.values(localized)) {
    if (typeof value === "string" && value.trim()) {
      strings.push(value.toLowerCase());
    }
  }

  return strings;
}

/* -------------------------------------------------------------------------- */
/* String Set Operations                                                      */
/* -------------------------------------------------------------------------- */

function stringsIntersect(a, b) {
  if (a.length === 0 || b.length === 0) {
    return false;
  }

  /* For small arrays (typical: 1-3 strings per entity), a simple
     nested loop is faster than building a Set. */
  for (const sa of a) {
    for (const sb of b) {
      if (sa === sb) {
        return true;
      }
    }
  }

  return false;
}

/* -------------------------------------------------------------------------- */
/* Utility Helpers                                                            */
/* -------------------------------------------------------------------------- */

function getFirstEnglish(localized) {
  if (!localized || typeof localized !== "object") {
    return null;
  }

  if (typeof localized === "string") {
    return localized;
  }

  return localized.en ?? Object.values(localized).find(Boolean) ?? null;
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
