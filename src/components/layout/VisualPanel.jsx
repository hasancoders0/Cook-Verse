"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiBarChart2, FiClock, FiStar } from "react-icons/fi";

import { Autoplay, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/effect-fade";

import recipes from "@/data/recipes";
import ROUTES from "@/constants/routes";

import useTranslation from "@/hooks/useTranslation";

export default function VisualPanel() {
  const { language, t } = useTranslation();

  const featuredRecipes = recipes.filter(
    (recipe) => recipe.featured && recipe.published,
  );

  const minuteLabel = language === "bn" ? "মিনিট" : "min";

  const calorieLabel = language === "bn" ? "ক্যালরি" : "kcal";

  return (
    <aside className="sticky top-0 hidden h-screen shrink-0 overflow-hidden border-l border-[#0c0a09de] xl:block  xl:w-[26rem] 2xl:w-[28rem]">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        loop
        speed={1200}
        allowTouchMove={false}
        autoplay={{
          delay: 7000,
          disableOnInteraction: false,
        }}
        className="h-full"
      >
        {featuredRecipes.map((recipe, index) => {
          const title =
            t(recipe.title) ||
            (language === "bn" ? "রেসিপির নাম নেই" : "Untitled Recipe");

          const category =
            t(recipe.category?.name) ||
            (language === "bn" ? "রেসিপি" : "Recipe");

          const difficulty =
            t(recipe.difficulty) || (language === "bn" ? "সহজ" : "Easy");

          return (
            <SwiperSlide key={recipe.id}>
              <div className="relative h-screen overflow-hidden">
                {/* Background Image */}

                <Image
                  src={recipe.thumbnail}
                  alt={title}
                  fill
                  priority={index === 0}
                  sizes="400px"
                  className="object-cover"
                />

                {/* Overlay */}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/5" />

                {/* Content */}

                <div className="absolute inset-x-0 bottom-0 p-8">
                  <span className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md">
                    {category}
                  </span>

                  <h2 className="mt-5 font-heading text-4xl font-semibold leading-tight text-white">
                    {title}
                  </h2>

                  <div className="mt-8 grid grid-cols-2 gap-5 text-white">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <FiStar />

                        <span>
                          {recipe.rating?.average ?? "N/A"} (
                          {recipe.rating?.count ?? 0})
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <FiClock />

                        <span>
                          {recipe.totalTime} {minuteLabel}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <FiBarChart2 />

                        <span>
                          {recipe.nutrition?.calories ?? "--"} {calorieLabel}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                        {difficulty}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`${ROUTES.RECIPE}/${recipe.slug}`}
                    className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-orange-500 hover:text-white"
                  >
                    {language === "bn" ? "রেসিপি দেখুন" : "View Recipe"}

                    <FiArrowRight />
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </aside>
  );
}
