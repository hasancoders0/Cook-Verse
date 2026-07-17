import { notFound } from "next/navigation";

import { getAllRecipes, getRecipeBySlug } from "@/lib/recipes";

import RecipeHero from "@/components/recipe/RecipeHero";
import RecipeIngredients from "@/components/recipe/RecipeIngredients";
import RecipeInstructions from "@/components/recipe/RecipeInstructions";
import RecipeNutrition from "@/components/recipe/RecipeNutrition";
import RelatedRecipes from "@/components/recipe/RelatedRecipes";
import RecentlyViewedTracker from "@/components/recipe/RecentlyViewedTracker";

export async function generateStaticParams() {
  const recipes = getAllRecipes();

  return recipes.map((recipe) => ({
    slug: recipe.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const recipe = getRecipeBySlug(slug);

  if (!recipe) {
    return {
      title: "Recipe Not Found",
    };
  }

  return {
    title: recipe.title,
    description: recipe.description,
  };
}

export default async function RecipeDetailsPage({ params }) {
  const { slug } = await params;

  const recipe = getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  return (
    <main>
      <RecentlyViewedTracker slug={recipe.slug} />

      <RecipeHero recipe={recipe} />

      <RecipeIngredients recipe={recipe} />

      <RecipeInstructions recipe={recipe} />

      <RecipeNutrition recipe={recipe} />

      <RelatedRecipes recipe={recipe} />
    </main>
  );
}
