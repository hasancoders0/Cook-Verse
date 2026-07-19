import { AI_CONFIG } from "./config";

/* -------------------------------------------------------------------------- */
/* Build Recipe Response — Public API                                         */
/* -------------------------------------------------------------------------- */

export function buildRecipeResponse({
  query = "",
  language = "en",
  results = [],
  constraints = {},
  metadata = {},
} = {}) {
  const safeResults = Array.isArray(results) ? results : [];
  const hasResults = safeResults.length > 0;

  if (!hasResults) {
    return buildEmptyResponse({ query, language, constraints, metadata });
  }

  return buildSuccessResponse({
    query,
    language,
    results: safeResults,
    constraints,
    metadata,
  });
}

/* -------------------------------------------------------------------------- */
/* Success Response                                                           */
/* -------------------------------------------------------------------------- */

function buildSuccessResponse({
  query,
  language,
  results,
  constraints,
  metadata,
}) {
  const response = {
    success: true,
    query,
    language,
    assistant: buildAssistant({
      success: true,
      language,
      results,
      constraints,
    }),
    search: buildSearch({ query, language, constraints, results }),
    recipes: formatRecipes(results),
    metadata: {},
  };

  if (AI_CONFIG.RESPONSE.SHOW_SUGGESTIONS !== false) {
    response.suggestions = buildSuggestions({
      success: true,
      language,
      results,
      constraints,
    });
  }

  response.metadata = buildMetadata({
    success: true,
    results,
    constraints,
    metadata,
  });

  return response;
}

/* -------------------------------------------------------------------------- */
/* Empty Response                                                             */
/* -------------------------------------------------------------------------- */

function buildEmptyResponse({ query, language, constraints, metadata }) {
  const response = {
    success: false,
    query,
    language,
    assistant: buildAssistant({ success: false, language, constraints }),
    search: buildSearch({ query, language, constraints, results: [] }),
    recipes: [],
    metadata: {},
  };

  if (AI_CONFIG.RESPONSE.SHOW_SUGGESTIONS !== false) {
    response.suggestions = buildSuggestions({
      success: false,
      language,
      results: [],
      constraints,
    });
  }

  response.metadata = buildMetadata({
    success: false,
    results: [],
    constraints,
    metadata,
  });

  return response;
}

/* -------------------------------------------------------------------------- */
/* Assistant Section                                                          */
/* -------------------------------------------------------------------------- */

function buildAssistant({ success, language, results = [], constraints = {} }) {
  const section = {
    role: "recipe-assistant",
    tone: "friendly",
    greeting: getGreeting(language),
    message: buildMainMessage({ success, language, results, constraints }),
  };

  if (AI_CONFIG.RESPONSE.SHOW_EXPLANATION !== false) {
    section.explanation = buildExplanation({
      success,
      language,
      results,
      constraints,
    });
  }

  if (AI_CONFIG.RESPONSE.SHOW_RECOMMENDATION !== false) {
    section.recommendation = buildRecommendation({
      success,
      language,
      results,
    });
  }

  if (AI_CONFIG.RESPONSE.SHOW_FOLLOW_UP !== false) {
    section.followUp = buildFollowUp({ success, language, constraints });
  }

  return section;
}

/* -------------------------------------------------------------------------- */
/* Greeting                                                                   */
/* -------------------------------------------------------------------------- */

function getGreeting(language) {
  const greetings = {
    en: "Hi! I'm your Recipe Assistant.",
    bn: "হ্যালো! আমি আপনার রেসিপি সহকারী।",
  };

  return greetings[language] ?? greetings.en;
}

/* -------------------------------------------------------------------------- */
/* Main Message                                                               */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Assembles a contextual message from:                                       */
/*   1. Result count + confidence tone                                        */
/*   2. Negation acknowledgements                                             */
/*   3. Contextual notes (meal type, detected entities)                       */
/*                                                                            */

function buildMainMessage({ success, language, results, constraints }) {
  if (!success) {
    return buildEmptyMainMessage(language, constraints);
  }

  const parts = [];

  /* Part 1: Result count with confidence-appropriate tone */
  parts.push(buildResultCountMessage(language, results));

  /* Part 2: Negation acknowledgement */
  const negationNote = buildNegationNote(language, constraints);
  if (negationNote) {
    parts.push(negationNote);
  }

  /* Part 3: Contextual note (meal type, entities) */
  const contextNote = buildContextNote(language, constraints);
  if (contextNote) {
    parts.push(contextNote);
  }

  return parts.join(" ");
}

function buildResultCountMessage(language, results) {
  const total = results.length;
  const topScore = results[0]?.score ?? 0;
  const maxScore = getMaximumPossibleScore();
  const ratio = maxScore > 0 ? topScore / maxScore : 0;

  /* High confidence: top result scored > 60% of max possible */
  if (ratio > 0.6) {
    return language === "bn"
      ? `আমি আপনার জন্য ${total}টি চমৎকার রেসিপি খুঁজে পেয়েছি।`
      : total === 1
        ? "I found the perfect recipe for you."
        : `I found ${total} great recipes for you.`;
  }

  /* Medium confidence */
  if (ratio > 0.3) {
    return language === "bn"
      ? `আপনার অনুরোধের সাথে মিল রেখে ${total}টি রেসিপি পেয়েছি।`
      : `I found ${total} recipe${total > 1 ? "s" : ""} that may match what you're looking for.`;
  }

  /* Low confidence */
  return language === "bn"
    ? `আপনার অনুরোধের সাথে আংশিক মিল রেখে ${total}টি রেসিপি পেয়েছি।`
    : `I found ${total} recipe${total > 1 ? "s" : ""} that partially match your request.`;
}

function buildNegationNote(language, constraints) {
  const negated = getNegatedPreferences(constraints);

  if (negated.length === 0) return null;

  const names = negated.map((p) => localizePreferenceName(p.name, language));

  if (language === "bn") {
    return `আমি লক্ষ্য করেছি আপনি ${joinWithComma(names, language)} এড়িয়ে চলতে চান।`;
  }

  return `I noted you'd like to avoid ${joinWithComma(names, language)}.`;
}

function buildContextNote(language, constraints) {
  const parts = [];

  /* Meal type */
  if (constraints.mealType) {
    const mealLabel = getMealTypeLabel(constraints.mealType, language);
    if (mealLabel) {
      parts.push(
        language === "bn"
          ? `এগুলো ${mealLabel} জন্য দারুণ।`
          : `These are great for ${mealLabel}.`,
      );
    }
  }

  /* Detected entities summary (brief) */
  const entityNames = getDetectedEntityLabels(constraints, language);
  if (entityNames.length > 0 && entityNames.length <= 3) {
    if (language === "bn") {
      parts.push(
        `আপনার উল্লেখিত ${joinWithComma(entityNames, language)} বিবেচনায় নেওয়া হয়েছে।`,
      );
    } else {
      parts.push(
        `I considered ${joinWithComma(entityNames, language)} from your request.`,
      );
    }
  }

  return parts.length > 0 ? parts.join(" ") : null;
}

function buildEmptyMainMessage(language, constraints) {
  const intent = constraints.intent;

  /* Greeting — friendly redirect to recipe search */
  if (intent === "greeting") {
    return language === "bn"
      ? "হ্যালো! আমি আপনার রেসিপি সহকারী। উপকরণ, খাবারের নাম বা রান্নার ধরন বলুন — আমি আপনার জন্য রেসিপি খুঁজে বের করব!"
      : "Hello! I'm your Recipe Assistant. Tell me what you'd like to cook — I can search by ingredients, dish names, or cuisines!";
  }

  /* Knowledge question — helpful guidance */
  if (intent === "knowledge") {
    return language === "bn"
      ? "আমি রেসিপি খুঁজে বের করতে সাহায্য করতে পারি। চেষ্টা করুন: 'চিকেন দিয়ে রেসিপি' বা 'দ্রুত লাঞ্চ'।"
      : "I can help you find recipes! Try something like 'recipes with chicken' or 'quick lunch ideas'.";
  }

  /* Has detected entities — specific not-found message */
  const detected = getDetectedEntityLabels(constraints, language);

  if (detected.length > 0) {
    return language === "bn"
      ? `দুঃখিত, আপনার উল্লেখিত ${joinWithComma(detected, language)} দিয়ে কোনো রেসিপি মেলেনি।`
      : `Sorry, I couldn't find any recipes matching ${joinWithComma(detected, language)}.`;
  }

  return language === "bn"
    ? "দুঃখিত, আপনার অনুরোধ অনুযায়ী কোনো রেসিপি খুঁজে পাইনি।"
    : "Sorry, I couldn't find any recipes matching your request.";
}
/* -------------------------------------------------------------------------- */
/* Explanation                                                                */
/* -------------------------------------------------------------------------- */

function buildExplanation({ success, language, results, constraints }) {
  if (!success) {
    return language === "bn"
      ? "অন্য উপকরণ, ক্যাটাগরি অথবা কীওয়ার্ড ব্যবহার করে আবার চেষ্টা করুন।"
      : "Try using different ingredients, categories, or keywords.";
  }

  const totalMatches = results[0]?.metadata?.totalMatches ?? 0;
  const matchedFields = results[0]?.metadata?.matchedFields ?? 0;

  if (totalMatches === 0 && matchedFields === 0) {
    return language === "bn"
      ? "ফলাফলগুলো আপনার অনুরোধের সাথে মিল অনুযায়ী সাজানো হয়েছে।"
      : "The recipes are ranked by how well they match your request.";
  }

  if (language === "bn") {
    return `শীর্ষ রেসিপিটিতে ${totalMatches}টি মিল পাওয়া গেছে ${matchedFields}টি ক্যাটাগরিতে।`;
  }

  return `The top recipe matched across ${matchedFields} categor${matchedFields === 1 ? "y" : "ies"} with ${totalMatches} individual match${totalMatches === 1 ? "" : "es"}.`;
}

/* -------------------------------------------------------------------------- */
/* Recommendation                                                             */
/* -------------------------------------------------------------------------- */

function buildRecommendation({ success, language, results }) {
  if (!success || !results.length) return null;

  const bestRecipe = results[0]?.recipe;
  if (!bestRecipe) return null;

  const title = getLocalizedValue(bestRecipe.title, language);

  if (language === "bn") {
    return `আমি প্রথমে "${title}" রেসিপিটি চেষ্টা করার পরামর্শ দিচ্ছি।`;
  }

  return `I recommend trying "${title}" first.`;
}

/* -------------------------------------------------------------------------- */
/* Follow Up                                                                  */
/* -------------------------------------------------------------------------- */

function buildFollowUp({ success, language, constraints }) {
  if (!success) {
    return language === "bn"
      ? "আপনি চাইলে অন্য কোনো উপকরণ বা খাবারের নাম দিয়ে আবার অনুসন্ধান করতে পারেন।"
      : "You can try searching again with different ingredients or dish names.";
  }

  /* Contextual follow-up based on what was detected */
  const hasQuick = hasPreference(constraints, "quick");
  const hasHealthy = hasPreference(constraints, "healthy", false);
  const hasCuisine = (constraints.cuisines?.length ?? 0) > 0;

  if (hasQuick && !hasHealthy) {
    return language === "bn"
      ? "আপনি কি স্বাস্থ্যকর বিকল্পও দেখতে চান?"
      : "Would you like to see healthier options too?";
  }

  if (hasHealthy && !hasQuick) {
    return language === "bn"
      ? "আপনি কি আরও দ্রুত রান্নার রেসিপি দেখতে চান?"
      : "Would you like quicker recipe options?";
  }

  if (hasCuisine) {
    return language === "bn"
      ? "আপনি কি অন্য দেশের খাবারও দেখতে চান?"
      : "Would you like to try recipes from a different cuisine?";
  }

  return language === "bn"
    ? "আপনি কি আরও দ্রুত, স্বাস্থ্যকর বা মশলাদার রেসিপি দেখতে চান?"
    : "Would you like quicker, healthier, or spicier recipe suggestions?";
}

/* -------------------------------------------------------------------------- */
/* Search Section                                                             */
/* -------------------------------------------------------------------------- */

function buildSearch({ query, language, constraints = {}, results = [] }) {
  return {
    query,
    language,
    totalResults: results.length,
    intent: resolveIntent(constraints),
    entities: extractSearchEntities(constraints),
    filters: extractSearchFilters(constraints),
  };
}

/* -------------------------------------------------------------------------- */
/* Intent Resolution                                                          */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Uses the parser's intent when available and specific.  Falls back to      */
/* constraint-based heuristic for the generic "recipe_search" intent.        */
/*                                                                            */

function resolveIntent(constraints) {
  /* Use the parser's intent if it's more specific than generic search */
  const parsedIntent = constraints.intent;

  if (parsedIntent && parsedIntent !== "recipe_search") {
    return parsedIntent;
  }

  /* Heuristic fallback: infer from what constraints are populated */
  if (constraints.categories?.length) return "category";
  if (constraints.ingredients?.length) return "ingredient";
  if (constraints.cuisines?.length) return "cuisine";
  if (constraints.diets?.length) return "diet";
  if (constraints.tags?.length) return "tag";

  return "recipe_search";
}

/* -------------------------------------------------------------------------- */
/* Search Entities                                                            */
/* -------------------------------------------------------------------------- */

function extractSearchEntities(constraints = {}) {
  return {
    ingredients: mapToSlugs(constraints.ingredients),
    categories: mapToSlugs(constraints.categories),
    cuisines: mapToSlugs(constraints.cuisines),
    diets: mapToSlugs(constraints.diets),
    tags: mapToSlugs(constraints.tags),
    difficulties: mapToNames(constraints.difficulties),
  };
}

/* -------------------------------------------------------------------------- */
/* Search Filters                                                             */
/* -------------------------------------------------------------------------- */

function extractSearchFilters(constraints = {}) {
  const filters = constraints.filters ?? {};

  return {
    maxCookTime: filters.maxCookTime ?? constraints.maxCookTime ?? null,
    servings: filters.servings ?? constraints.servings ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/* Format Recipes                                                             */
/* -------------------------------------------------------------------------- */

function formatRecipes(results = []) {
  return results.map(formatRecipe);
}

function formatRecipe(result) {
  const recipe = result?.recipe;

  if (!recipe) return null;

  const formatted = {
    id: recipe.id,
    slug: recipe.slug,
    title: recipe.title ?? null,
    description: recipe.description ?? null,

    /* Map thumbnail → image for API consumers */
    image: recipe.thumbnail ?? null,

    category: recipe.category ?? null,
    cuisine: recipe.cuisine ?? null,
    difficulty: recipe.difficulty ?? null,

    totalTime: recipe.totalTime ?? 0,
    prepTime: recipe.prepTime ?? 0,
    cookTime: recipe.cookTime ?? 0,
    servings: recipe.servings ?? 0,

    rating: recipe.rating ?? null,
    featured: recipe.featured ?? false,

    score: result.score ?? 0,
  };

  /* Include match details only when config allows */
  if (AI_CONFIG.RESPONSE.INCLUDE_MATCH_REASONS !== false) {
    formatted.matches = result.matches ?? null;
    formatted.reasons = result.reasons ?? null;
  }

  return formatted;
}

/* -------------------------------------------------------------------------- */
/* Suggestions                                                                */
/* -------------------------------------------------------------------------- */

function buildSuggestions({
  success,
  language,
  results = [],
  constraints = {},
}) {
  if (success) {
    return buildSuccessSuggestions(language, results, constraints);
  }

  return buildEmptySuggestions(language, constraints);
}

/* -------------------------------------------------------------------------- */
/* Success Suggestions — Contextual                                           */
/* -------------------------------------------------------------------------- */

function buildSuccessSuggestions(language, results, constraints) {
  const suggestions = [];

  /* Negation-based: offer what they're avoiding */
  const negated = getNegatedPreferences(constraints);

  for (const pref of negated) {
    const label = localizePreferenceName(pref.name, language);

    suggestions.push(
      language === "bn"
        ? `${label} সহ রেসিপি দেখুন`
        : `Show ${label} recipes instead`,
    );
  }

  /* Preference-based: offer complementary options */
  if (
    hasPreference(constraints, "quick") &&
    !hasPreference(constraints, "healthy", false)
  ) {
    suggestions.push(
      language === "bn" ? "স্বাস্থ্যকর রেসিপি দেখুন" : "Show healthy recipes",
    );
  }

  if (
    hasPreference(constraints, "healthy", false) &&
    !hasPreference(constraints, "quick")
  ) {
    suggestions.push(
      language === "bn" ? "দ্রুত রান্নার রেসিপি দেখুন" : "Show quick recipes",
    );
  }

  /* Cuisine-based: try another cuisine */
  if (constraints.cuisines?.length > 0) {
    suggestions.push(
      language === "bn"
        ? "অন্য দেশের খাবার চেষ্টা করুন"
        : "Try another cuisine",
    );
  }

  /* Ingredient-based: find more with same ingredients */
  if (constraints.ingredients?.length > 0) {
    suggestions.push(
      language === "bn"
        ? "একই উপকরণ দিয়ে আরও রেসিপি দেখুন"
        : "Show more recipes using these ingredients",
    );
  }

  /* Fallback defaults if nothing contextual was added */
  if (suggestions.length === 0) {
    suggestions.push(
      language === "bn" ? "দ্রুত রান্নার রেসিপি দেখুন" : "Show quick recipes",
    );
    suggestions.push(
      language === "bn" ? "স্বাস্থ্যকর রেসিপি দেখুন" : "Show healthy recipes",
    );
  }

  return suggestions.slice(0, AI_CONFIG.MAX_SUGGESTIONS);
}

/* -------------------------------------------------------------------------- */
/* Empty Suggestions — Recovery-Oriented                                     */
/* -------------------------------------------------------------------------- */

function buildEmptySuggestions(language, constraints = {}) {
  const suggestions = [];
  const intent = constraints.intent;

  /* For greeting/knowledge intents, show getting-started suggestions */
  if (intent === "greeting" || intent === "knowledge") {
    if (language === "bn") {
      suggestions.push("চিকেন বিরিয়ানি রেসিপি");
      suggestions.push("দ্রুত লাঞ্চের আইডিয়া");
      suggestions.push("সবজি দিয়ে রেসিপি");
    } else {
      suggestions.push("Chicken biryani recipe");
      suggestions.push("Quick lunch ideas");
      suggestions.push("Recipes with vegetables");
    }
    return suggestions.slice(0, AI_CONFIG.MAX_SUGGESTIONS);
  }

  /* Ingredient-based recovery */
  if (constraints.ingredients?.length > 1) {
    suggestions.push(
      language === "bn"
        ? "কম উপকরণ দিয়ে চেষ্টা করুন"
        : "Try with fewer ingredients",
    );
  }

  /* Cuisine-based recovery */
  if (constraints.cuisines?.length > 0) {
    suggestions.push(
      language === "bn"
        ? "অন্য দেশের খাবার চেষ্টা করুন"
        : "Try another cuisine",
    );
  }

  /* Diet-based recovery */
  if (constraints.diets?.length > 0) {
    suggestions.push(
      language === "bn"
        ? "ডায়েট সীমাবদ্ধতা সরিয়ে চেষ্টা করুন"
        : "Remove diet restriction",
    );
  }

  /* Negation-based: try including what they avoided */
  const negated = getNegatedPreferences(constraints);

  for (const pref of negated) {
    const label = localizePreferenceName(pref.name, language);

    suggestions.push(
      language === "bn" ? `${label} সহ রেসিপি দেখুন` : `Try including ${label}`,
    );
  }

  /* Generic fallback */
  if (suggestions.length === 0) {
    suggestions.push(
      language === "bn"
        ? "একটি নির্দিষ্ট খাবারের নাম দিন"
        : "Try a specific dish name",
    );
    suggestions.push(
      language === "bn"
        ? "উপকরণের নাম দিয়ে অনুসন্ধান করুন"
        : "Search by an ingredient name",
    );
  }

  return suggestions.slice(0, AI_CONFIG.MAX_SUGGESTIONS);
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Merges response-level metadata with pipeline metadata from               */
/* generate-recipe.js.  Pipeline metadata takes precedence for overlapping   */
/* keys (timing, errors, stages).                                           */
/*                                                                            */

function buildMetadata({
  success,
  results = [],
  constraints = {},
  metadata = {},
}) {
  const base = {
    success,
    totalResults: results.length,
    generatedAt: new Date().toISOString(),
    engine: "Recipe AI",
    version: AI_CONFIG.VERSION,
  };

  /* Confidence — only include when config allows */
  if (AI_CONFIG.RESPONSE.INCLUDE_CONFIDENCE !== false) {
    base.confidence = calculateConfidence(results);
  }

  /* Merge pipeline metadata (timing, errors, stages, etc.) */
  return { ...base, ...metadata };
}

/* -------------------------------------------------------------------------- */
/* Confidence                                                                 */
/* -------------------------------------------------------------------------- */

function calculateConfidence(results = []) {
  if (!results.length) return 0;

  const topScore = results[0]?.score ?? 0;
  const maxScore = getMaximumPossibleScore();

  if (maxScore <= 0) return 0;

  return clamp(Math.round((topScore / maxScore) * 100), 0, 100);
}

/* -------------------------------------------------------------------------- */
/* Maximum Possible Score — Dynamic                                          */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Sums all SCORE and BONUS values from config dynamically.                  */
/* This way, new scoring keys added to AI_CONFIG are automatically           */
/* included in the confidence calculation without code changes here.        */
/*                                                                            */

function getMaximumPossibleScore() {
  let total = 0;

  if (AI_CONFIG.SCORE && typeof AI_CONFIG.SCORE === "object") {
    for (const value of Object.values(AI_CONFIG.SCORE)) {
      if (typeof value === "number") {
        total += value;
      }
    }
  }

  if (AI_CONFIG.BONUS && typeof AI_CONFIG.BONUS === "object") {
    for (const value of Object.values(AI_CONFIG.BONUS)) {
      if (typeof value === "number") {
        total += value;
      }
    }
  }

  return total;
}

/* -------------------------------------------------------------------------- */
/* Helpers — Entity Mapping                                                   */
/* -------------------------------------------------------------------------- */

function mapToSlugs(items) {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item != null)
    .map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && item.slug) return item.slug;
      return null;
    })
    .filter(Boolean);
}

function mapToNames(items) {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item != null)
    .map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && item.name) {
        return typeof item.name === "string" ? item.name : item.name.en;
      }
      return null;
    })
    .filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/* Helpers — Preferences                                                      */
/* -------------------------------------------------------------------------- */

function getNegatedPreferences(constraints) {
  const prefs = constraints.preferences;

  if (!Array.isArray(prefs)) return [];

  return prefs.filter((p) => p && typeof p === "object" && p.negated === true);
}

function hasPreference(constraints, name, ignoreNegated = true) {
  const prefs = constraints.preferences;

  if (!Array.isArray(prefs)) return false;

  return prefs.some((p) => {
    if (!p) return false;

    if (typeof p === "string") return p === name;

    if (typeof p === "object") {
      if (ignoreNegated && p.negated) return false;
      return p.name === name;
    }

    return false;
  });
}

function localizePreferenceName(name, language) {
  const map = {
    spicy: { en: "spicy food", bn: "ঝাল খাবার" },
    healthy: { en: "healthy food", bn: "স্বাস্থ্যকর খাবার" },
    quick: { en: "quick recipes", bn: "দ্রুত রেসিপি" },
    easy: { en: "easy recipes", bn: "সহজ রেসিপি" },
    vegetarian: { en: "vegetarian food", bn: "নিরামিষ খাবার" },
    vegan: { en: "vegan food", bn: "ভেগান খাবার" },
    protein: { en: "high-protein food", bn: "উচ্চ-প্রোটিন খাবার" },
    lowCalorie: { en: "low-calorie food", bn: "কম-ক্যালোরি খাবার" },
    budget: { en: "budget-friendly food", bn: "সাশ্রয়ী খাবার" },
    kids: { en: "kid-friendly food", bn: "শিশু-বান্ধব খাবার" },
    party: { en: "party food", bn: "পার্টির খাবার" },
  };

  const entry = map[name];

  if (!entry) return name;

  return entry[language] ?? entry.en;
}

/* -------------------------------------------------------------------------- */
/* Helpers — Entity Labels                                                    */
/* -------------------------------------------------------------------------- */

function getDetectedEntityLabels(constraints, language) {
  const labels = [];

  /* Cuisines */
  if (constraints.cuisines?.length > 0) {
    for (const c of constraints.cuisines) {
      const name =
        typeof c === "object" ? getLocalizedValue(c.name, language) : c;
      if (name) labels.push(name);
    }
  }

  /* Categories */
  if (constraints.categories?.length > 0) {
    for (const c of constraints.categories) {
      const name =
        typeof c === "object" ? getLocalizedValue(c.name, language) : c;
      if (name) labels.push(name);
    }
  }

  /* Diets */
  if (constraints.diets?.length > 0) {
    for (const d of constraints.diets) {
      const name =
        typeof d === "object" ? getLocalizedValue(d.name, language) : d;
      if (name) labels.push(name);
    }
  }

  /* Ingredients (limit to first 3 to avoid long messages) */
  if (constraints.ingredients?.length > 0) {
    for (const i of constraints.ingredients.slice(0, 3)) {
      const name =
        typeof i === "object"
          ? i.name
            ? getLocalizedValue(i.name, language)
            : i.slug
          : i;
      if (name) labels.push(name);
    }
  }

  return labels;
}

/* -------------------------------------------------------------------------- */
/* Helpers — Meal Type Labels                                                 */
/* -------------------------------------------------------------------------- */

function getMealTypeLabel(mealType, language) {
  const labels = {
    breakfast: { en: "breakfast", bn: "সকালের নাস্তা" },
    lunch: { en: "lunch", bn: "দুপুরের খাবার" },
    dinner: { en: "dinner", bn: "রাতের খাবার" },
    snack: { en: "a snack", bn: "হালকা খাবার" },
    dessert: { en: "dessert", bn: "মিষ্টি জাতীয় খাবার" },
  };

  const entry = labels[mealType];

  if (!entry) return null;

  return entry[language] ?? entry.en;
}

/* -------------------------------------------------------------------------- */
/* Helpers — Localization                                                     */
/* -------------------------------------------------------------------------- */

function getLocalizedValue(value, language = "en") {
  if (value == null) return "";

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    return (
      value[language] ?? value.en ?? Object.values(value).find(Boolean) ?? ""
    );
  }

  return value;
}

/* -------------------------------------------------------------------------- */
/* Helpers — Text Formatting                                                  */
/* -------------------------------------------------------------------------- */

function joinWithComma(items, language) {
  if (!items.length) return "";

  if (items.length === 1) return items[0];

  if (items.length === 2) {
    return language === "bn"
      ? `${items[0]} এবং ${items[1]}`
      : `${items[0]} and ${items[1]}`;
  }

  const allButLast = items.slice(0, -1);
  const last = items[items.length - 1];

  return language === "bn"
    ? `${allButLast.join(", ")} এবং ${last}`
    : `${allButLast.join(", ")}, and ${last}`;
}

/* -------------------------------------------------------------------------- */
/* Helpers — Numeric                                                          */
/* -------------------------------------------------------------------------- */

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
