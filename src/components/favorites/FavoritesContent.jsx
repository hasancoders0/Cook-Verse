"use client";

import { useMemo } from "react";

import { useFavorites } from "@/context/FavoritesContext";

import FavoritesHero from "./FavoritesHero";
import EmptyFavorites from "./EmptyFavorites";

import DishGrid from "@/components/dish/DishGrid";
import AppContainer from "@/components/ui/AppContainer";

export default function FavoritesContent({ recipes }) {
  const { favorites } = useFavorites();

  const favoriteRecipes = useMemo(() => {
    return recipes.filter((recipe) =>
      favorites.includes(recipe.slug)
    );
  }, [recipes, favorites]);

  return (
    <>
      <FavoritesHero />

      {favoriteRecipes.length === 0 ? (
        <EmptyFavorites />
      ) : (
        <section className="py-16">
          <AppContainer>
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Saved Recipes
                </h2>

                <p className="mt-2 text-gray-600">
                  {favoriteRecipes.length} recipe
                  {favoriteRecipes.length !== 1 && "s"} saved
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