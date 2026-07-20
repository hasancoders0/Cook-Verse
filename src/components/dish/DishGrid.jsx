// src/components/dish/DishGrid.jsx
"use client";

import AppContainer from "@/components/ui/AppContainer";
import RecipeCard from "@/components/recipe/RecipeCard";

import dishContent from "@/content/dish";
import useTranslation from "@/hooks/useTranslation";

export default function DishGrid({ recipes }) {
  const { language } = useTranslation();

  const content = dishContent[language] || dishContent.en;
  const gridContent = content.grid;

  if (recipes.length === 0) {
    return (
      <section className="py-20">
        <AppContainer>
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-stone-200">
              {gridContent.noRecipes}
            </h2>
            <p className="mt-4 font-ui text-stone-600">
              {gridContent.tryChangeFilters}
            </p>
          </div>
        </AppContainer>
      </section>
    );
  }

  return (
    <section className="pb-16 pt-10">
      <AppContainer>
        {/* Subtle count above grid */}
        <div className="mb-8">
          <p className="font-ui text-sm text-stone-600">
            {recipes.length}{" "}
            {recipes.length === 1 ? gridContent.recipe : gridContent.recipes}{" "}
            {gridContent.found}
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </AppContainer>
    </section>
  );
}