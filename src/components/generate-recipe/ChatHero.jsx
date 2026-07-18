"use client";

import { Sparkles, BotMessageSquare } from "lucide-react";

import AppContainer from "@/components/ui/AppContainer";

import generateRecipeContent from "@/content/generate-recipe";
import useTranslation from "@/hooks/useTranslation";

export default function ChatHero() {
  const { language } = useTranslation();

  const content =
    generateRecipeContent[language] ||
    generateRecipeContent.en;

  return (
    <section className="overflow-hidden border-b border-orange-100 bg-gradient-to-b from-orange-50 via-orange-50/40 to-white">
      <AppContainer>
        <div className="mx-auto flex max-w-4xl flex-col items-center py-20 text-center md:py-24">
          {/* AI Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200">
            <BotMessageSquare size={38} />
          </div>

          {/* Badge */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-600 shadow-sm">
            <Sparkles size={16} />
            {content.hero.badge}
          </div>

          {/* Heading */}
          <h1 className="mt-8 max-w-3xl text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            {content.hero.title.first}

            <span className="block bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              {content.hero.title.second}
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            {content.hero.description}
          </p>

          {/* Quick Examples */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {content.hero.examples.map((example) => (
              <span
                key={example}
                className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm text-gray-700"
              >
                {example}
              </span>
            ))}
          </div>
        </div>
      </AppContainer>
    </section>
  );
}