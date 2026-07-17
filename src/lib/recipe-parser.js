import { getSearchData } from "@/lib/recipes";

/* -------------------------------------------------------------------------- */
/* Search Data                                                                 */
/* -------------------------------------------------------------------------- */

const searchData = getSearchData();

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function normalizeText(text = "") {
  return text
    .toLowerCase()
    .replace(/[.,!?()'"-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeWord(word = "") {
  return word.toLowerCase().replace(/s$/, "");
}

function includesPhrase(text, phrase) {
  return text.includes(normalizeText(phrase));
}

function unique(items = []) {
  return [...new Map(items.map((item) => [item.slug, item])).values()];
}

/* -------------------------------------------------------------------------- */
/* Entity Matcher                                                             */
/* -------------------------------------------------------------------------- */

function matchEntities(text, entities = []) {
  const matches = [];

  entities.forEach((entity) => {
    const keywords = [entity.name, entity.slug, ...(entity.searchTerms || [])];

    const found = keywords.some((keyword) => {
      const normalizedKeyword = normalizeText(keyword);

      return (
        includesPhrase(text, normalizedKeyword) ||
        normalizeWord(normalizedKeyword)
          .split(" ")
          .some((word) => text.split(" ").includes(normalizeWord(word)))
      );
    });

    if (found) {
      matches.push(entity);
    }
  });

  return unique(matches);
}

/* -------------------------------------------------------------------------- */
/* Time Extraction                                                            */
/* -------------------------------------------------------------------------- */

function extractTime(text) {
  const patterns = [
    /under\s+(\d+)\s*(minutes|min|mins)/i,
    /less than\s+(\d+)\s*(minutes|min|mins)/i,
    /within\s+(\d+)\s*(minutes|min|mins)/i,
    /(\d+)\s*(minutes|min|mins)/i,
    /(\d+)\s*(hours|hour|hrs|hr)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (!match) continue;

    let value = Number(match[1]);

    if (match[2].includes("hour") || match[2].includes("hr")) {
      value *= 60;
    }

    return value;
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Servings Extraction                                                        */
/* -------------------------------------------------------------------------- */

function extractServings(text) {
  const patterns = [
    /for\s+(\d+)/i,
    /serves?\s+(\d+)/i,
    /(\d+)\s+people/i,
    /family\s+of\s+(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      return Number(match[1]);
    }
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Difficulty                                                                 */
/* -------------------------------------------------------------------------- */

function extractDifficulty(text) {
  const difficulties = searchData.difficulties.map((difficulty) => ({
    name: difficulty,
    slug: difficulty.toLowerCase(),
    searchTerms: [difficulty, `${difficulty} recipe`],
  }));

  return matchEntities(text, difficulties);
}

/* -------------------------------------------------------------------------- */
/* Extractors                                                                 */
/* -------------------------------------------------------------------------- */

function extractIngredients(text) {
  return matchEntities(text, searchData.ingredients);
}

function extractCategories(text) {
  return matchEntities(text, searchData.categories);
}

function extractCuisines(text) {
  return matchEntities(text, searchData.cuisines);
}

function extractDiets(text) {
  return matchEntities(text, searchData.diets);
}

function extractTags(text) {
  return matchEntities(text, searchData.tags);
}

/* -------------------------------------------------------------------------- */
/* Intent Detection                                                           */
/* -------------------------------------------------------------------------- */

function detectIntent(text) {
  const intents = {
    recommend: [
      "recommend",
      "suggest",
      "what should i cook",
      "what can i cook",
      "what to cook",
      "recipe",
      "meal",
      "cook",
      "make",
    ],

    ingredients: [
      "i have",
      "with",
      "using",
      "available",
      "leftover",
      "leftovers",
    ],

    healthy: [
      "healthy",
      "diet",
      "fitness",
      "weight loss",
      "low calorie",
      "protein",
      "nutritious",
    ],

    quick: ["quick", "fast", "easy", "simple", "under", "minute", "minutes"],

    craving: ["craving", "want", "hungry", "feel like"],
  };

  const detected = [];

  Object.entries(intents).forEach(([intent, keywords]) => {
    const found = keywords.some((keyword) => text.includes(keyword));

    if (found) {
      detected.push(intent);
    }
  });

  return detected;
}

/* -------------------------------------------------------------------------- */
/* Main Parser                                                                */
/* -------------------------------------------------------------------------- */

export function parseRecipePrompt(prompt = "") {
  const normalizedPrompt = normalizeText(prompt);

  return {
    originalPrompt: prompt,

    normalizedPrompt,

    ingredients: extractIngredients(normalizedPrompt),

    categories: extractCategories(normalizedPrompt),

    cuisines: extractCuisines(normalizedPrompt),

    diets: extractDiets(normalizedPrompt),

    tags: extractTags(normalizedPrompt),

    difficulties: extractDifficulty(normalizedPrompt),

    intents: detectIntent(normalizedPrompt),

    maxCookTime: extractTime(normalizedPrompt),

    servings: extractServings(normalizedPrompt),
  };
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

export function hasFilters(parsedPrompt) {
  return (
    parsedPrompt.ingredients.length ||
    parsedPrompt.categories.length ||
    parsedPrompt.cuisines.length ||
    parsedPrompt.diets.length ||
    parsedPrompt.tags.length ||
    parsedPrompt.difficulties.length ||
    parsedPrompt.maxCookTime !== null ||
    parsedPrompt.servings !== null
  );
}

export function getMatchedIngredientSlugs(parsedPrompt) {
  return parsedPrompt.ingredients.map((item) => item.slug);
}

export function getMatchedCategorySlugs(parsedPrompt) {
  return parsedPrompt.categories.map((item) => item.slug);
}

export function getMatchedCuisineSlugs(parsedPrompt) {
  return parsedPrompt.cuisines.map((item) => item.slug);
}

export function getMatchedDietSlugs(parsedPrompt) {
  return parsedPrompt.diets.map((item) => item.slug);
}

export function getMatchedTagSlugs(parsedPrompt) {
  return parsedPrompt.tags.map((item) => item.slug);
}
