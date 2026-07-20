"use client";

import {
  Zap,
  Activity,
  Droplets,
  PieChart,
  Wheat,
  Candy,
  FlaskConical,
  BarChart3,
} from "lucide-react";
import AppContainer from "@/components/ui/AppContainer";
import useTranslation from "@/hooks/useTranslation";

export default function RecipeNutrition({ recipe }) {
  const { language } = useTranslation();

  const isBn = language === "bn";

  const items = [
    {
      label: isBn ? "ক্যালোরি" : "Calories",
      value: recipe.nutrition?.calories ?? 0,
      unit: "kcal",
      icon: <Zap size={15} />,
    },
    {
      label: isBn ? "প্রোটিন" : "Protein",
      value: recipe.nutrition?.protein ?? 0,
      unit: "g",
      icon: <Activity size={15} />,
    },
    {
      label: isBn ? "চর্বি" : "Fat",
      value: recipe.nutrition?.fat ?? 0,
      unit: "g",
      icon: <Droplets size={15} />,
    },
    {
      label: isBn ? "কার্বোহাইড্রেট" : "Carbs",
      value: recipe.nutrition?.carbohydrates ?? 0,
      unit: "g",
      icon: <PieChart size={15} />,
    },
    {
      label: isBn ? "ফাইবার" : "Fiber",
      value: recipe.nutrition?.fiber ?? 0,
      unit: "g",
      icon: <Wheat size={15} />,
    },
    {
      label: isBn ? "চিনি" : "Sugar",
      value: recipe.nutrition?.sugar ?? 0,
      unit: "g",
      icon: <Candy size={15} />,
    },
    {
      label: isBn ? "সোডিয়াম" : "Sodium",
      value: recipe.nutrition?.sodium ?? 0,
      unit: "mg",
      icon: <FlaskConical size={15} />,
    },
  ];

  return (
    <section
      className="bg-[#0c0a09] py-14 lg:py-20 section-fade"
      style={{ animationDelay: "0.3s" }}
    >
      <AppContainer>
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center">
                <BarChart3 size={15} className="text-orange-400" />
              </div>
              <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.15em] text-orange-400">
                {isBn ? "পুষ্টি" : "Nutrition"}
              </span>
            </div>

            <h2 className="font-heading text-2xl lg:text-3xl font-bold text-stone-100 tracking-tight">
              {isBn ? "পুষ্টির তথ্য" : "Nutrition Facts"}
            </h2>

            <p className="mt-2 font-ui text-sm text-stone-500">
              {isBn
                ? "প্রতি পরিবেশনের আনুমানিক পুষ্টিমান।"
                : "Approximate nutritional values per serving."}
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {items.map((item) => (
              <div
                key={item.label}
                className="group rounded-xl border border-white/[0.06] bg-stone-900/30 p-3.5 transition-all duration-200 hover:bg-stone-900/50 hover:border-white/[0.1]"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/15">
                    <span className="text-orange-400">{item.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500 truncate">
                      {item.label}
                    </p>
                    <p className="mt-1 font-ui text-xl font-bold text-orange-400">
                      {item.value}
                      <span className="ml-0.5 text-xs font-medium text-stone-600">
                        {item.unit}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-8 rounded-xl bg-orange-500/[0.04] border border-orange-500/10 p-4">
            <p className="font-ui text-xs leading-6 text-stone-500">
              <span className="font-semibold text-stone-400">
                {isBn ? "দ্রষ্টব্য:" : "Disclaimer:"}
              </span>{" "}
              {isBn
                ? "পুষ্টির মান আনুমানিক এবং উপাদানের ব্র্যান্ড, রান্নার পদ্ধতি ও পরিবেশনের পরিমাণ অনুযায়ী পরিবর্তিত হতে পারে।"
                : "Nutritional values are approximate and may vary depending on ingredient brands, preparation methods, and portion sizes."}
            </p>
          </div>
        </div>
      </AppContainer>
    </section>
  );
}