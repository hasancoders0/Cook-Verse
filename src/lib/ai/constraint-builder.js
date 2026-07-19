import { AI_CONFIG } from "./config";

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

/**
 * Preference keys (from prompt-parser) that map directly to diet
 * constraint objects the matcher can compare by slug.
 */
const PREFERENCE_DIET_MAP = {
  vegetarian: { slug: "vegetarian", name: { en: "Vegetarian", bn: "নিরামিষ" } },
  vegan: { slug: "vegan", name: { en: "Vegan", bn: "ভেগান" } },
  protein: {
    slug: "high-protein",
    name: { en: "High Protein", bn: "উচ্চ প্রোটিন" },
  },
};

/**
 * Difficulty strings to the object shape recipe-matcher expects:
 * { name: { en: "...", bn: "..." } }.
 */
const DIFFICULTY_OBJECT_MAP = {
  easy: { name: { en: "Easy", bn: "সহজ" } },
  medium: { name: { en: "Medium", bn: "মাঝারি" } },
  hard: { name: { en: "Hard", bn: "কঠিন" } },
};

/**
 * Cook-time ceiling (minutes) when the user expresses a preference
 * for "quick" or "fast" recipes.
 *
 * NOTE: "easy" is intentionally excluded here.  The prompt-parser
 * currently groups "easy" under the "quick" preference key, but
 * "easy" is primarily a difficulty signal.  The structured filter
 * extraction below handles difficulty separately via regex, so
 * only true speed keywords trigger the time ceiling here.
 */
const QUICK_TIME_THRESHOLD = 30;

const SPEED_PREFERENCES = new Set(["quick", "fast"]);

/**
 * Regex patterns for extracting structured numeric filters from the
 * raw prompt.  These mirror the internal helpers defined but never
 * called in prompt-parser.js and will be consolidated once that
 * module is rewritten.
 */
const COOK_TIME_PATTERNS = [
  /under\s+(\d+)\s*(?:minutes?|mins?|মিনিট)/i,
  /within\s+(\d+)\s*(?:minutes?|mins?|মিনিট)/i,
  /(\d+)\s*(?:minutes?|mins?)\s*(?:or\s*less|এর\s*কম)/i,
  /(?:in\s*)?(\d+)\s*মিনিট/,
];

const SERVINGS_PATTERNS = [
  /for\s+(\d+)\s*(?:people|persons?|জন)/i,
  /serves?\s+(\d+)/i,
  /(\d+)\s*(?:people|persons?|জন)/i,
  /(\d+)\s*সার্ভিং/,
];

const DIFFICULTY_PATTERNS = {
  easy: /\b(easy|simple|beginner|সহজ)\b/i,
  medium: /\b(medium|intermediate|মাঝারি)\b/i,
  hard: /\b(hard|advanced|expert|কঠিন)\b/i,
};

/* -------------------------------------------------------------------------- */
/* Entity Schema Transforms                                                   */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* The entity-extractor returns raw strings from the entity index.           */
/* The recipe-matcher expects typed objects with `.slug` (and sometimes       */
/* `.name`) properties.  These functions bridge that gap safely,             */
/* handling both string and object inputs so the builder works whether       */
/* entities come from the extractor or are constructed manually              */
/* (e.g. in the recommendation engine).                                      */
/*                                                                            */

function transformIngredient(value) {
  if (typeof value === "object" && value !== null) {
    return value;
  }
  return { slug: String(value).trim().toLowerCase() };
}

function transformSlugEntity(value) {
  if (typeof value === "object" && value !== null && value.slug) {
    return value;
  }
  const slug = String(value).trim().toLowerCase();
  return { slug, name: { en: slug, bn: slug } };
}

function transformDifficulty(value) {
  if (typeof value === "object" && value !== null && value.name) {
    return value;
  }
  const key = String(value).trim().toLowerCase();
  return (
    DIFFICULTY_OBJECT_MAP[key] ?? { name: { en: capitalize(key), bn: key } }
  );
}

function transformSearchTerm(value) {
  return String(value).trim().toLowerCase();
}

const ENTITY_TRANSFORMS = {
  ingredients: transformIngredient,
  cuisines: transformSlugEntity,
  categories: transformSlugEntity,
  diets: transformSlugEntity,
  cookingMethods: transformSlugEntity,
  tags: transformSlugEntity,
  searchTerms: transformSearchTerm,
};

/* -------------------------------------------------------------------------- */
/* Build Constraints                                                          */
/* -------------------------------------------------------------------------- */

export function buildConstraints({ parsed, entities }) {
  if (AI_CONFIG.PIPELINE.CONSTRAINT_BUILDING === false) {
    return createFallbackConstraints(parsed);
  }

  const constraints = createConstraintResult();

  runConstraintPipeline(parsed, entities, constraints);

  return finalizeConstraints(constraints);
}

/* -------------------------------------------------------------------------- */
/* Constraint Pipeline                                                        */
/* -------------------------------------------------------------------------- */

function runConstraintPipeline(parsed, entities, constraints) {
  populateEntityConstraints(entities, constraints);

  translatePreferences(parsed, constraints);

  extractStructuredFilters(parsed, constraints);

  populateMetadataConstraints(parsed, constraints);

  resolveConflicts(constraints);
}

/* -------------------------------------------------------------------------- */
/* Constraint Result                                                          */
/* -------------------------------------------------------------------------- */

function createConstraintResult() {
  const result = {};

  for (const collection of ENTITY_COLLECTIONS) {
    result[collection] = [];
  }

  result.difficulties = [];
  result.maxCookTime = null;
  result.servings = null;
  result.intent = null;
  result.mealType = null;
  result.preferences = [];
  result.filters = {};
  result.context = {};
  result.metadata = {};
  result.rawPrompt = "";
  result.normalizedPrompt = "";

  return result;
}

/* -------------------------------------------------------------------------- */
/* Stage 1 — Entity Constraints                                               */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Transforms raw entity strings into the typed objects the matcher needs    */
/* and filters out tokens shorter than MIN_TOKEN_LENGTH to reduce noise.    */
/*                                                                            */

function populateEntityConstraints(entities, constraints) {
  if (!entities || typeof entities !== "object") {
    return;
  }

  const minLen = AI_CONFIG.THRESHOLD.MIN_TOKEN_LENGTH;

  for (const collection of ENTITY_COLLECTIONS) {
    const values = entities[collection];

    if (!Array.isArray(values) || values.length === 0) {
      continue;
    }

    const transform = ENTITY_TRANSFORMS[collection];

    if (!transform) {
      continue;
    }

    for (const value of values) {
      if (value == null) {
        continue;
      }

      const str = String(value).trim();

      /* searchTerms can be short compound words; skip the length
         gate for that collection only */
      if (collection !== "searchTerms" && str.length < minLen) {
        continue;
      }

      constraints[collection].push(transform(value));
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Stage 2 — Preference → Constraint Translation                             */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Converts semantic preferences from the prompt parser into concrete        */
/* constraint values the matcher can use:                                    */
/*                                                                            */
/*   vegetarian / vegan / protein  →  diet constraint objects               */
/*   quick / fast                  →  maxCookTime ceiling                   */
/*   all others                    →  kept as-is for response builder        */
/*                                                                            */

function translatePreferences(parsed, constraints) {
  if (!Array.isArray(parsed?.preferences)) {
    return;
  }

  for (const pref of parsed.preferences) {
    if (!pref) {
      continue;
    }

    const key = String(pref).trim().toLowerCase();

    /* --- Diet-mappable preferences --- */
    if (PREFERENCE_DIET_MAP[key]) {
      pushUnique(constraints.diets, PREFERENCE_DIET_MAP[key], "slug");
      continue;
    }

    /* --- Speed preferences → cook time ceiling --- */
    if (SPEED_PREFERENCES.has(key)) {
      if (
        constraints.maxCookTime === null ||
        QUICK_TIME_THRESHOLD < constraints.maxCookTime
      ) {
        constraints.maxCookTime = QUICK_TIME_THRESHOLD;
      }
      continue;
    }

    /* --- Unrecognised: keep for the response builder --- */
    pushUnique(constraints.preferences, pref);
  }
}

/* -------------------------------------------------------------------------- */
/* Stage 3 — Structured Filter Extraction                                    */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Pulls numeric filters (cook time, servings) and difficulty directly       */
/* from the raw prompt text using regex patterns.  This compensates for      */
/* the fact that prompt-parser.js defines extraction helpers but never       */
/* invokes them — those will be consolidated when that module is updated.    */
/*                                                                            */

function extractStructuredFilters(parsed, constraints) {
  const prompt = parsed?.originalPrompt ?? "";

  if (!prompt) {
    return;
  }

  extractCookTime(prompt, constraints);

  extractServings(prompt, constraints);

  extractDifficulty(prompt, constraints);
}

function extractCookTime(prompt, constraints) {
  for (const pattern of COOK_TIME_PATTERNS) {
    const match = prompt.match(pattern);

    if (match) {
      const minutes = Number(match[1]);

      if (minutes > 0) {
        /* When both a preference and an explicit filter set a time,
           the stricter (lower) value wins */
        constraints.maxCookTime =
          constraints.maxCookTime === null
            ? minutes
            : Math.min(constraints.maxCookTime, minutes);
        return;
      }
    }
  }
}

function extractServings(prompt, constraints) {
  for (const pattern of SERVINGS_PATTERNS) {
    const match = prompt.match(pattern);

    if (match) {
      const count = Number(match[1]);

      if (count > 0) {
        constraints.servings = count;
        return;
      }
    }
  }
}

function extractDifficulty(prompt, constraints) {
  for (const [level, pattern] of Object.entries(DIFFICULTY_PATTERNS)) {
    if (pattern.test(prompt)) {
      const obj = DIFFICULTY_OBJECT_MAP[level];

      if (obj) {
        pushUnique(constraints.difficulties, obj, "name.en");
      }

      return;
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Stage 4 — Metadata Constraints                                             */
/* -------------------------------------------------------------------------- */

function populateMetadataConstraints(parsed, constraints) {
  constraints.intent = normalizePrimitive(parsed?.intent);
  constraints.mealType = normalizePrimitive(parsed?.mealType);
  constraints.rawPrompt = parsed?.originalPrompt ?? "";
  constraints.normalizedPrompt = parsed?.normalizedPrompt ?? "";

  /* Preserve any filters / context from parsed for backward compatibility */
  if (parsed?.filters && typeof parsed.filters === "object") {
    constraints.filters = { ...parsed.filters };
  }

  if (parsed?.context && typeof parsed.context === "object") {
    constraints.context = { ...parsed.context };
  }

  /* Surface extracted filters into constraints.filters so the response
     builder can show the user what was detected */
  if (constraints.maxCookTime !== null) {
    constraints.filters.maxCookTime = constraints.maxCookTime;
  }

  if (constraints.servings !== null) {
    constraints.filters.servings = constraints.servings;
  }
}

/* -------------------------------------------------------------------------- */
/* Stage 5 — Conflict Resolution & Deduplication                             */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Ensures no duplicate entities in any collection.  Conflicting numeric    */
/* values (e.g. maxCookTime from preference vs. explicit filter) are        */
/* already resolved with Math.min during earlier stages.                    */
/*                                                                            */

function resolveConflicts(constraints) {
  const allCollections = [...ENTITY_COLLECTIONS, "difficulties"];

  for (const collection of allCollections) {
    constraints[collection] = deduplicateArray(
      constraints[collection],
      getDedupKey(collection),
    );
  }

  constraints.preferences = [
    ...new Set(constraints.preferences.filter(Boolean)),
  ];
}

function getDedupKey(collection) {
  switch (collection) {
    case "ingredients":
    case "cuisines":
    case "categories":
    case "diets":
    case "cookingMethods":
    case "tags":
      return "slug";
    case "difficulties":
      return "name.en";
    case "searchTerms":
    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Finalize Constraints                                                       */
/* -------------------------------------------------------------------------- */

function finalizeConstraints(constraints) {
  validateConstraints(constraints);

  constraints.metadata = buildMetadata(constraints);

  return constraints;
}

/* -------------------------------------------------------------------------- */
/* Constraint Validation                                                      */
/* -------------------------------------------------------------------------- */

function validateConstraints(constraints) {
  constraints.intent = normalizePrimitive(constraints.intent);
  constraints.mealType = normalizePrimitive(constraints.mealType);
  constraints.preferences = cleanArray(constraints.preferences);
  constraints.filters = cleanObject(constraints.filters);
  constraints.context = cleanObject(constraints.context);
  constraints.maxCookTime = validatePositiveNumber(constraints.maxCookTime);
  constraints.servings = validatePositiveNumber(constraints.servings);

  for (const collection of ENTITY_COLLECTIONS) {
    constraints[collection] = cleanArray(constraints[collection]);
  }

  constraints.difficulties = cleanArray(constraints.difficulties);
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

function buildMetadata(constraints) {
  const allCollections = [...ENTITY_COLLECTIONS, "difficulties"];

  const totalEntities = allCollections.reduce(
    (total, collection) => total + (constraints[collection]?.length ?? 0),
    0,
  );

  const populatedCollections = allCollections.filter(
    (collection) => (constraints[collection]?.length ?? 0) > 0,
  );

  return {
    totalConstraints: totalEntities,

    entityCollections: populatedCollections,

    hasIntent: Boolean(constraints.intent),

    hasMealType: Boolean(constraints.mealType),

    hasPreferences: constraints.preferences.length > 0,

    hasFilters: Object.keys(constraints.filters).length > 0,

    hasContext: Object.keys(constraints.context).length > 0,

    hasMaxCookTime: constraints.maxCookTime !== null,

    hasServings: constraints.servings !== null,

    hasDifficulty: constraints.difficulties.length > 0,

    pipelineStages: [
      "entityPopulation",
      "preferenceTranslation",
      "filterExtraction",
      "metadataPopulation",
      "conflictResolution",
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* Fallback Constraints                                                       */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* When the pipeline is disabled via AI_CONFIG, return a minimal valid       */
/* constraint object that won't crash the matcher.  Only rawPrompt and      */
/* basic metadata are populated.                                             */
/*                                                                            */

function createFallbackConstraints(parsed) {
  return {
    ...createConstraintResult(),
    rawPrompt: parsed?.originalPrompt ?? "",
    normalizedPrompt: parsed?.normalizedPrompt ?? "",
    intent: normalizePrimitive(parsed?.intent),
    mealType: normalizePrimitive(parsed?.mealType),
    metadata: {
      pipelineStages: ["fallback"],
      totalConstraints: 0,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Array Helpers                                                              */
/* -------------------------------------------------------------------------- */

function cleanArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }
  return values.filter(Boolean);
}

function cleanObject(object) {
  if (!object || typeof object !== "object") {
    return {};
  }

  const result = {};

  for (const [key, value] of Object.entries(object)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    result[key] = value;
  }

  return result;
}

function normalizePrimitive(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = String(value).trim();

  return normalized || null;
}

function validatePositiveNumber(value) {
  if (typeof value !== "number" || !isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

function pushUnique(array, item, keyPath) {
  if (!item) {
    return;
  }

  if (!keyPath) {
    if (!array.includes(item)) {
      array.push(item);
    }
    return;
  }

  const keyValue = getNestedValue(item, keyPath);

  const exists = array.some(
    (existing) => getNestedValue(existing, keyPath) === keyValue,
  );

  if (!exists) {
    array.push(item);
  }
}

function getNestedValue(obj, path) {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

function deduplicateArray(array, key) {
  if (!Array.isArray(array) || array.length === 0) {
    return array;
  }

  if (!key) {
    return [...new Set(array)];
  }

  const seen = new Set();

  return array.filter((item) => {
    const value = getNestedValue(item, key);

    if (value == null || seen.has(value)) {
      return false;
    }

    seen.add(value);

    return true;
  });
}

function capitalize(str) {
  if (!str) {
    return str;
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}
