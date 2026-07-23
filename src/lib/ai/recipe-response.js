// src/lib/ai/recipe-response.js

import { INTENTS, RESPONSES, FALLBACK_SUGGESTIONS } from "./config";
import { getFormattedToday, isDayNameToday, formatNumber } from "@/lib/utils";
import {
  wasLastAssistantMessage,
  isRepeatedUserIntent,
} from "./conversation-manager";
import { countRecentRepeats } from "./recipe-memory";
import { buildDishSuggestions } from "./recommendation-engine";

/* -------------------------------------------------------------------------- */
/* Rewording Variants (for repetition avoidance)                            */
/* -------------------------------------------------------------------------- */

/**
 * Alternate phrasings for responses that might otherwise repeat
 * verbatim across turns. Keyed by the same RESPONSES key.
 */
const REPHRASE_VARIANTS = {
  GREETING: {
    en: ["Hey again! What are you in the mood to cook?", "Hi there! Ready to find another recipe?"],
    bn: ["আবার হ্যালো! আজ কী রান্না করতে মন চাইছে?", "হাই! আরেকটি রেসিপি খুঁজতে প্রস্তুত?"],
  },
  UNKNOWN: {
    en: ["I'm still not sure what you mean — try naming a dish, ingredient, or cuisine.", "Hmm, could you rephrase that? A dish name or ingredient works great."],
    bn: ["আমি এখনো ঠিক বুঝতে পারছি না — একটি খাবারের নাম, উপকরণ বা রান্নার ধরন বলে দেখুন।", "একটু অন্যভাবে বলবেন? খাবারের নাম বা উপকরণ দিলে সুবিধা হবে।"],
  },
  NO_MATCH: {
    en: ["Still no luck with that one — try a different ingredient or dish name?", "That one's not turning up matches. Want to try another ingredient?"],
    bn: ["এখনো কোনো মিল পাওয়া যায়নি — অন্য কোনো উপকরণ বা খাবারের নাম দিয়ে দেখুন?", "এটির সাথে মিল পাওয়া যাচ্ছে না। অন্য একটি উপকরণ দিয়ে চেষ্টা করবেন?"],
  },
  THANKS: {
    en: ["Anytime! Let me know if you want more recipe ideas.", "Happy to help — come back anytime for more recipes."],
    bn: ["যেকোনো সময়! আরও রেসিপির আইডিয়া চাইলে জানাবেন।", "সাহায্য করতে পেরে ভালো লাগলো — আবার আসবেন।"],
  },
};

/**
 * Pick a response variant, cycling through rephrase options when the
 * same response has already been sent recently, so the conversation
 * doesn't feel robotic on repeat questions.
 */
function pickVariedResponse(key, language, session) {
  const base = RESPONSES[key]?.[language] || RESPONSES[key]?.en || "";

  if (!session) return base;

  const repeatCount = countRecentRepeats(session.memory, base);
  const variants = REPHRASE_VARIANTS[key]?.[language] || REPHRASE_VARIANTS[key]?.en;

  if (repeatCount > 0 && variants?.length) {
    const index = (repeatCount - 1) % variants.length;
    return variants[index];
  }

  return base;
}

/* -------------------------------------------------------------------------- */
/* Conversational Intent Responses (non-recipe-search)                      */
/* -------------------------------------------------------------------------- */

function buildGreetingResponse(session, language, { isIslamicGreeting = false } = {}) {
  const message = isIslamicGreeting
    ? RESPONSES.GREETING_ISLAMIC[language] || RESPONSES.GREETING_ISLAMIC.en
    : pickVariedResponse("GREETING", language, session);

  return baseAssistantPayload({ message, language });
}

function buildIdentityResponse(language) {
  return baseAssistantPayload({
    message: RESPONSES.IDENTITY[language] || RESPONSES.IDENTITY.en,
    language,
  });
}

function buildCapabilitiesResponse(language) {
  return baseAssistantPayload({
    message: RESPONSES.CAPABILITIES[language] || RESPONSES.CAPABILITIES.en,
    language,
  });
}

function buildThanksResponse(session, language) {
  return baseAssistantPayload({
    message: pickVariedResponse("THANKS", language, session),
    language,
  });
}

function buildGoodbyeResponse(language, { casual = false } = {}) {
  const message = casual
    ? RESPONSES.GOODBYE_CASUAL[language] || RESPONSES.GOODBYE_CASUAL.en
    : RESPONSES.GOODBYE[language] || RESPONSES.GOODBYE.en;

  return baseAssistantPayload({ message, language });
}

function buildSmallTalkResponse(text, language) {
  const normalized = text.toLowerCase();

  if (normalized.includes("chatgpt") || normalized.includes("চ্যাটজিপিটি")) {
    return baseAssistantPayload({
      message: RESPONSES.NOT_CHATGPT[language] || RESPONSES.NOT_CHATGPT.en,
      language,
    });
  }

  if (normalized.includes("favorite") || normalized.includes("প্রিয়")) {
    return baseAssistantPayload({
      message: RESPONSES.NO_FAVORITE[language] || RESPONSES.NO_FAVORITE.en,
      language,
    });
  }

  return baseAssistantPayload({
    message: RESPONSES.NOT_GENERAL_QA[language] || RESPONSES.NOT_GENERAL_QA.en,
    language,
  });
}

/* -------------------------------------------------------------------------- */
/* Date / Day-check Responses                                                */
/* -------------------------------------------------------------------------- */

function buildDateResponse(language) {
  const today = getFormattedToday();

  const message =
    language === "bn"
      ? `আজ ${today.day.bn}, ${today.gregorian.bn}${today.hijri ? ` (হিজরি: ${today.hijri})` : ""}।`
      : `Today is ${today.day.en}, ${today.gregorian.en}${today.hijri ? ` (Hijri: ${today.hijri})` : ""}.`;

  return baseAssistantPayload({ message, language });
}

function buildDayCheckResponse(dayMention, language) {
  const today = getFormattedToday();
  const isCorrect = isDayNameToday(dayMention?.dayName, new Date());

  let message;

  if (isCorrect) {
    message =
      language === "bn"
        ? `হ্যাঁ, আজ ${today.day.bn}।`
        : `Yes, today is ${today.day.en}.`;
  } else {
    message =
      language === "bn"
        ? `আজ ${dayMention?.dayName} নয়।\nআজ ${today.day.bn}।`
        : `Today isn't ${dayMention?.dayName}.\nToday is ${today.day.en}.`;
  }

  return baseAssistantPayload({ message, language });
}

/* -------------------------------------------------------------------------- */
/* Recipe Search Responses                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Build the conversational response around a set of ranked recipe
 * results (from recommendation-engine.getRecommendations /
 * getRecommendationsForDish).
 *
 * @param results       ranked recipe array (with .score, .reasons)
 * @param isFallback    true if these are "closest match" recipes
 * @param constraints   the constraint set that was searched with
 * @param language      "en" | "bn"
 * @param session       conversation session (for inherited-context phrasing)
 */
function buildRecipeSearchResponse(results, isFallback, constraints, language, session) {
  if (!results.length) {
    return {
      ...baseAssistantPayload({
        message: pickVariedResponse("NO_MATCH", language, session),
        language,
      }),
      recipes: [],
      suggestions: FALLBACK_SUGGESTIONS[language] || FALLBACK_SUGGESTIONS.en,
    };
  }

  const top = results[0];
  const title = top.title?.[language] || top.title?.en;

  const intro = buildSearchIntro(constraints, language, { isFallback });
  const explanation = buildExplanation(top, language);
  const followUp = buildFollowUpPrompt(results, language);

  return {
    assistant: {
      message: intro,
      recommendation: null,
      explanation,
      followUp,
    },
    recipes: results,
    suggestions: buildDishSuggestions(results, language),
  };
}

/**
 * Build the opening line based on what was actually searched for —
 * mirrors the tone of your spec's examples ("দারুণ! আপনার কাছে মুরগি
 * ও আলু আছে...", "খুব ভালো পছন্দ!...").
 */
function buildSearchIntro(constraints, language, { isFallback }) {
  if (isFallback) {
    return language === "bn"
      ? "আজকের জন্য কিছু মজার রান্না খুঁজে বের করা যাক!"
      : "Let's find something fun to cook today!";
  }

  if (constraints.dish) {
    return language === "bn"
      ? "খুব ভালো পছন্দ! আমি কয়েকটি মিল থাকা রেসিপি পেয়েছি।"
      : "Great choice! I found a few matching recipes.";
  }

  if (constraints.ingredients?.length) {
    return language === "bn"
      ? "দারুণ! এই উপকরণ দিয়ে আমি কিছু রেসিপি খুঁজে পেয়েছি।"
      : "Nice! I found some recipes using what you have.";
  }

  if (constraints.cuisine) {
    return language === "bn"
      ? "অবশ্যই! আমি কয়েকটি জনপ্রিয় রেসিপি পেয়েছি।"
      : "Of course! I found a few popular matching recipes.";
  }

  if (constraints.diet) {
    return language === "bn"
      ? "ভালো সিদ্ধান্ত। আমি কিছু উপযুক্ত রেসিপি খুঁজে পেয়েছি।"
      : "Good choice. I found some recipes that fit.";
  }

  if (constraints.maxTime != null) {
    return language === "bn"
      ? `ঠিক আছে। আমি এমন রেসিপি দেখাচ্ছি যা প্রায় ${formatNumber(constraints.maxTime, "bn")} মিনিট বা তার কম সময়ে তৈরি করা যায়।`
      : `Got it. Here are recipes that take about ${constraints.maxTime} minutes or less.`;
  }

  return language === "bn"
    ? "আমি কয়েকটি মিল থাকা রেসিপি পেয়েছি।"
    : "I found a few matching recipes for you.";
}

/**
 * Brief "why this is recommended" line for the top result, per the
 * spec's "Always explain briefly why the top recipe is recommended."
 */
function buildExplanation(topRecipe, language) {
  if (!topRecipe?.reasons?.length) return null;
  return topRecipe.reasons.join(language === "bn" ? " এবং " : " and ");
}

/**
 * Prompt the user to pick one of the results, per your spec's
 * "আপনার পছন্দেরটি নির্বাচন করুন" pattern.
 */
function buildFollowUpPrompt(results, language) {
  if (results.length <= 1) return null;
  return language === "bn"
    ? "আপনার পছন্দেরটি নির্বাচন করুন, আমি সম্পূর্ণ রান্নার পদ্ধতি দেখিয়ে দেব।"
    : "Pick your favorite and I'll show you the full recipe.";
}

/* -------------------------------------------------------------------------- */
/* Unknown Intent                                                            */
/* -------------------------------------------------------------------------- */

function buildUnknownResponse(session, language) {
  return baseAssistantPayload({
    message: pickVariedResponse("UNKNOWN", language, session),
    language,
  });
}

/* -------------------------------------------------------------------------- */
/* Shared Payload Shape                                                      */
/* -------------------------------------------------------------------------- */

function baseAssistantPayload({ message, language, explanation = null, followUp = null }) {
  return {
    assistant: { message, recommendation: null, explanation, followUp },
    recipes: [],
    suggestions: [],
    language,
  };
}

/* -------------------------------------------------------------------------- */
/* Main Export                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Build the full response payload for a given intent + context.
 * This is the single entry point generate-recipe.js (the top-level
 * orchestrator called by HomeChat.jsx) should call once it has:
 *  - the detected intent
 *  - the parsed prompt (for dayMention, raw text, etc.)
 *  - the search results (if intent required a recipe search)
 *  - the session (for repetition-avoidance + language)
 *
 * Returns:
 * {
 *   success: boolean,
 *   language: "en" | "bn",
 *   assistant: { message, recommendation, explanation, followUp },
 *   recipes: RankedRecipe[],
 *   suggestions: string[],
 * }
 */
export function buildResponse({
  intent,
  parsed,
  session,
  language = "en",
  searchResult = null, // { results, isFallback } from recommendation-engine
  constraints = null,
  isIslamicGreeting = false,
}) {
  let payload;

  switch (intent) {
    case INTENTS.GREETING:
      payload = buildGreetingResponse(session, language, { isIslamicGreeting });
      break;

    case INTENTS.IDENTITY:
      payload = buildIdentityResponse(language);
      break;

    case INTENTS.CAPABILITIES:
      payload = buildCapabilitiesResponse(language);
      break;

    case INTENTS.DATE:
      payload = buildDateResponse(language);
      break;

    case INTENTS.DAY_CHECK:
      payload = buildDayCheckResponse(parsed?.dayMention, language);
      break;

    case INTENTS.THANKS:
      payload = buildThanksResponse(session, language);
      break;

    case INTENTS.GOODBYE:
      payload = buildGoodbyeResponse(language, {
        casual: /পরে কথা হবে|talk later|see you/.test(parsed?.raw?.toLowerCase() || ""),
      });
      break;

    case INTENTS.SMALL_TALK:
      payload = buildSmallTalkResponse(parsed?.raw || "", language);
      break;

    case INTENTS.RECIPE_SEARCH:
    case INTENTS.INGREDIENT_SEARCH:
      payload = buildRecipeSearchResponse(
        searchResult?.results || [],
        searchResult?.isFallback ?? false,
        constraints || {},
        language,
        session,
      );
      break;

    default:
      payload = buildUnknownResponse(session, language);
      break;
  }

  return {
    success: true,
    language,
    ...payload,
  };
}