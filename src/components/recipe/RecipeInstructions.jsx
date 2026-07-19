"use client";

import { ListOrdered, Sparkles } from "lucide-react";

import AppContainer from "@/components/ui/AppContainer";
import useTranslation from "@/hooks/useTranslation";

export default function RecipeInstructions({ recipe }) {
  const { language, t } = useTranslation();

  const isBn = language === "bn";

  return (
    <section className="py-14 lg:py-20 section-fade" style={{ animationDelay: "0.2s" }}>
      <AppContainer>
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2.5 mb-4">
              <ListOrdered size={16} className="text-orange-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                {isBn ? "নির্দেশনা" : "Instructions"}
              </span>
              <span className="text-xs text-stone-600">
                {recipe.instructions?.length ?? 0} {isBn ? "ধাপ" : "steps"}
              </span>
            </div>

            <h2
              className="text-2xl lg:text-3xl font-bold text-stone-100"
              style={{ fontFamily: "serif" }}
            >
              {isBn ? "ধাপে ধাপে রান্নার পদ্ধতি" : "Step-by-Step Directions"}
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              {isBn
                ? "সুস্বাদু রেসিপি তৈরি করতে এই সহজ ধাপগুলো অনুসরণ করুন।"
                : "Follow these simple steps to prepare your recipe."}
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {recipe.instructions?.map((step, i) => (
              <div
                key={step.step}
                className="group rounded-2xl p-5 lg:p-6 transition-all duration-200 hover:bg-stone-800/30"
                style={{
                  background: "#1c1714",
                  border: "1px solid rgba(68,64,60,0.3)",
                }}
              >
                <div className="flex gap-4 lg:gap-5">
                  {/* Step Number */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white transition-transform duration-200 group-hover:scale-110">
                    {step.step}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-0.5">
                    <h3 className="text-base font-semibold text-stone-100">
                      {t(step.title)}
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-stone-400">
                      {t(step.description)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          {recipe.tips?.length > 0 && (
            <div
              className="mt-10 rounded-2xl p-5"
              style={{
                background: "rgba(120,53,15,0.06)",
                border: "1px solid rgba(245,158,11,0.15)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={15} className="text-amber-400" />
                <h4 className="text-sm font-semibold text-amber-400">
                  {isBn ? "শেফের টিপস" : "Chef's Tips"}
                </h4>
              </div>

              <ul className="space-y-2">
                {recipe.tips.map((tip, i) => {
                  const text = t(tip);
                  if (!text) return null;
                  return (
                    <li key={i} className="flex gap-2.5 text-sm text-stone-400 leading-relaxed">
                      <span className="w-1 h-1 rounded-full bg-amber-500/50 mt-2 flex-shrink-0" />
                      {text}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </AppContainer>
    </section>
  );
}