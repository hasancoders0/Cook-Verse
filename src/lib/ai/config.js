// src/lib/ai/config.js

/* -------------------------------------------------------------------------- */
/* Languages                                                                  */
/* -------------------------------------------------------------------------- */

export const LANGUAGES = {
  EN: "en",
  BN: "bn",
};

export const DEFAULT_LANGUAGE = LANGUAGES.EN;
export const SUPPORTED_LANGUAGES = [LANGUAGES.EN, LANGUAGES.BN];

/* -------------------------------------------------------------------------- */
/* Intents                                                                    */
/* -------------------------------------------------------------------------- */

export const INTENTS = {
  GREETING: "greeting",
  IDENTITY: "identity", // "who are you"
  CAPABILITIES: "capabilities", // "what can you do"
  RECIPE_SEARCH: "recipe_search", // dish name / cuisine / category driven
  INGREDIENT_SEARCH: "ingredient_search", // "I have chicken and potato"
  DATE: "date", // "what's today's date"
  DAY_CHECK: "day_check", // "is today Friday?"
  THANKS: "thanks",
  GOODBYE: "goodbye",
  SMALL_TALK: "small_talk", // "what's your favorite food", "are you ChatGPT"
  UNKNOWN: "unknown",
};

/* -------------------------------------------------------------------------- */
/* Entity Types                                                               */
/* -------------------------------------------------------------------------- */

export const ENTITY_TYPES = {
  INGREDIENT: "ingredient",
  DISH: "dish",
  CUISINE: "cuisine",
  CATEGORY: "category",
  DIFFICULTY: "difficulty",
  DIET: "diet",
  TIME: "time",
};

/* -------------------------------------------------------------------------- */
/* Conversation Memory                                                        */
/* -------------------------------------------------------------------------- */

export const MEMORY_CONFIG = {
  // Max number of exchanges kept in memory before FIFO eviction
  MAX_HISTORY: 200,
  // How many previous turns to actually consider when resolving follow-ups
  CONTEXT_WINDOW: 6,
  // How long (ms) a "last searched recipe/ingredient" context stays relevant
  // before we stop auto-referencing it in follow-ups (30 min)
  CONTEXT_TTL_MS: 30 * 60 * 1000,
};

/* -------------------------------------------------------------------------- */
/* Matching & Ranking                                                         */
/* -------------------------------------------------------------------------- */

export const MATCH_CONFIG = {
  // Minimum fuzzy-similarity score (0-1) to accept a typo-tolerant match
  FUZZY_THRESHOLD: 0.72,
  // Minimum score to consider two free-text strings "the same" entity
  ENTITY_MATCH_THRESHOLD: 0.6,
  // Max recipes returned per search
  MAX_RESULTS: 6,
  // Max "closest match" fallback recipes when nothing matches exactly
  MAX_FALLBACK_RESULTS: 4,
  // Max suggestion chips shown after a response
  MAX_SUGGESTIONS: 4,
};

/**
 * Relevance ranking weights — used by recipe-ranker.js to score candidates.
 * Higher weight = more influence on final rank.
 */
export const RANKING_WEIGHTS = {
  DISH_NAME_MATCH: 10,
  MAIN_INGREDIENT_MATCH: 6,
  SECONDARY_INGREDIENT_MATCH: 2,
  CUISINE_MATCH: 4,
  CATEGORY_MATCH: 4,
  DIET_MATCH: 5,
  DIFFICULTY_MATCH: 3,
  TIME_CONSTRAINT_MATCH: 4,
  TAG_MATCH: 2,
  SEARCH_TERM_MATCH: 3,
  RATING_BOOST: 1, // multiplied by recipe.rating.average
  FEATURED_BOOST: 2,
};

/* -------------------------------------------------------------------------- */
/* Time / Difficulty Vocabulary                                              */
/* -------------------------------------------------------------------------- */

// "quick" style requests map to a max-minutes ceiling
export const TIME_KEYWORDS = {
  en: {
    quick: 20,
    fast: 20,
    rushed: 15,
  },
  bn: {
    দ্রুত: 20,
    তাড়াতাড়ি: 20,
    জলদি: 15,
  },
};

export const DIFFICULTY_ALIASES = {
  en: {
    easy: ["easy", "simple", "beginner"],
    medium: ["medium", "moderate", "intermediate"],
    hard: ["hard", "difficult", "advanced", "complex"],
  },
  bn: {
    easy: ["সহজ", "সহজে"],
    medium: ["মাঝারি"],
    hard: ["কঠিন", "কঠিনতর"],
  },
};

/* -------------------------------------------------------------------------- */
/* Stopwords (used to strip noise before entity extraction)                  */
/* -------------------------------------------------------------------------- */

export const STOPWORDS = {
  en: [
    "i", "me", "my", "you", "your", "the", "a", "an", "is", "are", "am",
    "have", "has", "had", "want", "would", "like", "can", "could", "please",
    "some", "something", "for", "with", "and", "or", "to", "of", "in", "on",
    "at", "what", "which", "how", "do", "does", "today", "cook", "cooking",
    "make", "recipe", "food", "eat", "give", "show", "find", "need",
  ],
  bn: [
    "আমি", "আমার", "আমাকে", "তুমি", "তোমার", "আছে", "চাই", "চাও", "চান",
    "করতে", "করবো", "করব", "রান্না", "খাবার", "কিছু", "একটা", "একটি",
    "কী", "কি", "কে", "যে", "যা", "এই", "সেই", "এবং", "আর", "বা", "জন্য",
    "দিয়ে", "থেকে", "হবে", "যেতে", "পারে", "খেতে", "খেয়ে",
  ],
};

/* -------------------------------------------------------------------------- */
/* Intent Keyword Triggers                                                    */
/* -------------------------------------------------------------------------- */

export const INTENT_KEYWORDS = {
  [INTENTS.GREETING]: {
    en: ["hi", "hello", "hey", "good morning", "good evening"],
    bn: ["হ্যালো", "হাই", "আসসালামু আলাইকুম", "সালাম"],
  },
  [INTENTS.IDENTITY]: {
    en: ["who are you", "what are you", "your name"],
    bn: ["তুমি কে", "তুই কে", "আপনি কে", "তোমার নাম"],
  },
  [INTENTS.CAPABILITIES]: {
    en: ["what can you do", "what do you do", "how can you help", "your features"],
    bn: ["তুমি কী করতে পারো", "তুমি কি করতে পারো", "কী কী করতে পারো"],
  },
  [INTENTS.DATE]: {
    en: ["what's the date", "what is the date", "today's date", "what day is it"],
    bn: ["আজ কত তারিখ", "আজকে কত তারিখ", "আজ কী তারিখ"],
  },
  [INTENTS.DAY_CHECK]: {
    en: ["is today", "is it"],
    bn: ["আজ কি", "আজ কী"], // combined with a day name detection in intent-detector
  },
  [INTENTS.THANKS]: {
    en: ["thanks", "thank you", "thx"],
    bn: ["ধন্যবাদ", "থ্যাংকস"],
  },
  [INTENTS.GOODBYE]: {
    en: ["bye", "goodbye", "see you", "talk later"],
    bn: ["বিদায়", "আচ্ছা পরে কথা হবে", "ভালো থাকবেন"],
  },
  [INTENTS.SMALL_TALK]: {
    en: ["are you chatgpt", "are you ai", "favorite food", "can you answer everything"],
    bn: ["তুমি কি চ্যাটজিপিটি", "তুমি কি এআই", "প্রিয় খাবার", "সব প্রশ্নের উত্তর"],
  },
};

/* -------------------------------------------------------------------------- */
/* Static Response Templates                                                  */
/* -------------------------------------------------------------------------- */

export const RESPONSES = {
  GREETING: {
    en: "Hi! I'm MealMuse, your recipe assistant. What would you like to cook today?",
    bn: "হ্যালো! আমি MealMuse, আপনার রেসিপি সহকারী। আজ কী রান্না করতে চান?",
  },
  GREETING_ISLAMIC: {
    en: "Walaikumus Salam. 🌿 What would you like to eat today? Or tell me what ingredients you have.",
    bn: "ওয়ালাইকুমুস সালাম। 🌿 আজ কী খেতে ইচ্ছে করছে? অথবা বলুন, আপনার কাছে কী কী উপকরণ আছে।",
  },
  IDENTITY: {
    en: "I'm MealMuse, your AI recipe assistant. Tell me a dish name, ingredients, or cuisine, and I'll find the right recipe for you.",
    bn: "আমি MealMuse, আপনার AI রেসিপি সহকারী। আপনি খাবারের নাম, উপকরণ, রান্নার ধরন বা ক্যাটাগরি বললে আমি উপযুক্ত রেসিপি খুঁজে দিতে পারি।",
  },
  CAPABILITIES: {
    en: "I can:\n• Find recipes by dish name\n• Suggest what to cook with ingredients you have\n• Recommend recipes by cuisine or country\n• Find meals that fit your available time\n• Pick easy, medium, or hard recipes for you",
    bn: "আমি আপনাকে—\n• খাবারের নাম দিয়ে রেসিপি খুঁজে দিতে পারি।\n• আপনার কাছে থাকা উপকরণ দিয়ে কী রান্না করা যায় তা বলতে পারি।\n• দেশ বা রান্নার ধরন অনুযায়ী রেসিপি সাজেস্ট করতে পারি।\n• নির্দিষ্ট সময়ে তৈরি করা যায় এমন খাবার খুঁজে দিতে পারি।\n• সহজ, মাঝারি বা কঠিন রেসিপি বেছে দিতে পারি।",
  },
  THANKS: {
    en: "You're welcome! I'm here whenever you want to find a new recipe.",
    bn: "আপনাকেও ধন্যবাদ। আবার নতুন কোনো রেসিপি খুঁজতে চাইলে আমি আছি।",
  },
  GOODBYE: {
    en: "Thanks! I'll be here if you want to find another recipe. Take care, happy cooking!",
    bn: "ধন্যবাদ! আবার নতুন কোনো রেসিপি খুঁজতে চাইলে আমি এখানেই আছি। ভালো থাকবেন, শুভ রান্না!",
  },
  GOODBYE_CASUAL: {
    en: "Sure. Take care!",
    bn: "অবশ্যই। ভালো থাকবেন!",
  },
  NOT_CHATGPT: {
    en: "No, I'm MealMuse. I mainly help you find recipes and suggest dishes to cook.",
    bn: "না, আমি MealMuse। আমি মূলত রেসিপি খুঁজে দেওয়া এবং রান্নার জন্য উপযুক্ত খাবার সাজেস্ট করার কাজে সাহায্য করি।",
  },
  NOT_GENERAL_QA: {
    en: "I'm built mainly to help with cooking and recipes. Tell me a dish name, ingredient, cuisine, or category and I'll find the best matches.",
    bn: "আমি মূলত রান্না ও রেসিপি সম্পর্কিত বিষয়ে সাহায্য করার জন্য তৈরি। আপনি খাবারের নাম, উপকরণ, রান্নার ধরন বা ক্যাটাগরি জানালে আমি সবচেয়ে উপযুক্ত রেসিপিগুলো খুঁজে দিতে পারি।",
  },
  NO_FAVORITE: {
    en: "I don't have personal preferences, but users search most for chicken biryani, kacchi, pasta, pizza, and various local dishes. Want me to suggest one based on your taste?",
    bn: "আমার নিজের কোনো ব্যক্তিগত পছন্দ নেই। তবে ব্যবহারকারীরা চিকেন বিরিয়ানি, কাচ্চি, পাস্তা, পিজ্জা এবং বিভিন্ন দেশীয় রান্না সবচেয়ে বেশি খুঁজে থাকেন। আপনি চাইলে আপনার পছন্দ অনুযায়ী আমি একটি রেসিপি সাজেস্ট করতে পারি।",
  },
  UNKNOWN: {
    en: "Sorry, I didn't quite catch that.\n\nYou can try something like:\n• Chicken biryani\n• I have eggs and potatoes\n• Healthy breakfast\n• Italian pasta\n• Something ready in 30 minutes",
    bn: "দুঃখিত, আমি বুঝতে পারিনি।\n\nআপনি চাইলে এভাবে লিখতে পারেন—\n• চিকেন বিরিয়ানি\n• আমার কাছে ডিম ও আলু আছে\n• স্বাস্থ্যকর নাস্তা\n• ইতালিয়ান পাস্তা\n• ৩০ মিনিটে তৈরি করা যায় এমন খাবার",
  },
  NO_MATCH: {
    en: "Sorry, I couldn't find a recipe matching that. Try another ingredient, dish name, or cuisine.",
    bn: "দুঃখিত, এই তথ্য অনুযায়ী কোনো রেসিপি খুঁজে পাওয়া যায়নি। অন্য কোনো উপকরণ, খাবারের নাম বা রান্নার ধরন লিখে আবার চেষ্টা করুন।",
  },
  ERROR: {
    en: "Something went wrong. Please try again.",
    bn: "দুঃখিত, একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।",
  },
};

/* -------------------------------------------------------------------------- */
/* Fallback Suggestion Labels (used when no recipe-based suggestions exist)  */
/* -------------------------------------------------------------------------- */

export const FALLBACK_SUGGESTIONS = {
  en: ["Beef burger recipe", "Vegetable salad", "I have rice and eggs", "American fast food"],
  bn: ["বিফ বার্গার রেসিপি", "সবজি সালাদ", "আমার কাছে ভাত ও ডিম আছে", "আমেরিকান ফাস্ট ফুড"],
};

/* -------------------------------------------------------------------------- */
/* Debug / Dev Flags                                                          */
/* -------------------------------------------------------------------------- */

export const DEBUG_DEFAULT = false;