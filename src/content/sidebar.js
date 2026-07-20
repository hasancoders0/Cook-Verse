import {
  FiMessageSquare,
  FiBookOpen,
  FiGrid,
  FiHeart,
  FiInfo,
  FiShield,
  FiFileText,
  FiClock,
} from "react-icons/fi";

import ROUTES from "@/constants/routes";

export const sidebarContent = {
  brand: {
    title: "CookVerse",
    subtitle: {
      en: "Your AI Recipe Assistant",
      bn: "আপনার AI রেসিপি সহকারী",
    },
  },

  navigation: [
    {
      key: "ask-ai",
      label: {
        en: "Ask AI",
        bn: "AI কে জিজ্ঞাসা করুন",
      },
      href: ROUTES.HOME,
      icon: FiMessageSquare,
    },
    {
      key: "dish",
      label: {
        en: "Browse Recipes",
        bn: "রেসিপি ব্রাউজ করুন",
      },
      href: ROUTES.DISH,
      icon: FiBookOpen,
    },
    {
      key: "ingredients",
      label: {
        en: "By Ingredients",
        bn: "উপকরণ অনুযায়ী",
      },
      href: ROUTES.INGREDIENTS,
      icon: FiGrid,
    },
    {
      key: "favorites",
      label: {
        en: "Favorites",
        bn: "পছন্দের রেসিপি",
      },
      href: ROUTES.FAVORITES,
      icon: FiHeart,
    },
  ],

  recentlyViewed: {
    icon: FiClock,

    title: {
      en: "Recently Viewed",
      bn: "সম্প্রতি দেখা",
    },

    empty: {
      en: "No recently viewed recipes.",
      bn: "এখনও কোনো রেসিপি দেখা হয়নি।",
    },
  },

  footer: [
    {
      key: "about",
      label: {
        en: "About",
        bn: "আমাদের সম্পর্কে",
      },
      href: ROUTES.ABOUT,
      icon: FiInfo,
    },
    {
      key: "privacy",
      label: {
        en: "Privacy Policy",
        bn: "প্রাইভেসি পলিসি",
      },
      href: ROUTES.PRIVACY_POLICY,
      icon: FiShield,
    },
    {
      key: "terms",
      label: {
        en: "Terms & Conditions",
        bn: "শর্তাবলী",
      },
      href: ROUTES.TERMS,
      icon: FiFileText,
    },
  ],
};