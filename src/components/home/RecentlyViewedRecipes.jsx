"use client";

import Link from "next/link";

import { useRecentlyViewed } from "@/context/RecentlyViewedContext";

import { getAllRecipes } from "@/lib/recipes";

import RecipeCard from "@/components/recipe/RecipeCard";
import AppContainer from "@/components/ui/AppContainer";

import ROUTES from "@/constants/routes";

export default function RecentlyViewedRecipes() {
  const { recentlyViewed } = useRecentlyViewed();

  if (!recentlyViewed.length) {
    return null;
  }

  const allRecipes = getAllRecipes();

  const recipes = recentlyViewed
    .map((slug) =>
      allRecipes.find((recipe) => recipe.slug === slug)
    )
    .filter(Boolean);

  if (!recipes.length) {
    return null;
  }

  return (
    <section className="py-16 lg:py-20">
      <AppContainer>
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <span className="mb-3 inline-flex rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-600">
              Continue Cooking
            </span>

            <h2 className="text-3xl font-bold text-gray-900">
              Recently Viewed Recipes
            </h2>

            <p className="mt-3 max-w-2xl text-gray-600">
              Pick up where you left off and continue exploring your favorite recipes.
            </p>
          </div>

          <Link
            href={ROUTES.DISH}
            className="hidden font-medium text-orange-600 transition hover:text-orange-700 md:block"
          >
            View All Recipes →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {recipes.slice(0, 4).map((recipe) => (
            <RecipeCard
              key={recipe.slug}
              recipe={recipe}
            />
          ))}
        </div>
      </AppContainer>
    </section>
  );
}