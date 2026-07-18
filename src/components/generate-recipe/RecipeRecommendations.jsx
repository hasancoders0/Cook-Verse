"use client";

import { ArrowRight, Sparkles } from "lucide-react";

import RecipeCard from "@/components/recipe/RecipeCard";

import generateRecipeContent from "@/content/generate-recipe";
import useTranslation from "@/hooks/useTranslation";

export default function RecipeRecommendations({ recipes = [] }) {
  const { language } = useTranslation();

  if (!recipes.length) return null;

  const content = generateRecipeContent[language] || generateRecipeContent.en;

  const recommendationContent = content.result.recommendations;

  return (
    <section className="py-4">
      <div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white p-8 shadow-sm">
        {/* Header */}

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
              <Sparkles size={16} />
              {recommendationContent.badge}
            </div>

            <h2 className="mt-5 text-3xl font-bold text-gray-900">
              {recommendationContent.title}
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-gray-600">
              {recommendationContent.description}
            </p>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white px-6 py-4 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              {recommendationContent.countLabel}
            </p>

            <p className="mt-1 text-3xl font-bold text-orange-600">
              {recipes.length}
            </p>
          </div>
        </div>

        {/* Recipe Grid */}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>

        {/* Footer */}

        <div className="mt-10 rounded-2xl border border-orange-100 bg-orange-50 p-6">
          <div className="flex items-start gap-3">
            <ArrowRight size={20} className="mt-1 shrink-0 text-orange-500" />

            <p className="leading-7 text-gray-700">
              {recommendationContent.footer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
