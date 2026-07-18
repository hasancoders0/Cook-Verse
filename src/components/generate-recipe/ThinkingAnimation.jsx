"use client";

import { Loader2, Sparkles } from "lucide-react";

import generateRecipeContent from "@/content/generate-recipe";
import useTranslation from "@/hooks/useTranslation";

export default function ThinkingAnimation() {
  const { language } = useTranslation();

  const content = generateRecipeContent[language] ?? generateRecipeContent.en;

  return (
    <section className="py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white p-10 shadow-sm">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200/60">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>

          {/* Title */}
          <h2 className="mt-8 text-3xl font-bold text-gray-900">
            {content.thinking.title}
          </h2>

          {/* Description */}
          <p className="mt-4 max-w-xl text-lg leading-8 text-gray-600">
            {content.thinking.description}
          </p>

          {/* Loading Dots */}
          <div className="mt-8 flex items-center gap-2">
            <Sparkles className="h-5 w-5 animate-pulse text-orange-500" />

            <span className="text-sm font-medium text-gray-500">
              {content.thinking.loading}
            </span>
          </div>

          <div className="mt-6 flex gap-2">
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-orange-500 [animation-delay:0ms]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-orange-500 [animation-delay:150ms]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-orange-500 [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </section>
  );
}
