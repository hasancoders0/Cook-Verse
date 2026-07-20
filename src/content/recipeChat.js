import {
  Zap,
  Timer,
  Leaf,
  Globe,
  ChefHat,
  Search,
} from "lucide-react";

export const INITIAL_SUGGESTIONS = [
  { label: "Chicken Biryani", icon: Zap },
  { label: "Quick breakfast", icon: Timer },
  { label: "Something healthy", icon: Leaf },
  { label: "Not spicy dinner", icon: Globe },
];

export const FALLBACK_SUGGESTIONS = [
  { label: "Beef burger recipe", icon: ChefHat },
  { label: "Vegetable salad", icon: Leaf },
  { label: "I have rice and eggs", icon: Search },
  { label: "American fast food", icon: Globe },
];

export const GREETINGS = {
  en: "Welcome to RecipeMind! I can find the perfect recipe for you. Try searching by dish name, ingredient, cuisine, or just tell me what you're in the mood for.",
  bn: "রেসিপিমাইন্ডে স্বাগতম! আমি আপনার জন্য নিখুঁত রেসিপি খুঁজে বের করতে পারি। খাবারের নাম, উপকরণ, রান্নার ধরন দিয়ে অনুসন্ধান করুন, অথবা শুধু বলুন আপনি কী খেতে চান।",
};