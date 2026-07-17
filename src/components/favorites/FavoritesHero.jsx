import AppContainer from "@/components/ui/AppContainer";

export default function FavoritesHero() {
  return (
    <section className="bg-orange-50 py-20">
      <AppContainer>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">
            ❤️ Favorites
          </span>

          <h1 className="mt-6 text-5xl font-bold tracking-tight text-gray-900">
            Your Favorite Recipes
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Keep all your favorite recipes in one place and cook them anytime.
          </p>
        </div>
      </AppContainer>
    </section>
  );
}