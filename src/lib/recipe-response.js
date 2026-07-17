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

function ingredientNames(ingredients = []) {
  return ingredients.map((item) => item.name);
}

function reasonSentence(reasons = []) {
  if (!reasons.length) return "";

  return formatList(reasons);
}

/* -------------------------------------------------------------------------- */
/* Recommendation                                                             */
/* -------------------------------------------------------------------------- */

export function buildRecommendation(result) {
  if (!result) return null;

  const {
    recipe,
    reasons = [],
    matchedIngredients = [],
    missingIngredients = [],
  } = result;

  return {
    title: `I recommend ${recipe.title}.`,

    summary:
      reasons.length > 0
        ? `This recipe is a great match because it matches ${reasonSentence(
            reasons,
          )}.`
        : recipe.description,

    recipe,

    matchedIngredients: ingredientNames(matchedIngredients),

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

export function buildCookingSummary(recipe) {
  if (!recipe) return null;

  return {
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    totalTime: recipe.totalTime,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    calories: recipe.nutrition?.calories ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/* Complete Response                                                          */
/* -------------------------------------------------------------------------- */

export function buildResponse(bestResult, topResults = []) {
  if (!bestResult) {
    return buildNoMatchResponse();
  }

  const recommendation = buildRecommendation(bestResult);

  return {
    /* ---------- Existing UI ---------- */

    recipe: bestResult.recipe,

    score: bestResult.score,

    matchedIngredients: bestResult.matchedIngredients,

    missingIngredients: bestResult.missingIngredients,

    recommendations: buildTopRecommendations(topResults),

    /* ---------- AI Response ---------- */

    recommendation,

    cooking: buildCookingSummary(bestResult.recipe),

    message: recommendation.summary,
  };
}
