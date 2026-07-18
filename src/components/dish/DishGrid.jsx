"use client";

import AppContainer from "@/components/ui/AppContainer";
import RecipeCard from "@/components/recipe/RecipeCard";

import dishContent from "@/content/dish";
import useTranslation from "@/hooks/useTranslation";

export default function DishGrid({ recipes }) {
  const { language } = useTranslation();

  const content =
    dishContent[language] || dishContent.en;

  const gridContent = content.grid;

  if (recipes.length === 0) {
    return (
      <section className="py-24">
        <AppContainer>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {gridContent.noRecipes}
            </h2>

            <p className="mt-4 text-gray-600">
              {gridContent.tryChangeFilters}
            </p>
          </div>
        </AppContainer>
      </section>
    );
  }

  return (
    <section className="py-24">
      <AppContainer>
        <div className="mb-8">
          <p className="text-gray-600">
            {recipes.length}{" "}
            {recipes.length === 1
              ? gridContent.recipe
              : gridContent.recipes}{" "}
            {gridContent.found}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
            />
          ))}
        </div>
      </AppContainer>
    </section>
  );
}