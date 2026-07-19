import recipes from "@/data/recipes";

import { getLocalizedValue } from "@/lib/language";


/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function normalizeText(value = "") {
  return String(value).toLowerCase().trim();
}

function normalizeSlug(value = "") {
  return normalizeText(value);
}

export function flattenIngredients(recipe) {
  return recipe?.ingredientGroups?.flatMap((group) => group.items || []) || [];
}

function uniqueBy(array = [], key) {
  return Array.from(new Map(array.map((item) => [item[key], item])).values());
}

/* -------------------------------------------------------------------------- */
/* Localization                                                               */
/* -------------------------------------------------------------------------- */

function t(value, language = "en") {
  return getLocalizedValue(value, language);
}

function localizedText(value, language = "en") {
  return normalizeText(t(value, language));
}

function localizedSearchTerms(searchTerms = {}, language = "en") {
  const localized = Array.isArray(searchTerms?.[language])
    ? searchTerms[language]
    : [];

  const english = Array.isArray(searchTerms?.en) ? searchTerms.en : [];

  return [...new Set([...localized, ...english])];
}

/* -------------------------------------------------------------------------- */
/* Recipes                                                                    */
/* -------------------------------------------------------------------------- */

export function getAllRecipes() {
  return recipes.filter((recipe) => recipe?.published !== false);
}

export function getFeaturedRecipes() {
  return getAllRecipes().filter((recipe) => recipe.featured);
}

export function getRecipeBySlug(slug) {
  if (!slug) return null;

  const normalizedSlug = normalizeSlug(slug);

  return getAllRecipes().find(
    (recipe) => normalizeSlug(recipe.slug) === normalizedSlug,
  );
}

export function getRelatedRecipes(recipe, limit = 3) {
  if (!recipe) return [];

  return getAllRecipes()
    .filter(
      (item) =>
        item.id !== recipe.id && item.category?.slug === recipe.category?.slug,
    )
    .slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/* Recipe Filters                                                             */
/* -------------------------------------------------------------------------- */

export function getRecipesByCategory(categorySlug) {
  return getAllRecipes().filter(
    (recipe) => recipe.category?.slug === categorySlug,
  );
}

export function getRecipesByCuisine(cuisineSlug) {
  return getAllRecipes().filter(
    (recipe) => recipe.cuisine?.slug === cuisineSlug,
  );
}

export function getRecipesByDifficulty(difficulty, language = "en") {
  return getAllRecipes().filter(
    (recipe) =>
      normalizeText(t(recipe.difficulty, language)) ===
      normalizeText(difficulty),
  );
}

export function getRecipesByDiet(dietSlug) {
  return getAllRecipes().filter((recipe) =>
    recipe.diet?.some((diet) => diet.slug === dietSlug),
  );
}

export function getRecipesByTag(tagSlug) {
  return getAllRecipes().filter((recipe) =>
    recipe.tags?.some((tag) => tag.slug === tagSlug),
  );
}

/* -------------------------------------------------------------------------- */
/* Search                                                                     */
/* -------------------------------------------------------------------------- */

export function searchRecipes(keyword = "", language = "en") {
  const query = normalizeText(keyword);

  if (!query) {
    return getAllRecipes();
  }

  return getAllRecipes().filter((recipe) => {
    const ingredients = flattenIngredients(recipe);

    return (
      localizedText(recipe.title, language).includes(query) ||
      localizedText(recipe.description, language).includes(query) ||
      localizedSearchTerms(recipe.searchTerms, language).some((term) =>
        normalizeText(term).includes(query),
      ) ||
      localizedText(recipe.category?.name).includes(query) ||
      normalizeText(recipe.category?.slug).includes(query) ||
      localizedText(recipe.cuisine?.name).includes(query) ||
      normalizeText(recipe.cuisine?.slug).includes(query) ||
      localizedText(recipe.difficulty).includes(query) ||
      recipe.diet?.some(
        (diet) =>
          localizedText(diet.name).includes(query) ||
          normalizeText(diet.slug).includes(query),
      ) ||
      recipe.tags?.some(
        (tag) =>
          localizedText(tag.name).includes(query) ||
          normalizeText(tag.slug).includes(query),
      ) ||
      recipe.ingredientGroups?.some((group) =>
        localizedText(group.title).includes(query),
      ) ||
      ingredients.some(
        (ingredient) =>
          localizedText(ingredient.name).includes(query) ||
          normalizeText(ingredient.slug).includes(query) ||
          localizedText(ingredient.note).includes(query),
      )
    );
  });
}

/* -------------------------------------------------------------------------- */
/* Categories                                                                 */
/* -------------------------------------------------------------------------- */

export function getCategories(language = "en") {
  return uniqueBy(
    getAllRecipes().map((recipe) => recipe.category),
    "slug",
  ).sort((a, b) =>
    localizedText(a.name, language).localeCompare(
      localizedText(b.name, language),
    ),
  );
}

export function getCategoryBySlug(slug) {
  return getCategories().find((category) => category.slug === slug);
}

/* -------------------------------------------------------------------------- */
/* Cuisines                                                                   */
/* -------------------------------------------------------------------------- */

export function getCuisines(language = "en") {
  return uniqueBy(
    getAllRecipes().map((recipe) => recipe.cuisine),
    "slug",
  ).sort((a, b) =>
    localizedText(a.name, language).localeCompare(
      localizedText(b.name, language),
    ),
  );
}

export function getCuisineBySlug(slug) {
  return getCuisines().find((cuisine) => cuisine.slug === slug);
}
/* -------------------------------------------------------------------------- */
/* Difficulties                                                               */
/* -------------------------------------------------------------------------- */

export function getDifficulties(language = "en") {
  return [
    ...new Set(getAllRecipes().map((recipe) => t(recipe.difficulty, language))),
  ].sort((a, b) => a.localeCompare(b));
}

/* -------------------------------------------------------------------------- */
/* Diets                                                                      */
/* -------------------------------------------------------------------------- */

export function getDiets(language = "en") {
  return uniqueBy(
    getAllRecipes().flatMap((recipe) => recipe.diet || []),
    "slug",
  ).sort((a, b) =>
    localizedText(a.name, language).localeCompare(
      localizedText(b.name, language),
    ),
  );
}

export function getDietBySlug(slug) {
  return getDiets().find((diet) => diet.slug === slug);
}

/* -------------------------------------------------------------------------- */
/* Ingredients                                                                */
/* -------------------------------------------------------------------------- */

export function getIngredients(language = "en") {
  return uniqueBy(
    getAllRecipes().flatMap((recipe) =>
      flattenIngredients(recipe).filter(
        (ingredient) => ingredient.isMainIngredient === true,
      ),
    ),
    "slug",
  ).sort((a, b) =>
    localizedText(a.name, language).localeCompare(
      localizedText(b.name, language),
    ),
  );
}

export function getIngredientBySlug(slug) {
  return getIngredients().find((ingredient) => ingredient.slug === slug);
}

/* -------------------------------------------------------------------------- */
/* Tags                                                                       */
/* -------------------------------------------------------------------------- */

export function getTags(language = "en") {
  return uniqueBy(
    getAllRecipes().flatMap((recipe) => recipe.tags || []),
    "slug",
  ).sort((a, b) =>
    localizedText(a.name, language).localeCompare(
      localizedText(b.name, language),
    ),
  );
}

export function getTagBySlug(slug) {
  return getTags().find((tag) => tag.slug === slug);
}

/* -------------------------------------------------------------------------- */
/* Search Data                                                                */
/* -------------------------------------------------------------------------- */

export function getSearchData(language = "en") {
  return {
    ingredients: getIngredients(language),

    categories: getCategories(language),

    cuisines: getCuisines(language),

    diets: getDiets(language),

    tags: getTags(language),

    difficulties: getDifficulties(language).map((difficulty) => ({
      slug: normalizeText(difficulty),
      name: {
        en: difficulty,
        bn: difficulty,
      },
      searchTerms: {
        en: [difficulty],
        bn: [difficulty],
      },
    })),
  };
}

/* -------------------------------------------------------------------------- */
/* Statistics                                                                 */
/* -------------------------------------------------------------------------- */

export function getRecipesByIngredient(slug) {
  return getAllRecipes().filter((recipe) =>
    recipe.ingredientGroups?.some((group) =>
      group.items?.some(
        (ingredient) =>
          ingredient.isMainIngredient === true && ingredient.slug === slug,
      ),
    ),
  );
}

export function getRecipeStats() {
  const allRecipes = getAllRecipes();

  return {
    recipes: allRecipes.length,
    categories: getCategories().length,
    cuisines: getCuisines().length,
    ingredients: getIngredients().length,
    diets: getDiets().length,
    tags: getTags().length,
    featured: getFeaturedRecipes().length,
  };
}
