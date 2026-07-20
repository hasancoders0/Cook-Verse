"use client";

import { ListOrdered, Sparkles } from "lucide-react";

import AppContainer from "@/components/ui/AppContainer";
import useTranslation from "@/hooks/useTranslation";

export default function RecipeInstructions({ recipe }) {
  const { language, t } = useTranslation();

  const isBn = language === "bn";

  return (
    <section
      className="bg-[#0c0a09] py-14 lg:py-20 section-fade"
      style={{ animationDelay: "0.2s" }}
    >
      <AppContainer>
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center">
                <ListOrdered size={15} className="text-orange-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.15em] text-orange-400">
                  {isBn ? "নির্দেশনা" : "Instructions"}
                </span>
                <span className="w-1 h-1 rounded-full bg-stone-700" />
                <span className="font-ui text-[10px] text-stone-600">
                  {recipe.instructions?.length ?? 0} {isBn ? "ধাপ" : "steps"}
                </span>
              </div>
            </div>

            <h2 className="font-heading text-2xl lg:text-3xl font-bold text-stone-100 tracking-tight">
              {isBn ? "ধাপে ধাপে রান্নার পদ্ধতি" : "Step-by-Step Directions"}
            </h2>

            <p className="mt-2 font-ui text-sm text-stone-500">
              {isBn
                ? "সুস্বাদু রেসিপি তৈরি করতে এই সহজ ধাপগুলো অনুসরণ করুন।"
                : "Follow these simple steps to prepare your recipe."}
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {recipe.instructions?.map((step) => (
              <div
                key={step.step}
                className="group rounded-2xl border border-white/[0.06] bg-stone-900/30 p-5 lg:p-6 transition-all duration-200 hover:bg-stone-900/50 hover:border-white/[0.1]"
              >
                <div className="flex gap-4 lg:gap-5">
                  {/* Step Number */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-transform duration-200 group-hover:scale-110">
                    {step.step}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-0.5 min-w-0">
                    <h3 className="font-ui text-base font-semibold text-stone-100">
                      {t(step.title)}
                    </h3>

                    <p className="mt-2 font-ui text-sm leading-7 text-stone-400">
                      {t(step.description)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          {recipe.tips?.length > 0 && (
            <div className="mt-10 rounded-2xl bg-amber-500/[0.05] border border-amber-500/10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={14} className="text-amber-400" />
                <h4 className="font-ui text-sm font-semibold text-amber-400">
                  {isBn ? "শেফের টিপস" : "Chef's Tips"}
                </h4>
              </div>

              <ul className="space-y-2.5">
                {recipe.tips.map((tip, i) => {
                  const text = t(tip);
                  if (!text) return null;
                  return (
                    <li
                      key={i}
                      className="flex gap-2.5 font-ui text-sm text-stone-400 leading-relaxed"
                    >
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
