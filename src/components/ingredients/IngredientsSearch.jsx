"use client";

import { useMemo } from "react";
import { FiSearch, FiX } from "react-icons/fi";

import { getAllRecipes } from "@/lib/recipes";

import useTranslation from "@/hooks/useTranslation";

import AppContainer from "@/components/ui/AppContainer";

export default function IngredientsSearch({
  search,
  setSearch,
  selectedType,
  setSelectedType,
}) {
  const { language, t } = useTranslation();

  const ingredientTypes = useMemo(() => {
    const recipes = getAllRecipes();

    const types = new Set();

    recipes.forEach((recipe) => {
      recipe.ingredientGroups?.forEach((group) => {
        group.items?.forEach((item) => {
          if (item.type) {
            types.add(item.type);
          }
        });
      });
    });

    return ["all", ...Array.from(types).sort()];
  }, [language]);

  const searchPlaceholder =
    language === "bn"
      ? "মুরগি, চাল, টমেটো ইত্যাদি উপাদান খুঁজুন..."
      : "Search ingredients like chicken, rice, tomato...";

  return (
    <section className="sticky top-16 z-20 border-y border-gray-200 bg-white/90 py-5 backdrop-blur">
      <AppContainer>
        <div className="mx-auto max-w-5xl space-y-5">
          {/* Search */}

          <div className="relative mx-auto max-w-2xl">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-14 w-full rounded-2xl border border-gray-300 bg-white pl-14 pr-14 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <FiX className="text-lg" />
              </button>
            )}
          </div>

          {/* Ingredient Types */}

          <div className="flex flex-wrap justify-center gap-3">
            {ingredientTypes.map((type) => {
              const active = selectedType === type;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`rounded-full px-5 py-2 text-sm font-medium capitalize transition ${
                    active
                      ? "bg-orange-500 text-white shadow-md"
                      : "border border-gray-300 bg-white text-gray-700 hover:border-orange-300 hover:text-orange-600"
                  }`}
                >
                  {type === "all"
                    ? language === "bn"
                      ? "সব"
                      : "All"
                    : t(type)}
                </button>
              );
            })}
          </div>
        </div>
      </AppContainer>
    </section>
  );
}
