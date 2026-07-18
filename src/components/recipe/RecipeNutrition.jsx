"use client";

import { FiActivity, FiDroplet, FiPieChart, FiZap } from "react-icons/fi";

import AppContainer from "@/components/ui/AppContainer";
import useTranslation from "@/hooks/useTranslation";

export default function RecipeNutrition({ recipe }) {
  const { language } = useTranslation();

  const isBn = language === "bn";

  const nutritionItems = [
    {
      id: 1,
      label: isBn ? "ক্যালরি" : "Calories",
      value: recipe.nutrition?.calories ?? 0,
      unit: "kcal",
      icon: <FiZap />,
    },
    {
      id: 2,
      label: isBn ? "প্রোটিন" : "Protein",
      value: recipe.nutrition?.protein ?? 0,
      unit: "g",
      icon: <FiActivity />,
    },
    {
      id: 3,
      label: isBn ? "চর্বি" : "Fat",
      value: recipe.nutrition?.fat ?? 0,
      unit: "g",
      icon: <FiDroplet />,
    },
    {
      id: 4,
      label: isBn ? "কার্বোহাইড্রেট" : "Carbohydrates",
      value: recipe.nutrition?.carbohydrates ?? 0,
      unit: "g",
      icon: <FiPieChart />,
    },
    {
      id: 5,
      label: isBn ? "ফাইবার" : "Fiber",
      value: recipe.nutrition?.fiber ?? 0,
      unit: "g",
      icon: <FiActivity />,
    },
    {
      id: 6,
      label: isBn ? "চিনি" : "Sugar",
      value: recipe.nutrition?.sugar ?? 0,
      unit: "g",
      icon: <FiZap />,
    },
    {
      id: 7,
      label: isBn ? "সোডিয়াম" : "Sodium",
      value: recipe.nutrition?.sodium ?? 0,
      unit: "mg",
      icon: <FiDroplet />,
    },
  ];

  return (
    <section className="py-20">
      <AppContainer>
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-10">
            <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-600">
              {isBn ? "পুষ্টি" : "Nutrition"}
            </span>

            <h2 className="mt-5 text-4xl font-bold text-gray-900">
              {isBn ? "পুষ্টির তথ্য" : "Nutrition Facts"}
            </h2>

            <p className="mt-3 text-lg text-gray-600">
              {isBn
                ? "প্রতি পরিবেশনের আনুমানিক পুষ্টিমান।"
                : "Approximate nutritional values per serving."}
            </p>
          </div>

          {/* Nutrition Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {nutritionItems.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl text-orange-600">
                  {item.icon}
                </div>

                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  {item.label}
                </h3>

                <p className="mt-3 text-3xl font-bold text-orange-600">
                  {item.value}
                  <span className="ml-1 text-base font-medium text-gray-500">
                    {item.unit}
                  </span>
                </p>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-10 rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <p className="text-sm leading-7 text-gray-600">
              <strong>{isBn ? "দ্রষ্টব্য:" : "Disclaimer:"}</strong>{" "}
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
