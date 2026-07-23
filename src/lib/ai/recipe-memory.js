// src/lib/ai/recipe-memory.js

import { MEMORY_CONFIG } from "./config";

/* -------------------------------------------------------------------------- */
/* Memory Store Shape                                                        */
/* -------------------------------------------------------------------------- */

/**
 * A memory store is a simple FIFO-capped ring buffer of turn entries:
 * {
 *   entries: HistoryEntry[],  // oldest first, newest last
 *   maxSize: number,
 * }
 *
 * HistoryEntry:
 * {
 *   role: "user" | "ai",
 *   text: string,
 *   intent?: string,          // only set on "user" entries
 *   entities?: object | null, // only set on "user" entries
 *   timestamp: number,
 * }
 */

export function createMemoryStore(maxSize = MEMORY_CONFIG.MAX_HISTORY) {
  return {
    entries: [],
    maxSize,
  };
}

/* -------------------------------------------------------------------------- */
/* Push / Evict (FIFO)                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Push a new entry into the store. If the store exceeds `maxSize`,
 * the oldest entry is evicted (FIFO) — this is the "Limit 200
 * conversation will remove FIFO system" behavior from the spec.
 */
export function pushHistoryEntry(store, entry) {
  if (!store || !entry) return store;

  store.entries.push({
    id: entry.id,

    role: entry.role,

    text: entry.text ?? "",

    recipes: entry.recipes ?? [],

    suggestions: entry.suggestions ?? [],

    entities: entry.entities ?? null,

    intent: entry.intent ?? null,

    metadata: entry.metadata ?? {},

    timestamp: entry.timestamp ?? Date.now(),
  });

  while (store.entries.length > store.maxSize) {
    store.entries.shift(); // evict oldest
  }

  return store;
}

/**
 * Clear all entries from a store, keeping its configured maxSize.
 */
export function clearMemoryStore(store) {
  if (!store) return store;
  store.entries = [];
  return store;
}

/* -------------------------------------------------------------------------- */
/* Reading History                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Return the last `limit` entries (both user + ai), oldest first,
 * preserving conversational order — useful for building a short
 * transcript window for context-aware processing.
 */
export function getRecentHistory(store, limit = MEMORY_CONFIG.CONTEXT_WINDOW) {
  if (!store?.entries?.length) return [];
  if (limit <= 0) return [];
  return store.entries.slice(-limit);
}

/**
 * Return the full history (up to maxSize) — mainly for debugging/export.
 */
export function getFullHistory(store) {
  return store?.entries ? [...store.entries] : [];
}

/**
 * Return only the user-authored entries from recent history.
 */
export function getRecentUserEntries(
  store,
  limit = MEMORY_CONFIG.CONTEXT_WINDOW,
) {
  return getRecentHistory(store, limit).filter(
    (entry) => entry.role === "user",
  );
}

/**
 * Return only the assistant-authored entries from recent history.
 */
export function getRecentAiEntries(
  store,
  limit = MEMORY_CONFIG.CONTEXT_WINDOW,
) {
  return getRecentHistory(store, limit).filter((entry) => entry.role === "ai");
}

/* -------------------------------------------------------------------------- */
/* Lookback Helpers                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Find the most recent user entry whose `intent` matches one of the
 * given intents. Useful for resolving "the same thing again" cases,
 * e.g. re-checking the last RECIPE_SEARCH after a DATE intent aside.
 */
export function findLastUserEntryByIntent(store, intents = []) {
  if (!store?.entries?.length) return null;
  const wanted = new Set(intents);

  for (let i = store.entries.length - 1; i >= 0; i--) {
    const entry = store.entries[i];
    if (entry.role === "user" && wanted.has(entry.intent)) {
      return entry;
    }
  }
  return null;
}

/**
 * Find the most recent user entry that had non-empty extracted entities
 * — used as a fallback context source if the session's structured
 * context object was somehow reset but history wasn't.
 */
export function findLastEntryWithEntities(store) {
  if (!store?.entries?.length) return null;

  for (let i = store.entries.length - 1; i >= 0; i--) {
    const entry = store.entries[i];
    if (
      entry.role === "user" &&
      entry.entities &&
      hasAnyEntityValue(entry.entities)
    ) {
      return entry;
    }
  }
  return null;
}

function hasAnyEntityValue(entities) {
  return Boolean(
    entities.ingredients?.length ||
    entities.dish ||
    entities.cuisine ||
    entities.category ||
    entities.diet ||
    entities.difficulty ||
    entities.time != null,
  );
}

/* -------------------------------------------------------------------------- */
/* Repetition Detection                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Count how many times the exact same assistant text was sent recently
 * (within the context window) — used to decide when a rephrase is
 * needed to avoid the "don't repeat the same response" rule.
 */
export function countRecentRepeats(
  store,
  text,
  limit = MEMORY_CONFIG.CONTEXT_WINDOW,
) {
  const recentAi = getRecentAiEntries(store, limit);
  return recentAi.filter((entry) => entry.text === text).length;
}

/**
 * Check whether the user's last N messages (by intent) look like the
 * same question asked repeatedly — a signal to vary response wording.
 */
export function isRepeatingSameIntent(store, currentIntent, lookback = 3) {
  const recentUser = getRecentUserEntries(store, lookback);
  if (recentUser.length < 2) return false;
  return recentUser.every((entry) => entry.intent === currentIntent);
}

/* -------------------------------------------------------------------------- */
/* Stats / Introspection                                                     */
/* -------------------------------------------------------------------------- */

export function getMemoryStats(store) {
  return {
    size: store?.entries?.length ?? 0,
    maxSize: store?.maxSize ?? MEMORY_CONFIG.MAX_HISTORY,
    isFull:
      (store?.entries?.length ?? 0) >=
      (store?.maxSize ?? MEMORY_CONFIG.MAX_HISTORY),
  };
}
