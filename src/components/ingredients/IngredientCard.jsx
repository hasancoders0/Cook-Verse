"use client";

import Link from "next/link";
import { FiArrowRight, FiLayers } from "react-icons/fi";

import useTranslation from "@/hooks/useTranslation";

export default function IngredientCard({ ingredient }) {
  const { language, t } = useTranslation();

  if (!ingredient) return null;

  const name =
    t(ingredient.name) || (language === "bn" ? "উপাদান" : "Ingredient");

  const type =
    typeof ingredient.type === "string" ? ingredient.type : t(ingredient.type);

  return (
    <Link href={`/ingredients/${ingredient.slug}`}>
      <article className="group h-full rounded-3xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl">
        <div className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold capitalize text-orange-600">
          {type}
        </div>

        <h3 className="mt-5 text-2xl font-bold text-gray-900 transition-colors group-hover:text-orange-600">
          {name}
        </h3>

        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
          <div className="flex items-center gap-2 text-gray-500">
            <FiLayers />

            <span className="text-sm">
              {ingredient.count}{" "}
              {language === "bn"
                ? "রেসিপি"
                : ingredient.count === 1
                  ? "Recipe"
                  : "Recipes"}
            </span>
          </div>

          <span className="flex items-center gap-2 text-sm font-semibold text-orange-600 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">
            {language === "bn" ? "রেসিপি দেখুন" : "View Recipes"}

            <FiArrowRight />
          </span>
        </div>
      </article>
    </Link>
  );
}
