"use client";

import useTranslation from "@/hooks/useTranslation";

import AppContainer from "@/components/ui/AppContainer";
import IngredientCard from "./IngredientCard";

export default function IngredientsGrid({ ingredients }) {
  const { language } = useTranslation();

  const content =
    language === "bn"
      ? {
          emptyTitle: "কোনো উপাদান পাওয়া যায়নি",
          emptyDescription: "অন্য কোনো উপাদান দিয়ে খুঁজে দেখুন।",
          title: `${ingredients.length} টি উপাদান`,
          description: "সুস্বাদু রেসিপি আবিষ্কার করতে উপাদানগুলো ব্রাউজ করুন।",
        }
      : {
          emptyTitle: "No Ingredients Found",
          emptyDescription: "Try searching for another ingredient.",
          title: `${ingredients.length} Ingredients`,
          description: "Browse ingredients to discover delicious recipes.",
        };

  if (ingredients.length === 0) {
    return (
      <section className="bg-[#0c0a09] py-20">
        <AppContainer>
          <div className="rounded-3xl border border-dashed border-white/[0.08] p-16 text-center">
            <h2 className="text-2xl font-bold text-stone-200">
              {content.emptyTitle}
            </h2>

            <p className="mt-3 text-stone-500">{content.emptyDescription}</p>
          </div>
        </AppContainer>
      </section>
    );
  }

  return (
    <section className="bg-[#0c0a09] py-20">
      <AppContainer>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-stone-100">{content.title}</h2>

          <p className="mt-2 text-stone-500">{content.description}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ingredients.map((ingredient) => (
            <IngredientCard key={ingredient.slug} ingredient={ingredient} />
          ))}
        </div>
      </AppContainer>
    </section>
  );
}