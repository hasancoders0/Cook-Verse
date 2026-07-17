import { getAllRecipes } from "@/lib/recipes";

import FavoritesContent from "@/components/favorites/FavoritesContent";

export const metadata = {
  title: "Favorite Recipes | CookVerse",
  description: "Browse all your favorite recipes.",
};

export default function FavoritesPage() {
  const recipes = getAllRecipes();

  return <FavoritesContent recipes={recipes} />;
}