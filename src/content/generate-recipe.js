const generateRecipeContent = {
  en: {
    seo: {
      title: "AI Recipe Generator | CookVerse",
      description:
        "Generate personalized recipes with AI based on your ingredients and preferences.",
    },

    hero: {
      badge: "AI Recipe Assistant",

      title: {
        first: "Discover",
        second: "Recipes with AI",
      },

      description: "Tell me what you have, and I'll find the perfect recipe.",
    },

    input: {
      placeholder: "I have chicken, rice, garlic and onion. What can I cook?",

      helperText: "Describe your ingredients or preferences.",

      clearButton: "Clear",

      submitButton: "Generate Recipe",
    },
    emptyState: {
      title: "Ready to Cook?",

      description:
        "Describe your ingredients or choose one of the suggestions below to get started.",
    },

    suggestions: {
      title: "Popular Prompts",
      items: [
        {
          id: 1,
          title: "Quick Dinner",
          prompt: "Recommend a quick dinner under 30 minutes.",
        },
        {
          id: 2,
          title: "Healthy Meal",
          prompt: "Suggest a healthy meal.",
        },
        {
          id: 3,
          title: "Use My Ingredients",
          prompt: "I have chicken, rice and garlic. What can I cook?",
        },
        {
          id: 4,
          title: "High Protein",
          prompt: "Recommend a high-protein meal.",
        },
        {
          id: 5,
          title: "Vegetarian",
          prompt: "Suggest an easy vegetarian recipe.",
        },
        {
          id: 6,
          title: "Surprise Me",
          prompt: "Recommend something unique and delicious.",
        },
      ],
    },
    thinking: {
      title: "Finding the Best Recipe",
      description:
        "Analyzing your request and searching the CookVerse recipe collection.",
      loading: "AI is generating your recipe...",
    },
    result: {
      badge: "AI Recipe",

      title: "Recipe Found",

      description: "Here's the best recipe based on your request.",

      stats: {
        score: "Match Score",
        ingredients: "Matched Ingredients",
        time: "Cooking Time",
        difficulty: "Difficulty",
      },

      matchedIngredients: "Matched Ingredients",

      missingIngredients: {
        ready: {
          title: "Ready to Cook",

          description: "You already have everything you need.",
        },

        title: "Missing Ingredients",

        description: "You'll need these ingredients before you start cooking.",
      },
    },

    messages: {
      emptyPrompt: "Describe what you'd like to cook.",
      noResults: "No matching recipes found.",
      tryAgain: "Try adding more ingredients or preferences.",
    },
  },
  bn: {
    seo: {
      title: "এআই রেসিপি জেনারেটর | CookVerse",
      description: "আপনার উপকরণ ও পছন্দ অনুযায়ী এআই দিয়ে রেসিপি খুঁজে নিন।",
    },

    hero: {
      badge: "এআই রেসিপি সহকারী",

      title: {
        first: "আরও সহজে",
        second: "রান্না করুন",
      },

      description:
        "আপনার কাছে কী কী উপকরণ আছে লিখুন, আমি আপনার জন্য সেরা রেসিপি খুঁজে দেব।",
    },

    input: {
      placeholder:
        "আমার কাছে চিকেন, ভাত, রসুন ও পেঁয়াজ আছে। কী রান্না করতে পারি?",

      helperText: "আপনার উপকরণ বা পছন্দের খাবারের ধরন লিখুন।",

      clearButton: "মুছুন",

      submitButton: "রেসিপি তৈরি করুন",
    },
    emptyState: {
      title: "কী রান্না করবেন?",

      description: "আপনার উপকরণ লিখুন অথবা নিচের একটি সাজেশন নির্বাচন করুন।",
    },

    suggestions: {
      title: "জনপ্রিয় সাজেশন",

      items: [
        {
          id: 1,
          title: "দ্রুত রাতের খাবার",
          prompt: "৩০ মিনিটের মধ্যে একটি রাতের খাবারের রেসিপি সাজেস্ট করুন।",
        },
        {
          id: 2,
          title: "স্বাস্থ্যকর খাবার",
          prompt: "একটি স্বাস্থ্যকর ও পুষ্টিকর রেসিপি সাজেস্ট করুন।",
        },
        {
          id: 3,
          title: "নিরামিষ",
          prompt: "একটি সহজ নিরামিষ রেসিপি সাজেস্ট করুন।",
        },
        {
          id: 4,
          title: "চিকেন",
          prompt: "আমার কাছে চিকেন আছে। কী রান্না করতে পারি?",
        },
        {
          id: 5,
          title: "পাস্তা",
          prompt: "একটি সহজ পাস্তার রেসিপি সাজেস্ট করুন।",
        },
        {
          id: 6,
          title: "চমকে দিন",
          prompt: "আমাকে একটি ভিন্ন ও মজার রেসিপি সাজেস্ট করুন।",
        },
      ],
    },

    thinking: {
      title: "সেরা রেসিপি খোঁজা হচ্ছে",
      description:
        "আপনার অনুরোধ বিশ্লেষণ করে CookVerse থেকে উপযুক্ত রেসিপি খুঁজে বের করা হচ্ছে।",
      loading: "এআই রেসিপি তৈরি করছে...",
    },

    result: {
      badge: "এআই রেসিপি",

      title: "রেসিপি পাওয়া গেছে",

      description: "আপনার অনুরোধ অনুযায়ী সেরা রেসিপি পাওয়া গেছে।",

      stats: {
        score: "মিলের স্কোর",
        ingredients: "মিল পাওয়া উপকরণ",
        time: "রান্নার সময়",
        difficulty: "কঠিনতা",
      },

      matchedIngredients: "মিল পাওয়া উপকরণ",

      missingIngredients: {
        ready: {
          title: "রান্নার জন্য প্রস্তুত",

          description: "আপনার কাছে প্রয়োজনীয় সব উপকরণ রয়েছে।",
        },

        title: "যে উপকরণগুলো লাগবে",

        description: "রান্না শুরু করার আগে এই উপকরণগুলো সংগ্রহ করুন।",
      },
    },

    messages: {
      emptyPrompt: "আপনি কী রান্না করতে চান তা লিখুন।",
      noResults: "কোনো উপযুক্ত রেসিপি পাওয়া যায়নি।",
      tryAgain: "আরও উপকরণ বা পছন্দ যোগ করে আবার চেষ্টা করুন।",
    },
  },
};

export default generateRecipeContent;
