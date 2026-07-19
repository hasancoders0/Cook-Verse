import { AI_CONFIG } from "./config";

/* -------------------------------------------------------------------------- */
/* Rank Recipes — Public API                                                  */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* const ranked = rankRecipes(matchResults, { limit: 5 });                   */
/*                                                                            */

export function rankRecipes(results = [], options = {}) {
  /* Pipeline gate */
  if (AI_CONFIG.PIPELINE.RECIPE_RANKING === false) {
    return results;
  }

  if (!Array.isArray(results) || results.length === 0) {
    return [];
  }

  const limit = resolveLimit(options);

  /* Work on a copy — never mutate the matcher's output array */
  const ranked = results.map(attachEmptyRank);

  runRankingPipeline(ranked, limit);

  return ranked;
}

/* -------------------------------------------------------------------------- */
/* Ranking Pipeline                                                           */
/* -------------------------------------------------------------------------- */

function runRankingPipeline(ranked, limit) {
  filterUnmatched(ranked);

  deduplicateById(ranked);

  sortByPriority(ranked);

  applyMatchQualityTiebreak(ranked);

  assignRanks(ranked);

  applyLimit(ranked, limit);

  attachRankingMetadata(ranked);
}

/* -------------------------------------------------------------------------- */
/* Filter Unmatched                                                          */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Safety net: the matcher should never include matched:false results,      */
/* but if it does (e.g. a future code change), remove them here.            */
/*                                                                            */

function filterUnmatched(results) {
  for (let i = results.length - 1; i >= 0; i--) {
    if (!results[i].matched) {
      results.splice(i, 1);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Deduplicate by Recipe ID                                                   */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* If the same recipe appears more than once (matcher bug or data issue),    */
/* keep only the highest-scoring occurrence.                                 */
/*                                                                            */

function deduplicateById(results) {
  const seen = new Map();

  for (let i = results.length - 1; i >= 0; i--) {
    const id = results[i].recipe?.id;

    if (!id) continue;

    const existing = seen.get(id);

    if (!existing) {
      seen.set(id, results[i]);
      continue;
    }

    /* Keep the one with the higher score */
    if ((results[i].score ?? 0) > (existing.score ?? 0)) {
      /* Remove the previously-kept one from the array */
      const index = results.indexOf(existing);
      if (index !== -1) {
        results.splice(index, 1);
      }
      seen.set(id, results[i]);
    } else {
      /* Remove the current (lower-scoring) one */
      results.splice(i, 1);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Sort by Config-Driven Priority                                            */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Reads AI_CONFIG.RANKING.SORT_PRIORITY to determine the comparison        */
/* chain.  Each entry maps to a comparator function.  The first criterion    */
/* that produces a non-zero result wins; if tied, the next criterion is      */
/* tried, and so on.                                                         */
/*                                                                            */
/* This means adding/removing/reordering sort criteria only requires         */
/* changing the config — no code changes here.                              */
/*                                                                            */

function sortByPriority(results) {
  const priority = AI_CONFIG.RANKING?.SORT_PRIORITY;

  if (!Array.isArray(priority) || priority.length === 0) {
    /* Fallback: score-only sort when config is missing or empty */
    results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    return;
  }

  results.sort((a, b) => {
    for (const criterion of priority) {
      const comparator = COMPARATORS[criterion];

      if (!comparator) continue;

      const result = comparator(a, b);

      if (result !== 0) return result;
    }

    return 0;
  });
}

/* -------------------------------------------------------------------------- */
/* Comparators                                                                */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Each comparator returns:                                                   */
/*   > 0  if a should rank LOWER than b (b is better)                       */
/*   < 0  if a should rank HIGHER than b (a is better)                      */
/*   0    if tied on this criterion                                          */
/*                                                                            */
/* This matches the standard Array.sort convention where negative = a       */
/* comes first.                                                              */
/*                                                                            */

const COMPARATORS = {
  /* Primary: higher score wins */
  score(a, b) {
    return (b.score ?? 0) - (a.score ?? 0);
  },

  /* Featured recipes rank higher */
  featured(a, b) {
    return (
      Number(Boolean(b.recipe?.featured)) - Number(Boolean(a.recipe?.featured))
    );
  },

  /* Higher average rating wins */
  averageRating(a, b) {
    return (b.recipe?.rating?.average ?? 0) - (a.recipe?.rating?.average ?? 0);
  },

  /* More ratings (popularity) wins */
  ratingCount(a, b) {
    return (b.recipe?.rating?.count ?? 0) - (a.recipe?.rating?.count ?? 0);
  },

  /* Shorter total time wins (quicker recipes first) */
  totalTime(a, b) {
    const aTime = a.recipe?.totalTime ?? Number.MAX_SAFE_INTEGER;
    const bTime = b.recipe?.totalTime ?? Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  },

  /* Alphabetical by English title (stable tiebreaker) */
  title(a, b) {
    return (a.recipe?.title?.en ?? "").localeCompare(
      b.recipe?.title?.en ?? "",
      "en",
      { sensitivity: "base", numeric: true },
    );
  },

  /* More matched fields wins (breadth of match) */
  matchedFields(a, b) {
    return (b.metadata?.matchedFields ?? 0) - (a.metadata?.matchedFields ?? 0);
  },

  /* More total individual matches wins (depth of match) */
  totalMatches(a, b) {
    return (b.metadata?.totalMatches ?? 0) - (a.metadata?.totalMatches ?? 0);
  },

  /* Lower difficulty wins (easy before hard) */
  difficulty(a, b) {
    const order = { easy: 0, medium: 1, hard: 2 };
    const aDiff = order[(a.recipe?.difficulty?.en ?? "").toLowerCase()] ?? 3;
    const bDiff = order[(b.recipe?.difficulty?.en ?? "").toLowerCase()] ?? 3;
    return aDiff - bDiff;
  },

  /* More servings wins (more flexible for larger groups) */
  servings(a, b) {
    return (b.recipe?.servings ?? 0) - (a.recipe?.servings ?? 0);
  },
};

/* -------------------------------------------------------------------------- */
/* Match Quality Tiebreak                                                    */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* When two recipes have the same score AND the same result on all          */
/* configured sort criteria, break the tie by match quality:                */
/*   1. More matched fields (breadth)                                        */
/*   2. More total matches (depth)                                           */
/*   3. Title matches count as stronger than other match types              */
/*                                                                            */
/* This only re-sorts adjacent elements that are still tied after the       */
/* main sort, so it's O(n) in practice for most result sets.               */
/*                                                                            */

function applyMatchQualityTiebreak(results) {
  if (results.length < 2) return;

  for (let i = 0; i < results.length - 1; i++) {
    const a = results[i];
    const b = results[i + 1];

    /* Only apply tiebreak when scores are equal */
    if ((a.score ?? 0) !== (b.score ?? 0)) continue;

    const quality = compareMatchQuality(a, b);

    if (quality !== 0) {
      results[i] = b;
      results[i + 1] = a;
    }
  }
}

function compareMatchQuality(a, b) {
  /* Tiebreak 1: more matched fields */
  const aFields = a.metadata?.matchedFields ?? 0;
  const bFields = b.metadata?.matchedFields ?? 0;

  if (aFields !== bFields) return bFields - aFields;

  /* Tiebreak 2: more total matches */
  const aTotal = a.metadata?.totalMatches ?? 0;
  const bTotal = b.metadata?.totalMatches ?? 0;

  if (aTotal !== bTotal) return bTotal - aTotal;

  /* Tiebreak 3: title match is stronger than non-title */
  const aHasTitle = (a.matches?.title?.length ?? 0) > 0;
  const bHasTitle = (b.matches?.title?.length ?? 0) > 0;

  if (aHasTitle !== bHasTitle) return Number(bHasTitle) - Number(aHasTitle);

  return 0;
}

/* -------------------------------------------------------------------------- */
/* Assign Ranks                                                               */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Adds a `rank` property (1-based) to each result.                          */
/*                                                                            */

function assignRanks(results) {
  for (let i = 0; i < results.length; i++) {
    results[i].rank = i + 1;
  }
}

/* -------------------------------------------------------------------------- */
/* Apply Limit                                                                */
/* -------------------------------------------------------------------------- */

function applyLimit(results, limit) {
  if (limit >= results.length) return;

  results.length = limit;
}

/* -------------------------------------------------------------------------- */
/* Attach Ranking Metadata                                                    */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Adds a `_ranking` object to each result with position info and           */
/* a normalized score (0–100) relative to the top result.                   */
/*                                                                            */

function attachRankingMetadata(results) {
  const topScore = results[0]?.score ?? 0;

  for (let i = 0; i < results.length; i++) {
    results[i]._ranking = {
      position: i + 1,

      totalResults: results.length,

      normalizedScore: normalizeScore(results[i].score ?? 0, topScore),

      isTopResult: i === 0,
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Rank Attachment                                                            */
/* -------------------------------------------------------------------------- */

function attachEmptyRank(result) {
  return {
    ...result,

    rank: 0,

    _ranking: null,
  };
}

/* -------------------------------------------------------------------------- */
/* Resolve Limit                                                              */
/* -------------------------------------------------------------------------- */

function resolveLimit(options = {}) {
  if (typeof options.limit === "number" && options.limit > 0) {
    return options.limit;
  }

  return AI_CONFIG.RANKING?.DEFAULT_LIMIT ?? 10;
}

/* -------------------------------------------------------------------------- */
/* Score Normalization                                                        */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Converts a raw score to a 0–100 scale relative to the top result.        */
/*   Top result:  100                                                       */
/*   Zero score:   0                                                         */
/*   Mid-range:    proportional                                                */
/*                                                                            */

function normalizeScore(score, topScore) {
  if (topScore <= 0) return 0;

  if (score <= 0) return 0;

  if (score >= topScore) return 100;

  return Math.round((score / topScore) * 100);
}
