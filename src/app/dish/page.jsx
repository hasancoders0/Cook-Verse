"use client";

import { useMemo, useState } from "react";

import { getAllRecipes, searchRecipes } from "@/lib/recipes";

import DishHero from "@/components/dish/DishHero";
import DishFilters from "@/components/dish/DishFilters";
import DishGrid from "@/components/dish/DishGrid";

export default function DishPage() {
  const recipes = getAllRecipes();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [sort, setSort] = useState("");

  const [diet, setDiet] = useState("");

  const filteredRecipes = useMemo(() => {
    let filtered = search ? searchRecipes(search) : [...recipes];

    if (category) {
      filtered = filtered.filter((recipe) => recipe.category.slug === category);
    }

    if (cuisine) {
      filtered = filtered.filter((recipe) => recipe.cuisine.slug === cuisine);
    }

    if (diet) {
      filtered = filtered.filter((recipe) =>
        recipe.diet.some((item) => item.slug === diet),
      );
    }

    if (difficulty) {
      filtered = filtered.filter((recipe) => recipe.difficulty === difficulty);
    }

    switch (sort) {
      case "latest":
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;

      case "time":
        filtered.sort((a, b) => a.totalTime - b.totalTime);
        break;

      case "rating":
        filtered.sort((a, b) => b.rating.average - a.rating.average);
        break;

      default:
        break;
    }

    return filtered;
  }, [recipes, search, category, cuisine, diet, difficulty, sort]);

  return (
    <main>
      <DishHero />

      <DishFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        cuisine={cuisine}
        setCuisine={setCuisine}
        diet={diet}
        setDiet={setDiet}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        sort={sort}
        setSort={setSort}
        totalRecipes={filteredRecipes.length}
      />

      <DishGrid recipes={filteredRecipes} />
    </main>
  );
}
