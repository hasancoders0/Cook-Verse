import { AI_CONFIG } from "./config";

import { matchRecipes } from "./recipe-matcher";
import { rankRecipes } from "./recipe-ranker";

/* -------------------------------------------------------------------------- */
/* Recommend Recipes — Public API                                             */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Finds recipes similar to a given recipe by matching on shared            */
/* entities (ingredients, cuisine, category, diets, tags, difficulty).       */
/* The source recipe is always excluded from results.                       */
/*                                                                            */
/* const related = recommendRecipes(recipe, { limit: 6 });                  */
/*                                                                            */

export function recommendRecipes(recipe = null, options = {}) {
  if (!recipe || typeof recipe !== "object") {
    return [];
  }

  /* Pipeline gate */
  if (AI_CONFIG.PIPELINE.RECIPE_MATCHING === false) {
    return [];
  }

  const context = createContext(recipe, options);

  runRecommendationPipeline(context);

  return context.results;
}

/* -------------------------------------------------------------------------- */
/* Context                                                                    */
/* -------------------------------------------------------------------------- */

function createContext(recipe, options) {
  return {
    recipe,

    options: normalizeOptions(options),

    constraints: null,

    matches: [],

    results: [],
  };
}

function normalizeOptions(options) {
  return {
    limit:
      typeof options.limit === "number" && options.limit > 0
        ? options.limit
        : 6,

    /** When true, only consider ingredients for similarity.
        Useful for "recipes using similar ingredients" features. */
    ingredientsOnly: options.ingredientsOnly ?? false,

    /** Minimum number of shared entities required to include a result.
        Recipes sharing fewer than this are filtered out. */
    minSharedEntities: options.minSharedEntities ?? 1,
  };
}

/* -------------------------------------------------------------------------- */
/* Recommendation Pipeline                                                    */
/* -------------------------------------------------------------------------- */

function runRecommendationPipeline(context) {
  buildConstraints(context);

  matchRecommendations(context);

  removeCurrentRecipe(context);

  filterByMinShared(context);

  rankRecommendations(context);
}

/* -------------------------------------------------------------------------- */
/* Build Constraints                                                          */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Constructs a constraint object from the source recipe's entities.         */
/* These constraints are passed directly to the matcher, which scores       */
/* other recipes by how many entities they share with the source.            */
/*                                                                            */
/* Important: NO normalizedPrompt/rawPrompt is set.  This intentionally      */
/* disables the matcher's title and searchTerm scoring — recommendations     */
/* should be based on shared entities, not text overlap.                     */
/*                                                                            */

function buildConstraints(context) {
  const recipe = context.recipe;
  const ingredientsOnly = context.options.ingredientsOnly;

  context.constraints = {
    /* --- Entity constraints (matcher compares these against other recipes) --- */

    ingredients: extractRecipeIngredients(recipe),

    cuisines: extractRecipeCuisine(recipe),

    categories: extractRecipeCategory(recipe),

    diets: extractRecipeDiets(recipe),

    tags: extractRecipeTags(recipe),

    difficulties: extractRecipeDifficulty(recipe),

    /* --- Disable text-based matching --- */

    normalizedPrompt: "",

    rawPrompt: "",

    /* --- No numeric filters (we're finding similar recipes, not
         filtering by time/servings) --- */

    maxCookTime: null,

    servings: null,

    /* --- Metadata for the matcher --- */

    intent: "recommendation",

    mealType: null,

    preferences: [],

    filters: {},

    context: {},
  };

  /* When ingredientsOnly is true, clear non-ingredient constraints
     so the matcher only scores on ingredient overlap. */
  if (ingredientsOnly) {
    context.constraints.cuisines = [];
    context.constraints.categories = [];
    context.constraints.diets = [];
    context.constraints.tags = [];
    context.constraints.difficulties = [];
  }
}

/* -------------------------------------------------------------------------- */
/* Entity Extraction from Recipe                                              */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* These functions extract entities from the recipe JSON and reshape         */
/* them into the format the matcher expects.  The recipe JSON uses          */
/* different field names and structures than what the matcher's              */
/* getMatchableStrings() expects, so we normalise here.                      */
/*                                                                            */

/* --- Ingredients --- */

function extractRecipeIngredients(recipe) {
  /* Recipe JSON uses ingredientGroups, not a flat ingredients array */
  const groups = recipe.ingredientGroups;

  if (!Array.isArray(groups)) {
    return [];
  }

  return groups
    .flatMap((group) => group.items ?? [])
    .filter((item) => item?.isMainIngredient === true)
    .map((item) => ({
      slug: item.slug,
      name: item.name,
    }));
}

/* --- Cuisine --- */

function extractRecipeCuisine(recipe) {
  if (!recipe.cuisine || typeof recipe.cuisine !== "object") {
    return [];
  }

  /* Recipe cuisine is already { slug, name } — matches matcher format */
  return [recipe.cuisine];
}

/* --- Category --- */

function extractRecipeCategory(recipe) {
  if (!recipe.category || typeof recipe.category !== "object") {
    return [];
  }

  return [recipe.category];
}

/* --- Diets --- */

function extractRecipeDiets(recipe) {
  /* Recipe JSON uses "diet" (singular), not "diets" */
  const diets = recipe.diet;

  if (!Array.isArray(diets)) {
    return [];
  }

  return diets
    .filter((d) => d && typeof d === "object")
    .map((d) => ({
      slug: d.slug,
      name: d.name,
    }));
}

/* --- Tags --- */

function extractRecipeTags(recipe) {
  const tags = recipe.tags;

  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .filter((t) => t && typeof t === "object")
    .map((t) => ({
      slug: t.slug,
      name: t.name,
    }));
}

/* --- Difficulty --- */

function extractRecipeDifficulty(recipe) {
  const difficulty = recipe.difficulty;

  if (!difficulty || typeof difficulty !== "object") {
    return [];
  }

  /* Recipe difficulty is { en: "Easy", bn: "সহজ" } (flat localized).
     The matcher's getMatchableStrings() expects { name: { en, bn } }.
     Wrap it to match the constraint-builder's output format. */
  return [
    {
      name: {
        en: difficulty.en ?? "",
        bn: difficulty.bn ?? "",
      },
    },
  ];
}

/* -------------------------------------------------------------------------- */
/* Match Recommendations                                                      */
/* -------------------------------------------------------------------------- */

function matchRecommendations(context) {
  context.matches = matchRecipes(context.constraints);
}

/* -------------------------------------------------------------------------- */
/* Remove Current Recipe                                                      */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* The source recipe will match itself perfectly (all entities shared).      */
/* Remove it so it never appears in its own recommendation list.             */
/*                                                                            */

function removeCurrentRecipe(context) {
  const currentId = context.recipe.id;

  if (!currentId) return;

  context.matches = context.matches.filter(
    (item) => item.recipe?.id !== currentId,
  );
}

/* -------------------------------------------------------------------------- */
/* Filter by Minimum Shared Entities                                          */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Removes results that share fewer entities than the minimum threshold.    */
/* This prevents marginally-related recipes from appearing when the         */
/* source recipe has rich entity data.                                      */
/*                                                                            */

function filterByMinShared(context) {
  const min = context.options.minSharedEntities;

  if (min <= 1) return;

  context.matches = context.matches.filter(
    (item) => (item.metadata?.totalMatches ?? 0) >= min,
  );
}

/* -------------------------------------------------------------------------- */
/* Rank Recommendations                                                       */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Delegates to the shared ranker.  Limit is applied here rather than        */
/* duplicated locally.                                                       */
/*                                                                            */

function rankRecommendations(context) {
  context.results = rankRecipes(context.matches, {
    limit: context.options.limit,
  });
}
