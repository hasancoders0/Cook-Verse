"use client";

import { Sparkles } from "lucide-react";

import generateRecipeContent from "@/content/generate-recipe";
import useTranslation from "@/hooks/useTranslation";

export default function SuggestionChips({ onSelect }) {
  const { language } = useTranslation();

  const content = generateRecipeContent[language] ?? generateRecipeContent.en;

  return (
    <section className="mt-10">
      {/* Header */}
      <div className="mb-5 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-orange-500" />

        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          {content.suggestions.title}
        </h3>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-3">
        {content.suggestions.items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.prompt)}
            className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 active:translate-y-0"
          >
            {item.title}
          </button>
        ))}
      </div>
    </section>
  );
}
