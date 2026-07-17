"use client";

import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

import homeContent from "@/content/home";
import AppContainer from "@/components/ui/AppContainer";

export default function FAQ() {
  const { faq } = homeContent;

  const [active, setActive] = useState(0);

  return (
    <section className="bg-gray-50 py-24">
      <AppContainer>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-600">
            {faq.badge}
          </span>

          <h2 className="mt-6 text-4xl font-bold text-gray-900">
            {faq.title}
          </h2>

          <p className="mt-5 text-lg text-gray-600">
            {faq.description}
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-3xl space-y-4">
          {faq.items.map((item, index) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              <button
                onClick={() =>
                  setActive(active === index ? -1 : index)
                }
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <span className="text-lg font-semibold">
                  {item.question}
                </span>

                <FiChevronDown
                  className={`transition ${
                    active === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {active === index && (
                <div className="border-t border-gray-100 px-6 py-5 text-gray-600">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </AppContainer>
    </section>
  );
}