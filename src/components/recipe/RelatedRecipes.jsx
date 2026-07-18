"use client";

import AppContainer from "@/components/ui/AppContainer";
import RecipeCard from "@/components/recipe/RecipeCard";

import { getRelatedRecipes } from "@/lib/recipes";
import useTranslation from "@/hooks/useTranslation";

export default function RelatedRecipes({ recipe }) {
  const { language, t } = useTranslation();

  const relatedRecipes = getRelatedRecipes(recipe, 3);

  if (relatedRecipes.length === 0) {
    return null;
  }

  const categoryName = t(recipe.category?.name);

  return (
    <section className="bg-gray-50 py-20">
      <AppContainer>
        {/* Header */}
        <div className="mb-12">
          <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-600">
            {language === "bn" ? "আপনার পছন্দ হতে পারে" : "You May Also Like"}
          </span>

          <h2 className="mt-5 text-4xl font-bold text-gray-900">
            {language === "bn" ? "সম্পর্কিত রেসিপি" : "Related Recipes"}
          </h2>

          <p className="mt-3 text-lg text-gray-600">
            {language === "bn"
              ? "আরও সুস্বাদু রেসিপি দেখুন "
              : "Explore more delicious recipes from the "}

            <span className="font-semibold text-gray-900">{categoryName}</span>

            {language === "bn" ? " বিভাগ থেকে।" : " category."}
          </p>
        </div>

        {/* Recipes */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {relatedRecipes.map((relatedRecipe) => (
            <RecipeCard key={relatedRecipe.id} recipe={relatedRecipe} />
          ))}
        </div>
      </AppContainer>
    </section>
  );
}
