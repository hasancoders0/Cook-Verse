import recipes from "@/data/recipes";


/* -------------------------------------------------------------------------- */
/* Search Index Cache                                                         */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* The index is built once and cached for the process lifetime.             */
/* Cache is invalidated when:                                                 */
/*   - A different data source is provided                                   */
/*   - Build options change                                                  */
/*   - invalidateSearchIndex() is called explicitly                          */
/*                                                                            */

let cachedIndex = null;

let cachedSource = null;

let cachedOptionsKey = null;

/* -------------------------------------------------------------------------- */
/* Get Search Index — Public API                                              */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Builds and caches a search index from recipe data.  Each recipe is       */
/* mapped to a { recipe, searchable } pair where `searchable` is a          */
/* flattened view optimized for the matcher's comparison functions.         */
/*                                                                            */

export function getSearchIndex(options = {}) {
  const source = resolveSource(options);

  const optionsKey = buildOptionsKey(options);

  /* Return cached if source reference and options haven't changed */
  if (
    cachedIndex &&
    cachedSource === source &&
    cachedOptionsKey === optionsKey
  ) {
    return cachedIndex;
  }

  cachedIndex = buildSearchIndex(source, options);

  cachedSource = source;

  cachedOptionsKey = optionsKey;

  return cachedIndex;
}

/* -------------------------------------------------------------------------- */
/* Invalidate Cache — Public API                                              */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Forces a full rebuild on the next getSearchIndex() call.                 */
/* Call after recipe data is mutated (create, update, delete).              */
/*                                                                            */

export function invalidateSearchIndex() {
  cachedIndex = null;

  cachedSource = null;

  cachedOptionsKey = null;
}

/* -------------------------------------------------------------------------- */
/* Resolve Data Source                                                        */
/* -------------------------------------------------------------------------- */

function resolveSource(options) {
  if (Array.isArray(options.recipes)) {
    return options.recipes;
  }

  return recipes;
}

/* -------------------------------------------------------------------------- */
/* Build Search Index                                                         */
/* -------------------------------------------------------------------------- */

function buildSearchIndex(recipeData, options = {}) {
  const mainOnly = options.mainIngredientsOnly ?? false;

  const index = [];

  let skippedUnpublished = 0;

  for (const recipe of recipeData) {
    if (recipe.published === false) {
      skippedUnpublished++;
      continue;
    }

    index.push(buildRecipeIndex(recipe, mainOnly));
  }

  /* Attach index metadata for debugging and monitoring */
  index._metadata = {
    totalIndexed: index.length,

    sourceCount: recipeData.length,

    skippedUnpublished,

    builtAt: new Date().toISOString(),

    mainIngredientsOnly: mainOnly,
  };

  return index;
}

/* -------------------------------------------------------------------------- */
/* Build Recipe Index Entry                                                   */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Creates a { recipe, searchable } pair.  The `searchable` object is a     */
/* flattened view of the recipe optimized for the matcher's comparison       */
/* functions.                                                                */
/*                                                                            */
/* Field mapping from recipe JSON → searchable:                              */
/*                                                                            */
/*   recipe.title              → searchable.title      (string[])          */
/*   recipe.searchTerms        → searchable.searchTerms (string[])          */
/*   recipe.ingredientGroups   → searchable.ingredients (object[])        */
/*   recipe.category            → searchable.category    (object)           */
/*   recipe.cuisine             → searchable.cuisine     (object)           */
/*   recipe.diet                → searchable.diets       (object[]) [ren]   */
/*   recipe.tags                → searchable.tags         (object[])        */
/*   recipe.difficulty          → searchable.difficulty   (localized obj)   */
/*   recipe.cookTime            → searchable.cookTime     (number)          */
/*   recipe.totalTime           → searchable.totalTime    (number)          */
/*   recipe.servings            → searchable.servings     (number)          */
/*   recipe.featured            → searchable.featured     (boolean)         */
/*   recipe.rating               → searchable.rating      (object)          */
/*                                                                            */

function buildRecipeIndex(recipe, mainOnly) {
  return {
    recipe,

    searchable: {
      /* --- Text fields (string arrays for phrase matching) --- */

      title: collectTitle(recipe),

      searchTerms: collectSearchTerms(recipe),

      /* --- Entity fields (object arrays with slug + name) --- */

      ingredients: collectIngredients(recipe, mainOnly),

      category: recipe.category ?? null,

      cuisine: recipe.cuisine ?? null,

      /* Recipe JSON uses "diet" (singular).  Renamed to "diets" (plural)
         for consistency with the matcher's naming convention:
         `searchable.diets` is read by matchDiet(). */
      diets: recipe.diet ?? [],

      tags: recipe.tags ?? [],

      /* --- Localized field --- */

      difficulty: recipe.difficulty ?? null,

      /* --- Numeric fields --- */

      cookTime: recipe.cookTime ?? 0,

      totalTime: recipe.totalTime ?? 0,

      servings: recipe.servings ?? 0,

      /* --- Metadata fields --- */
      /* Used by the ranker for tiebreaking and by the matcher for        */
      /* bonus/penalty scoring.                                            */

      featured: recipe.featured ?? false,

      rating: recipe.rating ?? null,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Collectors                                                                 */
/* -------------------------------------------------------------------------- */

function collectTitle(recipe) {
  return [recipe.title?.en, recipe.title?.bn].filter(Boolean);
}

function collectSearchTerms(recipe) {
  return [...(recipe.searchTerms?.en ?? []), ...(recipe.searchTerms?.bn ?? [])];
}

function collectIngredients(recipe, mainOnly) {
  const groups = recipe.ingredientGroups;

  if (!Array.isArray(groups)) {
    return [];
  }

  return groups.flatMap((group) => {
    const items = group.items ?? [];

    if (mainOnly) {
      return items.filter((item) => item?.isMainIngredient === true);
    }

    return items;
  });
}

/* -------------------------------------------------------------------------- */
/* Options Key                                                                */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Builds a string key from build-affecting options (excluding the data     */
/* source, which is compared by reference).  Used alongside the source     */
/* reference to determine if the cache is still valid.                      */
/*                                                                            */

function buildOptionsKey(options = {}) {
  const parts = [options.mainIngredientsOnly ? "main_only" : "all_ingredients"];

  return parts.join(":");
}
