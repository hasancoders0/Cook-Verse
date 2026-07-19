import { notFound } from "next/navigation";

import { getAllRecipes, getRecipeBySlug } from "@/lib/recipes";
import { getLocalizedValue } from "@/lib/language";

import RecipeHero from "@/components/recipe/RecipeHero";
import RecipeIngredients from "@/components/recipe/RecipeIngredients";
import RecipeInstructions from "@/components/recipe/RecipeInstructions";
import RecipeNutrition from "@/components/recipe/RecipeNutrition";
import RelatedRecipes from "@/components/recipe/RelatedRecipes";
import RecentlyViewedTracker from "@/components/recipe/RecentlyViewedTracker";

const DEFAULT_LANGUAGE = "en";

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
    title: getLocalizedValue(recipe.title, DEFAULT_LANGUAGE),
    description: getLocalizedValue(recipe.description, DEFAULT_LANGUAGE),
  };
}

export default async function RecipeDetailsPage({ params }) {
  const { slug } = await params;

  const recipe = getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  return (
    <main className="min-h-screen" style={{ background: "#13100e" }}>
      <style>{`
        .hero-reveal {
          animation: heroIn 0.8s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .section-fade {
          animation: secIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
          opacity: 0;
        }
        @keyframes secIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <RecentlyViewedTracker slug={recipe.slug} />

      <RecipeHero recipe={recipe} />

      <RecipeIngredients recipe={recipe} />

      <RecipeInstructions recipe={recipe} />

      <RecipeNutrition recipe={recipe} />

      <RelatedRecipes recipe={recipe} />
    </main>
  );
}