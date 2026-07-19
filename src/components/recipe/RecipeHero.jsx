"use client";

import Image from "next/image";

import {
  Clock,
  Users,
  BarChart3,
  Award,
  Star,
  Flame,
  ChefHat,
} from "lucide-react";

import AppContainer from "@/components/ui/AppContainer";
import useTranslation from "@/hooks/useTranslation";

export default function RecipeHero({ recipe }) {
  const { language, t } = useTranslation();

  const title = t(recipe.title) || (language === "bn" ? "রেসিপি" : "Recipe");

  const description = t(recipe.description);

  const categoryName = t(recipe.category?.name);

  const cuisineName = t(recipe.cuisine?.name);

  const difficulty = t(recipe.difficulty);

  const minLabel = language === "bn" ? "মিনিট" : "min";

  const reviewsLabel = language === "bn" ? "রিভিউ" : "reviews";

  const prepLabel = language === "bn" ? "প্রেপ" : "prep";

  const cookLabel = language === "bn" ? "কুক" : "cook";

  return (
    <>
      {/* ===== Hero Image ===== */}
      <section className="relative h-[65vh] min-h-[420px] overflow-hidden">
        <Image
          src={recipe.thumbnail}
          alt={title}
          fill
          priority
          className="object-cover scale-105"
          style={{ transition: "transform 8s ease" }}
          onLoad={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        />

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, #13100e 0%, rgba(19,16,14,0.75) 40%, rgba(19,16,14,0.25) 70%, transparent 100%)",
          }}
        />

        {/* Content */}
        <div className="hero-reveal absolute bottom-0 left-0 right-0 px-5 pb-8 lg:px-10 lg:pb-10">
          <div className="max-w-4xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="rounded-full bg-orange-500/90 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                {categoryName}
              </span>

              <span
                className="rounded-full px-3.5 py-1.5 text-xs font-medium backdrop-blur-sm"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "#d6cdc3",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {cuisineName}
              </span>

              {recipe.featured && (
                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-sm" style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <Flame size={11} />
                  {language === "bn" ? "ফিচার্ড" : "Featured"}
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-stone-100"
              style={{ fontFamily: "serif" }}
            >
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p className="mt-4 text-base lg:text-lg leading-relaxed text-stone-400 line-clamp-2 max-w-2xl">
                {description}
              </p>
            )}

            {/* Rating */}
            <div className="mt-5 flex items-center gap-2.5">
              <div className="flex items-center gap-1">
                <Star className="fill-yellow-400 text-yellow-400" size={16} />
                <span className="font-semibold text-stone-100">
                  {recipe.rating?.average ?? 0}
                </span>
              </div>

              <span className="text-sm text-stone-500">
                ({recipe.rating?.count ?? 0} {reviewsLabel})
              </span>
            </div>

            {/* Tags */}
            {recipe.tags?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {recipe.tags.map((tag, i) => (
                  <span
                    key={tag.slug || i}
                    className="rounded-full px-3 py-1 text-[11px] font-medium text-stone-500"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    #{t(tag.name)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== Floating Stats Bar ===== */}
      <section className="relative z-10 -mt-12 px-4 lg:px-8">
        <AppContainer>
          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 rounded-2xl p-4 lg:p-5"
            style={{
              background: "rgba(28,23,20,0.92)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(68,64,60,0.35)",
            }}
          >
            {/* Total Time */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(249,115,22,0.12)" }}>
                <Clock size={18} className="text-orange-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-stone-500">
                  {language === "bn" ? "মোট সময়" : "Total Time"}
                </p>
                <p className="text-sm font-semibold text-stone-100">
                  {recipe.totalTime} {minLabel}
                </p>
                {(recipe.prepTime || recipe.cookTime) && (
                  <p className="text-[10px] text-stone-600 mt-0.5">
                    {prepLabel}: {recipe.prepTime ?? 0} &middot; {cookLabel}: {recipe.cookTime ?? 0}
                  </p>
                )}
              </div>
            </div>

            {/* Servings */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(249,115,22,0.12)" }}>
                <Users size={18} className="text-orange-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-stone-500">
                  {language === "bn" ? "পরিবেশন" : "Servings"}
                </p>
                <p className="text-sm font-semibold text-stone-100">
                  {recipe.servings} {language === "bn" ? "জন" : "people"}
                </p>
              </div>
            </div>

            {/* Calories */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(249,115,22,0.12)" }}>
                <BarChart3 size={18} className="text-orange-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-stone-500">
                  {language === "bn" ? "ক্যালোরি" : "Calories"}
                </p>
                <p className="text-sm font-semibold text-stone-100">
                  {recipe.nutrition?.calories ?? 0} kcal
                </p>
              </div>
            </div>

            {/* Difficulty */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(249,115,22,0.12)" }}>
                <Award size={18} className="text-orange-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-stone-500">
                  {language === "bn" ? "কঠিনতা" : "Difficulty"}
                </p>
                <p className="text-sm font-semibold text-stone-100">
                  {difficulty}
                </p>
              </div>
            </div>
          </div>
        </AppContainer>
      </section>

      {/* Spacer for floating bar overlap */}
      <div className="h-8 lg:h-10" />
    </>
  );
}