import { Sparkles, BotMessageSquare } from "lucide-react";

import AppContainer from "@/components/ui/AppContainer";

export default function ChatHero() {
  return (
    <section className="overflow-hidden border-b border-orange-100 bg-gradient-to-b from-orange-50 via-orange-50/40 to-white">
      <AppContainer>
        <div className="mx-auto flex max-w-4xl flex-col items-center py-20 text-center md:py-24">
          {/* AI Icon */}

          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200">
            <BotMessageSquare size={38} />
          </div>

          {/* Badge */}

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-600 shadow-sm">
            <Sparkles size={16} />
            CookVerse AI Chef
          </div>

          {/* Heading */}

          <h1 className="mt-8 max-w-3xl text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Your Personal
            <span className="block bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              AI Recipe Assistant
            </span>
          </h1>

          {/* Description */}

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Tell me what ingredients you have, your preferred cuisine, dietary
            preferences, or cooking time, and I'll recommend the best matching
            recipe from the CookVerse collection.
          </p>

          {/* Quick Examples */}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm text-gray-700">
              🥩 I have chicken and rice
            </span>

            <span className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm text-gray-700">
              🥗 Healthy vegetarian dinner
            </span>

            <span className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm text-gray-700">
              ⏱ Ready in 30 minutes
            </span>

            <span className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm text-gray-700">
              🌶 Spicy Indian food
            </span>
          </div>
        </div>
      </AppContainer>
    </section>
  );
}
