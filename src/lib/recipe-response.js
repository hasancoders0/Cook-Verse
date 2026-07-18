import { getLocalizedValue } from "@/lib/language";
/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatList(items = []) {
  if (!items.length) return "";

  if (items.length === 1) return items[0];

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function ingredientNames(ingredients = [], language = "en") {
  return ingredients.map((item) => getLocalizedValue(item.name, language));
}

function reasonSentence(reasons = []) {
  if (!reasons.length) return "";

  return formatList(reasons);
}

/* -------------------------------------------------------------------------- */
/* Recommendation                                                             */
/* -------------------------------------------------------------------------- */

export function buildRecommendation(result, language = "en") {
  if (!result) return null;

  const {
    recipe,
    reasons = [],
    matchedIngredients = [],
    missingIngredients = [],
  } = result;

  return {
    title: `I recommend ${getLocalizedValue(recipe.title, language)}.`,

    summary:
      reasons.length > 0
        ? `This recipe is a great match because it matches ${reasonSentence(
            reasons,
          )}.`
        : getLocalizedValue(recipe.description, language),

    recipe,

    matchedIngredients: ingredientNames(matchedIngredients, language),

    missingIngredients: ingredientNames(missingIngredients),
  };
}

/* -------------------------------------------------------------------------- */
/* No Match                                                                   */
/* -------------------------------------------------------------------------- */

export function buildNoMatchResponse() {
  return {
    success: false,

    recipe: null,

    score: 0,

    matchedIngredients: [],

    missingIngredients: [],

    recommendations: [],

    recommendation: null,

    cooking: null,

    message:
      "I couldn't find an exact recipe match. Try adding more ingredients or changing your filters.",
  };
}

/* -------------------------------------------------------------------------- */
/* Alternative Recipes                                                        */
/* -------------------------------------------------------------------------- */

export function buildTopRecommendations(results = []) {
  return results.slice(1).map((item) => item.recipe);
}

/* -------------------------------------------------------------------------- */
/* Cooking Summary                                                            */
/* -------------------------------------------------------------------------- */

export function buildCookingSummary(recipe, language = "en") {
  if (!recipe) return null;

  return {
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    totalTime: recipe.totalTime,
    servings: recipe.servings,
    difficulty: getLocalizedValue(recipe.difficulty, language),
    calories: recipe.nutrition?.calories ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/* Complete Response                                                          */
/* -------------------------------------------------------------------------- */

export function buildResponse(bestResult, topResults = [], language = "en") {
  if (!bestResult) {
    return buildNoMatchResponse();
  }

  const recommendation = buildRecommendation(bestResult, language);

  return {
    /* ---------- Existing UI ---------- */

    recipe: bestResult.recipe,

    score: bestResult.score,

    matchedIngredients: bestResult.matchedIngredients,

    missingIngredients: bestResult.missingIngredients,

    recommendations: buildTopRecommendations(topResults),

    /* ---------- AI Response ---------- */

    recommendation,

    cooking: buildCookingSummary(bestResult.recipe, language),

    message: recommendation.summary,
  };
}
