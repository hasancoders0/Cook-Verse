import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import homeContent from "@/content/home";
import AppButton from "@/components/ui/AppButton";
import AppCard from "@/components/ui/AppCard";
import AppContainer from "@/components/ui/AppContainer";

export default function RecipeMethod() {
  const { recipeMethod } = homeContent;

  return (
    <section className="py-20 bg-gray-50">
      <AppContainer>
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-600">
            🍽️ Choose Your Way
          </span>

          <h2 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 lg:text-5xl">
            {recipeMethod.title}
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            {recipeMethod.description}
          </p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {recipeMethod.methods.map((method) => (
            <AppCard
              key={method.id}
              className="group rounded-3xl border border-gray-200 bg-white p-10 transition-all duration-300 hover:-translate-y-2 hover:border-orange-200 hover:shadow-xl"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-100 text-5xl">
                {method.emoji}
              </div>

              <h3 className="mt-8 text-3xl font-bold text-gray-900">
                {method.title}
              </h3>

              <p className="mt-4 leading-8 text-gray-600">
                {method.description}
              </p>

              <div className="mt-10">
                <Link href={method.href}>
                  <AppButton className="group w-full justify-center">
                    {method.button}

                    <FiArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </AppButton>
                </Link>
              </div>
            </AppCard>
          ))}
        </div>
      </AppContainer>
    </section>
  );
}
