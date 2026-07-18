const generateRecipeContent = {
  en: {
    seo: {
      title: "AI Recipe Generator | CookVerse",
      description: "Generate personalized recipe recommendations using AI.",
    },

    hero: {
      badge: "CookVerse AI Chef",

      title: {
        first: "Your Personal",
        second: "AI Recipe Assistant",
      },

      description:
        "Tell me what ingredients you have, your preferred cuisine, dietary preferences, or cooking time, and I'll recommend the best matching recipe from the CookVerse collection.",

      examples: [
        "🥩 I have chicken and rice",
        "🥗 Healthy vegetarian dinner",
        "⏱ Ready in 30 minutes",
        "🌶 Spicy Indian food",
      ],
    },

    input: {
      placeholder:
        "Example: I have chicken, rice, onion, garlic and yogurt. Recommend something spicy for dinner under 30 minutes...",

      enterHint: "Press Enter to generate • Shift + Enter for a new line",

      helperText:
        "Ask about ingredients, cuisine, diet, cooking time, or servings.",

      characterCount: "characters",

      clearButton: "Clear",

      submitButton: "Generate Recipe",
    },

    emptyState: {
      badge: "CookVerse AI Chef",

      title: "Ready to Find Your Perfect Recipe?",

      description:
        "Tell me what ingredients you already have, your favorite cuisine, dietary preferences, or how much time you have. I'll recommend the best matching recipe from the CookVerse collection.",

      features: [
        {
          title: "Smart Recipe Matching",
          description:
            "Finds recipes that best match your available ingredients and preferences.",
        },
        {
          title: "Time-Based Suggestions",
          description:
            "Discover recipes that fit your available cooking time and difficulty level.",
        },
        {
          title: "Shopping Assistance",
          description:
            "Shows which ingredients you're missing and recommends similar recipes you can cook.",
        },
      ],

      examples: {
        title: "Try asking something like...",

        prompts: [
          "🥩 I have chicken, rice, onion and garlic. What can I cook?",
          "🌶 Recommend a spicy Indian dinner under 30 minutes.",
          "🥗 Show me a healthy vegetarian recipe.",
          "🍔 I want something easy for 4 people.",
        ],
      },
    },

    suggestions: {
      title: "Try one of these prompts",

      items: [
        {
          id: 1,
          title: "Chicken Biryani",
          prompt:
            "I have chicken, rice, onion, garlic and yogurt. What can I cook?",
        },
        {
          id: 2,
          title: "Beef Burger",
          prompt:
            "I have ground beef, burger buns, lettuce, tomato and cheese.",
        },
        {
          id: 3,
          title: "Vegetable Salad",
          prompt:
            "I have cucumber, tomato, lettuce and carrots. Suggest a healthy recipe.",
        },
        {
          id: 4,
          title: "Spicy Dinner",
          prompt: "Recommend a spicy chicken recipe for dinner.",
        },
        {
          id: 5,
          title: "Healthy Lunch",
          prompt: "I want a healthy vegetable meal for lunch.",
        },
        {
          id: 6,
          title: "Use My Ingredients",
          prompt: "I have rice, chicken and yogurt. What recipe matches best?",
        },
      ],
    },

    thinking: {
      badge: "CookVerse AI Chef",

      title: "Preparing Your Recipe...",

      description:
        "Please wait while I analyze your request and find the best recipe from the CookVerse collection.",

      stepLabel: "Step",

      steps: [
        {
          icon: "cpu",
          title: "Understanding your request",
          description:
            "Analyzing your ingredients, cuisine preferences, dietary needs, and cooking time.",
        },
        {
          icon: "search",
          title: "Searching recipe collection",
          description:
            "Comparing your request with recipes in the CookVerse database.",
        },
        {
          icon: "check",
          title: "Finding the best match",
          description:
            "Scoring recipes and selecting the best recommendation for you.",
        },
      ],

      footer:
        "This usually takes only a few seconds. We're matching your request against the CookVerse recipe collection.",
    },

    result: {
      recommendations: {
        badge: "AI Recommendations",

        title: "You Might Also Like",

        description:
          "These recipes also match many of your ingredients, cooking preferences, or dietary choices.",

        countLabel: "Alternative Recipes",

        footer:
          "Want something even more specific? Add more ingredients or preferences.",
      },

      alternatives: "More Recipes",

      matchedIngredients: "Matched Ingredients",

      missingIngredients: {
        ready: {
          title: "You're Ready to Cook!",
          description: "Great news! You already have every ingredient needed.",
        },

        title: "Missing Ingredients",

        description:
          "You're almost ready! Just pick up the following ingredients.",

        footer: "Once you've collected them, you'll be ready to cook.",
      },
    },

    messages: {
      emptyPrompt: "Please enter what you'd like to cook.",
      noResults: "No matching recipes were found.",
      tryAgain: "Try using different ingredients or filters.",
    },
  },

  bn: {
    seo: {
      title: "এআই রেসিপি জেনারেটর | CookVerse",
      description: "এআই ব্যবহার করে আপনার জন্য উপযুক্ত রেসিপি খুঁজে নিন।",
    },

    hero: {
      badge: "CookVerse এআই শেফ",

      title: {
        first: "আপনার ব্যক্তিগত",
        second: "এআই রেসিপি সহকারী",
      },

      description:
        "আপনার কাছে থাকা উপকরণ, পছন্দের খাবার, ডায়েট বা রান্নার সময় লিখুন। আমি CookVerse সংগ্রহ থেকে সবচেয়ে উপযুক্ত রেসিপি খুঁজে দেব।",

      examples: [
        "🥩 আমার কাছে চিকেন ও ভাত আছে",
        "🥗 স্বাস্থ্যকর নিরামিষ রাতের খাবার",
        "⏱ ৩০ মিনিটে প্রস্তুত",
        "🌶 ঝাল ভারতীয় খাবার",
      ],
    },

    input: {
      placeholder:
        "উদাহরণ: আমার কাছে চিকেন, ভাত, পেঁয়াজ, রসুন এবং দই আছে। ৩০ মিনিটের মধ্যে ঝাল রাতের খাবারের জন্য একটি রেসিপি সাজেস্ট করুন...",

      enterHint: "Enter চাপুন • নতুন লাইনের জন্য Shift + Enter",

      helperText: "উপকরণ, রান্নার সময়, ডায়েট বা খাবারের ধরন সম্পর্কে লিখুন।",

      characterCount: "অক্ষর",

      clearButton: "মুছুন",

      submitButton: "রেসিপি তৈরি করুন",
    },

    emptyState: {
      badge: "CookVerse এআই শেফ",

      title: "আপনার জন্য সেরা রেসিপি খুঁজে বের করুন",

      description:
        "আপনার কাছে কী কী উপকরণ আছে বা কী ধরনের খাবার খেতে চান তা লিখুন।",

      features: [
        {
          title: "স্মার্ট রেসিপি নির্বাচন",
          description: "আপনার উপকরণ ও পছন্দ অনুযায়ী সেরা রেসিপি খুঁজে দেয়।",
        },
        {
          title: "সময় অনুযায়ী সাজেশন",
          description:
            "আপনার হাতে যত সময় আছে তার ভিত্তিতে রেসিপি সাজেস্ট করে।",
        },
        {
          title: "শপিং সহায়তা",
          description:
            "কোন কোন উপকরণ নেই তা দেখায় এবং বিকল্প রেসিপি সাজেস্ট করে।",
        },
      ],

      examples: {
        title: "এভাবে লিখে দেখতে পারেন",

        prompts: [
          "🥩 আমার কাছে চিকেন, ভাত, পেঁয়াজ ও রসুন আছে।",
          "🌶 ৩০ মিনিটে ঝাল ভারতীয় রাতের খাবার চাই।",
          "🥗 একটি স্বাস্থ্যকর নিরামিষ রেসিপি দেখাও।",
          "🍔 ৪ জনের জন্য সহজ একটি রেসিপি চাই।",
        ],
      },
    },

    suggestions: {
      title: "এই উদাহরণগুলো ব্যবহার করুন",

      items: [
        {
          id: 1,
          title: "চিকেন বিরিয়ানি",
          prompt: "আমার কাছে চিকেন, ভাত, পেঁয়াজ, রসুন ও দই আছে।",
        },
        {
          id: 2,
          title: "বিফ বার্গার",
          prompt: "আমার কাছে বিফ, বান, টমেটো ও চিজ আছে।",
        },
        {
          id: 3,
          title: "সবজি সালাদ",
          prompt: "আমার কাছে শসা, টমেটো ও লেটুস আছে।",
        },
      ],
    },

    thinking: {
      badge: "CookVerse এআই শেফ",

      title: "আপনার রেসিপি প্রস্তুত করা হচ্ছে...",

      description:
        "আপনার অনুরোধ বিশ্লেষণ করে CookVerse থেকে সেরা রেসিপি খুঁজে বের করা হচ্ছে।",

      stepLabel: "ধাপ",

      steps: [
        {
          icon: "cpu",
          title: "আপনার অনুরোধ বিশ্লেষণ করা হচ্ছে",
          description:
            "উপকরণ, খাবারের ধরন, ডায়েট এবং সময় বিশ্লেষণ করা হচ্ছে।",
        },
        {
          icon: "search",
          title: "রেসিপি সংগ্রহে অনুসন্ধান",
          description:
            "CookVerse-এর রেসিপির সাথে আপনার তথ্য মিলিয়ে দেখা হচ্ছে।",
        },
        {
          icon: "check",
          title: "সেরা রেসিপি নির্বাচন",
          description: "সবচেয়ে উপযুক্ত রেসিপি নির্বাচন করা হচ্ছে।",
        },
      ],

      footer: "এতে সাধারণত কয়েক সেকেন্ড সময় লাগে।",
    },

    result: {
      recommendations: {
        badge: "এআই সাজেশন",

        title: "আপনার আরও ভালো লাগতে পারে",

        description: "এই রেসিপিগুলোও আপনার পছন্দের সাথে মিল রয়েছে।",

        countLabel: "বিকল্প রেসিপি",

        footer: "আরও নির্দিষ্ট ফলাফলের জন্য আরও তথ্য যোগ করুন।",
      },

      alternatives: "আরও রেসিপি",

      matchedIngredients: "মিল পাওয়া উপকরণ",

      missingIngredients: {
        ready: {
          title: "আপনি রান্নার জন্য প্রস্তুত!",
          description: "এই রেসিপির জন্য আপনার সব উপকরণ রয়েছে।",
        },

        title: "যে উপকরণগুলো নেই",

        description: "রান্না শুরু করার আগে নিচের উপকরণগুলো সংগ্রহ করুন।",

        footer: "সব উপকরণ সংগ্রহ করলে আপনি সহজেই রান্না করতে পারবেন।",
      },
    },

    messages: {
      emptyPrompt: "অনুগ্রহ করে কী রান্না করতে চান তা লিখুন।",
      noResults: "কোনো মিল পাওয়া যায়নি।",
      tryAgain: "অন্য উপকরণ বা ফিল্টার ব্যবহার করে আবার চেষ্টা করুন।",
    },
  },
};

export default generateRecipeContent;
