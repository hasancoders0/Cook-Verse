"use client";

import { useMemo, useState } from "react";

import { getIngredients } from "@/lib/recipes";
import useTranslation from "@/hooks/useTranslation";

import IngredientsHero from "@/components/ingredients/IngredientsHero";
import IngredientsSearch from "@/components/ingredients/IngredientsSearch";
import IngredientsGrid from "@/components/ingredients/IngredientsGrid";

export default function IngredientsPage() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const { language, t } = useTranslation();

  // Get localized ingredients
  const ingredients = useMemo(() => getIngredients(language), [language]);

  const filteredIngredients = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return ingredients.filter((ingredient) => {
      const name = String(t(ingredient.name) || "").toLowerCase();
      const type = String(t(ingredient.type) || "");

      const matchesSearch = name.includes(keyword);

      const matchesType = selectedType === "all" || type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [ingredients, search, selectedType, t]);

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
