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
    <main className="bg-[#0c0a09]">
      {/* Hero */}
      <section className="relative border-b border-white/[0.06] pt-20 pb-16 overflow-hidden">
        {/* Atmospheric glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-orange-500/[0.06] blur-[140px]" />
          <div className="absolute top-[30%] left-[20%] w-[300px] h-[200px] bg-amber-500/[0.03] blur-[100px]" />
          <div className="absolute top-[20%] right-[15%] w-[250px] h-[180px] bg-orange-600/[0.03] blur-[90px]" />
        </div>

        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px",
          }}
        />

        <AppContainer>
          <div className="relative mx-auto max-w-3xl text-center">
            {/* Type badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/[0.07] px-4 py-1.5 backdrop-blur-sm font-ui text-xs font-medium capitalize text-orange-400">
              <span className="w-1 h-1 rounded-full bg-orange-500/60" />
              {type}
            </span>

            {/* Title */}
            <h1
              className="mt-7 font-heading text-5xl font-bold leading-tight tracking-tight"
              style={{
                background: "linear-gradient(to bottom, #f5f5f4, #a8a29e)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {name}
            </h1>

            {/* Description */}
            <p className="mt-5 font-ui text-base leading-relaxed text-stone-500 sm:text-lg max-w-2xl mx-auto">
              Discover delicious recipes that use{" "}
              <span className="font-semibold text-stone-200">{name}</span> as an
              ingredient.
            </p>

            {/* Recipe count pill */}
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 font-ui text-sm font-medium text-stone-300 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500/60" />
              {recipes.length} {recipes.length === 1 ? "Recipe" : "Recipes"}
            </div>
          </div>
        </AppContainer>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0c0a09] to-transparent pointer-events-none" />
      </section>

      {/* Recipes */}
      <section className="py-12">
        <AppContainer>
          {/* Section header */}
          <div className="mb-7">
            <h2 className="font-heading text-2xl font-semibold text-stone-100 tracking-tight">
              Recipes with {name}
            </h2>

            <p className="mt-1.5 font-ui text-sm text-stone-500">
              Browse all recipes that include {name.toLowerCase()}.
            </p>
          </div>

          {recipes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.08] py-16 text-center">
              <h3 className="font-heading text-xl font-semibold text-stone-200">
                No Recipes Found
              </h3>

              <p className="mt-2.5 font-ui text-sm text-stone-500 leading-relaxed">
                We couldn't find any recipes using this ingredient.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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