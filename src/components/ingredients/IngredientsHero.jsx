import AppContainer from "@/components/ui/AppContainer";

export default function IngredientsHero() {
  return (
    <section className="bg-orange-50 py-20 lg:py-24">
      <AppContainer>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-600">
            Ingredients
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            Find Recipes by Ingredient
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Explore hundreds of ingredients and instantly discover recipes
            you can cook. Search for your favorite ingredient or browse the
            collection to find your next meal.
          </p>
        </div>
      </AppContainer>
    </section>
  );
}