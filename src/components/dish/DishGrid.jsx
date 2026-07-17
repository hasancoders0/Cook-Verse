import AppContainer from "@/components/ui/AppContainer";
import RecipeCard from "@/components/recipe/RecipeCard";

export default function DishGrid({ recipes }) {
  if (recipes.length === 0) {
    return (
      <section className="py-24">
        <AppContainer>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              No recipes found
            </h2>

            <p className="mt-4 text-gray-600">
              Try changing your search or filters.
            </p>
          </div>
        </AppContainer>
      </section>
    );
  }

  return (
    <section className="py-24">
      <AppContainer>
        <div className="mb-8">
          <p className="text-gray-600">
            {recipes.length} recipe
            {recipes.length > 1 ? "s" : ""} found
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
            />
          ))}
        </div>
      </AppContainer>
    </section>
  );
}