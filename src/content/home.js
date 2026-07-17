const homeContent = {
  hero: {
    badge: "🍳 Modern Recipe Platform",

    title: "Discover Delicious Recipes with Ease",

    description:
      "Search recipes by dish or ingredients and enjoy a simple step-by-step cooking experience.",

    primaryButton: {
      label: "Find by Dish",
      href: "/dish",
    },

    secondaryButton: {
      label: "Find by Ingredients",
      href: "/ingredients",
    },
  },

  recipeMethod: {
    title: "How would you like to find a recipe?",

    description: "Choose the way that works best for you.",

    methods: [
      {
        id: 1,
        title: "Find by Dish",
        description:
          "Already know what you want to cook? Browse recipes by dish name.",
        button: "Browse Dishes",
        href: "/dish",
        emoji: "🍽️",
      },
      {
        id: 2,
        title: "Find by Ingredients",
        description:
          "Select ingredients you already have and discover matching recipes.",
        button: "Choose Ingredients",
        href: "/ingredients",
        emoji: "🥬",
      },
    ],
  },
  popularCategories: {
    badge: "Popular Categories",

    title: "Find Recipes by Category",

    description: "Browse recipes from your favorite food categories.",

    items: [
      {
        id: 1,
        name: "Breakfast",
        emoji: "🍳",
        total: "120 Recipes",
      },
      {
        id: 2,
        name: "Lunch",
        emoji: "🍛",
        total: "245 Recipes",
      },
      {
        id: 3,
        name: "Dinner",
        emoji: "🍕",
        total: "310 Recipes",
      },
      {
        id: 4,
        name: "Dessert",
        emoji: "🍰",
        total: "98 Recipes",
      },
      {
        id: 5,
        name: "Healthy",
        emoji: "🥗",
        total: "185 Recipes",
      },
      {
        id: 6,
        name: "Drinks",
        emoji: "🥤",
        total: "76 Recipes",
      },
    ],
  },
  popularRecipes: {
    badge: "Trending Recipes",

    title: "Popular Recipes",

    description: "Explore the recipes our community loves the most.",

    items: [
      {
        id: 1,
        name: "Chicken Biryani",
        image:
          "https://images.unsplash.com/photo-1701579231305-d84d8af9a3fd?auto=format&fit=crop&w=900&q=80",
        category: "Dinner",
        time: "45 min",
        difficulty: "Medium",
      },

      {
        id: 2,
        name: "Beef Burger",
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
        category: "Fast Food",
        time: "25 min",
        difficulty: "Easy",
      },

      {
        id: 3,
        name: "Vegetable Salad",
        image:
          "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=900&q=80",
        category: "Healthy",
        time: "15 min",
        difficulty: "Easy",
      },
    ],
  },
  whyCookVerse: {
    badge: "Why CookVerse",

    title: "Cooking Made Simple for Everyone",

    description:
      "Whether you're a beginner or an experienced home cook, CookVerse helps you prepare delicious meals with confidence.",

    items: [
      {
        id: 1,
        title: "Easy Step-by-Step",
        description:
          "Follow clear instructions from start to finish without confusion.",
        icon: "👨‍🍳",
      },
      {
        id: 2,
        title: "Find Recipes Fast",
        description:
          "Search by dish name or ingredients you already have at home.",
        icon: "🔍",
      },
      {
        id: 3,
        title: "Nutrition Information",
        description:
          "Know calories, protein, fat, carbohydrates and more before cooking.",
        icon: "🥗",
      },
      {
        id: 4,
        title: "Mobile Friendly",
        description: "Cook comfortably from your phone, tablet, or desktop.",
        icon: "📱",
      },
    ],
  },
  faq: {
    badge: "FAQ",

    title: "Frequently Asked Questions",

    description: "Everything you need to know about CookVerse.",

    items: [
      {
        id: 1,
        question: "Is CookVerse free to use?",
        answer: "Yes. Version 1 of CookVerse is completely free.",
      },
      {
        id: 2,
        question: "Can I search recipes by ingredients?",
        answer:
          "Yes. Select the ingredients you already have and we'll suggest matching recipes.",
      },
      {
        id: 3,
        question: "Does CookVerse support Bangla?",
        answer: "Yes. Both Bangla and English are supported.",
      },
      {
        id: 4,
        question: "Can I print recipes?",
        answer: "Yes. Every recipe can be printed or downloaded as a PDF.",
      },
    ],
  },
};

export default homeContent;
