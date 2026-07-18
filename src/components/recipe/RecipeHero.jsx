"use client";

import Image from "next/image";
import { FiAward, FiBarChart2, FiClock, FiStar, FiUsers } from "react-icons/fi";

import AppContainer from "@/components/ui/AppContainer";
import useTranslation from "@/hooks/useTranslation";

export default function RecipeHero({ recipe }) {
  const { language, t } = useTranslation();

  const title = t(recipe.title) || (language === "bn" ? "রেসিপি" : "Recipe");

  const description = t(recipe.description);

  const categoryName = t(recipe.category?.name);

  const cuisineName = t(recipe.cuisine?.name);

  const difficulty = t(recipe.difficulty);

  return (
    <section className="border-b border-gray-200 bg-orange-50 py-16 lg:py-20">
      <AppContainer>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div>
            {/* Category & Cuisine */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-600">
                {categoryName}
              </span>

              <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700">
                {cuisineName}
              </span>
            </div>

            {/* Title */}
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              {title}
            </h1>

            {/* Description */}
            <p className="mt-5 text-lg leading-8 text-gray-600">
              {description}
            </p>

            {/* Rating */}
            <div className="mt-6 flex items-center gap-2">
              <FiStar className="fill-yellow-400 text-yellow-400" />

              <span className="font-semibold text-gray-900">
                {recipe.rating?.average ?? 0}
              </span>

              <span className="text-gray-500">
                ({recipe.rating?.count ?? 0}{" "}
                {language === "bn" ? "রিভিউ" : "reviews"})
              </span>
            </div>

            {/* Recipe Info */}
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
                <FiClock className="mx-auto mb-3 text-2xl text-orange-600" />

                <p className="text-sm text-gray-500">
                  {language === "bn" ? "মোট সময়" : "Total Time"}
                </p>

                <h3 className="mt-1 font-semibold text-gray-900">
                  {recipe.totalTime} {language === "bn" ? "মিনিট" : "min"}
                </h3>
              </div>

              <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
                <FiUsers className="mx-auto mb-3 text-2xl text-orange-600" />

                <p className="text-sm text-gray-500">
                  {language === "bn" ? "পরিবেশন" : "Servings"}
                </p>

                <h3 className="mt-1 font-semibold text-gray-900">
                  {recipe.servings}
                </h3>
              </div>

              <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
                <FiBarChart2 className="mx-auto mb-3 text-2xl text-orange-600" />

                <p className="text-sm text-gray-500">
                  {language === "bn" ? "ক্যালোরি" : "Calories"}
                </p>

                <h3 className="mt-1 font-semibold text-gray-900">
                  {recipe.nutrition?.calories ?? 0} kcal
                </h3>
              </div>

              <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
                <FiAward className="mx-auto mb-3 text-2xl text-orange-600" />

                <p className="text-sm text-gray-500">
                  {language === "bn" ? "কঠিনতা" : "Difficulty"}
                </p>

                <h3 className="mt-1 font-semibold text-gray-900">
                  {difficulty}
                </h3>
              </div>
            </div>

            {/* Tags */}
            {recipe.tags?.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-3">
                {recipe.tags.map((tag, index) => (
                  <span
                    key={tag.slug || index}
                    className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600"
                  >
                    #{t(tag.name)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Recipe Image */}
          <div className="relative overflow-hidden rounded-3xl">
            <div className="relative aspect-[4/3]">
              <Image
                src={recipe.thumbnail}
                alt={title}
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </AppContainer>
    </section>
  );
}
