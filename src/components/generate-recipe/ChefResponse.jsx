import { ChefHat, Clock3, Flame, Sparkles, Target } from "lucide-react";

import RecipeCard from "@/components/recipe/RecipeCard";

export default function ChefResponse({ result, prompt }) {
  if (!result?.success || !result.recipe) return null;

  const {
    recipe,
    score = 0,
    matchedIngredients = [],
    missingIngredients = [],
  } = result;

  return (
    <section className="py-10">
      <div className="mx-auto max-w-5xl">
        {/* AI Response */}

        <div className="overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white shadow-sm">
          <div className="p-8 md:p-10">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg">
                <ChefHat size={30} />
              </div>

              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100 px-4 py-1.5 text-sm font-semibold text-orange-700">
                  <Sparkles size={16} />
                  CookVerse AI Chef
                </div>

                <h2 className="mt-5 text-3xl font-bold text-gray-900">
                  I found a recipe you'll love!
                </h2>

                <p className="mt-4 text-lg leading-8 text-gray-700">
                  Based on your request
                  {prompt && (
                    <>
                      {" "}
                      <span className="font-semibold text-gray-900">
                        "{prompt}"
                      </span>
                    </>
                  )}
                  , my best recommendation is{" "}
                  <span className="font-semibold text-orange-600">
                    {recipe.title}
                  </span>
                  .
                </p>

                {/* Stats */}

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-orange-100 bg-white p-5">
                    <Target size={20} className="mb-3 text-orange-500" />

                    <p className="text-sm text-gray-500">Match Score</p>

                    <h4 className="mt-1 text-2xl font-bold text-gray-900">
                      {score}%
                    </h4>
                  </div>

                  <div className="rounded-2xl border border-orange-100 bg-white p-5">
                    <Sparkles size={20} className="mb-3 text-green-500" />

                    <p className="text-sm text-gray-500">Ingredients Found</p>

                    <h4 className="mt-1 text-2xl font-bold text-gray-900">
                      {matchedIngredients.length}
                    </h4>
                  </div>

                  <div className="rounded-2xl border border-orange-100 bg-white p-5">
                    <Clock3 size={20} className="mb-3 text-blue-500" />

                    <p className="text-sm text-gray-500">Cooking Time</p>

                    <h4 className="mt-1 text-2xl font-bold text-gray-900">
                      {recipe.totalTime} min
                    </h4>
                  </div>

                  <div className="rounded-2xl border border-orange-100 bg-white p-5">
                    <Flame size={20} className="mb-3 text-red-500" />

                    <p className="text-sm text-gray-500">Difficulty</p>

                    <h4 className="mt-1 text-2xl font-bold text-gray-900">
                      {recipe.difficulty}
                    </h4>
                  </div>
                </div>

                {/* Summary */}

                <div className="mt-8 rounded-2xl border border-orange-100 bg-orange-50 p-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Why this recipe?
                  </h3>

                  <p className="mt-3 leading-8 text-gray-700">
                    This recipe closely matches your available ingredients,
                    preferred cooking style, and requested criteria. You already
                    have{" "}
                    <span className="font-semibold text-gray-900">
                      {matchedIngredients.length}
                    </span>{" "}
                    required ingredient
                    {matchedIngredients.length !== 1 && "s"}
                    {missingIngredients.length > 0 && (
                      <>
                        {" "}
                        and only need{" "}
                        <span className="font-semibold text-gray-900">
                          {missingIngredients.length}
                        </span>{" "}
                        additional ingredient
                        {missingIngredients.length !== 1 && "s"}.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Recipe */}

        <div className="mt-10">
          <RecipeCard recipe={recipe} />
        </div>
      </div>
    </section>
  );
}
