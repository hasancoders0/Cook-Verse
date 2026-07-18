import { getAllRecipes, flattenIngredients } from "@/lib/recipes";
import { getLocalizedValue } from "@/lib/language";

/* -------------------------------------------------------------------------- */
/* Score Configuration                                                        */
/* -------------------------------------------------------------------------- */

const SCORE = {
  MAIN_INGREDIENT: 30,
  INGREDIENT: 15,

  CATEGORY: 20,
  CUISINE: 20,
  DIET: 20,
  TAG: 10,

  DIFFICULTY: 10,

  TIME_MATCH: 15,
  SERVING_MATCH: 10,

  FEATURED: 2,
};

/* -------------------------------------------------------------------------- */
/* Minimum Match Score                                                        */
/* -------------------------------------------------------------------------- */

const MINIMUM_MATCH_SCORE = 20;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function hasSlug(collection = [], slug) {
  return collection.some((item) => item.slug === slug);
}

function countMatchingIngredients(recipeIngredients, selectedIngredients) {
  let score = 0;

  const matched = [];
  const missing = [];

  selectedIngredients.forEach((selected) => {
    const found = recipeIngredients.find(
      (ingredient) => ingredient.slug === selected.slug,
    );

    if (!found) {
      missing.push(selected);
      return;
    }

    matched.push(found);

    score += found.isMainIngredient ? SCORE.MAIN_INGREDIENT : SCORE.INGREDIENT;
  });

  return {
    score,
    matched,
    missing,
  };
}

/* -------------------------------------------------------------------------- */
/* Score Recipe                                                               */
/* -------------------------------------------------------------------------- */

export function scoreRecipe(recipe, parsedPrompt) {
  let score = 0;

  const reasons = [];

  const ingredients = flattenIngredients(recipe);

  /* ---------------------------------------------------------------------- */
  /* Ingredients                                                             */
  /* ---------------------------------------------------------------------- */

  const ingredientResult = countMatchingIngredients(
    ingredients,
    parsedPrompt.ingredients,
  );

  score += ingredientResult.score;

  if (ingredientResult.matched.length) {
    reasons.push(
      `${ingredientResult.matched.length} matching ingredient${
        ingredientResult.matched.length > 1 ? "s" : ""
      }`,
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Category                                                                */
  /* ---------------------------------------------------------------------- */

  parsedPrompt.categories.forEach((category) => {
    if (recipe.category.slug === category.slug) {
      score += SCORE.CATEGORY;
      reasons.push(`Category: ${category.name}`);
    }
  });

  /* ---------------------------------------------------------------------- */
  /* Cuisine                                                                 */
  /* ---------------------------------------------------------------------- */

  parsedPrompt.cuisines.forEach((cuisine) => {
    if (recipe.cuisine.slug === cuisine.slug) {
      score += SCORE.CUISINE;
      reasons.push(`Cuisine: ${cuisine.name}`);
    }
  });

  /* ---------------------------------------------------------------------- */
  /* Diet                                                                    */
  /* ---------------------------------------------------------------------- */

  parsedPrompt.diets.forEach((diet) => {
    if (hasSlug(recipe.diet, diet.slug)) {
      score += SCORE.DIET;
      reasons.push(`Diet: ${diet.name}`);
    }
  });

  /* ---------------------------------------------------------------------- */
  /* Tags                                                                    */
  /* ---------------------------------------------------------------------- */

  parsedPrompt.tags.forEach((tag) => {
    if (hasSlug(recipe.tags, tag.slug)) {
      score += SCORE.TAG;
      reasons.push(`Tag: ${tag.name}`);
    }
  });

  /* ---------------------------------------------------------------------- */
  /* Difficulty                                                              */
  /* ---------------------------------------------------------------------- */

  parsedPrompt.difficulties.forEach((difficulty) => {
    const recipeDifficulty = getLocalizedValue(recipe.difficulty, "en");

    if (recipeDifficulty.toLowerCase() === difficulty.slug.toLowerCase()) {
      score += SCORE.DIFFICULTY;

      reasons.push(`Difficulty: ${recipeDifficulty}`);
    }
  });

  /* ---------------------------------------------------------------------- */
  /* Cooking Time                                                            */
  /* ---------------------------------------------------------------------- */

  if (
    parsedPrompt.maxCookTime &&
    recipe.totalTime <= parsedPrompt.maxCookTime
  ) {
    score += SCORE.TIME_MATCH;
    reasons.push(`${recipe.totalTime} minute cooking time`);
  }

  /* ---------------------------------------------------------------------- */
  /* Servings                                                                */
  /* ---------------------------------------------------------------------- */

  if (parsedPrompt.servings && recipe.servings >= parsedPrompt.servings) {
    score += SCORE.SERVING_MATCH;
    reasons.push(`Serves ${recipe.servings} people`);
  }

  /* ---------------------------------------------------------------------- */
  /* Featured Bonus                                                          */
  /* ---------------------------------------------------------------------- */

  if (recipe.featured) {
    score += SCORE.FEATURED;
  }

  return {
    recipe,
    score,
    matchedIngredients: ingredientResult.matched,
    missingIngredients: ingredientResult.missing,
    reasons,
  };
}

/* -------------------------------------------------------------------------- */
/* Score All Recipes                                                          */
/* -------------------------------------------------------------------------- */

export function scoreRecipes(parsedPrompt) {
  return getAllRecipes()
    .map((recipe) => scoreRecipe(recipe, parsedPrompt))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return b.recipe.rating.average - a.recipe.rating.average;
    });
}

/* -------------------------------------------------------------------------- */
/* Best Recipe                                                                */
/* -------------------------------------------------------------------------- */

export function getBestRecipe(parsedPrompt) {
  const recipes = scoreRecipes(parsedPrompt);

  if (!recipes.length) {
    return null;
  }

  const best = recipes[0];

  if (best.score < MINIMUM_MATCH_SCORE) {
    return null;
  }

  return best;
}

/* -------------------------------------------------------------------------- */
/* Top Recipes                                                                */
/* -------------------------------------------------------------------------- */

export function getTopRecipes(
  parsedPrompt,
  limit = 5,
  minimumScore = MINIMUM_MATCH_SCORE,
) {
  return scoreRecipes(parsedPrompt)
    .filter((item) => item.score >= minimumScore)
    .slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/* Has Matches                                                                */
/* -------------------------------------------------------------------------- */

export function hasRecipeMatches(parsedPrompt) {
  return getBestRecipe(parsedPrompt) !== null;
}
