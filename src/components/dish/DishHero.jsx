"use client";

import dishContent from "@/content/dish";

import AppContainer from "@/components/ui/AppContainer";
import useTranslation from "@/hooks/useTranslation";

export default function DishHero() {
  const { language } = useTranslation();

  const content = dishContent[language] ?? dishContent.en;
  const { hero } = content;

  return (
    <section className="bg-orange-50 py-20">
      <AppContainer>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-600">
            {hero.badge}
          </span>

          <h1 className="mt-6 text-5xl font-bold leading-tight text-gray-900 md:text-6xl">
            {hero.title}
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            {hero.description}
          </p>
        </div>
      </AppContainer>
    </section>
  );
}
