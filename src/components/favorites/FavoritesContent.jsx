"use client";

import { useMemo } from "react";

import { useFavorites } from "@/context/FavoritesContext";
import useTranslation from "@/hooks/useTranslation";

import FavoritesHero from "./FavoritesHero";
import EmptyFavorites from "./EmptyFavorites";

import DishGrid from "@/components/dish/DishGrid";
import AppContainer from "@/components/ui/AppContainer";

export default function FavoritesContent({ recipes }) {
  const { favorites } = useFavorites();
  const { language } = useTranslation();

  const favoriteRecipes = useMemo(() => {
    return recipes.filter((recipe) =>
      favorites.includes(recipe.slug)
    );
  }, [recipes, favorites]);

  const content =
    language === "bn"
      ? {
          title: "সংরক্ষিত রেসিপি",
          description: `${favoriteRecipes.length} টি রেসিপি সংরক্ষিত আছে`,
        }
      : {
          title: "Saved Recipes",
          description: `${favoriteRecipes.length} recipe${favoriteRecipes.length !== 1 ? "s" : ""} saved`,
        };

  return (
    <>
      <FavoritesHero />

      {favoriteRecipes.length === 0 ? (
        <EmptyFavorites />
      ) : (
        <section className="bg-[#0c0a09] py-12">
          <AppContainer>
            {/* Section header */}
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-stone-100 tracking-tight">
                  {content.title}
                </h2>

                <p className="mt-1.5 font-ui text-sm text-stone-500">
                  {content.description}
                </p>
              </div>
            </div>

            <DishGrid recipes={favoriteRecipes} />
          </AppContainer>
        </section>
      )}
    </>
  );
}