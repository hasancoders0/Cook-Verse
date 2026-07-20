"use client";

import { useMemo } from "react";
import { Search, X } from "lucide-react";

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
    <section
      className="sticky top-16 z-20"
      style={{
        background: "rgba(12, 10, 9, 0.88)",
        backdropFilter: "blur(24px) saturate(1.4)",
      }}
    >
      {/* Top gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-orange-500/25 to-transparent" />

      <div className="border-b border-white/[0.06] px-4 sm:px-6 py-3">
        <AppContainer>
          <div className="mx-auto max-w-5xl space-y-3">
            {/* Search */}
            <div className="relative mx-auto max-w-2xl">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-600 pointer-events-none"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-xl border border-white/[0.07] bg-stone-900/50 pl-10 pr-10 font-ui text-[13px] text-stone-100 outline-none transition-all duration-200 placeholder:text-stone-600 focus:border-orange-500/30 focus:bg-stone-900/70 focus:ring-2 focus:ring-orange-500/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-stone-500 transition-colors hover:bg-white/[0.06] hover:text-stone-300"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Ingredient Types */}
            <div className="flex flex-wrap justify-center gap-2">
              {ingredientTypes.map((type) => {
                const active = selectedType === type;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`rounded-xl px-4 py-2 font-ui text-[13px] font-medium capitalize transition-all duration-200 ${
                      active
                        ? "bg-orange-500/15 border border-orange-500/30 text-orange-300 shadow-sm shadow-orange-500/5"
                        : "border border-white/[0.07] bg-white/[0.02] text-stone-400 hover:bg-white/[0.04] hover:border-white/[0.12] hover:text-stone-200"
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
      </div>
    </section>
  );
}