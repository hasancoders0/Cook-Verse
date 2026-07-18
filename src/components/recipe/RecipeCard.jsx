"use client";

import Image from "next/image";
import Link from "next/link";
import { FiBarChart2, FiClock, FiStar } from "react-icons/fi";

import ROUTES from "@/constants/routes";

import FavoriteButton from "@/components/ui/FavoriteButton";

import useTranslation from "@/hooks/useTranslation";

export default function RecipeCard({ recipe }) {
  if (!recipe) return null;

  const { language, t } = useTranslation();

  const {
    slug = "",
    thumbnail = "/images/placeholder-recipe.jpg",
    totalTime = 0,
    category,
    nutrition,
    rating,
  } = recipe;

  // Localized Data

  const title =
    t(recipe.title) ||
    (language === "bn" ? "রেসিপির নাম নেই" : "Untitled Recipe");

  const description = t(recipe.description) || "";

  const difficulty =
    t(recipe.difficulty) || (language === "bn" ? "সহজ" : "Easy");

  const categoryName =
    t(category?.name) || (language === "bn" ? "রেসিপি" : "Recipe");

  // Labels

  const minuteLabel = language === "bn" ? "মিনিট" : "min";

  const calorieLabel = language === "bn" ? "ক্যালরি" : "kcal";

  return (
    <Link href={`${ROUTES.RECIPE}/${slug}`}>
      <article className="group overflow-hidden rounded-3xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
        {/* Image */}

        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover transition duration-500 group-hover:scale-110"
          />

          {/* Category */}

          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-orange-600 backdrop-blur">
              {categoryName}
            </span>
          </div>

          {/* Favorite */}

          <div className="absolute right-4 top-4 z-10">
            <FavoriteButton slug={slug} />
          </div>
        </div>

        {/* Content */}

        <div className="p-6">
          {/* Rating */}

          <div className="flex items-center gap-2 text-sm">
            <FiStar className="fill-yellow-400 text-yellow-400" />

            <span className="font-semibold text-gray-900">
              {rating?.average ?? "N/A"}
            </span>

            <span className="text-gray-500">({rating?.count ?? 0})</span>
          </div>

          {/* Title */}

          <h3 className="mt-4 line-clamp-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-orange-600">
            {title}
          </h3>

          {/* Description */}

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">
            {description}
          </p>

          {/* Footer */}

          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
            {/* Time */}

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiClock />

              <span>
                {totalTime} {minuteLabel}
              </span>
            </div>

            {/* Calories */}

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiBarChart2 />

              <span>
                {nutrition?.calories ?? "--"} {calorieLabel}
              </span>
            </div>

            {/* Difficulty */}

            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
              {difficulty}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
