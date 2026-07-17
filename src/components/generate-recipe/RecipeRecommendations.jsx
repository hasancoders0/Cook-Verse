import { ArrowRight, Sparkles } from "lucide-react";

import RecipeCard from "@/components/recipe/RecipeCard";

export default function RecipeRecommendations({ recipes = [] }) {
  if (!recipes.length) return null;

  return (
    <section className="py-4">
      <div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white p-8 shadow-sm">
        {/* Header */}

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
              <Sparkles size={16} />
              AI Recommendations
            </div>

            <h2 className="mt-5 text-3xl font-bold text-gray-900">
              You Might Also Like
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-gray-600">
              These recipes also match many of your ingredients, cooking
              preferences, or dietary choices. If you'd like to explore more
              options, these are excellent alternatives.
            </p>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white px-6 py-4 text-center shadow-sm">
            <p className="text-sm text-gray-500">Alternative Recipes</p>

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
              Want something even more specific? Try adding more ingredients,
              preferred cuisine, cooking time, or dietary preferences to get a
              more personalized recommendation from CookVerse AI.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
