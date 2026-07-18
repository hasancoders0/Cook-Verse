import { notFound } from "next/navigation";

import {
  getIngredients,
  getIngredientBySlug,
  getRecipesByIngredient,
} from "@/lib/recipes";

import { getLocalizedValue } from "@/lib/language";

import AppContainer from "@/components/ui/AppContainer";
import RecipeCard from "@/components/recipe/RecipeCard";

const DEFAULT_LANGUAGE = "en";

export async function generateStaticParams() {
  return getIngredients(DEFAULT_LANGUAGE).map((ingredient) => ({
    slug: ingredient.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const ingredient = getIngredientBySlug(slug, DEFAULT_LANGUAGE);

  if (!ingredient) {
    return {
      title: "Ingredient Not Found",
    };
  }

  const name = getLocalizedValue(ingredient.name, DEFAULT_LANGUAGE);

  return {
    title: `${name} Recipes`,
    description: `Browse delicious recipes made with ${name}.`,
  };
}

export default async function IngredientDetailsPage({ params }) {
  const { slug } = await params;

  const ingredient = getIngredientBySlug(slug, DEFAULT_LANGUAGE);

  if (!ingredient) {
    notFound();
  }

  const recipes = getRecipesByIngredient(slug);

  const name = getLocalizedValue(ingredient.name, DEFAULT_LANGUAGE);

  const type =
    typeof ingredient.type === "string"
      ? ingredient.type
      : getLocalizedValue(ingredient.type, DEFAULT_LANGUAGE);

  return (
    <main>
      {/* Hero */}
      <section className="bg-orange-50 py-20">
        <AppContainer>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-medium capitalize text-orange-600">
              {type}
            </span>

            <h1 className="mt-6 text-5xl font-bold text-gray-900">{name}</h1>

            <p className="mt-6 text-lg leading-8 text-gray-600">
              Discover delicious recipes that use{" "}
              <span className="font-semibold text-gray-900">{name}</span> as an
              ingredient.
            </p>

            <div className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm">
              {recipes.length} {recipes.length === 1 ? "Recipe" : "Recipes"}
            </div>
          </div>
        </AppContainer>
      </section>

      {/* Recipes */}
      <section className="py-20">
        <AppContainer>
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              Recipes with {name}
            </h2>

            <p className="mt-3 text-gray-600">
              Browse all recipes that include {name.toLowerCase()}.
            </p>
          </div>

          {recipes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 py-20 text-center">
              <h3 className="text-2xl font-bold text-gray-900">
                No Recipes Found
              </h3>

              <p className="mt-3 text-gray-600">
                We couldn't find any recipes using this ingredient.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </AppContainer>
      </section>
    </main>
  );
}
