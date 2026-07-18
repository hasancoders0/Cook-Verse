"use client";

import { ChefHat } from "lucide-react";

import generateRecipeContent from "@/content/generate-recipe";
import useTranslation from "@/hooks/useTranslation";

export default function EmptyState() {
  const { language } = useTranslation();

  const content =
    generateRecipeContent[language] ??
    generateRecipeContent.en;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white p-8 shadow-sm md:p-12">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200/60">
            <ChefHat className="h-10 w-10" />
          </div>

          {/* Title */}
          <h2 className="mt-8 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {content.emptyState.title}
          </h2>

          {/* Description */}
          <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
            {content.emptyState.description}
          </p>
        </div>
      </div>
    </section>
  );
}