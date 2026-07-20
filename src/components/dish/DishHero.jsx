// src/components/dish/DishHero.jsx
"use client";

import dishContent from "@/content/dish";
import AppContainer from "@/components/ui/AppContainer";
import useTranslation from "@/hooks/useTranslation";
import { Sparkles } from "lucide-react";

export default function DishHero() {
  const { language } = useTranslation();

  const content = dishContent[language] ?? dishContent.en;
  const { hero } = content;

  return (
    <section className="relative border-b border-white/[0.06] bg-[#0c0a09] pt-20 pb-16 overflow-hidden">
      {/* Multi-layer atmospheric glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-orange-500/[0.06] blur-[140px]" />
        <div className="absolute top-[30%] left-[20%] w-[300px] h-[200px] bg-amber-500/[0.03] blur-[100px]" />
        <div className="absolute top-[20%] right-[15%] w-[250px] h-[180px] bg-orange-600/[0.03] blur-[90px]" />
      </div>

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px",
        }}
      />

      <AppContainer>
        <div className="relative mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/[0.07] px-4 py-1.5 backdrop-blur-sm">
            <Sparkles size={12} className="text-orange-500/70" />
            <span className="font-ui text-xs font-medium text-orange-400">
              {hero.badge}
            </span>
          </div>

          {/* Title with gradient */}
          <h1
            className="mt-7 font-heading text-4xl font-bold leading-tight sm:text-5xl tracking-tight"
            style={{
              background: "linear-gradient(to bottom, #f5f5f4, #a8a29e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {hero.title}
          </h1>

          {/* Description */}
          <p className="mt-5 font-ui text-base leading-relaxed text-stone-500 sm:text-lg max-w-2xl mx-auto">
            {hero.description}
          </p>
        </div>
      </AppContainer>

      {/* Bottom gradient fade into content */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0c0a09] to-transparent pointer-events-none" />
    </section>
  );
}