"use client";

import { CheckCircle2, ShoppingCart } from "lucide-react";

import generateRecipeContent from "@/content/generate-recipe";
import useTranslation from "@/hooks/useTranslation";

export default function MissingIngredients({ ingredients = [], message = "" }) {
  const { language, t } = useTranslation();

  const content = generateRecipeContent[language] ?? generateRecipeContent.en;

  const missingContent = content.result.missingIngredients;

  const hasMissing = ingredients.length > 0 || Boolean(message);

  if (!hasMissing) {
    return (
      <section className="rounded-3xl border border-green-200 bg-green-50 p-8">
        <div className="flex items-start gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-green-800">
              {missingContent.ready.title}
            </h2>

            <p className="mt-2 max-w-2xl leading-7 text-green-700">
              {missingContent.ready.description}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white p-8 shadow-sm">
      <div className="flex items-start gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <ShoppingCart className="h-7 w-7" />
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">
            {missingContent.title}
          </h2>

          <p className="mt-2 leading-7 text-gray-600">
            {message || missingContent.description}
          </p>

          {ingredients.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {ingredients.map((ingredient) => (
                <span
                  key={ingredient.slug || ingredient.name}
                  className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                >
                  {t(ingredient.name)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
