/* -------------------------------------------------------------------------- */
/* Entity Index Builder                                                       */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Builds a lookup index from recipe data for use by the entity-extractor.   */
/* Each collection is a flat string[] containing matchable text values.      */
/*                                                                            */
/* Two types of values are indexed per collection:                           */
/*                                                                            */
/*   1. Slugs  — canonical identifiers (e.g. "ground-beef").  When the       */
/*               extractor returns a slug, the constraint-builder can         */
/*               use it directly as `constraint.slug` for exact matching     */
/*               in recipe-matcher.                                          */
/*                                                                            */
/*   2. Names  — human-readable text (e.g. "ground beef", "গরুর কিমা").     */
/*               These improve text-matching coverage in the extractor's      */
/*               exact/partial/fuzzy tiers.  When a name is returned, the    */
/*               constraint-builder lowercases it as a slug — this may not   */
/*               match the recipe's hyphenated slug, but the searchTerms     */
/*               fallback in the extractor ensures the recipe is still       */
/*               found through the searchTerms scoring path.                 */
/*                                                                            */
/* Architecture note: the ideal solution is a name→slug lookup table that   */
/* the constraint-builder consults.  That requires changes to the            */
/* constraint-builder and will be addressed when that module is updated.     */
/*                                                                            */

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const ENTITY_COLLECTIONS = [
  "ingredients",
  "cuisines",
  "categories",
  "diets",
  "cookingMethods",
  "tags",
  "searchTerms",
];

/* -------------------------------------------------------------------------- */
/* Build Entity Index                                                         */
/* -------------------------------------------------------------------------- */

export function buildEntityIndex(recipes = [], options = {}) {
  const {
    /** When false (default), only ingredients with isMainIngredient === true
        are indexed.  Set true to include seasonings, sauces, etc. */
    includeNonMainIngredients = false,
  } = options;

  const index = createEmptyIndex();

  for (const recipe of recipes) {
    /* Skip unpublished drafts */
    if (recipe.published === false) {
      continue;
    }

    indexIngredients(index, recipe, includeNonMainIngredients);

    indexCuisine(index, recipe);

    indexCategory(index, recipe);

    indexDiets(index, recipe);

    indexTags(index, recipe);

    indexSearchTerms(index, recipe);

    /* cookingMethods — no dedicated field in the current recipe schema.
       Left empty.  Could be populated from instruction analysis or a
       future recipe.cookingMethods field. */
  }

  return finalizeIndex(index);
}

/* -------------------------------------------------------------------------- */
/* Index — Ingredients                                                        */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Source: recipe.ingredientGroups[].items[]                                  */
/* Indexes: slug, name.en, name.bn (if present)                              */
/*                                                                            */

function indexIngredients(index, recipe, includeNonMainIngredients) {
  const groups = recipe.ingredientGroups;

  if (!Array.isArray(groups)) {
    return;
  }

  for (const group of groups) {
    const items = group.items;

    if (!Array.isArray(items)) {
      continue;
    }

    for (const item of items) {
      if (!item) {
        continue;
      }

      /* Filter out non-main ingredients unless explicitly included */
      if (!includeNonMainIngredients && item.isMainIngredient !== true) {
        continue;
      }

      addSlug(index.ingredients, item.slug);

      addLocalizedString(index.ingredients, item.name);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Index — Cuisine                                                            */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Source: recipe.cuisine (single object with slug + localized name)         */
/*                                                                            */

function indexCuisine(index, recipe) {
  const cuisine = recipe.cuisine;

  if (!cuisine || typeof cuisine !== "object") {
    return;
  }

  addSlug(index.cuisines, cuisine.slug);

  addLocalizedString(index.cuisines, cuisine.name);
}

/* -------------------------------------------------------------------------- */
/* Index — Category                                                           */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Source: recipe.category (single object with slug + localized name)        */
/*                                                                            */

function indexCategory(index, recipe) {
  const category = recipe.category;

  if (!category || typeof category !== "object") {
    return;
  }

  addSlug(index.categories, category.slug);

  addLocalizedString(index.categories, category.name);
}

/* -------------------------------------------------------------------------- */
/* Index — Diets                                                              */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Source: recipe.diet (array of objects with slug + localized name)         */
/*                                                                            */

function indexDiets(index, recipe) {
  const diets = recipe.diet;

  if (!Array.isArray(diets)) {
    return;
  }

  for (const diet of diets) {
    if (!diet || typeof diet !== "object") {
      continue;
    }

    addSlug(index.diets, diet.slug);

    addLocalizedString(index.diets, diet.name);
  }
}

/* -------------------------------------------------------------------------- */
/* Index — Tags                                                               */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Source: recipe.tags (array of objects with slug + localized name)         */
/*                                                                            */

function indexTags(index, recipe) {
  const tags = recipe.tags;

  if (!Array.isArray(tags)) {
    return;
  }

  for (const tag of tags) {
    if (!tag || typeof tag !== "object") {
      continue;
    }

    addSlug(index.tags, tag.slug);

    addLocalizedString(index.tags, tag.name);
  }
}

/* -------------------------------------------------------------------------- */
/* Index — Search Terms                                                       */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Source: recipe.searchTerms.en[] and recipe.searchTerms.bn[]               */
/* These are the richest source of matchable text — hand-curated aliases    */
/* and variants that cover synonyms, transliterations, and compound forms.   */
/*                                                                            */

function indexSearchTerms(index, recipe) {
  const terms = recipe.searchTerms;

  if (!terms || typeof terms !== "object") {
    return;
  }

  /* English terms */
  if (Array.isArray(terms.en)) {
    for (const term of terms.en) {
      addNormalized(index.searchTerms, term);
    }
  }

  /* Bangla terms */
  if (Array.isArray(terms.bn)) {
    for (const term of terms.bn) {
      addNormalized(index.searchTerms, term);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Index Writers                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Add a slug value to a collection set.
 * Slugs are lowercased and deduplicated by the set.
 */
function addSlug(collection, slug) {
  if (!slug || typeof slug !== "string") {
    return;
  }

  const normalized = slug.trim().toLowerCase();

  if (normalized) {
    collection.add(normalized);
  }
}

/**
 * Add localized string values from a { en, bn, ... } object.
 * Handles both string and object shapes defensively.
 */
function addLocalizedString(collection, localized) {
  if (!localized) {
    return;
  }

  /* Already a plain string */
  if (typeof localized === "string") {
    addNormalized(collection, localized);
    return;
  }

  /* Object with language keys — extract all non-empty values */
  if (typeof localized === "object") {
    for (const value of Object.values(localized)) {
      if (typeof value === "string" && value.trim()) {
        addNormalized(collection, value);
      }
    }
  }
}

/**
 * Add a single normalized string to a collection set.
 * Handles null, non-string, and empty-string inputs safely.
 */
function addNormalized(collection, value) {
  if (!value || typeof value !== "string") {
    return;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized) {
    collection.add(normalized);
  }
}

/* -------------------------------------------------------------------------- */
/* Create Empty Index                                                         */
/* -------------------------------------------------------------------------- */

function createEmptyIndex() {
  const index = {};

  for (const collection of ENTITY_COLLECTIONS) {
    index[collection] = new Set();
  }

  return index;
}

/* -------------------------------------------------------------------------- */
/* Finalize Index                                                             */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Converts Sets to sorted arrays and attaches build metadata.               */
/*                                                                            */

function finalizeIndex(index) {
  const result = {};
  const stats = {};

  for (const collection of ENTITY_COLLECTIONS) {
    const sorted = [...(index[collection] ?? [])].sort();

    result[collection] = sorted;

    stats[collection] = sorted.length;
  }

  result._metadata = {
    collections: ENTITY_COLLECTIONS,

    totalEntries: Object.values(stats).reduce((sum, n) => sum + n, 0),

    stats,

    hasData: ENTITY_COLLECTIONS.filter((c) => (stats[c] ?? 0) > 0),

    emptyCollections: ENTITY_COLLECTIONS.filter((c) => (stats[c] ?? 0) === 0),
  };

  return result;
}
