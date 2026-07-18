"use client";

import { FiCheckCircle, FiCpu, FiLoader, FiSearch } from "react-icons/fi";

import generateRecipeContent from "@/content/generate-recipe";
import useTranslation from "@/hooks/useTranslation";

const icons = {
  cpu: FiCpu,
  search: FiSearch,
  check: FiCheckCircle,
};

export default function ThinkingAnimation() {
  const { language } = useTranslation();

  const content = generateRecipeContent[language] || generateRecipeContent.en;

  return (
    <section className="py-10">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white shadow-lg">
        {/* Header */}
        <div className="border-b border-orange-100 p-8">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg">
              <FiLoader size={28} className="animate-spin" />
            </div>

            <div>
              <div className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                {content.thinking.badge}
              </div>

              <h2 className="mt-3 text-3xl font-bold text-gray-900">
                {content.thinking.title}
              </h2>

              <p className="mt-2 text-gray-600">
                {content.thinking.description}
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-5 p-8">
          {content.thinking.steps.map((step, index) => {
            const Icon = icons[step.icon];

            return (
              <div
                key={index}
                className="flex items-start gap-5 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <Icon size={22} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {step.title}
                    </h3>

                    <span className="text-xs font-medium text-orange-500">
                      {content.thinking.stepLabel} {index + 1} /{" "}
                      {content.thinking.steps.length}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {step.description}
                  </p>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-orange-100">
                    <div
                      className="h-full animate-pulse rounded-full bg-gradient-to-r from-orange-400 to-orange-600"
                      style={{
                        width: `${((index + 1) / content.thinking.steps.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-orange-100 bg-orange-50 px-8 py-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <p className="text-sm leading-7 text-gray-600">
              {content.thinking.footer}
            </p>

            <div className="flex gap-2">
              <span className="h-3 w-3 animate-bounce rounded-full bg-orange-500 [animation-delay:0ms]" />
              <span className="h-3 w-3 animate-bounce rounded-full bg-orange-500 [animation-delay:150ms]" />
              <span className="h-3 w-3 animate-bounce rounded-full bg-orange-500 [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
