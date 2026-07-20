"use client";

import { useState } from "react";
import { Check, ChefHat } from "lucide-react";

import AppContainer from "@/components/ui/AppContainer";
import useTranslation from "@/hooks/useTranslation";

/* -------------------------------------------------------------------------- */
/* Ingredient Row                                                            */
/* -------------------------------------------------------------------------- */

function IngredientRow({ item, lang }) {
  const [checked, setChecked] = useState(false);

  const name = item.name
    ? typeof item.name === "string"
      ? item.name
      : (item.name[lang] ?? item.name.en ?? "")
    : "";
  const note = item.note
    ? typeof item.note === "string"
      ? item.note
      : (item.note[lang] ?? item.note.en ?? "")
    : "";
  const amount =
    item.amount != null
      ? `${item.amount}${
          item.unit
            ? typeof item.unit === "string"
              ? ` ${item.unit}`
              : ` ${item.unit[lang] ?? item.unit.en ?? ""}`
            : ""
        }`
      : "";

  return (
    <label className="flex items-center gap-3 py-3.5 border-b border-white/[0.04] last:border-0 cursor-pointer group transition-colors hover:bg-white/[0.02] -mx-2 px-2 rounded-lg">
      {/* Checkbox */}
      <div
        onClick={(e) => {
          e.preventDefault();
          setChecked(!checked);
        }}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          checked
            ? "bg-orange-500 border-orange-500"
            : "border-stone-600 group-hover:border-stone-500"
        }`}
      >
        {checked && <Check size={11} className="text-white" strokeWidth={3} />}
      </div>

      {/* Name + Note */}
      <div className="flex-1 min-w-0">
        <span
          className={`font-ui text-sm transition-all duration-200 ${
            checked ? "line-through text-stone-600" : "text-stone-200"
          }`}
        >
          {name}
        </span>
        {note && (
          <p
            className={`font-ui text-[11px] mt-0.5 transition-all duration-200 ${
              checked ? "text-stone-700" : "text-stone-500"
            }`}
          >
            {note}
          </p>
        )}
      </div>

      {/* Amount */}
      {amount && (
        <span
          className={`font-ui text-xs font-medium flex-shrink-0 rounded-lg px-2.5 py-1 transition-all duration-200 ${
            checked
              ? "bg-stone-800/40 text-stone-600"
              : "bg-orange-500/10 text-orange-400 border border-orange-500/15"
          }`}
        >
          {amount}
        </span>
      )}
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                            */
/* -------------------------------------------------------------------------- */

export default function RecipeIngredients({ recipe }) {
  const { language, t } = useTranslation();

  const isBn = language === "bn";

  const totalIngredients =
    recipe.ingredientGroups?.reduce(
      (sum, g) => sum + (g.items?.length ?? 0),
      0,
    ) ?? 0;

  return (
    <section
      className="bg-[#0c0a09] py-14 lg:py-20 section-fade"
      style={{ animationDelay: "0.1s" }}
    >
      <AppContainer>
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center">
                <ChefHat size={15} className="text-orange-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.15em] text-orange-400">
                  {isBn ? "উপকরণ" : "Ingredients"}
                </span>
                <span className="w-1 h-1 rounded-full bg-stone-700" />
                <span className="font-ui text-[10px] text-stone-600">
                  {totalIngredients} {isBn ? "টি" : "items"}
                </span>
              </div>
            </div>

            <h2 className="font-heading text-2xl lg:text-3xl font-bold text-stone-100 tracking-tight">
              {isBn ? "যা যা লাগবে" : "Everything You'll Need"}
            </h2>

            <p className="mt-2 font-ui text-sm text-stone-500">
              {isBn
                ? "রান্না শুরু করার আগে সব উপাদান প্রস্তুত করে নিন।"
                : "Gather all the ingredients before you begin cooking."}
            </p>
          </div>

          {/* Groups */}
          <div className="space-y-3">
            {recipe.ingredientGroups?.map((group, gi) => (
              <div
                key={group.slug || gi}
                className="rounded-2xl border border-white/[0.06] bg-stone-900/30 overflow-hidden"
              >
                {/* Group Header */}
                {group.title && (
                  <div className="px-5 lg:px-6 py-3 border-b border-white/[0.05]">
                    <h3 className="font-ui text-[10px] font-semibold text-orange-400/80 uppercase tracking-[0.15em]">
                      {t(group.title)}
                    </h3>
                  </div>
                )}

                {/* Items */}
                <div className="px-5 lg:px-6 py-2">
                  {group.items?.map((item, ii) => (
                    <IngredientRow
                      key={item.slug || ii}
                      item={item}
                      lang={language}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-6 rounded-xl bg-orange-500/[0.06] border border-orange-500/10 p-4 text-center">
            <p className="font-ui text-xs text-stone-500">
              {isBn ? "উপকরণের পরিমাণ" : "Ingredient quantities are based on"}{" "}
              <span className="font-semibold text-stone-300">
                {recipe.servings}
              </span>{" "}
              {isBn ? "জনের জন্য।" : "servings."}
            </p>
          </div>
        </div>
      </AppContainer>
    </section>
  );
}
