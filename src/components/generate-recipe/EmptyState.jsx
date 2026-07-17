import { ChefHat, Clock3, Sparkles, UtensilsCrossed } from "lucide-react";

export default function EmptyState() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white p-10 shadow-sm">
        {/* Hero */}

        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg">
            <ChefHat size={40} />
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
            <Sparkles size={16} />
            CookVerse AI Chef
          </div>

          <h2 className="mt-6 text-4xl font-bold text-gray-900">
            Ready to Find Your Perfect Recipe?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            Tell me what ingredients you already have, your favorite cuisine,
            dietary preferences, or how much time you have. I'll recommend the
            best matching recipe from the CookVerse collection.
          </p>
        </div>

        {/* Features */}

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-orange-100 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-4 inline-flex rounded-2xl bg-orange-100 p-3 text-orange-600">
              <Sparkles size={24} />
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              Smart Recipe Matching
            </h3>

            <p className="mt-3 leading-7 text-gray-600">
              Finds recipes that best match your available ingredients and
              preferences.
            </p>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-4 inline-flex rounded-2xl bg-blue-100 p-3 text-blue-600">
              <Clock3 size={24} />
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              Time-Based Suggestions
            </h3>

            <p className="mt-3 leading-7 text-gray-600">
              Discover recipes that fit your available cooking time and
              difficulty level.
            </p>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-4 inline-flex rounded-2xl bg-green-100 p-3 text-green-600">
              <UtensilsCrossed size={24} />
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              Shopping Assistance
            </h3>

            <p className="mt-3 leading-7 text-gray-600">
              Shows which ingredients you're missing and recommends similar
              recipes you can cook.
            </p>
          </div>
        </div>

        {/* Example Prompts */}

        <div className="mt-14 rounded-3xl border border-dashed border-orange-200 bg-orange-50 p-8">
          <h3 className="text-center text-xl font-semibold text-gray-900">
            Try asking something like...
          </h3>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 text-gray-700 shadow-sm">
              🥩 I have chicken, rice, onion and garlic. What can I cook?
            </div>

            <div className="rounded-2xl bg-white p-4 text-gray-700 shadow-sm">
              🌶 Recommend a spicy Indian dinner under 30 minutes.
            </div>

            <div className="rounded-2xl bg-white p-4 text-gray-700 shadow-sm">
              🥗 Show me a healthy vegetarian recipe.
            </div>

            <div className="rounded-2xl bg-white p-4 text-gray-700 shadow-sm">
              🍔 I want something easy for 4 people.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
