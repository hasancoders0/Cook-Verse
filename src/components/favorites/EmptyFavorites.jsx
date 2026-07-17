import Link from "next/link";

import AppContainer from "@/components/ui/AppContainer";

export default function EmptyFavorites() {
  return (
    <section className="py-24">
      <AppContainer>
        <div className="mx-auto max-w-lg text-center">
          <div className="text-7xl">❤️</div>

          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            No favorite recipes yet
          </h2>

          <p className="mt-4 text-gray-600">
            Browse recipes and save your favorites to find them here anytime.
          </p>

          <Link
            href="/dish"
            className="mt-8 inline-flex rounded-full bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            Browse Recipes
          </Link>
        </div>
      </AppContainer>
    </section>
  );
}