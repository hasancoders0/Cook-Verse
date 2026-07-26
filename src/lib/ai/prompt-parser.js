// src/lib/ai/prompt-parser.js

import { INTENTS, INTENT_KEYWORDS, LANGUAGES } from "./config";
import {
  normalizeText,
  stripPunctuation,
  tokenize,
  fuzzyIncludes,
} from "@/lib/utils";
import { getDayName } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Day-name lookup (for DAY_CHECK intent, e.g. "আজ শুক্রবার?")               */
/* -------------------------------------------------------------------------- */

const DAY_NAME_LOOKUP = {
  en: {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  },
  bn: {
    রবিবার: 0,
    সোমবার: 1,
    মঙ্গলবার: 2,
    বুধবার: 3,
    বৃহস্পতিবার: 4,
    শুক্রবার: 5,
    শনিবার: 6,
  },
};

/**
 * Try to find a day name inside the text. Returns { dayIndex, language } or null.
 */
function findDayNameMention(text) {
  const normalized = normalizeText(text);

  for (const lang of [LANGUAGES.EN, LANGUAGES.BN]) {
    const table = DAY_NAME_LOOKUP[lang];
    for (const [name, index] of Object.entries(table)) {
      if (normalized.includes(name)) {
        return { dayIndex: index, dayName: name, language: lang };
      }
    }
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Intent Keyword Matching                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Check whether any keyword/phrase for a given intent+language appears in text.
 */
function matchesIntentKeywords(text, intent, language) {
  const phrases = INTENT_KEYWORDS[intent]?.[language] || [];
  const normalized = normalizeText(text);

  return phrases.some((phrase) => {
    const keyword = normalizeText(phrase);

    // Multi-word phrases still use substring matching
    if (keyword.includes(" ")) {
      return normalized.includes(keyword);
    }

    // Single-word keywords must match whole words only
    const words = normalized.split(/\s+/);
    return words.includes(keyword);
  });
}
function detectRecipeFollowUpIntent(text) {
  const normalized = normalizeText(text);
  const newRecipeWords = [
    "recipe",
    "রেসিপি",
    "চাই",
    "breakfast",
    "lunch",
    "dinner",
    "নাস্তা",
    "দুপুর",
    "রাতের",
  ];
  const followUpIntents = [
    INTENTS.SHOW_INGREDIENTS,
    INTENTS.SHOW_TIME,
    INTENTS.SHOW_DIFFICULTY,
    INTENTS.SHOW_ORIGIN,
    INTENTS.SHOW_EQUIPMENT,
    INTENTS.SHOW_STEPS,
    INTENTS.SHOW_NUTRITION,
    INTENTS.SHOW_NEXT_RECIPE,
  ];

  for (const intent of followUpIntents) {
    for (const language of [LANGUAGES.EN, LANGUAGES.BN]) {
      if (matchesIntentKeywords(normalized, intent, language)) {
        return intent;
      }
    }
  }

  if (newRecipeWords.some((word) => normalized.includes(word))) {
    return null;
  }
}
/**
 * Order matters: more specific intents should be checked before broader ones.
 * DAY_CHECK is checked before DATE since "is today Friday" contains no
 * explicit "date" keyword but implies a date-adjacent question.
 */
const INTENT_CHECK_ORDER = [
  INTENTS.GREETING,
  INTENTS.IDENTITY,
  INTENTS.CAPABILITIES,

  // Recipe follow-up actions
  INTENTS.SHOW_INGREDIENTS,
  INTENTS.SHOW_TIME,
  INTENTS.SHOW_DIFFICULTY,
  INTENTS.SHOW_ORIGIN,
  INTENTS.SHOW_EQUIPMENT,
  INTENTS.SHOW_STEPS,
  INTENTS.SHOW_NUTRITION,
  INTENTS.SHOW_NEXT_RECIPE,

  INTENTS.DATE,
  INTENTS.DAY_CHECK,
  INTENTS.THANKS,
  INTENTS.GOODBYE,
  INTENTS.SMALL_TALK,
];

/**
 * Detect the intent behind a user message.
 *
 * Recipe/ingredient search intents are NOT keyword-based — they're the
 * fallback once no conversational intent matches, disambiguated by
 * whether the message looks like an ingredient list or a dish/cuisine/
 * category request (entity-extractor.js will do the heavy lifting there;
 * here we just make a lightweight guess so recommendation-engine.js
 * knows which path to prefer).
 */
export function detectIntent(text, language = LANGUAGES.EN) {
  const trimmed = (text || "").trim();

  if (!trimmed) return INTENTS.UNKNOWN;

  // Check follow-up intent first
  const followUpIntent = detectRecipeFollowUpIntent(trimmed);

  // If the message explicitly asks for a NEW recipe,
  // ignore follow-up intents.
  if (followUpIntent) {
    const normalized = normalizeText(trimmed);

    const newRecipePatterns = [
      /রেসিপি/,
      /নাস্তা/,
      /লাঞ্চ/,
      /ডিনার/,
      /খাবার/,
      /\brecipe\b/i,
      /\bbreakfast\b/i,
      /\blunch\b/i,
      /\bdinner\b/i,
    ];

    const wantsNewRecipe = newRecipePatterns.some((pattern) =>
      pattern.test(normalized),
    );

    if (!wantsNewRecipe) {
      return followUpIntent;
    }
  }

  // DAY_CHECK
  const dayMention = findDayNameMention(trimmed);
  if (
    dayMention &&
    (trimmed.includes("?") ||
      matchesIntentKeywords(trimmed, INTENTS.DAY_CHECK, language))
  ) {
    return INTENTS.DAY_CHECK;
  }

  for (const intent of INTENT_CHECK_ORDER) {
    if (intent === INTENTS.DAY_CHECK) continue;
    if (matchesIntentKeywords(trimmed, intent, language)) {
      return intent;
    }
  }

  // Ingredient search
  if (looksLikeIngredientStatement(trimmed, language)) {
    return INTENTS.INGREDIENT_SEARCH;
  }

  // Default recipe search
  const tokens = tokenize(trimmed);
  if (tokens.length > 0) {
    return INTENTS.RECIPE_SEARCH;
  }

  return INTENTS.UNKNOWN;
}

/**
 * Cheap heuristic for "I have <ingredients>" style phrasing.
 */
function looksLikeIngredientStatement(text, language) {
  const normalized = normalizeText(text);

  const markers = {
    en: ["i have", "i've got", "i got"],
    bn: ["আমার কাছে", "আমার কাছে আছে", "কাছে আছে"],
  };

  const phrases = markers[language] || markers.en;
  return phrases.some((phrase) => normalized.includes(phrase));
}

/* -------------------------------------------------------------------------- */
/* Prompt Parsing (main export)                                              */
/* -------------------------------------------------------------------------- */

/**
 * Parse a raw user prompt into a structured object that downstream
 * modules (entity-extractor, conversation-manager, recommendation-engine)
 * can consume.
 *
 * Returns:
 * {
 *   raw: string,                 // original text, untouched
 *   cleaned: string,             // punctuation-stripped, whitespace-normalized
 *   tokens: string[],            // tokenized words
 *   language: "en" | "bn",
 *   intent: INTENTS.*,
 *   dayMention: { dayIndex, dayName, language } | null,
 *   isQuestion: boolean,
 * }
 */
export function parsePrompt(text = "", { language = LANGUAGES.EN } = {}) {
  const raw = String(text ?? "");
  const cleaned = stripPunctuation(normalizeText(raw));
  const tokens = tokenize(raw);
  const intent = detectIntent(raw, language);
  const dayMention = findDayNameMention(raw);
  const isQuestion = /\?/.test(raw) || isImplicitQuestion(raw, language);

  return {
    raw,
    cleaned,
    tokens,
    language,
    intent,
    dayMention,
    isQuestion,
  };
}

/**
 * Some Bangla questions don't use "?" consistently (e.g. "তুমি কে").
 * Detect common interrogative markers as a fallback signal.
 */
function isImplicitQuestion(text, language) {
  const normalized = normalizeText(text);

  const markers = {
    en: ["what", "who", "how", "when", "where", "which", "is it", "are you"],
    bn: ["কী", "কি", "কে", "কেন", "কখন", "কোথায়", "কোনটা"],
  };

  const phrases = markers[language] || markers.en;
  return phrases.some((phrase) => normalized.includes(phrase));
}

/* -------------------------------------------------------------------------- */
/* Fuzzy Intent Re-check (used by conversation-manager for follow-ups)       */
/* -------------------------------------------------------------------------- */

/**
 * Some follow-up messages are too short to re-detect intent reliably
 * ("Something spicy", "স্বাস্থ্যকর কিছু") — this helper flags whether a
 * parsed prompt looks like a "refinement" of a previous search rather
 * than a brand-new topic, so conversation-manager.js knows to merge
 * context instead of resetting it.
 */
export function looksLikeRefinement(parsed) {
  if (!parsed) return false;

  const { intent, tokens = [], raw = "" } = parsed;

  const isSearchIntent =
    intent === INTENTS.RECIPE_SEARCH || intent === INTENTS.INGREDIENT_SEARCH;

  if (!isSearchIntent) return false;

  const text = raw.toLowerCase().trim();

  // Only treat obvious follow-up/refinement phrases as refinements
  const refinementPatterns = [
    /\b(spicy|mild|hot|healthy|quick|easy|another|different|more|less|under)\b/i,
    /(ঝাল|কম ঝাল|মিষ্টি|স্বাস্থ্যকর|সহজ|আরেকটা|অন্য|দ্রুত|কম সময়)/,
  ];

  return (
    tokens.length > 0 &&
    tokens.length <= 3 &&
    refinementPatterns.some((pattern) => pattern.test(text))
  );
}
