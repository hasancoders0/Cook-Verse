/* -------------------------------------------------------------------------- */
/* AI Configuration                                                           */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Central configuration for the recipe AI pipeline.                         */
/* Every scoring weight, threshold, limit, and toggle lives here so           */
/* tuning the engine never requires touching pipeline logic.                  */
/*                                                                            */
/* Convention:                                                                */
/*   SCORE   — points awarded per individual field match                     */
/*   BONUS   — extra points when multiple fields match together              */
/*   PENALTY — points subtracted for undesirable signals                     */
/*   THRESHOLD — minimum values that gate downstream behaviour               */
/*   PIPELINE — on/off switches for each pipeline stage                      */
/*                                                                            */
/* ======================================================================= */

export const AI_CONFIG = {
  /* ---------------------------------------------------------------------- */
  /* Version                                                                 */
  /* ---------------------------------------------------------------------- */

  VERSION: "2.0.0",

  /* ---------------------------------------------------------------------- */
  /* Limits                                                                  */
  /* ---------------------------------------------------------------------- */

  MAX_RESULTS: 10,

  MAX_SUGGESTIONS: 3,

  MIN_TOKEN_LENGTH: 2,

  /* ---------------------------------------------------------------------- */
  /* Scoring — Per-Field Match Weights                                       */
  /* ---------------------------------------------------------------------- */
  /*                                                                          */
  /* Each value is the base score awarded when the user prompt matches       */
  /* that field on a recipe.  Higher = that field is considered more         */
  /* important for relevance.                                                */
  /*                                                                          */

  SCORE: {
    TITLE: 15,
    SEARCH_TERM: 20,
    INGREDIENT: 10,
    CATEGORY: 8,
    CUISINE: 8,
    DIET: 8,
    TAG: 5,
    DIFFICULTY: 5,
    COOK_TIME: 10,
    SERVINGS: 5,
  },

  /* ---------------------------------------------------------------------- */
  /* Scoring — Bonus Rewards                                                 */
  /* ---------------------------------------------------------------------- */
  /*                                                                          */
  /* Awarded on top of per-field scores when multiple related fields         */
  /* match the same recipe, signalling a strong overall fit.                 */
  /*                                                                          */
  /* NOTE: getMaximumPossibleScore() in recipe-response.js sums the          */
  /* original five bonus keys explicitly.  New keys below (FOUR_PLUS_*,      */
  /* TAG_MATCH_MULTI, FEATURED_RECIPE, HIGH_RATING) are additive extras     */
  /* that make real scores exceed the calculated max — confidence simply     */
  /* clamps at 100 % which is the intended behaviour.                        */
  /*                                                                          */

  BONUS: {
    TWO_INGREDIENTS: 10,
    THREE_INGREDIENTS: 20,
    FOUR_PLUS_INGREDIENTS: 30,
    CATEGORY_MATCH: 5,
    CUISINE_MATCH: 5,
    DIET_MATCH: 5,
    TAG_MATCH_MULTI: 3,
    FEATURED_RECIPE: 2,
    HIGH_RATING: 3,
  },

  /* ---------------------------------------------------------------------- */
  /* Scoring — Penalties                                                     */
  /* ---------------------------------------------------------------------- */
  /*                                                                          */
  /* Subtracted from the running score to demote recipes that technically    */
  /* match but carry undesirable signals (low rating, long cook time, etc.). */
  /*                                                                          */

  PENALTY: {
    PARTIAL_INGREDIENT_MATCH: -3,
    LOW_RATING: -2,
    LONG_COOK_TIME: -1,
  },

  /* ---------------------------------------------------------------------- */
  /* Thresholds                                                              */
  /* ---------------------------------------------------------------------- */
  /*                                                                          */
  /* Gate values that control when a result is "good enough" to return,     */
  /* or how fuzzy matching behaves.                                          */
  /*                                                                          */

  THRESHOLD: {
    /** Minimum total score a recipe must reach to be included in results. */
    MIN_MATCH_SCORE: 1,

    /** Confidence percentages that classify result quality. */
    HIGH_CONFIDENCE: 70,
    MEDIUM_CONFIDENCE: 40,
    LOW_CONFIDENCE: 10,

    /** Shortest token length eligible for fuzzy matching (avoids noise). */
    FUZZY_MATCH_MIN_LENGTH: 3,

    /** Minimum Jaro-Winkler / Levenshtein similarity (0–1) to accept a fuzzy hit. */
    FUZZY_MATCH_TOLERANCE: 0.7,
  },

  /* ---------------------------------------------------------------------- */
  /* Pipeline — Stage Toggles                                                */
  /* ---------------------------------------------------------------------- */
  /*                                                                          */
  /* Set any stage to `false` to skip it.  Useful for debugging or           */
  /* stripping the pipeline down for performance-critical paths.             */
  /*                                                                          */

  PIPELINE: {
    LANGUAGE_DETECTION: true,
    PROMPT_PARSING: true,
    ENTITY_EXTRACTION: true,
    ENTITY_NORMALIZATION: true,
    CONSTRAINT_BUILDING: true,
    RECIPE_MATCHING: true,
    RECIPE_RANKING: true,
    RESPONSE_GENERATION: true,
  },

  /* ---------------------------------------------------------------------- */
  /* Language                                                                */
  /* ---------------------------------------------------------------------- */

  LANGUAGE: {
    DEFAULT: "en",
    SUPPORTED: ["en", "bn"],
    FALLBACK: "en",
  },

  /* ---------------------------------------------------------------------- */
  /* Ranking — Sort Priorities & Defaults                                    */
  /* ---------------------------------------------------------------------- */
  /*                                                                          */
  /* SORT_PRIORITY defines the tiebreaker chain when two recipes share       */
  /* the same score.  First entry wins; if still tied, next entry is used,   */
  /* and so on.                                                              */
  /*                                                                          */

  RANKING: {
    SORT_PRIORITY: [
      "score",
      "featured",
      "averageRating",
      "ratingCount",
      "totalTime",
      "title",
    ],
    DEFAULT_LIMIT: 10,
  },

  /* ---------------------------------------------------------------------- */
  /* Fuzzy Matching                                                          */
  /* ---------------------------------------------------------------------- */
  /*                                                                          */
  /* When enabled, the entity extractor will also accept near-matches        */
  /* (typos, transliteration variants, etc.) for the listed collections.     */
  /*                                                                          */

  FUZZY: {
    ENABLED: true,
    MAX_EDIT_DISTANCE: 2,
    MIN_SIMILARITY: 0.6,
    APPLY_TO: ["ingredients", "searchTerms", "tags"],
  },

  /* ---------------------------------------------------------------------- */
  /* Response — Assistant Behaviour                                          */
  /* ---------------------------------------------------------------------- */
  /*                                                                          */
  /* Controls which sections the generated response object includes.         */
  /* Toggle off sections you don't render in the UI to shrink payloads.      */
  /*                                                                          */

  RESPONSE: {
    SHOW_EXPLANATION: true,
    SHOW_RECOMMENDATION: true,
    SHOW_FOLLOW_UP: true,
    SHOW_SUGGESTIONS: true,
    INCLUDE_MATCH_REASONS: true,
    INCLUDE_CONFIDENCE: true,
  },

  /* ---------------------------------------------------------------------- */
  /* Intent — Keyword Sensitivity                                            */
  /* ---------------------------------------------------------------------- */

  INTENT: {
    REQUIRE_EXACT_MATCH: false,
    MIN_KEYWORD_MATCH: 1,
  },
};
