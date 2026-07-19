"use client";

import {
  Zap,
  Activity,
  Droplets,
  PieChart,
  Wheat,
  Candy,
  FlaskConical,
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
      icon: <Zap size={20} />,
    },
    {
      label: isBn ? "প্রোটিন" : "Protein",
      value: recipe.nutrition?.protein ?? 0,
      unit: "g",
      icon: <Activity size={20} />,
    },
    {
      label: isBn ? "চর্বি" : "Fat",
      value: recipe.nutrition?.fat ?? 0,
      unit: "g",
      icon: <Droplets size={20} />,
    },
    {
      label: isBn ? "কার্বোহাইড্রেট" : "Carbs",
      value: recipe.nutrition?.carbohydrates ?? 0,
      unit: "g",
      icon: <PieChart size={20} />,
    },
    {
      label: isBn ? "ফাইবার" : "Fiber",
      value: recipe.nutrition?.fiber ?? 0,
      unit: "g",
      icon: <Wheat size={20} />,
    },
    {
      label: isBn ? "চিনি" : "Sugar",
      value: recipe.nutrition?.sugar ?? 0,
      unit: "g",
      icon: <Candy size={20} />,
    },
    {
      label: isBn ? "সোডিয়াম" : "Sodium",
      value: recipe.nutrition?.sodium ?? 0,
      unit: "mg",
      icon: <FlaskConical size={20} />,
    },
  ];

  return (
    <section className="py-14 lg:py-20 section-fade" style={{ background: "#171311", animationDelay: "0.3s" }}>
      <AppContainer>
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2.5 mb-4">
              <BarChart3Icon size={16} className="text-orange-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                {isBn ? "পুষ্টি" : "Nutrition"}
              </span>
            </div>

            <h2
              className="text-2xl lg:text-3xl font-bold text-stone-100"
              style={{ fontFamily: "serif" }}
            >
              {isBn ? "পুষ্টির তথ্য" : "Nutrition Facts"}
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              {isBn
                ? "প্রতি পরিবেশনের আনুমানিক পুষ্টিমান।"
                : "Approximate nutritional values per serving."}
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl p-5 text-center transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "#1c1714",
                  border: "1px solid rgba(68,64,60,0.3)",
                }}
              >
                <div
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl mb-3"
                  style={{ background: "rgba(249,115,22,0.1)" }}
                >
                  <span className="text-orange-400">{item.icon}</span>
                </div>

                <p className="text-xs text-stone-500 uppercase tracking-wider">
                  {item.label}
                </p>

                <p className="mt-2 text-2xl font-bold text-orange-400">
                  {item.value}
                  <span className="ml-0.5 text-sm font-medium text-stone-600">
                    {item.unit}
                  </span>
                </p>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div
            className="mt-8 rounded-xl p-4"
            style={{
              background: "rgba(249,115,22,0.04)",
              border: "1px solid rgba(249,115,22,0.08)",
            }}
          >
            <p className="text-xs leading-6 text-stone-500">
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

/* Small wrapper so the header icon matches the pattern */
function BarChart3Icon({ size, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}