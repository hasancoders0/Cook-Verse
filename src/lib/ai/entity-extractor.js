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
 * Words too common in recipe queries to be useful as standalone
 * entity matches.  Kept minimal and recipe-domain-specific to avoid
 * accidentally filtering real ingredient or cuisine names.
 */
// src/lib/ai/entity-extractor.js
// Find the STOP_WORDS Set (around line 30-70) and update it:

const STOP_WORDS = new Set([
  /* Articles & prepositions */
  "a", "an", "the", "of", "in", "for", "on", "with", "at", "by", "from", "as", "into", "to",
  "and", "but", "or", "not",
  
  /* Pronouns */
  "i", "me", "my", "we", "our", "you", "your", "he", "him", "his", "she", "her", "it", "its",
  "they", "them", "their",
  
  /* Auxiliary & linking verbs */
  "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
  "will", "would", "could", "should", "can", "shall", "may", "might",
  
  /* Common query verbs — never ingredient/cuisine names */
  "make", "cook", "want", "like", "give", "show", "tell", "need", "try", "use", "get", "find",
  "please", "know", "think", "looking", "search", "suggest", "recommend",
  
  /* Fillers */
  "some", "any", "something", "anything", "very", "just", "also", "really", "much", "many",
  "more", "most", "other", "than", "then", "how", "what", "which", "where", "when", "who",
  
  /* Recipe-context generics */
  "recipe", "recipes", "dish", "dishes", "food", "meal",
  
  /* --- NEW: Additional filler words to filter out --- */
  // Greetings
  "hello", "hi", "hey", "good", "morning", "afternoon", "evening", "night", "welcome",
  
  // Question words not already covered
  "why", "whose", "whom",
  
  // Common misspellings/variants
  "prefer", "preffer", "prefers", "preferred", "preferring", "want", "wants", "wanted",
  
  // Time-related fillers
  "today", "tomorrow", "yesterday", "now", "then",
  
  // "etc", "etcetera", "and so on", etc.
  "etc", "etcetera", "so",
  
  // Common filler phrases
  "like", "maybe", "perhaps", "probably", "definitely", "certainly",
  
  // "Launch" - common typo for lunch
  "launch", "launches", "launched",
]);

// Also update the MIN_TOKEN_LENGTH to filter out very short tokens
// Find where AI_CONFIG.THRESHOLD.MIN_TOKEN_LENGTH is used and ensure it's at least 3

/* -------------------------------------------------------------------------- */
/* Extract Entities                                                           */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Accepts a parsed prompt object (from prompt-parser) and an optional        */
/* entity index (from entity-index).                                          */
/*                                                                            */
/* When the index is provided and non-empty, index-based extraction runs      */
/* first (exact → partial → fuzzy).  Regardless of the index, a fallback     */
/* always injects meaningful prompt tokens as searchTerms so downstream       */
/* stages have raw material to work with even when the index is absent        */
/* or incomplete.                                                             */
/*                                                                            */
/* Output shape (backward-compatible with normalizeEntities):                */
/*   { ingredients: string[], cuisines: string[], ..., metadata: {} }        */
/*                                                                            */

export function extractEntities(parsed, entityIndex) {
  /* Pipeline gate */
  if (AI_CONFIG.PIPELINE.ENTITY_EXTRACTION === false) {
    return createEmptyResult("skipped");
  }

  /* Defensive: reject raw strings.  The pipeline should always pass
     a parsed object.  Once generate-recipe.js is rewritten this guard
     can be tightened to an assertion. */
  if (typeof parsed === "string" || !parsed) {
    return createEmptyResult("invalid_input");
  }

  const prompt =
    parsed.normalizedPrompt || normalizeText(parsed.originalPrompt);

  if (!prompt) {
    return createEmptyResult("empty_prompt");
  }

  const entities = createEntityResult();

  const context = buildMatchContext(parsed, prompt);

  /* Stage 1 — Index-based extraction (exact → partial → fuzzy) */
  if (entityIndex && hasIndexData(entityIndex)) {
    runIndexExtraction(context, entityIndex, entities);
  }

  /* Stage 2 — Fallback: inject prompt tokens as searchTerms so the
     matcher always has material, even without a proper index. */
  runFallbackExtraction(context, entities, entityIndex);

  return finalizeEntities(entities);
}

/* -------------------------------------------------------------------------- */
/* Match Context                                                              */
/* -------------------------------------------------------------------------- */

function buildMatchContext(parsed, prompt) {
  const tokens = parsed.tokens?.length ? parsed.tokens : tokenize(prompt);

  return {
    prompt,
    tokens,
    tokenSet: new Set(tokens),
    language: parsed.language ?? AI_CONFIG.LANGUAGE.DEFAULT,
    intent: parsed.intent ?? null,
    mealType: parsed.mealType ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/* Index-Based Extraction                                                     */
/* -------------------------------------------------------------------------- */

function runIndexExtraction(context, entityIndex, entities) {
  for (const collection of ENTITY_COLLECTIONS) {
    const source = entityIndex[collection];

    if (!Array.isArray(source) || source.length === 0) {
      continue;
    }

    const fuzzyEnabled = isFuzzyEnabledForCollection(collection);

    for (const value of source) {
      if (!value || typeof value !== "string") {
        continue;
      }

      const result = matchEntity(context, value, fuzzyEnabled);

      if (result.matched) {
        entities[collection].push({
          value,
          matchType: result.type,
          confidence: result.confidence,
        });
      }
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Fallback Extraction                                                        */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Adds meaningful prompt tokens as searchTerms when the index doesn't       */
/* cover them.  Skips tokens already captured by index extraction,           */
/* stop words, and tokens shorter than MIN_TOKEN_LENGTH.                     */
/*                                                                            */

function runFallbackExtraction(context, entities, entityIndex) {
  const indexedValues = new Set();

  if (entityIndex && hasIndexData(entityIndex)) {
    for (const collection of ENTITY_COLLECTIONS) {
      const source = entityIndex[collection];
      if (Array.isArray(source)) {
        for (const value of source) {
          if (value) indexedValues.add(value);
        }
      }
    }
  }

  for (const collection of ENTITY_COLLECTIONS) {
    for (const entry of entities[collection]) {
      indexedValues.add(entry.value);
    }
  }

  // Only add tokens that are at least 3 characters AND not in stop words
  const minLen = AI_CONFIG.THRESHOLD.MIN_TOKEN_LENGTH || 3;
  
  for (const token of context.tokens) {
    // Skip tokens that are too short, in stop words, or already indexed
    if (token.length < minLen) continue;
    if (STOP_WORDS.has(token)) continue;
    if (indexedValues.has(token)) continue;
    
    // Skip tokens that are just numbers
    if (/^\d+$/.test(token)) continue;
    
    // Skip tokens that are common filler like "etc"
    if (token === 'etc' || token === 'etcetera') continue;
    
    entities.searchTerms.push({
      value: token,
      matchType: "token",
      confidence: 0.3,
    });
  }
}

function isExcludedToken(token, indexedValues) {
  if (token.length < AI_CONFIG.THRESHOLD.MIN_TOKEN_LENGTH) {
    return true;
  }

  if (STOP_WORDS.has(token)) {
    return true;
  }

  if (indexedValues.has(token)) {
    return true;
  }

  return false;
}

/* -------------------------------------------------------------------------- */
/* Entity Matching Pipeline                                                   */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Three-tier matching, ordered by precision:                                 */
/*                                                                            */
/*   1. Exact   — full phrase with word boundaries in the prompt             */
/*   2. Partial — for multi-word entities, enough significant words         */
/*               from the entity appear in the prompt                        */
/*   3. Fuzzy   — Levenshtein similarity above the configured threshold     */
/*                                                                            */

function matchEntity(context, entity, fuzzyEnabled) {
  /* --- Tier 1: Exact phrase match --- */
  if (exactPhraseMatch(context.prompt, entity)) {
    return { matched: true, type: "exact", confidence: 1.0 };
  }

  /* --- Tier 2: Partial word match (multi-word entities only) --- */
  const words = entity.split(/\s+/).filter(Boolean);

  if (words.length > 1) {
    if (partialWordMatch(context.tokenSet, words)) {
      return { matched: true, type: "partial", confidence: 0.6 };
    }
  }

  /* --- Tier 3: Fuzzy match (typo-tolerant) --- */
  if (fuzzyEnabled) {
    const score = fuzzyMatch(context.tokens, entity);

    if (score !== null) {
      return { matched: true, type: "fuzzy", confidence: score };
    }
  }

  return { matched: false, type: null, confidence: 0 };
}

/* -------------------------------------------------------------------------- */
/* Tier 1 — Exact Phrase Match                                               */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Uses Unicode-aware word-boundary regex so it works with Bangla,          */
/* accented characters, etc.                                                 */
/*                                                                            */

function exactPhraseMatch(prompt, phrase) {
  if (!prompt || !phrase) {
    return false;
  }

  const escaped = escapeRegex(phrase);

  const regex = new RegExp(
    `(^|[^\\p{L}\\p{N}])${escaped}(?=[^\\p{L}\\p{N}]|$)`,
    "iu",
  );

  return regex.test(prompt);
}

/* -------------------------------------------------------------------------- */
/* Tier 2 — Partial Word Match                                                */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* A multi-word entity like "ground beef" matches if at least half of       */
/* its significant words (non-stop-words, >= MIN_TOKEN_LENGTH) appear       */
/* in the prompt's token set.                                                */
/*                                                                            */

function partialWordMatch(tokenSet, words) {
  const significant = words.filter(
    (w) =>
      w.length >= AI_CONFIG.THRESHOLD.MIN_TOKEN_LENGTH && !STOP_WORDS.has(w),
  );

  if (significant.length === 0) {
    return false;
  }

  const matchedCount = significant.filter((w) => tokenSet.has(w)).length;

  return matchedCount >= Math.ceil(significant.length / 2);
}

/* -------------------------------------------------------------------------- */
/* Tier 3 — Fuzzy Match                                                       */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Compares each prompt token against the entity using normalised            */
/* Levenshtein similarity.  A length-ratio pre-filter skips pairs that      */
/* can't possibly meet the threshold, avoiding unnecessary distance          */
/* calculations.                                                             */
/*                                                                            */

function fuzzyMatch(tokens, entity) {
  const minLen = AI_CONFIG.FUZZY.MIN_SIMILARITY_MIN_LENGTH;
  const threshold = AI_CONFIG.FUZZY.MIN_SIMILARITY;
  const maxEdit = AI_CONFIG.FUZZY.MAX_EDIT_DISTANCE;

  let bestScore = 0;

  for (const token of tokens) {
    /* Skip tokens too short for meaningful fuzzy comparison */
    if (token.length < minLen) {
      continue;
    }

    /* Length-ratio pre-filter: if the length difference is too large
       relative to the threshold, the edit distance can't possibly
       meet it.  Saves work on obviously mismatched pairs. */
    const shorter = Math.min(token.length, entity.length);
    const longer = Math.max(token.length, entity.length);

    if (longer > 0 && shorter / longer < threshold) {
      continue;
    }

    /* Quick upper-bound check via max edit distance */
    if (Math.abs(token.length - entity.length) > maxEdit) {
      continue;
    }

    const score = levenshteinSimilarity(token, entity);

    if (score > bestScore) {
      bestScore = score;
    }
  }

  return bestScore >= threshold ? bestScore : null;
}

/* -------------------------------------------------------------------------- */
/* Levenshtein Distance (single-row DP)                                      */
/* -------------------------------------------------------------------------- */

function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;

  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array(n + 1);

  for (let j = 0; j <= n; j++) {
    prev[j] = j;
  }

  for (let i = 1; i <= m; i++) {
    const curr = new Array(n + 1);
    curr[0] = i;

    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] !== b[j - 1] ? 1 : 0;

      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }

    prev = curr;
  }

  return prev[n];
}

function levenshteinSimilarity(a, b) {
  if (a === b) return 1;

  const maxLen = Math.max(a.length, b.length);

  if (maxLen === 0) return 1;

  return 1 - levenshteinDistance(a, b) / maxLen;
}

/* -------------------------------------------------------------------------- */
/* Entity Result                                                              */
/* -------------------------------------------------------------------------- */

function createEntityResult() {
  const result = {};

  for (const collection of ENTITY_COLLECTIONS) {
    result[collection] = [];
  }

  result.metadata = {
    totalEntities: 0,
    confidence: 0,
    collections: [],
    matchTypes: { exact: 0, partial: 0, fuzzy: 0, token: 0 },
    extractionMode: null,
  };

  return result;
}

function createEmptyResult(reason) {
  const result = createEntityResult();
  result.metadata.extractionMode = reason;
  return result;
}

/* -------------------------------------------------------------------------- */
/* Finalize                                                                   */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Deduplicates entities (keeping highest-confidence match) and strips        */
/* internal match metadata so the output is plain string arrays —            */
/* the shape normalizeEntities expects.                                      */
/*                                                                            */

function finalizeEntities(entities) {
  const matchTypes = { exact: 0, partial: 0, fuzzy: 0, token: 0 };

  for (const collection of ENTITY_COLLECTIONS) {
    entities[collection] = deduplicateByValue(entities[collection]);

    for (const entry of entities[collection]) {
      /* After dedup, entries are plain strings — count was already
         tracked before stripping.  We count from the pre-strip array. */
    }
  }

  /* Count match types from the raw (pre-strip) data.
     We do this before the loop above strips metadata, so we need
     to count first, then strip.  Refactored: */

  return finalizeWithCounts(entities);
}

function finalizeWithCounts(entities) {
  const matchTypes = { exact: 0, partial: 0, fuzzy: 0, token: 0 };
  const totalEntities = { count: 0 };

  for (const collection of ENTITY_COLLECTIONS) {
    /* Count match types before stripping */
    for (const entry of entities[collection]) {
      if (matchTypes[entry.matchType] !== undefined) {
        matchTypes[entry.matchType]++;
      }
      totalEntities.count++;
    }

    /* Deduplicate: keep highest-confidence match per value,
       return plain string for backward compatibility */
    entities[collection] = deduplicateByValue(entities[collection]);
  }

  entities.metadata = {
    totalEntities: totalEntities.count,
    confidence: calculateConfidence(totalEntities.count, matchTypes),
    collections: ENTITY_COLLECTIONS.filter((c) => entities[c].length > 0),
    matchTypes,
    extractionMode: "full",
  };

  return entities;
}

/* -------------------------------------------------------------------------- */
/* Deduplication                                                              */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* When the same value matches via multiple tiers (e.g. exact + fuzzy),     */
/* keep only the highest-confidence occurrence.  Output is plain strings     */
/* so normalizeEntities can call String(value) safely.                       */
/*                                                                            */

function deduplicateByValue(entries) {
  const map = new Map();

  for (const entry of entries) {
    const existing = map.get(entry.value);

    if (!existing || entry.confidence > existing.confidence) {
      map.set(entry.value, entry);
    }
  }

  return [...map.values()].map((entry) => entry.value);
}

/* -------------------------------------------------------------------------- */
/* Confidence                                                                 */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Weighted average across match types:                                       */
/*   exact  = 1.0   partial = 0.6   fuzzy = 0.5   token = 0.3              */
/* Result clamped to 0–100.                                                  */
/*                                                                            */

function calculateConfidence(total, types) {
  if (total === 0) return 0;

  const weightedSum =
    types.exact * 1.0 +
    types.partial * 0.6 +
    types.fuzzy * 0.5 +
    types.token * 0.3;

  const raw = weightedSum / total;

  return Math.min(100, Math.round(raw * 100));
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function hasIndexData(entityIndex) {
  if (!entityIndex || typeof entityIndex !== "object") {
    return false;
  }

  return ENTITY_COLLECTIONS.some(
    (c) => Array.isArray(entityIndex[c]) && entityIndex[c].length > 0,
  );
}

function isFuzzyEnabledForCollection(collection) {
  if (!AI_CONFIG.FUZZY.ENABLED) {
    return false;
  }

  if (!Array.isArray(AI_CONFIG.FUZZY.APPLY_TO)) {
    return false;
  }

  return AI_CONFIG.FUZZY.APPLY_TO.includes(collection);
}

function tokenize(text) {
  if (!text) return [];

  return [
    ...new Set(
      text
        .split(/\s+/)
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  ];
}

function normalizeText(value) {
  if (!value) return "";

  return String(value).trim().replace(/\s+/g, " ").toLowerCase();
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
