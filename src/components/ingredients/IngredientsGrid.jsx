import AppContainer from "@/components/ui/AppContainer";
import IngredientCard from "./IngredientCard";

export default function IngredientsGrid({
  ingredients,
}) {
  if (ingredients.length === 0) {
    return (
      <section className="py-20">
        <AppContainer>
          <div className="rounded-3xl border border-dashed border-gray-300 p-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              No Ingredients Found
            </h2>

            <p className="mt-3 text-gray-600">
              Try searching for another ingredient.
            </p>
          </div>
        </AppContainer>
      </section>
    );
  }

  return (
    <section className="py-20">
      <AppContainer>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {ingredients.length} Ingredients
          </h2>

          <p className="mt-2 text-gray-600">
            Browse ingredients to discover delicious recipes.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ingredients.map((ingredient) => (
            <IngredientCard
              key={ingredient.slug}
              ingredient={ingredient}
            />
          ))}
        </div>
      </AppContainer>
    </section>
  );
}