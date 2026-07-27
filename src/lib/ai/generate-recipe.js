// src/lib/ai/generate-recipe.js

import { INTENTS } from "./config";
import { detectLanguage } from "./language-detector";
import { parsePrompt } from "./prompt-parser";
import { extractEntities, hasAnyEntities } from "./entity-extractor";

import {
  createSession,
  resolveFollowUpEntities,
  updateContext,
  setLastSearchedRecipe,
  setLastSearchResults,
  recordTurn,
} from "./conversation-manager";

import {
  buildConstraints,
  getRecommendations,
  getRecommendationsForDish,
} from "./recommendation-engine";

import { buildResponse, buildNextRecipeResponse } from "./recipe-response";

/* -------------------------------------------------------------------------- */
/* Module Session                                                             */
/* -------------------------------------------------------------------------- */

let session = null;

function getSession() {
  if (!session) {
    session = createSession("en");
  }

  return session;
}

export function resetSession() {
  session = createSession("en");
  return session;
}

/* -------------------------------------------------------------------------- */
/* Session Rehydration                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Restore conversation memory after page refresh.
 *
 * Only user messages are replayed through:
 * Language Detection
 * ↓
 * Prompt Parsing
 * ↓
 * Entity Extraction
 * ↓
 * Context Update
 *
 * Recipe cards restore the last searched recipe without rerunning
 * recommendation logic.
 */

export function rehydrateSession(messages = []) {
  const restored = createSession("en");

  let lastRecipeCard = null;

  for (const msg of messages) {
    if (msg.role === "user" && msg.text) {
      const language = detectLanguage(msg.text, restored.language);

      restored.language = language;

      const parsed = parsePrompt(msg.text, {
        language,
      });

      const entities = extractEntities(msg.text, {
        language,
      });

      const isSearchIntent =
        parsed.intent === INTENTS.RECIPE_SEARCH ||
        parsed.intent === INTENTS.INGREDIENT_SEARCH;

      if (isSearchIntent && hasAnyEntities(entities)) {
        const effectiveEntities = resolveFollowUpEntities(
          restored,
          parsed,
          entities,
        );

        updateContext(restored, effectiveEntities);
      }

      recordTurn(restored, {
        userText: msg.text,
        assistantText: "",
        intent: parsed.intent,
        entities: hasAnyEntities(entities) ? entities : null,
      });

      restored.previousIntent = parsed.intent;
    }

    if (msg.role === "ai" && msg.isRecipeCard && msg.recipe) {
      lastRecipeCard = msg.recipe;
    }
  }

  if (lastRecipeCard) {
    setLastSearchedRecipe(restored, lastRecipeCard);
  }

  session = restored;

  return session;
}

/* -------------------------------------------------------------------------- */
/* Greeting Detection                                                         */
/* -------------------------------------------------------------------------- */

const ISLAMIC_GREETING_PATTERN =
  /আসসালামু আলাইকুম|আসসালামু আলাইকুম ওয়া রহমাতুল্লাহ|assalamu alaikum|assalamualaikum/i;

function isIslamicGreeting(text = "") {
  return ISLAMIC_GREETING_PATTERN.test(text);
}

/* -------------------------------------------------------------------------- */
/* Main Generator                                                             */
/* -------------------------------------------------------------------------- */

export function generateRecipe(rawText, { debug = true } = {}) {
  const currentSession = getSession();

  try {
    const language = detectLanguage(rawText, currentSession.language);

    currentSession.language = language;

    const parsed = parsePrompt(rawText, {
      language,
    });

    if (parsed.intent === INTENTS.SHOW_NEXT_RECIPE) {
      const recipes = currentSession.context.lastSearchResults || [];
      const nextIndex = currentSession.context.currentRecipeIndex + 1;

      if (nextIndex >= recipes.length) {
        return {
          success: true,
          language,
          assistant: {
            message:
              language === "bn"
                ? "বর্তমান অনুসন্ধানের জন্য আর কোনো রেসিপি নেই। আপনি চাইলে অন্য কোনো খাবার, উপকরণ বা রান্নার ধরন দিয়ে আবার খুঁজে দেখতে পারেন।"
                : "There are no more recipes for your current search. Try searching for another dish, ingredient, or cuisine.",
            recommendation: null,
            explanation: null,
            followUp: null,
          },
          recipes: [],
          suggestions: [],
        };
      }

      const nextRecipe = recipes[nextIndex];

      currentSession.context.currentRecipeIndex = nextIndex;
      setLastSearchedRecipe(currentSession, nextRecipe);

      return buildNextRecipeResponse(nextRecipe, language);
    }

    // If there is no previous recipe, follow-up intents should become recipe searches.
    const followUpIntents = [
      INTENTS.SHOW_INGREDIENTS,
      INTENTS.SHOW_TIME,
      INTENTS.SHOW_DIFFICULTY,
      INTENTS.SHOW_ORIGIN,
      INTENTS.SHOW_EQUIPMENT,
      INTENTS.SHOW_STEPS,
      INTENTS.SHOW_NUTRITION,
    ];

    const hasRecipeContext = !!currentSession.context.lastSearchedRecipe;

    if (followUpIntents.includes(parsed.intent) && !hasRecipeContext) {
      parsed.intent = INTENTS.RECIPE_SEARCH;
    }

    const rawEntities = extractEntities(rawText, {
      language,
    });

    const effectiveEntities = resolveFollowUpEntities(
      currentSession,
      parsed,
      rawEntities,
    );

    const hasRawEntities = hasAnyEntities(rawEntities);

    if (
      parsed.intent === INTENTS.RECIPE_SEARCH &&
      !hasRawEntities &&
      !effectiveEntities.inheritedFromContext
    ) {
      return buildResponse({
        intent: INTENTS.UNKNOWN,
        parsed,
        session: currentSession,
        language,
      });
    }

    const isSearchIntent =
      parsed.intent === INTENTS.RECIPE_SEARCH ||
      parsed.intent === INTENTS.INGREDIENT_SEARCH;

    const hasEffectiveEntities = hasAnyEntities(effectiveEntities);

    const shouldSearch =
      isSearchIntent &&
      (hasRawEntities || effectiveEntities.inheritedFromContext === true);

    // These MUST always exist to avoid runtime ReferenceError.
    let constraints = null;
    let searchResult = null;
    if (shouldSearch && hasEffectiveEntities) {
      constraints = {
        ...buildConstraints(effectiveEntities),
        query: rawText,
      };

      searchResult = effectiveEntities.dish
        ? getRecommendationsForDish(effectiveEntities.dish, constraints, {
            language,
          })
        : getRecommendations(constraints, { language });

      updateContext(currentSession, effectiveEntities);

      if (searchResult.results.length > 0) {
        setLastSearchResults(currentSession, searchResult.results);
        setLastSearchedRecipe(currentSession, searchResult.results[0]);
      }
    }

    const response = buildResponse({
      intent: parsed.intent,
      parsed,
      session: currentSession,
      language,
      searchResult,
      constraints,
      lastRecipe: currentSession.context.lastSearchedRecipe,
      isIslamicGreeting:
        parsed.intent === INTENTS.GREETING && isIslamicGreeting(rawText),
    });

    const assistantText = [
      response.assistant?.message,
      response.assistant?.recommendation,
    ]
      .filter(Boolean)
      .join(" ");

    recordTurn(currentSession, {
      userText: rawText,
      assistantText,
      intent: parsed.intent,
      entities: hasAnyEntities(rawEntities) ? rawEntities : null,
    });

    if (debug) {
      // eslint-disable-next-line no-console
      console.group("[MealMuse Debug]");

      // eslint-disable-next-line no-console
      console.log("Language:", language);

      // eslint-disable-next-line no-console
      console.log("Intent:", parsed.intent);

      // eslint-disable-next-line no-console
      console.log("Raw Entities:", rawEntities);

      // eslint-disable-next-line no-console
      console.log("Effective Entities:", effectiveEntities);

      // eslint-disable-next-line no-console
      console.log("Constraints:", constraints);

      // eslint-disable-next-line no-console
      console.log("Search Result:", searchResult);

      // eslint-disable-next-line no-console
      console.log("Recipe Count:", searchResult?.results?.length ?? 0);

      // eslint-disable-next-line no-console
      console.log("Fallback:", searchResult?.isFallback ?? false);

      // eslint-disable-next-line no-console
      console.groupEnd();
    }

    return response;
  } catch (error) {
    if (debug) {
      // eslint-disable-next-line no-console
      console.error("[MealMuse Error]", error);
    }

    const fallbackLanguage = currentSession?.language || "en";

    return {
      success: false,
      language: fallbackLanguage,

      assistant: {
        message:
          fallbackLanguage === "bn"
            ? "দুঃখিত, একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।"
            : "Something went wrong. Please try again.",

        recommendation: null,
        explanation: null,
        followUp: null,
      },

      recipes: [],
      suggestions: [],
    };
  }
}
