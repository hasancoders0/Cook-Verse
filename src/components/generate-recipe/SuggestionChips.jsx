"use client";

import generateRecipeContent from "@/content/generate-recipe";
import useTranslation from "@/hooks/useTranslation";

export default function SuggestionChips({ onSelect }) {
  const { language } = useTranslation();

  const content = generateRecipeContent[language] || generateRecipeContent.en;

  return (
    <div className="mt-8">
      <p className="mb-4 text-sm font-medium text-gray-500">
        {content.suggestions.title}
      </p>

      <div className="flex flex-wrap gap-3">
        {content.suggestions.items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.prompt)}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
          >
            {item.title}
          </button>
        ))}
      </div>
    </div>
  );
}
