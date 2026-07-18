"use client";

import { FiCheckCircle, FiShoppingCart } from "react-icons/fi";

import generateRecipeContent from "@/content/generate-recipe";
import useTranslation from "@/hooks/useTranslation";

export default function MissingIngredients({ ingredients = [], message = "" }) {
  const { language, t } = useTranslation();

  const content = generateRecipeContent[language] || generateRecipeContent.en;

  const missingContent = content.result.missingIngredients;

  const hasMissing = ingredients.length > 0 || !!message;

  if (!hasMissing) {
    return (
      <section className="rounded-3xl border border-green-200 bg-green-50 p-8 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600">
            <FiCheckCircle size={30} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-green-800">
              {missingContent.ready.title}
            </h2>

            <p className="mt-3 max-w-2xl leading-8 text-green-700">
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
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <FiShoppingCart size={30} />
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">
            {missingContent.title}
          </h2>

          <p className="mt-3 leading-8 text-gray-600">
            {message || missingContent.description}
          </p>

          {ingredients.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {ingredients.map((ingredient) => (
                <span
                  key={ingredient.slug || ingredient.name}
                  className="rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                >
                  {t(ingredient.name)}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <p className="text-sm leading-7 text-gray-600">
              {missingContent.footer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
