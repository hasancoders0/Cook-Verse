import { AI_CONFIG } from "./config";

import { detectLanguage } from "./language-detector";
import { parsePrompt } from "./prompt-parser";
import { extractEntities } from "./entity-extractor";
import { normalizeEntities } from "./entity-normalizer";
import { buildConstraints } from "./constraint-builder";
import { matchRecipes } from "./recipe-matcher";
import { rankRecipes } from "./recipe-ranker";
import { buildRecipeResponse } from "./recipe-response";
import { buildEntityIndex } from "./entity-index";

import recipes from "@/data/recipes";

/* -------------------------------------------------------------------------- */
/* Stop Words for Prompt Validation                                           */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Used to determine if a prompt has meaningful content.                     */
/* These are words that don't convey specific recipe-related intent.        */
/*                                                                            */

const STOP_WORDS = new Set([
  /* Greetings - ONLY these specific greetings */
  "hello",
  "hi",
  "hey",

  /* Question words - only when used as standalone queries */
  "what",
  "how",
  "which",
  "where",
  "when",
  "who",
  "why",
  "whose",
  "whom",

  /* Common query verbs that don't specify what to cook */
  "make",
  "cook",
  "want",
  "like",
  "give",
  "show",
  "tell",
  "need",
  "try",
  "use",
  "get",
  "find",
  "please",
  "know",
  "think",
  "looking",
  "search",
  "suggest",
  "recommend",
  "prefer",
  "prefers",
  "preferred",
  "preferring",

  /* Fillers */
  "some",
  "any",
  "something",
  "anything",
  "very",
  "just",
  "also",
  "really",
  "much",
  "many",
  "more",
  "most",
  "other",
  "than",
  "then",
  "now",
  "so",
  "maybe",
  "perhaps",
  "probably",
  "definitely",
  "certainly",

  /* Time-related - but NOT meal names */
  "today",
  "tomorrow",
  "yesterday",

  /* Etc */
  "etc",
  "etcetera",

  /* Articles & prepositions */
  "a",
  "an",
  "the",
  "of",
  "in",
  "for",
  "on",
  "with",
  "at",
  "by",
  "from",
  "as",
  "into",
  "to",
  "and",
  "but",
  "or",
  "not",

  /* Pronouns */
  "i",
  "me",
  "my",
  "we",
  "our",
  "you",
  "your",
  "he",
  "him",
  "his",
  "she",
  "her",
  "it",
  "its",
  "they",
  "them",
  "their",

  /* Common spelling variants of greetings/fillers */
  "preffer", // Common typo for "prefer"

  /* Note: "lunch", "breakfast", "dinner", "snack", "dessert" are NOT in stop words
     because they are legitimate meal types that help with recipe discovery */
]);

/* -------------------------------------------------------------------------- */
/* Entity Index Cache                                                         */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Built once on first use, reused for all subsequent calls.                 */
/* Import recipes directly here because this is the pipeline orchestrator    */
/* — it's responsible for wiring data into each stage.                      */
/*                                                                            */

let cachedEntityIndex = null;

function getEntityIndex(options = {}) {
  if (cachedEntityIndex) {
    return cachedEntityIndex;
  }

  const source = Array.isArray(options.recipes) ? options.recipes : recipes;

  cachedEntityIndex = buildEntityIndex(source, {
    includeNonMainIngredients: options.includeNonMainIngredients ?? false,
  });

  return cachedEntityIndex;
}

/* -------------------------------------------------------------------------- */
/* Generate Recipe — Public API                                               */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* const response = generateRecipe("chicken stir fry");                      */
/* const response = generateRecipe("গরুর কিমা দিয়ে রেসিপি", { limit: 5 }); */
/*                                                                            */

export function generateRecipe(prompt = "", options = {}) {
  const resolvedOptions = resolveOptions(options);

  const context = createContext(prompt, resolvedOptions);

  runPipeline(context);

  return context.response;
}

/* -------------------------------------------------------------------------- */
/* Options                                                                    */
/* -------------------------------------------------------------------------- */

function resolveOptions(options) {
  return {
    limit: options.limit ?? AI_CONFIG.RANKING.DEFAULT_LIMIT,

    /** Override auto-detected language. Must be in AI_CONFIG.LANGUAGE.SUPPORTED. */
    language: options.language ?? null,

    /** Override default recipe data source (for testing or custom datasets). */
    recipes: options.recipes ?? null,

    /** Pass through to entity-index: index non-main ingredients too. */
    includeNonMainIngredients: options.includeNonMainIngredients ?? false,

    /** Attach intermediate pipeline state to response._debug. */
    debug: options.debug ?? false,
  };
}

/* -------------------------------------------------------------------------- */
/* Context                                                                    */
/* -------------------------------------------------------------------------- */

function createContext(prompt, options) {
  return {
    /* --- Input --- */
    prompt: sanitizePrompt(prompt),
    options,

    /* --- Stage outputs (set once, never mutated after) --- */
    language: null,
    parsed: null,
    entities: null,
    constraints: null,
    matches: [],
    ranked: [],

    /* --- Final output --- */
    response: null,

    /* --- Diagnostics --- */
    timing: {},
    errors: [],
    warnings: [],
    pipelineStages: [],
  };
}

function sanitizePrompt(prompt) {
  if (prompt == null) return "";
  const str = String(prompt).trim();
  /* Collapse excessive whitespace but preserve single spaces */
  return str.replace(/\s+/g, " ");
}

/* -------------------------------------------------------------------------- */
/* Pipeline                                                                   */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Each stage is wrapped in runStage() which:                                */
/*   1. Checks the AI_CONFIG.PIPELINE gate                                    */
/*   2. Times execution                                                       */
/*   3. Catches errors without crashing downstream stages                    */
/*   4. Records status in pipelineStages for debugging                       */
/*                                                                            */

function runPipeline(context) {
  const pipelineStart = performance.now();

  /* --- Stage 1: Language Detection --- */
  runStage(context, "language_detection", () => {
    const override = context.options.language;

    if (override && AI_CONFIG.LANGUAGE.SUPPORTED.includes(override)) {
      context.language = override;
    } else {
      context.language = detectLanguage(context.prompt);
    }
  });

  /* --- Early exit for empty prompt --- */
  if (!context.prompt) {
    context.pipelineStages.push({
      name: "early_exit",
      status: "skipped",
      reason: "empty_prompt",
    });

    context.response = buildEmptyResponse(context);
    finalizeTiming(context, pipelineStart);
    return;
  }

  /* --- Check if the prompt has meaningful content --- */
  const meaningfulWords = extractMeaningfulWords(context.prompt);

  /* If there are NO meaningful words at all, it's just greetings/fillers */
  if (meaningfulWords.length === 0) {
    context.pipelineStages.push({
      name: "early_exit",
      status: "skipped",
      reason: "vague_prompt",
      details: {
        meaningfulWords: meaningfulWords.length,
        totalWords: context.prompt.split(/\s+/).filter(Boolean).length,
      },
    });

    context.response = buildVaguePromptResponse(context);
    finalizeTiming(context, pipelineStart);
    return;
  }

  /* --- Stage 2: Prompt Parsing --- */
  runStage(context, "prompt_parsing", () => {
    context.parsed = parsePrompt(context.prompt, context.language);
  });

  /* --- Stage 3: Entity Extraction --- */
  runStage(context, "entity_extraction", () => {
    const entityIndex = getEntityIndex(context.options);
    context.entities = extractEntities(context.parsed, entityIndex);
  });

  /* --- Stage 4: Entity Normalization --- */
  runStage(context, "entity_normalization", () => {
    context.entities = normalizeEntities(context.entities);
  });

  /* --- Stage 5: Constraint Building --- */
  runStage(context, "constraint_building", () => {
    context.constraints = buildConstraints({
      parsed: context.parsed,
      entities: context.entities,
    });
  });

  /* --- Stage 6: Recipe Matching --- */
  runStage(context, "recipe_matching", () => {
    context.matches = matchRecipes(context.constraints);
  });

  /* --- Stage 7: Recipe Ranking --- */
  runStage(context, "recipe_ranking", () => {
    context.ranked = rankRecipes(context.matches, {
      limit: context.options.limit,
    });
  });

  /* --- Stage 8: Response Generation --- */
  runStage(context, "response_generation", () => {
    context.response = buildRecipeResponse({
      query: context.prompt,
      language: context.language,
      results: context.ranked,
      constraints: context.constraints,
      metadata: buildPipelineMetadata(context),
    });
  });

  finalizeTiming(context, pipelineStart);

  /* --- Debug mode: attach intermediate state --- */
  if (context.options.debug && context.response) {
    attachDebugInfo(context);
  }

  return;
}

/* -------------------------------------------------------------------------- */
/* Meaningful Word Extraction                                                 */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Extracts words from the prompt that convey actual meaning for             */
/* recipe searching. Filters out:                                            */
/*   - Words shorter than 3 characters                                       */
/*   - Words in the STOP_WORDS set                                           */
/*   - Words that are just numbers                                           */
/*                                                                            */

function extractMeaningfulWords(prompt) {
  if (!prompt || typeof prompt !== "string") {
    return [];
  }

  const words = prompt
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length >= 3)
    .filter((word) => !/^\d+$/.test(word))
    .filter((word) => !STOP_WORDS.has(word));

  return words;
}

/* -------------------------------------------------------------------------- */
/* Stage Runner                                                               */
/* -------------------------------------------------------------------------- */

const STAGE_TO_CONFIG_KEY = {
  language_detection: "LANGUAGE_DETECTION",
  prompt_parsing: "PROMPT_PARSING",
  entity_extraction: "ENTITY_EXTRACTION",
  entity_normalization: "ENTITY_NORMALIZATION",
  constraint_building: "CONSTRAINT_BUILDING",
  recipe_matching: "RECIPE_MATCHING",
  recipe_ranking: "RECIPE_RANKING",
  response_generation: "RESPONSE_GENERATION",
};

function runStage(context, name, fn) {
  const configKey = STAGE_TO_CONFIG_KEY[name];

  /* Pipeline gate: skip stage if disabled in config */
  if (configKey && AI_CONFIG.PIPELINE[configKey] === false) {
    context.pipelineStages.push({ name, status: "skipped" });
    context.timing[name] = 0;
    return;
  }

  const start = performance.now();

  try {
    fn();
    context.pipelineStages.push({ name, status: "success" });
  } catch (error) {
    context.pipelineStages.push({
      name,
      status: "error",
      error: error.message,
    });

    context.errors.push({
      stage: name,
      error,
      message: error.message,
    });
  }

  context.timing[name] = performance.now() - start;
}

/* -------------------------------------------------------------------------- */
/* Empty Response                                                             */
/* -------------------------------------------------------------------------- */

function buildEmptyResponse(context) {
  return buildRecipeResponse({
    query: "",
    language: context.language ?? AI_CONFIG.LANGUAGE.DEFAULT,
    results: [],
    constraints: {},
    metadata: {
      emptyReason: "empty_prompt",
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Vague Prompt Response                                                      */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Returns a friendly response when the user's prompt doesn't contain       */
/* enough meaningful words to perform a recipe search.                      */
/*                                                                            */

function buildVaguePromptResponse(context) {
  const lang = context.language ?? AI_CONFIG.LANGUAGE.DEFAULT;

  const message =
    lang === "bn"
      ? "আমি বুঝতে পারিনি আপনি কী খুঁজছেন। দয়া করে একটি খাবারের নাম, উপকরণ বা রান্নার ধরন উল্লেখ করুন। যেমন: 'চিকেন বিরিয়ানি', 'মুরগির রেসিপি', অথবা 'দ্রুত নাস্তা'।"
      : "I'm not sure what you're looking for. Please mention a dish name, ingredient, or cuisine type. For example: 'chicken biryani', 'chicken recipe', or 'quick snack'.";

  const suggestions =
    lang === "bn"
      ? [
          "চিকেন বিরিয়ানি",
          "মুরগির রেসিপি",
          "দ্রুত নাস্তা",
          "স্বাস্থ্যকর খাবার",
        ]
      : ["Chicken Biryani", "Chicken recipe", "Quick snack", "Healthy food"];

  const response = {
    success: false,
    query: context.prompt,
    language: lang,
    assistant: {
      role: "recipe-assistant",
      tone: "friendly",
      greeting:
        lang === "bn"
          ? "হ্যালো! আমি আপনার রেসিপি সহকারী।"
          : "Hi! I'm your Recipe Assistant.",
      message: message,
      explanation:
        lang === "bn"
          ? "আমি খাবারের নাম, উপকরণ, অথবা রান্নার ধরন দিয়ে রেসিপি খুঁজে বের করতে পারি।"
          : "I can find recipes by dish name, ingredient, or cuisine type.",
      recommendation: null,
      followUp:
        lang === "bn"
          ? "আপনি কী ধরনের খাবার খুঁজছেন? আমাকে বলুন।"
          : "What kind of food are you looking for? Let me know.",
    },
    search: {
      query: context.prompt,
      language: lang,
      totalResults: 0,
      intent: "recipe_search",
      entities: {
        ingredients: [],
        categories: [],
        cuisines: [],
        diets: [],
        tags: [],
        difficulties: [],
      },
      filters: {
        maxCookTime: null,
        servings: null,
      },
    },
    recipes: [],
    suggestions: suggestions,
    metadata: {
      success: false,
      totalResults: 0,
      generatedAt: new Date().toISOString(),
      engine: "Recipe AI",
      version: AI_CONFIG.VERSION,
      emptyReason: "vague_prompt",
      isVague: true,
      meaningfulWords: extractMeaningfulWords(context.prompt),
    },
  };

  return response;
}

/* -------------------------------------------------------------------------- */
/* Pipeline Metadata                                                          */
/* -------------------------------------------------------------------------- */

function buildPipelineMetadata(context) {
  return {
    pipelineStages: context.pipelineStages,

    timing: {
      ...context.timing,
      total: context.timing.total ?? 0,
    },

    errors: context.errors.length > 0 ? context.errors : undefined,

    warnings: context.warnings.length > 0 ? context.warnings : undefined,

    entityCount: context.entities?.metadata?.totalEntities ?? 0,

    entityConfidence: context.entities?.metadata?.confidence ?? 0,

    matchCount: context.matches.length,

    resultCount: context.ranked.length,
  };
}

/* -------------------------------------------------------------------------- */
/* Debug Info                                                                 */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Attached to response._debug when options.debug is true.                   */
/* Contains the full intermediate state of every pipeline stage.             */
/* NOT for production responses — only for development and testing.          */
/*                                                                            */

function attachDebugInfo(context) {
  context.response._debug = {
    input: {
      prompt: context.prompt,
      options: context.options,
    },

    language: context.language,

    parsed: context.parsed,

    entities: context.entities,

    constraints: context.constraints,

    matcher: {
      matchCount: context.matches.length,

      topScores: context.matches.slice(0, 5).map((m) => ({
        id: m.recipe?.id,
        slug: m.recipe?.slug,
        score: m.score,
        reasons: m.reasons,
      })),
    },

    ranker: {
      resultCount: context.ranked.length,

      scores: context.ranked.map((r) => ({
        id: r.recipe?.id,
        slug: r.recipe?.slug,
        score: r.score,
      })),
    },

    pipeline: {
      stages: context.pipelineStages,
      timing: context.timing,
      errors: context.errors,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Timing                                                                     */
/* -------------------------------------------------------------------------- */

function finalizeTiming(context, pipelineStart) {
  context.timing.total = performance.now() - pipelineStart;
}
