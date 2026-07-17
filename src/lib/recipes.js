import chickenBiryani from "@/data/recipes/chicken-biryani.json";
import beefBurger from "@/data/recipes/beef-burger.json";
import vegetableSalad from "@/data/recipes/vegetable-salad.json";

/* -------------------------------------------------------------------------- */
/* Recipes                                                                    */
/* -------------------------------------------------------------------------- */

const recipes = [chickenBiryani, beefBurger, vegetableSalad];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function flattenIngredients(recipe) {
  return recipe?.ingredientGroups?.flatMap((group) => group.items || []) || [];
}

function uniqueBy(array = [], key) {
  return Array.from(new Map(array.map((item) => [item[key], item])).values());
}

function normalizeSlug(value = "") {
  return value.toLowerCase().trim();
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

export function getRecipesByDifficulty(difficulty) {
  return getAllRecipes().filter((recipe) => recipe.difficulty === difficulty);
}

export function getRecipesByDiet(dietSlug) {
  return getAllRecipes().filter((recipe) =>
    recipe.diet?.some((diet) => diet.slug === dietSlug),
  );
}
/* -------------------------------------------------------------------------- */
/* Recipe Search                                                              */
/* -------------------------------------------------------------------------- */

export function searchRecipes(keyword = "") {
  const query = keyword.trim().toLowerCase();

  if (!query) {
    return getAllRecipes();
  }

  return getAllRecipes().filter((recipe) => {
    const ingredients = flattenIngredients(recipe);

    return (
      /* Title */
      recipe.title?.toLowerCase().includes(query) ||
      /* Description */
      recipe.description?.toLowerCase().includes(query) ||
      /* Category */
      recipe.category?.name?.toLowerCase().includes(query) ||
      recipe.category?.slug?.toLowerCase().includes(query) ||
      recipe.category?.searchTerms?.some((term) =>
        term.toLowerCase().includes(query),
      ) ||
      /* Cuisine */
      recipe.cuisine?.name?.toLowerCase().includes(query) ||
      recipe.cuisine?.slug?.toLowerCase().includes(query) ||
      recipe.cuisine?.searchTerms?.some((term) =>
        term.toLowerCase().includes(query),
      ) ||
      /* Difficulty */
      recipe.difficulty?.toLowerCase().includes(query) ||
      /* Diet */
      recipe.diet?.some(
        (diet) =>
          diet.name.toLowerCase().includes(query) ||
          diet.slug.toLowerCase().includes(query) ||
          diet.searchTerms?.some((term) => term.toLowerCase().includes(query)),
      ) ||
      /* Tags */
      recipe.tags?.some(
        (tag) =>
          tag.name.toLowerCase().includes(query) ||
          tag.slug.toLowerCase().includes(query) ||
          tag.searchTerms?.some((term) => term.toLowerCase().includes(query)),
      ) ||
      /* Ingredients */
      ingredients.some(
        (ingredient) =>
          ingredient.name.toLowerCase().includes(query) ||
          ingredient.slug.toLowerCase().includes(query) ||
          ingredient.searchTerms?.some((term) =>
            term.toLowerCase().includes(query),
          ),
      )
    );
  });
}

/* -------------------------------------------------------------------------- */
/* Dynamic Filters                                                            */
/* -------------------------------------------------------------------------- */

export function getCategories() {
  return uniqueBy(
    getAllRecipes().map((recipe) => recipe.category),
    "slug",
  ).sort((a, b) => a.name.localeCompare(b.name));
}

export function getCuisines() {
  return uniqueBy(
    getAllRecipes().map((recipe) => recipe.cuisine),
    "slug",
  ).sort((a, b) => a.name.localeCompare(b.name));
}

export function getDifficulties() {
  return [...new Set(getAllRecipes().map((recipe) => recipe.difficulty))];
}

export function getDiets() {
  return uniqueBy(
    getAllRecipes().flatMap((recipe) => recipe.diet || []),
    "slug",
  ).sort((a, b) => a.name.localeCompare(b.name));
}
/* -------------------------------------------------------------------------- */
/* Ingredients                                                                */
/* -------------------------------------------------------------------------- */

export function getIngredients() {
  const ingredients = new Map();

  getAllRecipes().forEach((recipe) => {
    const recipeIngredients = flattenIngredients(recipe);

    recipeIngredients.forEach((ingredient) => {
      if (!ingredient.isMainIngredient) return;

      const slug = ingredient.slug;

      if (ingredients.has(slug)) {
        ingredients.get(slug).count += 1;
      } else {
        ingredients.set(slug, {
          ...ingredient,
          count: 1,
        });
      }
    });
  });

  return [...ingredients.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getIngredientBySlug(slug) {
  return getIngredients().find((ingredient) => ingredient.slug === slug);
}

export function getRecipesByIngredient(slug) {
  return getAllRecipes().filter((recipe) => {
    const ingredients = flattenIngredients(recipe);

    return ingredients.some((ingredient) => ingredient.slug === slug);
  });
}

export function findRecipesByIngredients(ingredientSlugs = []) {
  return getAllRecipes().filter((recipe) => {
    const ingredients = flattenIngredients(recipe);

    const recipeSlugs = ingredients.map((ingredient) => ingredient.slug);

    return ingredientSlugs.every((slug) => recipeSlugs.includes(slug));
  });
}

export function searchIngredients(keyword = "") {
  const query = keyword.trim().toLowerCase();

  const ingredients = getIngredients();

  if (!query) {
    return ingredients;
  }

  return ingredients.filter((ingredient) => {
    return (
      ingredient.name.toLowerCase().includes(query) ||
      ingredient.slug.toLowerCase().includes(query) ||
      ingredient.searchTerms?.some((term) => term.toLowerCase().includes(query))
    );
  });
}
/* -------------------------------------------------------------------------- */
/* AI Helpers                                                                 */
/* -------------------------------------------------------------------------- */

export function findIngredient(keyword = "") {
  const query = keyword.trim().toLowerCase();

  return getIngredients().find(
    (ingredient) =>
      ingredient.name.toLowerCase() === query ||
      ingredient.slug.toLowerCase() === query ||
      ingredient.searchTerms?.some((term) => term.toLowerCase() === query),
  );
}

export function getSearchData() {
  return {
    categories: getCategories(),
    cuisines: getCuisines(),
    diets: getDiets(),
    difficulties: getDifficulties(),
    ingredients: getIngredients(),
    tags: getTags(),
  };
}

/* -------------------------------------------------------------------------- */
/* Ingredient Types                                                           */
/* -------------------------------------------------------------------------- */

export function getIngredientTypes() {
  return [
    ...new Set(
      getIngredients()
        .map((ingredient) => ingredient.type)
        .filter(Boolean),
    ),
  ].sort();
}

export function getIngredientsByType(type) {
  return getIngredients().filter((ingredient) => ingredient.type === type);
}

/* -------------------------------------------------------------------------- */
/* Tags                                                                       */
/* -------------------------------------------------------------------------- */

export function getTags() {
  return uniqueBy(
    getAllRecipes().flatMap((recipe) => recipe.tags || []),
    "slug",
  ).sort((a, b) => a.name.localeCompare(b.name));
}

export function getRecipesByTag(tagSlug) {
  return getAllRecipes().filter((recipe) =>
    recipe.tags?.some((tag) => tag.slug === tagSlug),
  );
}

/* -------------------------------------------------------------------------- */
/* Nutrition                                                                  */
/* -------------------------------------------------------------------------- */

export function getCaloriesRange() {
  const calories = getAllRecipes()
    .map((recipe) => recipe.nutrition?.calories)
    .filter((value) => typeof value === "number");

  if (!calories.length) {
    return {
      min: 0,
      max: 0,
    };
  }

  return {
    min: Math.min(...calories),
    max: Math.max(...calories),
  };
}

/* -------------------------------------------------------------------------- */
/* Export Helpers                                                             */
/* -------------------------------------------------------------------------- */

export { flattenIngredients };
