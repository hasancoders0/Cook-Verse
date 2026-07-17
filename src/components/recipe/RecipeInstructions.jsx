import { FiInfo } from "react-icons/fi";

import AppContainer from "@/components/ui/AppContainer";

export default function RecipeInstructions({ recipe }) {
  return (
    <section className="bg-gray-50 py-20">
      <AppContainer>
        <div className="mx-auto max-w-4xl">
          {/* Section Header */}
          <div className="mb-10">
            <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-600">
              Instructions
            </span>

            <h2 className="mt-5 text-4xl font-bold text-gray-900">
              Step-by-Step Directions
            </h2>

            <p className="mt-3 text-lg text-gray-600">
              Follow these simple steps to prepare your recipe.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            {recipe.instructions.map((step) => (
              <div
                key={step.step}
                className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm"
              >
                <div className="flex gap-6">
                  {/* Step Number */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-xl font-bold text-white">
                    {step.step}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {step.title}
                    </h3>

                    <p className="mt-3 leading-8 text-gray-600">
                      {step.description}
                    </p>

                    {step.tip && (
                      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4">
                        <FiInfo className="mt-0.5 shrink-0 text-lg text-orange-600" />

                        <div>
                          <p className="text-sm font-semibold text-orange-700">
                            Chef's Tip
                          </p>

                          <p className="mt-1 text-sm text-gray-600">
                            {step.tip}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppContainer>
    </section>
  );
}
