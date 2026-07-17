import homeContent from "@/content/home";

import { getFeaturedRecipes } from "@/lib/recipes";

import AppContainer from "@/components/ui/AppContainer";
import RecipeCard from "@/components/recipe/RecipeCard";

export default function PopularRecipes() {
  const { popularRecipes } = homeContent;

  const recipes = getFeaturedRecipes();

  return (
    <section className="bg-gray-50 py-24">
      <AppContainer>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-600">
            {popularRecipes.badge}
          </span>

          <h2 className="mt-6 text-4xl font-bold text-gray-900">
            {popularRecipes.title}
          </h2>

          <p className="mt-5 text-lg text-gray-600">
            {popularRecipes.description}
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </AppContainer>
    </section>
  );
}
