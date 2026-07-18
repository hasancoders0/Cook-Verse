"use client";

import {
  ChefHat,
  Clock3,
  Flame,
  Sparkles,
  Target,
} from "lucide-react";

import RecipeCard from "@/components/recipe/RecipeCard";

import generateRecipeContent from "@/content/generate-recipe";
import useTranslation from "@/hooks/useTranslation";
import { getLocalizedValue } from "@/lib/language";

export default function ChefResponse({ result, prompt }) {
  if (!result?.success || !result.recipe) {
    return null;
  }

  const { language, t } = useTranslation();

  const content = generateRecipeContent[language] || generateRecipeContent.en;

  const { recipe, score = 0, matchedIngredients = [] } = result;

  const title = t(recipe.title);

  return (
    <section className="py-10">
      <div className="mx-auto max-w-5xl">
        {/* AI Response */}

        <div className="overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white shadow-sm">
          <div className="p-8 md:p-10">
            <div className="flex items-start gap-5">
              {/* Icon */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg">
                <ChefHat size={30} />
              </div>

              <div className="flex-1">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100 px-4 py-1.5 text-sm font-semibold text-orange-700">
                  <Sparkles size={16} />

                  {language === "bn"
                    ? "AI রেসিপি সাজেশন"
                    : "AI Recipe Recommendation"}
                </div>

                {/* Title */}

                <h2 className="mt-5 text-3xl font-bold text-gray-900">
                  {language === "bn"
                    ? "আপনার জন্য সেরা রেসিপি পাওয়া গেছে!"
                    : "Perfect Recipe Found!"}
                </h2>

                {/* Description */}

                <p className="mt-4 text-lg leading-8 text-gray-700">
                  {language === "bn"
                    ? "আপনার তথ্য অনুযায়ী আমরা এই রেসিপিটি খুঁজে পেয়েছি:"
                    : "Based on your request, we found this recipe:"}
                  {prompt && (
                    <>
                      {" "}
                      <span className="font-semibold text-gray-900">
                        "{prompt}"
                      </span>
                    </>
                  )}{" "}
                  <span className="font-semibold text-orange-600">{title}</span>
                </p>

                {/* Stats */}

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Score */}

                  <div className="rounded-2xl border border-orange-100 bg-white p-5">
                    <Target size={20} className="mb-3 text-orange-500" />

                    <p className="text-sm text-gray-500">
                      {language === "bn" ? "মিলের স্কোর" : "Match Score"}
                    </p>

                    <h4 className="mt-1 text-2xl font-bold text-gray-900">
                      {score}%
                    </h4>
                  </div>

                  {/* Ingredients */}

                  <div className="rounded-2xl border border-orange-100 bg-white p-5">
                    <Sparkles size={20} className="mb-3 text-green-500" />

                    <p className="text-sm text-gray-500">
                      {language === "bn"
                        ? "মিল পাওয়া উপকরণ"
                        : "Matched Ingredients"}
                    </p>

                    <h4 className="mt-1 text-2xl font-bold text-gray-900">
                      {matchedIngredients.length}
                    </h4>
                  </div>

                  {/* Time */}

                  <div className="rounded-2xl border border-orange-100 bg-white p-5">
                    <Clock3 size={20} className="mb-3 text-blue-500" />

                    <p className="text-sm text-gray-500">
                      {language === "bn" ? "রান্নার সময়" : "Cooking Time"}
                    </p>

                    <h4 className="mt-1 text-2xl font-bold text-gray-900">
                      {recipe.totalTime} {language === "bn" ? "মিনিট" : "min"}
                    </h4>
                  </div>

                  {/* Difficulty */}

                  <div className="rounded-2xl border border-orange-100 bg-white p-5">
                    <Flame size={20} className="mb-3 text-red-500" />

                    <p className="text-sm text-gray-500">
                      {language === "bn" ? "কঠিনতা" : "Difficulty"}
                    </p>

                    <h4 className="mt-1 text-2xl font-bold text-gray-900">
                      {getLocalizedValue(recipe.difficulty, language)}
                    </h4>
                  </div>
                </div>

                {/* Summary */}

                <div className="mt-8 rounded-2xl border border-orange-100 bg-orange-50 p-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {language === "bn"
                      ? "কেন এই রেসিপি নির্বাচন করা হয়েছে?"
                      : "Why This Recipe Matches"}
                  </h3>

                  <p className="mt-3 leading-8 text-gray-700">
                    {language === "bn"
                      ? "এই রেসিপিটি আপনার উপকরণ এবং পছন্দের সাথে সবচেয়ে ভালো মিলেছে।"
                      : "This recipe is the best match based on your ingredients and preferences."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recipe Card */}

        <div className="mt-10">
          <RecipeCard recipe={recipe} />
        </div>
      </div>
    </section>
  );
}
