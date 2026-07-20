"use client";

import Image from "next/image";
import { Clock, Users, BarChart3, Gauge, Star, Flame } from "lucide-react";

import AppContainer from "@/components/ui/AppContainer";
import useTranslation from "@/hooks/useTranslation";

/* ── Difficulty Color Helper (matches ChatMessages) ── */
function getDiffColor(d) {
  const s = (typeof d === "string" ? d : "").toLowerCase();
  if (s === "easy" || s === "সহজ") return "text-emerald-400";
  if (s === "medium" || s === "মাঝারি") return "text-amber-400";
  if (s === "hard" || s === "কঠিন") return "text-red-400";
  return "text-stone-400";
}

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

        {/* Gradient Overlay - strictly matches #0c0a09 base */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, #0c0a09 0%, rgba(12,10,9,0.8) 40%, rgba(12,10,9,0.3) 70%, transparent 100%)",
          }}
        />

        {/* Content */}
        <div className="hero-reveal absolute bottom-0 left-0 right-0 px-5 pb-8 lg:px-10 lg:pb-10">
          <div className="max-w-4xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-orange-300 font-ui backdrop-blur-md ring-1 ring-white/[0.08]">
                {categoryName}
              </span>

              <span className="rounded-full bg-white/[0.08] px-2.5 py-1 text-[11px] font-medium text-stone-300 font-ui backdrop-blur-md ring-1 ring-white/[0.08]">
                {cuisineName}
              </span>

              {recipe.featured && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/[0.12] px-2.5 py-1 text-[11px] font-semibold text-amber-300 font-ui backdrop-blur-md ring-1 ring-amber-500/20">
                  <Flame size={11} />
                  {language === "bn" ? "ফিচার্ড" : "Featured"}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-stone-100 tracking-tight">
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p className="mt-4 font-ui text-base lg:text-lg leading-relaxed text-stone-400 line-clamp-2 max-w-2xl">
                {description}
              </p>
            )}

            {/* Rating & Tags Row */}
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Rating */}
              <div className="flex items-center gap-1.5">
                <Star className="fill-amber-400 text-amber-400" size={15} />
                <span className="font-ui text-sm font-semibold text-stone-200">
                  {recipe.rating?.average ?? 0}
                </span>
                <span className="font-ui text-sm text-stone-500">
                  ({recipe.rating?.count ?? 0} {reviewsLabel})
                </span>
              </div>

              {/* Tags */}
              {recipe.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {recipe.tags.map((tag, i) => (
                    <span
                      key={tag.slug || i}
                      className="rounded-full bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 font-ui text-[10px] font-medium text-stone-500"
                    >
                      #{t(tag.name)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Floating Stats Bar ===== */}
      <section className="relative z-10 px-4 lg:px-8">
        <AppContainer>
          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 rounded-2xl border border-white/[0.06] bg-[#0c0a09]/90 p-4 lg:p-5 shadow-2xl shadow-black/40"
            style={{ backdropFilter: "blur(24px) saturate(1.2)" }}
          >
            {/* Total Time */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center flex-shrink-0">
                <Clock size={17} className="text-orange-400" />
              </div>
              <div className="min-w-0">
                <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500">
                  {language === "bn" ? "মোট সময়" : "Total Time"}
                </p>
                <p className="font-ui text-sm font-semibold text-stone-100 mt-0.5">
                  {recipe.totalTime} {minLabel}
                </p>
                {(recipe.prepTime || recipe.cookTime) && (
                  <p className="font-ui text-[10px] text-stone-600 mt-0.5">
                    {prepLabel}: {recipe.prepTime ?? 0} &middot; {cookLabel}:{" "}
                    {recipe.cookTime ?? 0}
                  </p>
                )}
              </div>
            </div>

            {/* Servings */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center flex-shrink-0">
                <Users size={17} className="text-orange-400" />
              </div>
              <div className="min-w-0">
                <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500">
                  {language === "bn" ? "পরিবেশন" : "Servings"}
                </p>
                <p className="font-ui text-sm font-semibold text-stone-100 mt-0.5">
                  {recipe.servings} {language === "bn" ? "জন" : "people"}
                </p>
              </div>
            </div>

            {/* Calories */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center flex-shrink-0">
                <BarChart3 size={17} className="text-orange-400" />
              </div>
              <div className="min-w-0">
                <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500">
                  {language === "bn" ? "ক্যালোরি" : "Calories"}
                </p>
                <p className="font-ui text-sm font-semibold text-stone-100 mt-0.5">
                  {recipe.nutrition?.calories ?? 0} kcal
                </p>
              </div>
            </div>

            {/* Difficulty */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center flex-shrink-0">
                <Gauge size={17} className="text-orange-400" />
              </div>
              <div className="min-w-0">
                <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500">
                  {language === "bn" ? "কঠিনতা" : "Difficulty"}
                </p>
                <p
                  className={`font-ui text-sm font-semibold mt-0.5 ${getDiffColor(difficulty)}`}
                >
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
