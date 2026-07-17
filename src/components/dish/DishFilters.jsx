"use client";

import { FiSearch, FiX } from "react-icons/fi";

import {
  getCategories,
  getCuisines,
  getDifficulties,
  getDiets,
} from "@/lib/recipes";

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
  const categories = getCategories();
  const cuisines = getCuisines();
  const diets = getDiets();
  const difficulties = getDifficulties();

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

  return (
    <section className="sticky top-16 z-20 border-y border-gray-200 bg-white/90 py-6 backdrop-blur">
      <AppContainer>
        <div className="space-y-5">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipes..."
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

          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3"
            >
              <option value="">All Categories</option>

              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3"
            >
              <option value="">All Cuisines</option>

              {cuisines.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3"
            >
              <option value="">All Diets</option>

              {diets.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3"
            >
              <option value="">All Difficulties</option>

              {difficulties.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3"
            >
              <option value="">Sort By</option>
              <option value="rating">Highest Rated</option>
              <option value="time">Fastest First</option>
              <option value="latest">Newest</option>
            </select>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {totalRecipes}
              </span>{" "}
              recipe{totalRecipes !== 1 && "s"}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-full border border-orange-200 bg-orange-50 px-5 py-2 text-sm font-medium text-orange-600 transition hover:bg-orange-100"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </AppContainer>
    </section>
  );
}
