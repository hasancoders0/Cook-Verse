"use client";

import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";

import useTranslation from "@/hooks/useTranslation";

export default function IngredientCard({ ingredient }) {
  const { language, t } = useTranslation();

  if (!ingredient) return null;

  const name =
    t(ingredient.name) || (language === "bn" ? "উপাদান" : "Ingredient");

  const type =
    typeof ingredient.type === "string" ? ingredient.type : t(ingredient.type);

  return (
    <Link href={`/ingredients/${ingredient.slug}`} className="group block">
      <article className="relative h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-stone-900/40 p-5 transition-all duration-300 hover:border-white/[0.12] hover:shadow-xl hover:shadow-black/30 hover:-translate-y-1">
        {/* Left accent bar on hover */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

        {/* Type badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/15 bg-orange-500/[0.07] px-2.5 py-1 font-ui text-[11px] font-medium capitalize text-orange-400">
          <span className="w-1 h-1 rounded-full bg-orange-500/60" />
          {type}
        </span>

        {/* Name */}
        <h3 className="mt-4 font-heading text-xl font-semibold text-stone-100 leading-snug transition-colors duration-200 group-hover:text-orange-300">
          {name}
        </h3>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between pt-4 border-t border-white/[0.05]">
          {/* Recipe count */}
          <div className="flex items-center gap-1.5 font-ui text-[12px] text-stone-500">
            <Layers size={13} className="text-stone-600" />
            <span>
              {ingredient.count}{" "}
              {language === "bn"
                ? "রেসিপি"
                : ingredient.count === 1
                  ? "Recipe"
                  : "Recipes"}
            </span>
          </div>

          {/* View link */}
          <span className="flex items-center gap-1.5 font-ui text-[12px] font-medium text-orange-400 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
            {language === "bn" ? "রেসিপি দেখুন" : "View Recipes"}
            <ArrowRight size={13} />
          </span>
        </div>
      </article>
    </Link>
  );
}