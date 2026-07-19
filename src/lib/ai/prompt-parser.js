import { AI_CONFIG } from "./config";
import { detectLanguage } from "./language-detector";

/* -------------------------------------------------------------------------- */
/* Negation Prefixes                                                          */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* When one of these appears before a preference keyword, the preference    */
/* is marked as negated rather than excluded.  This lets the response       */
/* builder say "I see you want to avoid spicy food" instead of silently     */
/* treating "not spicy" as a request FOR spicy food.                        */
/*                                                                            */

const NEGATION_PREFIXES = [
  /* English */
  "no ",
  "not ",
  "without ",
  "dont want ",
  "don't want ",
  "avoid ",
  "skip ",
  "exclude ",
  "none of ",
  "no more ",
  /* Bangla */
  "ছাড়া ",
  "ব্যতিরেকে ",
  "নয় ",
];

/* -------------------------------------------------------------------------- */
/* Intents                                                                    */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Checked via scoring: each intent earns +1 per matched keyword.            */
/* Highest score wins; ties broken by declaration order (first wins).       */
/*                                                                            */
/* REQUIRE_EXACT_MATCH = false → substring matching (default)               */
/* REQUIRE_EXACT_MATCH = true  → word-boundary regex matching              */
/*                                                                            */
/* MIN_KEYWORD_MATCH = minimum keyword hits required to select an intent.  */
/* Below threshold → falls back to "recipe_search".                         */
/*                                                                            */

const INTENTS = [
  {
    name: "recipe_recommendation",
    keywords: [
      "hello",
      "hi",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
      "howdy",
      "greetings",
      "what's up",
      "whats up",
      "হ্যালো",
      "নমস্কার",
      "আসসালামু",
      "সুপ্রভাত",
      "শুভ সন্ধ্যা",
    ],
  },
  {
    name: "recipe_instructions",
    keywords: [
      "how to cook",
      "how to make",
      "how do i make",
      "instructions",
      "steps",
      "recipe for",
      "কিভাবে রান্না",
      "কীভাবে রান্না",
      "রান্নার নিয়ম",
      "রান্না করবেন",
    ],
  },
  {
    name: "nutrition",
    keywords: [
      "nutrition",
      "calories",
      "protein",
      "fat",
      "carbs",
      "পুষ্টি",
      "ক্যালোরি",
      "প্রোটিন",
      "ফ্যাট",
    ],
  },
  {
    name: "knowledge",
    keywords: [
      "what is",
      "what are",
      "tell me about",
      "কি",
      "কী",
      "মানে",
      "সম্পর্কে",
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Meal Types                                                                 */
/* -------------------------------------------------------------------------- */

const MEAL_TYPES = {
  breakfast: ["breakfast", "morning", "সকালের নাস্তা", "নাস্তা", "সকাল"],
  lunch: ["lunch", "afternoon", "দুপুর", "দুপুরের খাবার"],
  dinner: ["dinner", "night", "রাত", "রাতের খাবার"],
  snack: ["snack", "snacks", "হালকা খাবার", "নাস্তা"],
  dessert: ["dessert", "sweet", "ডেজার্ট", "মিষ্টি"],
};

/* -------------------------------------------------------------------------- */
/* Preferences                                                                */
/* -------------------------------------------------------------------------- */

const PREFERENCES = {
  healthy: ["healthy", "health", "স্বাস্থ্যকর", "হেলদি"],
  spicy: ["spicy", "hot", "ঝাল", "মশলাদার"],
  quick: ["quick", "fast", "instant", "দ্রুত"],
  easy: ["easy", "simple", "beginner", "সহজ"],
  vegetarian: ["vegetarian", "veg", "নিরামিষ"],
  vegan: ["vegan", "ভেগান"],
  protein: ["high protein", "protein", "প্রোটিন"],
  lowCalorie: ["low calorie", "low-calorie", "diet", "কম ক্যালোরি", "ডায়েট"],
  budget: ["cheap", "budget", "low cost", "সস্তা", "কম খরচ"],
  kids: ["kids", "children", "baby", "বাচ্চা", "শিশু"],
  party: ["party", "guest", "পার্টি", "অতিথি"],
};

/* -------------------------------------------------------------------------- */
/* Difficulties                                                               */
/* -------------------------------------------------------------------------- */

const DIFFICULTIES = {
  easy: ["easy", "simple", "beginner", "সহজ"],
  medium: ["medium", "intermediate", "মাঝারি"],
  hard: ["hard", "advanced", "expert", "কঠিন"],
};

/* -------------------------------------------------------------------------- */
/* Occasions                                                                  */
/* -------------------------------------------------------------------------- */

const OCCASIONS = {
  party: ["party", "birthday", "celebration", "পার্টি", "জন্মদিন"],
  guest: ["guest", "guests", "অতিথি"],
  picnic: ["picnic", "পিকনিক"],
  ramadan: ["ramadan", "iftar", "sehri", "রমজান", "ইফতার", "সেহরি"],
  eid: ["eid", "ঈদ"],
  christmas: ["christmas"],
};

/* -------------------------------------------------------------------------- */
/* Seasons                                                                    */
/* -------------------------------------------------------------------------- */

const SEASONS = {
  summer: ["summer", "গ্রীষ্ম"],
  rainy: ["rainy", "বর্ষা"],
  winter: ["winter", "শীত"],
  spring: ["spring", "বসন্ত"],
  autumn: ["autumn", "fall", "শরৎ"],
};

/* -------------------------------------------------------------------------- */
/* Meal Times                                                                 */
/* -------------------------------------------------------------------------- */

const MEAL_TIMES = {
  today: ["today", "আজ"],
  tomorrow: ["tomorrow", "আগামীকাল"],
  tonight: ["tonight", "আজ রাতে"],
  weekend: ["weekend", "ছুটির দিন"],
};

/* -------------------------------------------------------------------------- */
/* Filter Patterns                                                            */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Parse Prompt — Public API                                                  */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Accepts an optional `language` parameter.  When provided (e.g. from      */
/* generate-recipe.js which detects language in a prior stage), it skips     */
/* redundant re-detection.  Falls back to detectLanguage() when null.       */
/*                                                                            */

export function parsePrompt(prompt = "", language = null) {
  /* Pipeline gate */
  if (AI_CONFIG.PIPELINE.PROMPT_PARSING === false) {
    return createFallbackResult(prompt);
  }

  const originalPrompt = sanitizeInput(prompt);

  const detectedLanguage = language ?? detectLanguage(originalPrompt);

  const normalizedPrompt = normalizePrompt(originalPrompt, detectedLanguage);

  const tokens = tokenizePrompt(normalizedPrompt);

  const intent = detectIntent(normalizedPrompt);

  const mealType = extractMealType(normalizedPrompt);

  const preferences = extractPreferences(originalPrompt, normalizedPrompt);

  const filters = extractFilters(originalPrompt);

  const context = extractContext(normalizedPrompt);

  return {
    originalPrompt,

    normalizedPrompt,

    language: detectedLanguage,

    intent,

    mealType,

    preferences,

    filters,

    context,

    tokens,

    metadata: buildMetadata({
      originalPrompt,
      normalizedPrompt,
      language: detectedLanguage,
      tokens,
    }),
  };
}

/* -------------------------------------------------------------------------- */
/* Fallback Result                                                            */
/* -------------------------------------------------------------------------- */

function createFallbackResult(prompt) {
  const originalPrompt = sanitizeInput(prompt);

  return {
    originalPrompt,
    normalizedPrompt: "",
    language: AI_CONFIG.LANGUAGE.DEFAULT,
    intent: "recipe_search",
    mealType: null,
    preferences: [],
    filters: {},
    context: {},
    tokens: [],
    metadata: { parserMode: "skipped" },
  };
}

/* -------------------------------------------------------------------------- */
/* Input Sanitization                                                         */
/* -------------------------------------------------------------------------- */

function sanitizeInput(prompt) {
  if (prompt == null) return "";

  // Remove common filler phrases and greetings
  let cleaned = String(prompt).trim();

  // Remove common greetings
  cleaned = cleaned.replace(
    /^(hello|hi|hey|good morning|good afternoon|good evening|welcome)\s*[,:]?\s*/i,
    "",
  );

  // Remove "what is", "what are", "how to", etc. - these are intent markers, not search terms
  cleaned = cleaned.replace(
    /^(what is|what are|how to|how do i|how do you|can i|can you|give me|show me|tell me|i want|i need|i would like|i'd like)\s+/i,
    "",
  );

  // Remove trailing filler
  cleaned = cleaned.replace(
    /\s*(etc|and so on|and more|please|thanks|thank you)\s*$/i,
    "",
  );

  // Clean up extra spaces
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

/* -------------------------------------------------------------------------- */
/* Normalize Prompt                                                           */
/* -------------------------------------------------------------------------- */

function normalizePrompt(prompt, language) {
  if (!prompt) return "";

  let normalized = prompt;

  /* Collapse whitespace */
  normalized = normalized.replace(/\s+/g, " ");

  /* Remove punctuation — preserve hyphens (for "low-calorie") and
     Bangla danda (।) is already not in the character class */
  normalized = normalized.replace(/[.,!?;:()\[\]{}"'`]/g, "");

  /* Lowercase for English and mixed-language prompts.
     Bangla has no case, so this is a no-op for pure Bangla. */
  if (language === "en" || language === "mixed") {
    normalized = normalized.toLowerCase();
  }

  return normalized.trim();
}

/* -------------------------------------------------------------------------- */
/* Tokenize                                                                   */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Filters tokens below MIN_TOKEN_LENGTH to prevent single-character        */
/* noise from entering the token list.                                       */
/*                                                                            */

function tokenizePrompt(prompt) {
  if (!prompt) return [];

  const minLen = AI_CONFIG.THRESHOLD.MIN_TOKEN_LENGTH;

  return unique(
    prompt
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= minLen),
  );
}

/* -------------------------------------------------------------------------- */
/* Detect Intent                                                              */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Scoring approach: each intent earns +1 per matched keyword.               */
/* Highest score wins; ties broken by declaration order (first intent       */
/* in the array wins).                                                       */
/*                                                                            */
/* When REQUIRE_EXACT_MATCH is false (default), substring matching is used. */
/* When true, Unicode-aware word-boundary regex is used instead.             */
/*                                                                            */

function detectIntent(prompt) {
  const exactMode = AI_CONFIG.INTENT.REQUIRE_EXACT_MATCH;
  const minMatch = AI_CONFIG.INTENT.MIN_KEYWORD_MATCH;

  let bestIntent = "recipe_search";
  let bestScore = 0;

  for (const intent of INTENTS) {
    const score = countKeywordMatches(prompt, intent.keywords, exactMode);

    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent.name;
    }
  }

  /* If no intent met the minimum keyword threshold, fall back to
     generic search.  With default minMatch=1 this only triggers when
     zero keywords matched across ALL intents. */
  if (bestScore < minMatch) {
    return "recipe_search";
  }

  return bestIntent;
}

function countKeywordMatches(prompt, keywords, exactMode) {
  let count = 0;

  for (const keyword of keywords) {
    if (!keyword) continue;

    if (exactMode) {
      if (exactWordMatch(prompt, keyword)) count++;
    } else {
      if (substringMatch(prompt, keyword)) count++;
    }
  }

  return count;
}

/* -------------------------------------------------------------------------- */
/* Keyword Matching                                                           */
/* -------------------------------------------------------------------------- */

function substringMatch(prompt, keyword) {
  return prompt.includes(keyword.toLowerCase());
}

function exactWordMatch(prompt, keyword) {
  const escaped = escapeRegex(keyword.toLowerCase());

  const regex = new RegExp(
    `(^|[^\\p{L}\\p{N}])${escaped}(?=[^\\p{L}\\p{N}]|$)`,
    "iu",
  );

  return regex.test(prompt);
}

/* -------------------------------------------------------------------------- */
/* Meal Type                                                                  */
/* -------------------------------------------------------------------------- */

function extractMealType(prompt) {
  for (const [mealType, keywords] of Object.entries(MEAL_TYPES)) {
    if (keywords.some((kw) => prompt.includes(kw.toLowerCase()))) {
      return mealType;
    }
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Preferences — with Negation Detection                                      */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Each detected preference is returned as an object:                        */
/*   { name: "spicy", negated: false }                                       */
/*   { name: "spicy", negated: true }                                        */
/*                                                                            */
/* Negation is detected by looking backwards from the matched keyword in    */
/* the ORIGINAL prompt for a negation prefix.  The original prompt is used  */
/* because normalization strips spaces that negation detection depends on.  */
/*                                                                            */
/* Downstream: the constraint-builder treats negated preferences as          */
/* non-matching (they are NOT added to constraints).  The response builder  */
/* can use them for personalised messages like "I see you want to avoid     */
/* spicy food."                                                              */
/*                                                                            */

function extractPreferences(originalPrompt, normalizedPrompt) {
  const detected = [];

  for (const [name, keywords] of Object.entries(PREFERENCES)) {
    const matchedKeyword = findFirstKeyword(normalizedPrompt, keywords);

    if (!matchedKeyword) continue;

    const negated = isNegated(originalPrompt, matchedKeyword);

    detected.push({ name, negated });
  }

  return detected;
}

function findFirstKeyword(prompt, keywords) {
  for (const keyword of keywords) {
    if (!keyword) continue;

    if (prompt.includes(keyword.toLowerCase())) {
      return keyword;
    }
  }

  return null;
}

function isNegated(originalPrompt, keyword) {
  const lowerOriginal = originalPrompt.toLowerCase();

  const keywordLower = keyword.toLowerCase();
  const keywordIndex = lowerOriginal.indexOf(keywordLower);

  if (keywordIndex === -1) return false;

  /* Examine the 30 characters before the keyword for a negation prefix */
  const before = lowerOriginal.substring(
    Math.max(0, keywordIndex - 30),
    keywordIndex,
  );

  for (const prefix of NEGATION_PREFIXES) {
    const trimmed = prefix.trimEnd();

    if (before.endsWith(trimmed)) {
      return true;
    }
  }

  return false;
}

/* -------------------------------------------------------------------------- */
/* Filters — Numeric Extraction from Original Prompt                         */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Runs regex against the ORIGINAL (non-normalized) prompt because patterns  */
/* expect mixed-case inputs like "For 4 People" or "30 Minutes".            */
/*                                                                            */

function extractFilters(originalPrompt) {
  return {
    maxCookTime: extractCookTime(originalPrompt),
    servings: extractServings(originalPrompt),
    difficulty: extractDifficulty(originalPrompt),
  };
}

/* -------------------------------------------------------------------------- */
/* Cook Time                                                                  */
/* -------------------------------------------------------------------------- */

function extractCookTime(prompt) {
  for (const pattern of COOK_TIME_PATTERNS) {
    const match = pattern.exec(prompt);

    if (match) {
      const minutes = Number(match[1]);

      if (minutes > 0) return minutes;
    }
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Servings                                                                   */
/* -------------------------------------------------------------------------- */

function extractServings(prompt) {
  for (const pattern of SERVINGS_PATTERNS) {
    const match = pattern.exec(prompt);

    if (match) {
      const count = Number(match[1]);

      if (count > 0) return count;
    }
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Difficulty                                                                 */
/* -------------------------------------------------------------------------- */

function extractDifficulty(prompt) {
  const lower = prompt.toLowerCase();

  for (const [difficulty, keywords] of Object.entries(DIFFICULTIES)) {
    if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return difficulty;
    }
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Context — Occasion, Season, Meal Time                                     */
/* -------------------------------------------------------------------------- */

function extractContext(prompt) {
  return {
    occasion: extractFromMap(prompt, OCCASIONS),
    season: extractFromMap(prompt, SEASONS),
    mealTime: extractFromMap(prompt, MEAL_TIMES),
  };
}

function extractFromMap(prompt, map) {
  const lower = prompt.toLowerCase();

  for (const [key, keywords] of Object.entries(map)) {
    if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return key;
    }
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

function buildMetadata({ originalPrompt, normalizedPrompt, language, tokens }) {
  return {
    originalLength: originalPrompt.length,

    normalizedLength: normalizedPrompt.length,

    tokenCount: tokens.length,

    hasNumbers: /\d/.test(originalPrompt),

    hasBangla: /[\u0980-\u09FF]/.test(originalPrompt),

    hasEnglish: /[A-Za-z]/.test(originalPrompt),

    isMixedLanguage:
      /[\u0980-\u09FF]/.test(originalPrompt) && /[A-Za-z]/.test(originalPrompt),

    language,

    parserVersion: AI_CONFIG.VERSION,

    parserMode: "full",
  };
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function unique(values) {
  return [...new Set(values)];
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
