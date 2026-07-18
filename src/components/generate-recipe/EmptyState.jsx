"use client";

import {
  ChefHat,
  Clock3,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

import generateRecipeContent from "@/content/generate-recipe";
import useTranslation from "@/hooks/useTranslation";

export default function EmptyState() {
  const { language } = useTranslation();

  const content =
    generateRecipeContent[language] ||
    generateRecipeContent.en;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white p-10 shadow-sm">
        {/* Hero */}
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg">
            <ChefHat size={40} />
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
            <Sparkles size={16} />
            {content.emptyState.badge}
          </div>

          <h2 className="mt-6 text-4xl font-bold text-gray-900">
            {content.emptyState.title}
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            {content.emptyState.description}
          </p>
        </div>

        {/* Features */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {content.emptyState.features.map((feature, index) => {
            const Icon =
              index === 0
                ? Sparkles
                : index === 1
                  ? Clock3
                  : UtensilsCrossed;

            const iconBg =
              index === 0
                ? "bg-orange-100 text-orange-600"
                : index === 1
                  ? "bg-blue-100 text-blue-600"
                  : "bg-green-100 text-green-600";

            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-orange-100 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`mb-4 inline-flex rounded-2xl p-3 ${iconBg}`}>
                  <Icon size={24} />
                </div>

                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Example Prompts */}
        <div className="mt-14 rounded-3xl border border-dashed border-orange-200 bg-orange-50 p-8">
          <h3 className="text-center text-xl font-semibold text-gray-900">
            {content.emptyState.examples.title}
          </h3>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {content.emptyState.examples.prompts.map((prompt) => (
              <div
                key={prompt}
                className="rounded-2xl bg-white p-4 text-gray-700 shadow-sm"
              >
                {prompt}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}