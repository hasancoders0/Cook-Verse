// src/lib/ai/conversation-manager.js

import { INTENTS, MEMORY_CONFIG } from "./config";
import { looksLikeRefinement } from "./prompt-parser";
import {
  createMemoryStore,
  pushHistoryEntry,
  getRecentHistory,
} from "./recipe-memory";

/* -------------------------------------------------------------------------- */
/* Session Shape                                                              */
/* -------------------------------------------------------------------------- */

/**
 * A session object looks like:
 * {
 *   language: "en" | "bn",
 *   previousIntent: INTENTS.* | null,
 *   context: {
 *     lastSearchedRecipe: object | null,   // full recipe object
 *     lastMentionedIngredients: string[],  // normalized ingredient slugs
 *     selectedCuisine: string | null,      // cuisine slug
 *     selectedCategory: string | null,     // category slug
 *     selectedDifficulty: string | null,
 *     lastTimeConstraint: number | null,   // minutes
 *     lastDiet: string | null,
 *     updatedAt: number,                   // timestamp for TTL checks
 *   },
 *   memory: MemoryStore,  // from recipe-memory.js — full turn history (FIFO)
 * }
 */

export function createSession(language = "en") {
  return {
    language,
    previousIntent: null,
    context: emptyContext(),
    memory: createMemoryStore(MEMORY_CONFIG.MAX_HISTORY),
  };
}

function emptyContext() {
  return {
    lastSearchedRecipe: null,
    lastMentionedIngredients: [],
    selectedCuisine: null,
    selectedCategory: null,
    selectedDifficulty: null,
    lastTimeConstraint: null,
    lastDiet: null,
    updatedAt: Date.now(),
  };
}

/* -------------------------------------------------------------------------- */
/* Context Freshness                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Returns true if the session's stored context is still "fresh" enough
 * to auto-apply to a follow-up message (per MEMORY_CONFIG.CONTEXT_TTL_MS).
 */
export function isContextFresh(session) {
  if (!session?.context?.updatedAt) return false;
  return Date.now() - session.context.updatedAt <= MEMORY_CONFIG.CONTEXT_TTL_MS;
}

/**
 * Reset only the "active search" context, keeping history/memory intact.
 * Used when the user clearly starts a brand-new topic.
 */
export function resetContext(session) {
  session.context = emptyContext();
  return session;
}

/* -------------------------------------------------------------------------- */
/* Turn Recording                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Record a completed user+assistant turn into memory (FIFO-capped) and
 * update `previousIntent` for next time.
 */
export function recordTurn(
  session,
  { userText, intent, assistantText, entities },
) {
  pushHistoryEntry(session.memory, {
    role: "user",
    text: userText,
    intent,
    entities: entities || null,
    timestamp: Date.now(),
  });

  pushHistoryEntry(session.memory, {
    role: "ai",
    text: assistantText,
    timestamp: Date.now(),
  });

  session.previousIntent = intent;
  return session;
}

/**
 * Return the last N turns for context-aware processing (e.g. resolving
 * pronouns like "that one" or "the second recipe").
 */
export function getRecentTurns(session, limit = MEMORY_CONFIG.CONTEXT_WINDOW) {
  return getRecentHistory(session.memory, limit);
}

/* -------------------------------------------------------------------------- */
/* Context Updates (called after entity-extractor / recipe-matcher run)      */
/* -------------------------------------------------------------------------- */

/**
 * Merge newly extracted entities into the session's active context.
 * Only overwrites fields that were actually present in `entities` —
 * everything else in the context is preserved, so a follow-up like
 * "Something spicy" (no ingredients mentioned) keeps the previously
 * stored ingredients intact.
 */
export function updateContext(session, entities = {}) {
  const ctx = session.context;

  if (entities.ingredients?.length) {
    ctx.lastMentionedIngredients = entities.ingredients;
  }
  if (entities.cuisine) {
    ctx.selectedCuisine = entities.cuisine;
  }
  if (entities.category) {
    ctx.selectedCategory = entities.category;
  }
  if (entities.difficulty) {
    ctx.selectedDifficulty = entities.difficulty;
  }
  if (entities.time != null) {
    ctx.lastTimeConstraint = entities.time;
  }
  if (entities.diet) {
    ctx.lastDiet = entities.diet;
  }

  ctx.updatedAt = Date.now();
  return session;
}

/**
 * Store the top recipe result from the latest search as "last searched",
 * so a follow-up like "show me the cooking steps" can resolve without
 * the user repeating the dish name.
 */
export function setLastSearchedRecipe(session, recipe) {
  session.context.lastSearchedRecipe = recipe || null;
  session.context.updatedAt = Date.now();
  return session;
}

/* -------------------------------------------------------------------------- */
/* Follow-up Resolution                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Decide whether the current parsed prompt should inherit context from
 * the previous turn, and if so, return the merged entity set to search
 * with. This is the core of your "Something spicy" -> carries forward
 * `chicken` example.
 *
 * @param session   current session
 * @param parsed    output of parsePrompt()
 * @param extracted entities already pulled from THIS message by
 *                  entity-extractor.js (may be partial/empty)
 *
 * Returns the effective entity set to run the search with.
 */
export function resolveFollowUpEntities(session, parsed, extracted = {}) {
  const isSearchLike =
    parsed.intent === INTENTS.RECIPE_SEARCH ||
    parsed.intent === INTENTS.INGREDIENT_SEARCH;

  if (!isSearchLike) {
    return extracted;
  }

  const shouldInheritContext =
    isContextFresh(session) && looksLikeRefinement(parsed);

  if (!shouldInheritContext) {
    return extracted;
  }

  const ctx = session.context;

  return {
    ingredients: extracted.ingredients?.length
      ? extracted.ingredients
      : ctx.lastMentionedIngredients,
    cuisine: extracted.cuisine ?? ctx.selectedCuisine,
    category: extracted.category ?? ctx.selectedCategory,
    difficulty: extracted.difficulty ?? ctx.selectedDifficulty,
    time: extracted.time ?? ctx.lastTimeConstraint,
    diet: extracted.diet ?? ctx.lastDiet,
    dish: extracted.dish ?? null, // dish name never inherited from context
    inheritedFromContext: true,
  };
}

function hasNoNewEntities(entities = {}) {
  return (
    !entities.ingredients?.length &&
    !entities.cuisine &&
    !entities.category &&
    !entities.difficulty &&
    entities.time == null &&
    !entities.diet &&
    !entities.dish
  );
}

/* -------------------------------------------------------------------------- */
/* Repetition Avoidance                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Check if the assistant is about to send the exact same response text
 * as its last message — used by recipe-response.js to trigger a
 * reworded variant instead of a verbatim repeat.
 */
export function wasLastAssistantMessage(session, text) {
  const recent = getRecentTurns(session, 2);
  const lastAi = [...recent].reverse().find((turn) => turn.role === "ai");
  return lastAi?.text === text;
}

/**
 * Track whether the user is repeating the same question (same intent +
 * same tokens as last time), so recipe-response.js can vary phrasing.
 */
export function isRepeatedUserIntent(session, parsed) {
  return session.previousIntent === parsed.intent;
}
