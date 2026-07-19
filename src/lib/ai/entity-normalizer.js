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

/* -------------------------------------------------------------------------- */
/* Entity Normalizer                                                          */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Cleans, validates, and deduplicates entity strings produced by the        */
/* entity-extractor before they reach the constraint-builder.                */
/*                                                                            */
/* This is a lightweight safety net — the extractor already normalizes       */
/* text.  The normalizer's real value is:                                    */
/*                                                                            */
/*   1. Filtering out edge-case values that survive extraction               */
/*   2. Re-deduplicating in case a future extractor change introduces        */
/*      duplicates before its own finalize step                              */
/*   3. Merging its own metadata with the extractor's metadata               */
/*      (instead of overwriting it)                                          */
/*   4. Providing a pipeline gate for debugging                              */
/*                                                                            */

export function normalizeEntities(entities) {
  /* Pipeline gate */
  if (AI_CONFIG.PIPELINE.ENTITY_NORMALIZATION === false) {
    return entities ?? createEmptyResult();
  }

  /* Defensive: accept null/undefined */
  if (!entities || typeof entities !== "object") {
    return createEmptyResult("invalid_input");
  }

  const normalized = createNormalizedResult();

  const log = createNormalizationLog();

  runNormalization(entities, normalized, log);

  return finalizeNormalization(normalized, entities.metadata, log);
}

/* -------------------------------------------------------------------------- */
/* Normalization Pipeline                                                     */
/* -------------------------------------------------------------------------- */

function runNormalization(entities, normalized, log) {
  const minLen = AI_CONFIG.THRESHOLD.MIN_TOKEN_LENGTH;

  for (const collection of ENTITY_COLLECTIONS) {
    const values = entities[collection];

    if (!Array.isArray(values) || values.length === 0) {
      continue;
    }

    for (const value of values) {
      const result = normalizeValue(value, minLen);

      if (result.dropped) {
        log.dropped++;
        log.droppedReasons[result.reason] =
          (log.droppedReasons[result.reason] ?? 0) + 1;
        continue;
      }

      if (result.normalized) {
        log.normalized++;
      }

      normalized[collection].push(result.value);
    }

    /* Deduplicate within collection */
    const before = normalized[collection].length;
    normalized[collection] = deduplicate(normalized[collection]);
    const removed = before - normalized[collection].length;

    if (removed > 0) {
      log.deduplicated += removed;
    }

    log.inputCounts[collection] = values.length;
    log.outputCounts[collection] = normalized[collection].length;
  }
}

/* -------------------------------------------------------------------------- */
/* Normalize Single Value                                                     */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Returns { value, normalized, dropped, reason }                             */
/*   - value:      the final string to keep                                  */
/*   - normalized: true if the value was modified during normalization       */
/*   - dropped:    true if the value should be discarded                     */
/*   - reason:     why it was dropped (only when dropped=true)              */
/*                                                                            */

function normalizeValue(value, minLen) {
  /* Reject non-strings early */
  if (typeof value !== "string") {
    return {
      value: "",
      normalized: false,
      dropped: true,
      reason: "non_string",
    };
  }

  const trimmed = value.trim();

  /* Reject empty / whitespace-only */
  if (!trimmed) {
    return { value: "", normalized: false, dropped: true, reason: "empty" };
  }

  const lowercased = trimmed.toLowerCase();

  /* Reject values that become too short after normalization.
     searchTerms can be short compound fragments (e.g. "bbq") so
     we only apply the length gate when called with a collection-
     specific minLen.  Here we use 0 (no gate) because the caller
     already filtered by minLen for non-searchTerm collections,
     and the extractor's fallback stage deliberately adds short
     tokens as searchTerms. */
  if (lowercased.length === 0) {
    return {
      value: "",
      normalized: false,
      dropped: true,
      reason: "empty_after_normalize",
    };
  }

  const wasModified = lowercased !== value;

  return {
    value: lowercased,
    normalized: wasModified,
    dropped: false,
    reason: null,
  };
}

/* -------------------------------------------------------------------------- */
/* Normalized Result                                                          */
/* -------------------------------------------------------------------------- */

function createNormalizedResult() {
  const result = {};

  for (const collection of ENTITY_COLLECTIONS) {
    result[collection] = [];
  }

  result.metadata = {
    totalEntities: 0,
    confidence: 0,
    collections: [],
  };

  return result;
}

function createEmptyResult(reason) {
  const result = createNormalizedResult();
  result.metadata.normalizationMode = reason;
  return result;
}

/* -------------------------------------------------------------------------- */
/* Finalize                                                                   */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Merges extraction metadata (from the extractor) with normalization        */
/* metadata instead of overwriting it.  The extractor's confidence is        */
/* authoritative — it considers match types.  The normalizer only adds       */
/* its own processing stats.                                                 */
/*                                                                            */

function finalizeNormalization(normalized, extractionMetadata, log) {
  const totalEntities = ENTITY_COLLECTIONS.reduce(
    (sum, c) => sum + normalized[c].length,
    0,
  );

  normalized.metadata = {
    /* Carry forward the extractor's confidence — it accounts for match
       types (exact/partial/fuzzy/token) and is more accurate than
       anything the normalizer could compute from plain strings. */
    confidence: extractionMetadata?.confidence ?? 0,

    totalEntities,

    collections: ENTITY_COLLECTIONS.filter((c) => normalized[c].length > 0),

    /* Normalizer-specific stats */
    normalization: {
      mode:
        log.dropped === 0 && log.deduplicated === 0 ? "passthrough" : "active",

      inputTotal: log.inputTotal,

      outputTotal: totalEntities,

      dropped: log.dropped,

      droppedReasons: { ...log.droppedReasons },

      deduplicated: log.deduplicated,

      modified: log.normalized,

      perCollection: ENTITY_COLLECTIONS.reduce((map, c) => {
        const input = log.inputCounts[c] ?? 0;
        const output = log.outputCounts[c] ?? 0;

        if (input > 0 || output > 0) {
          map[c] = { input, output };
        }

        return map;
      }, {}),
    },

    /* Preserve extractor metadata for full pipeline traceability */
    extraction: {
      mode: extractionMetadata?.extractionMode ?? null,

      matchTypes: extractionMetadata?.matchTypes ?? null,
    },

    normalizationMode: "full",
  };

  return normalized;
}

/* -------------------------------------------------------------------------- */
/* Normalization Log                                                          */
/* -------------------------------------------------------------------------- */

function createNormalizationLog() {
  return {
    inputTotal: 0,
    dropped: 0,
    deduplicated: 0,
    normalized: 0,
    droppedReasons: {},
    inputCounts: {},
    outputCounts: {},
  };
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function deduplicate(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return values;
  }

  return [...new Set(values)];
}
