// src/components/home/ChatHeader.jsx
"use client";

import { Flame, RotateCcw, Sparkles } from "lucide-react";

const LABELS = {
  online: { en: "Online", bn: "অনলাইন" },
  finder: { en: "AI Recipe Finder", bn: "এআই রেসিপি ফাইন্ডার" },
  clear: { en: "Clear", bn: "মুছুন" },
};

function lbl(key, lang) {
  const field = LABELS[key];
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[lang] ?? field.en ?? "";
}

export default function ChatHeader({ lang, messageCount, onClear }) {
  return (
    <header
      className="sticky top-0 z-30 relative flex items-center gap-3 px-5 sm:px-6 py-3.5"
      style={{
        background: "rgba(12, 10, 9, 0.88)",
        backdropFilter: "blur(24px) saturate(1.4)",
      }}
    >
      {/* Gradient accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />

      {/* Brand */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25 flex-shrink-0">
          <Flame className="text-white" size={16} />
          <div className="absolute -inset-1.5 rounded-2xl bg-orange-500/15 -z-10 blur-sm" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="font-heading text-lg font-semibold text-stone-100 leading-tight tracking-tight">
              RecipeMind
            </h1>
            <Sparkles size={11} className="text-orange-500/50" />
          </div>
          <p className="font-ui text-[10px] text-stone-500 uppercase tracking-[0.18em] font-medium">
            {lbl("finder", lang)}
          </p>
        </div>
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-3">
        {/* Online badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/[0.07] border border-emerald-500/10">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
          <span className="font-ui text-[11px] text-emerald-400/80 font-medium">
            {lbl("online", lang)}
          </span>
        </div>

        {/* Clear button */}
        {messageCount > 1 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 font-ui text-[11px] text-stone-500 hover:text-stone-200 transition-all duration-200 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08]"
            title={lbl("clear", lang)}
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">{lbl("clear", lang)}</span>
          </button>
        )}
      </div>
    </header>
  );
}