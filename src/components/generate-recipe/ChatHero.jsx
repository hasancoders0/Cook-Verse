"use client";

import { Bot, Sparkles } from "lucide-react";

import AppContainer from "@/components/ui/AppContainer";

import generateRecipeContent from "@/content/generate-recipe";
import useTranslation from "@/hooks/useTranslation";

export default function ChatHero() {
  const { language } = useTranslation();

  const content = generateRecipeContent[language] ?? generateRecipeContent.en;

  return (
    <section className="border-b border-orange-100 bg-gradient-to-b from-orange-50/80 via-white to-white">
      <AppContainer>
        <div className="mx-auto flex max-w-3xl flex-col items-center py-16 text-center lg:py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600">
            <Sparkles className="h-4 w-4" />
            <span>{content.hero.badge}</span>
          </div>

          {/* AI Icon */}
          <div className="mt-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200/60">
            <Bot className="h-10 w-10" />
          </div>

          {/* Heading */}
          <h1 className="mt-8 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            {content.hero.title.first}
            <span className="mt-2 block bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              {content.hero.title.second}
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
            {content.hero.description}
          </p>
        </div>
      </AppContainer>
    </section>
  );
}
