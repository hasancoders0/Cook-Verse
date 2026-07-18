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

  const content =
    generateRecipeContent[language] ??
    generateRecipeContent.en;

  const { recipe, score = 0, matchedIngredients = [] } = result;

  const title = t(recipe.title);

  const stats = [
    {
      icon: Target,
      color: "text-orange-500",
      label: content.result.stats.score,
      value: `${score}%`,
    },
    {
      icon: Sparkles,
      color: "text-green-500",
      label: content.result.stats.ingredients,
      value: matchedIngredients.length,
    },
    {
      icon: Clock3,
      color: "text-blue-500",
      label: content.result.stats.time,
      value: `${recipe.totalTime} ${
        language === "bn" ? "মিনিট" : "min"
      }`,
    },
    {
      icon: Flame,
      color: "text-red-500",
      label: content.result.stats.difficulty,
      value: getLocalizedValue(recipe.difficulty, language),
    },
  ];

  return (
    <section className="py-10">
      <div className="mx-auto max-w-5xl">
        {/* AI Response */}
        <div className="overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white shadow-sm">
          <div className="p-8 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              {/* Icon */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg">
                <ChefHat className="h-8 w-8" />
              </div>

              <div className="flex-1">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600">
                  <Sparkles className="h-4 w-4" />
                  {content.result.badge}
                </div>

                {/* Title */}
                <h2 className="mt-5 text-3xl font-bold text-gray-900">
                  {content.result.title}
                </h2>

                {/* Description */}
                <p className="mt-3 text-lg text-gray-600">
                  {content.result.description}
                </p>

                {/* Recipe Name */}
                <div className="mt-6 rounded-2xl border border-orange-100 bg-white p-5">
                  <p className="text-sm text-gray-500">
                    {language === "bn"
                      ? "নির্বাচিত রেসিপি"
                      : "Selected Recipe"}
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-orange-600">
                    {title}
                  </h3>

                  {prompt && (
                    <p className="mt-2 text-sm text-gray-500">
                      "{prompt}"
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {stats.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-gray-100 bg-white p-5"
                      >
                        <Icon className={`mb-3 h-5 w-5 ${item.color}`} />

                        <p className="text-sm text-gray-500">
                          {item.label}
                        </p>

                        <h4 className="mt-1 text-xl font-semibold text-gray-900">
                          {item.value}
                        </h4>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recipe */}
        <div className="mt-10">
          <RecipeCard recipe={recipe} />
        </div>
      </div>
    </section>
  );
}