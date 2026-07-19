"use client";

import { HandMetal } from "lucide-react";

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

  const isBn = language === "bn";

  return (
    <section
      className="py-14 lg:py-20 section-fade"
      style={{ background: "#1a1614", animationDelay: "0.4s" }}
    >
      <AppContainer>
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-4">
            <HandMetal size={16} className="text-orange-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
              {isBn ? "আপনার পছন্দ হতে পারে" : "You May Also Like"}
            </span>
          </div>

          <h2
            className="text-2xl lg:text-3xl font-bold text-stone-100"
            style={{ fontFamily: "serif" }}
          >
            {isBn ? "সম্পর্কিত রেসিপি" : "Related Recipes"}
          </h2>

          <p className="mt-2 text-sm text-stone-500">
            {isBn
              ? "আরও সুস্বাদু রেসিপি দেখুন "
              : "Explore more delicious recipes from the "}
            <span className="font-semibold text-stone-300">{categoryName}</span>
            {isBn ? " বিভাগ থেকে।" : " category."}
          </p>
        </div>

        {/* Recipe Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {relatedRecipes.map((relatedRecipe) => (
            <RecipeCard key={relatedRecipe.id} recipe={relatedRecipe} />
          ))}
        </div>
      </AppContainer>
    </section>
  );
}