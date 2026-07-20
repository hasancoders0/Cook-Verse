// src/components/dish/DishFilters.jsx
"use client";

import {
  Search,
  X,
  UtensilsCrossed,
  Globe2,
  Leaf,
  Gauge,
  ArrowUpDown,
  FilterX,
} from "lucide-react";

import {
  getCategories,
  getCuisines,
  getDifficulties,
  getDiets,
} from "@/lib/recipes";

import useTranslation from "@/hooks/useTranslation";
import dishContent from "@/content/dish";
import AppContainer from "@/components/ui/AppContainer";

export default function DishFilters({
  search,
  setSearch,
  category,
  setCategory,
  cuisine,
  setCuisine,
  diet,
  setDiet,
  difficulty,
  setDifficulty,
  sort,
  setSort,
  totalRecipes,
}) {
  const { language, t } = useTranslation();

  const content = dishContent[language] ?? dishContent.en;
  const filters = content.filters;

  const categories = getCategories(language);
  const cuisines = getCuisines(language);
  const diets = getDiets(language);
  const difficulties = getDifficulties(language);

  const hasFilters =
    search || category || cuisine || diet || difficulty || sort;

  function clearFilters() {
    setSearch("");
    setCategory("");
    setCuisine("");
    setDiet("");
    setDifficulty("");
    setSort("");
  }

  /* Select with icon prefix */
  function FilterSelect({ icon: Icon, value, onChange, children }) {
    return (
      <div className="relative">
        <Icon
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600 pointer-events-none"
        />
        <select
          value={value}
          onChange={onChange}
          className="w-full h-10 rounded-xl border border-white/[0.07] bg-stone-900/50 pl-9 pr-8 font-ui text-[13px] text-stone-300 outline-none transition-all duration-200 focus:border-orange-500/30 focus:bg-stone-900/70 focus:ring-2 focus:ring-orange-500/10 appearance-none cursor-pointer hover:border-white/[0.12]"
        >
          {children}
        </select>
        {/* Custom chevron */}
        <svg
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-600 pointer-events-none"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    );
  }

  return (
    <section
      className="sticky top-0 z-20"
      style={{
        background: "rgba(12, 10, 9, 0.88)",
        backdropFilter: "blur(24px) saturate(1.4)",
      }}
    >
      {/* Top gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-orange-500/25 to-transparent" />

      <div className="border-b border-white/[0.06] px-4 sm:px-6 py-3">
        <AppContainer>
          <div className="space-y-2.5">
            {/* Row 1: Search + Clear */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-600 pointer-events-none"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={filters.searchPlaceholder}
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

              {/* Clear all — inline */}
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl border border-orange-500/20 bg-orange-500/[0.07] font-ui text-[12px] font-medium text-orange-400 transition-all duration-200 hover:bg-orange-500/15 hover:border-orange-500/30 whitespace-nowrap flex-shrink-0"
                >
                  <FilterX size={13} />
                  <span className="hidden sm:inline">{filters.clearFilters}</span>
                </button>
              )}

              {/* Recipe count — inline */}
              <div className="hidden md:flex items-center gap-1.5 flex-shrink-0 pl-2 border-l border-white/[0.06]">
                <span className="font-ui text-[12px] text-stone-600">
                  {filters.showing}
                </span>
                <span className="font-ui text-[13px] font-semibold text-stone-300">
                  {totalRecipes}
                </span>
              </div>
            </div>

            {/* Row 2: Filter dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2">
              <FilterSelect
                icon={UtensilsCrossed}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">{filters.allCategories}</option>
                {categories.map((item) => (
                  <option
                    key={item.slug}
                    value={item.slug}
                    className="bg-stone-900 text-stone-200"
                  >
                    {t(item.name)}
                  </option>
                ))}
              </FilterSelect>

              <FilterSelect
                icon={Globe2}
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
              >
                <option value="">{filters.allCuisines}</option>
                {cuisines.map((item) => (
                  <option
                    key={item.slug}
                    value={item.slug}
                    className="bg-stone-900 text-stone-200"
                  >
                    {t(item.name)}
                  </option>
                ))}
              </FilterSelect>

              <FilterSelect
                icon={Leaf}
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
              >
                <option value="">{filters.allDiets}</option>
                {diets.map((item) => (
                  <option
                    key={item.slug}
                    value={item.slug}
                    className="bg-stone-900 text-stone-200"
                  >
                    {t(item.name)}
                  </option>
                ))}
              </FilterSelect>

              <FilterSelect
                icon={Gauge}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="">{filters.allDifficulties}</option>
                {difficulties.map((item) => {
                  const label = t(item);
                  return (
                    <option
                      key={label}
                      value={label}
                      className="bg-stone-900 text-stone-200"
                    >
                      {label}
                    </option>
                  );
                })}
              </FilterSelect>

              <FilterSelect
                icon={ArrowUpDown}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="">{filters.sortBy}</option>
                <option value="rating" className="bg-stone-900 text-stone-200">
                  {filters.highestRated}
                </option>
                <option value="time" className="bg-stone-900 text-stone-200">
                  {filters.fastest}
                </option>
                <option value="latest" className="bg-stone-900 text-stone-200">
                  {filters.newest}
                </option>
              </FilterSelect>
            </div>

            {/* Mobile-only count */}
            <div className="flex md:hidden items-center gap-1.5">
              <span className="font-ui text-[11px] text-stone-600">
                {filters.showing}
              </span>
              <span className="font-ui text-[12px] font-semibold text-stone-300">
                {totalRecipes}
              </span>
              <span className="font-ui text-[11px] text-stone-600">
                {totalRecipes === 1 ? filters.recipe : filters.recipes}
              </span>
            </div>
          </div>
        </AppContainer>
      </div>
    </section>
  );
}