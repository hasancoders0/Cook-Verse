"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Star, BarChart3 } from "lucide-react";

import ROUTES from "@/constants/routes";
import FavoriteButton from "@/components/ui/FavoriteButton";
import useTranslation from "@/hooks/useTranslation";

/* ── Difficulty color mapping (matches ChatMessages) ── */
function diffStyle(d) {
  const s = (typeof d === "string" ? d : "").toLowerCase();
  if (s === "easy" || s === "সহজ")
    return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  if (s === "medium" || s === "মাঝারি")
    return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  if (s === "hard" || s === "কঠিন")
    return "text-red-400 bg-red-400/10 border-red-400/20";
  return "text-stone-400 bg-stone-400/10 border-stone-400/20";
}

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

  const title =
    t(recipe.title) ||
    (language === "bn" ? "রেসিপির নাম নেই" : "Untitled Recipe");

  const description = t(recipe.description) || "";
  const difficulty =
    t(recipe.difficulty) || (language === "bn" ? "সহজ" : "Easy");
  const categoryName =
    t(category?.name) || (language === "bn" ? "রেসিপি" : "Recipe");

  const minuteLabel = language === "bn" ? "মিনিট" : "min";
  const calorieLabel = language === "bn" ? "ক্যালরি" : "kcal";

  return (
    <Link href={`${ROUTES.RECIPE}/${slug}`} className="group block">
      <article className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-stone-900/40 transition-all duration-300 hover:border-white/[0.12] hover:shadow-xl hover:shadow-black/30 hover:-translate-y-1">
        {/* Left accent bar on hover */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-800">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Bottom gradient on image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Shine sweep on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

          {/* Category badge */}
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-orange-300 font-ui backdrop-blur-md ring-1 ring-white/[0.08]">
              {categoryName}
            </span>
          </div>

          {/* Favorite */}
          <div className="absolute right-3 top-3 z-10">
            <FavoriteButton slug={slug} />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Rating */}
          <div className="flex items-center gap-1.5 text-xs">
            <Star className="fill-amber-400 text-amber-400" size={13} />
            <span className="font-ui font-semibold text-stone-200">
              {rating?.average ?? "N/A"}
            </span>
            <span className="font-ui text-stone-600">
              ({rating?.count ?? 0})
            </span>
          </div>

          {/* Title */}
          <h3 className="mt-2.5 line-clamp-2 font-ui text-[15px] font-semibold text-stone-100 leading-snug transition-colors duration-200 group-hover:text-orange-300">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="mt-2 line-clamp-2 font-ui text-[13px] text-stone-500 leading-relaxed">
              {description}
            </p>
          )}

          {/* Footer */}
          <div className="mt-4 flex items-center gap-3 pt-3 border-t border-white/[0.05]">
            {/* Time */}
            <div className="flex items-center gap-1.5 font-ui text-[12px] text-stone-500">
              <Clock size={13} className="text-stone-600" />
              <span>
                {totalTime} {minuteLabel}
              </span>
            </div>

            {/* Calories */}
            <div className="flex items-center gap-1.5 font-ui text-[12px] text-stone-500">
              <BarChart3 size={13} className="text-stone-600" />
              <span>
                {nutrition?.calories ?? "--"} {calorieLabel}
              </span>
            </div>

            {/* Difficulty */}
            <span
              className={`ml-auto text-[10px] font-ui font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${diffStyle(difficulty)}`}
            >
              {difficulty}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}