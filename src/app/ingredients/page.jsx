"use client";

import { useMemo, useState } from "react";

import { getIngredients } from "@/lib/recipes";

import IngredientsHero from "@/components/ingredients/IngredientsHero";
import IngredientsSearch from "@/components/ingredients/IngredientsSearch";
import IngredientsGrid from "@/components/ingredients/IngredientsGrid";

export default function IngredientsPage() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const ingredients = getIngredients();

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ingredient) => {
      const matchesSearch = ingredient.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesType =
        selectedType === "all" || ingredient.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [ingredients, search, selectedType]);

  return (
    <main>
      <IngredientsHero />

      <IngredientsSearch
        search={search}
        setSearch={setSearch}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />

      <IngredientsGrid ingredients={filteredIngredients} />
    </main>
  );
}
