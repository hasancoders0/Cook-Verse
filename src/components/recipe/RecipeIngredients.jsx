import { FiCheckCircle } from "react-icons/fi";

import AppContainer from "@/components/ui/AppContainer";

export default function RecipeIngredients({ recipe }) {
  return (
    <section className="py-20">
      <AppContainer>
        <div className="mx-auto max-w-4xl">
          {/* Section Header */}
          <div className="mb-10">
            <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-600">
              Ingredients
            </span>

            <h2 className="mt-5 text-4xl font-bold text-gray-900">
              Everything You'll Need
            </h2>

            <p className="mt-3 text-lg text-gray-600">
              Gather all the ingredients before you begin cooking.
            </p>
          </div>

          <div className="space-y-8">
            {recipe.ingredientGroups.map((group) => (
              <div
                key={group.title}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
              >
                {/* Group Header */}
                <div className="border-b border-gray-200 bg-gray-50 px-8 py-5">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {group.title}
                  </h3>
                </div>

                {/* Ingredients */}
                <div className="divide-y divide-gray-100">
                  {group.items.map((ingredient) => (
                    <div
                      key={ingredient.slug}
                      className="flex items-start justify-between gap-6 px-8 py-5"
                    >
                      <div className="flex items-start gap-3">
                        <FiCheckCircle className="mt-1 shrink-0 text-lg text-orange-500" />

                        <div>
                          <h4 className="font-medium text-gray-900">
                            {ingredient.name}
                          </h4>

                          {ingredient.note && (
                            <p className="mt-1 text-sm text-gray-500">
                              {ingredient.note}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 rounded-xl bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600">
                        {ingredient.amount} {ingredient.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 rounded-2xl bg-orange-50 p-5 text-center">
            <p className="text-sm text-gray-600">
              Ingredient quantities are based on{" "}
              <span className="font-semibold text-gray-900">
                {recipe.servings} servings
              </span>
              .
            </p>
          </div>
        </div>
      </AppContainer>
    </section>
  );
}
