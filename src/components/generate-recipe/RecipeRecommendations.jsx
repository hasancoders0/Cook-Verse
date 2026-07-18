"use client";

import { Sparkles } from "lucide-react";

import RecipeCard from "@/components/recipe/RecipeCard";

import generateRecipeContent from "@/content/generate-recipe";
import useTranslation from "@/hooks/useTranslation";

export default function RecipeRecommendations({ recipes = [] }) {
  const { language } = useTranslation();

  if (!recipes.length) return null;

  const content = generateRecipeContent[language] ?? generateRecipeContent.en;

  const recommendationContent = content.result.recommendations;

  return (
    <section className="py-6">
      <div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white p-8 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <Sparkles className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {recommendationContent.title}
            </h2>

            <p className="mt-1 text-gray-600">
              {recommendationContent.description}
            </p>
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>
      </div>
    </section>
  );
}
