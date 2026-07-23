// src/components/home/ChatMessages.jsx
"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  Clock,
  Star,
  BarChart3,
  ExternalLink,
  Search,
  User,
} from "lucide-react";

/* ── Minimal animations (can't do sequential dots with pure Tailwind) ── */
const ThinkingStyles = () => (
  <style>{`
    @keyframes thinkDot {
      0%, 60%, 100% { opacity: 0.15; transform: scale(0.75); }
      30% { opacity: 1; transform: scale(1.1); }
    }
    @keyframes spinSlow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .think-dot { animation: thinkDot 1.4s ease-in-out infinite; }
    .spin-slow { animation: spinSlow 10s linear infinite; }
  `}</style>
);

/* ── Local helpers ─────────────────────────────────────── */

function t(field, lang = "en") {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object")
    return field[lang] ?? field.en ?? Object.values(field).find(Boolean) ?? "";
  return "";
}

const UNIT = {
  min: { en: "min", bn: "মিনিট" },
  kcal: { en: "kcal", bn: "ক্যালোরি" },
};

function unit(key, lang) {
  return t(UNIT[key], lang);
}

function diffColor(d) {
  const s = (typeof d === "string" ? d : d?.en ?? "").toLowerCase();
  if (s === "easy" || s === "সহজ")
    return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  if (s === "medium" || s === "মাঝারি")
    return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  if (s === "hard" || s === "কঠিন")
    return "text-red-400 bg-red-400/10 border-red-400/20";
  return "text-stone-400 bg-stone-400/10 border-stone-400/20";
}

/* ── Sub-components ────────────────────────────────────── */

function ChatBubble({ msg }) {
  /* ── User bubble with icon ── */
  if (msg.role === "user") {
    return (
      <div className="msg-appear flex justify-end gap-2.5 items-start">
        <div className="max-w-[82%] sm:max-w-[68%] rounded-2xl rounded-br-sm bg-gradient-to-br from-stone-800/90 to-stone-800/60 border border-white/[0.08] px-4 py-3 font-ui text-sm leading-relaxed text-stone-100 shadow-sm shadow-black/10">
          {msg.text}
        </div>
        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-stone-800/80 border border-white/[0.08] flex items-center justify-center mt-0.5">
          <User className="text-stone-400" size={13} />
        </div>
      </div>
    );
  }

  /* ── AI bubble ── */
  return (
    <div className="msg-appear flex gap-3 items-start">
      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mt-0.5 shadow-md shadow-orange-500/15">
        <Flame className="text-white" size={12} />
      </div>
      <div className="max-w-[88%] sm:max-w-[80%] space-y-1.5">
{msg.text && (
  <div className="rounded-2xl rounded-bl-sm bg-stone-900/60 border border-white/[0.05] px-4 py-3 font-ui text-sm leading-relaxed text-stone-200 whitespace-pre-line">
    {msg.text}
  </div>
)}
        {msg.explanation && (
          <p className="font-ui text-xs text-stone-500 pl-1 leading-relaxed">
            {msg.explanation}
          </p>
        )}
        {msg.recommendation && (
          <p className="font-ui text-xs text-orange-400/80 pl-1 italic">
            {msg.recommendation}
          </p>
        )}
        {msg.followUp && (
          <p className="font-ui text-xs text-stone-500 pl-1 mt-1">
            {msg.followUp}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Enhanced thinking indicator ── */
function TypingIndicator({ lang = "en" }) {
  const label = lang === "bn" ? "ভাবছি…" : "Thinking…";

  return (
    <div className="msg-appear flex gap-3 items-start">
      {/* AI avatar with pulse ring */}
      <div className="relative flex-shrink-0 mt-0.5">
        <span
          className="absolute -inset-1.5 rounded-xl bg-orange-500/20 animate-ping"
          style={{ animationDuration: "2s" }}
        />
        <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/15">
          <Flame className="text-white" size={12} />
        </div>
      </div>

      {/* Thinking bubble */}
      <div className="rounded-2xl rounded-bl-sm bg-stone-900/60 border border-white/[0.05] px-5 py-4 flex items-center gap-3">
        <div className="flex gap-1.5 items-center">
          <span
            className="w-1.5 h-1.5 rounded-full bg-orange-400 think-dot"
            style={{ animationDelay: "0s" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-orange-400 think-dot"
            style={{ animationDelay: "0.2s" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-orange-400 think-dot"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
        <span className="font-ui text-[11px] text-stone-500 tracking-wide">
          {label}
        </span>
      </div>
    </div>
  );
}

/* ── Recipe result card ── */
function RecipeResultCard({ recipe, lang }) {
  const title = t(recipe.title, lang);
  const description = t(recipe.description, lang);
  const cuisine = t(recipe.cuisine?.name, lang);
  const category = t(recipe.category?.name, lang);
  const diff = t(recipe.difficulty, lang);
  const time = recipe.totalTime ?? 0;
  const calories = recipe.nutrition?.calories ?? 0;
  const rating = recipe.rating?.average;
  const ratingCount = recipe.rating?.count ?? 0;
  const thumbnail =
    recipe.image || recipe.thumbnail || "/images/placeholder-recipe.jpg";
  const slug = recipe.slug;

  return (
    <Link
      href={`/recipe/${slug}`}
      className="msg-appear group relative block rounded-2xl overflow-hidden border border-white/[0.06] bg-stone-900/40 hover:bg-stone-900/70 hover:border-white/[0.12] transition-all duration-300 hover:shadow-xl hover:shadow-black/30 max-w-[30rem]"
    >
      {/* Left accent bar on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex gap-3.5 p-3.5">
        {/* Thumbnail */}
        <div className="relative w-[84px] h-[84px] rounded-xl overflow-hidden flex-shrink-0 bg-stone-800 ring-1 ring-white/[0.06]">
          <img
            src={thumbnail}
            alt={title}
            loading="lazy"
            onError={(e) => {
              e.target.src = "/images/placeholder-recipe.jpg";
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {/* Shine overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
          <div className="absolute top-1.5 left-1.5">
            <span className="rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-semibold text-orange-300 font-ui backdrop-blur-md ring-1 ring-white/[0.05]">
              {category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-[92px] overflow-hidden py-0.5">
          <div className="min-w-0">
            {/* Rating */}
            <div className="flex items-center gap-1.5 text-xs mb-1">
              <Star className="fill-amber-400 text-amber-400" size={11} />
              <span className="font-ui font-semibold text-stone-200">
                {rating ?? "N/A"}
              </span>
              <span className="font-ui text-stone-600 text-[11px]">
                ({ratingCount})
              </span>
            </div>

            {/* Title */}
            <h4 className="font-ui text-[13px] font-semibold text-stone-100 truncate group-hover:text-orange-300 transition-colors leading-snug">
              {title}
            </h4>

            {/* Description */}
            {description && (
              <p className="mt-0.5 font-ui text-[11px] text-stone-500 line-clamp-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Meta footer */}
          <div className="flex items-center gap-2.5 mt-1.5 flex-shrink-0">
            <div className="flex items-center gap-1 font-ui text-[11px] text-stone-500">
              <Clock size={11} className="text-stone-600" />
              <span>
                {time} {unit("min", lang)}
              </span>
            </div>
            <div className="flex items-center gap-1 font-ui text-[11px] text-stone-500">
              <BarChart3 size={11} className="text-stone-600" />
              <span>
                {calories} {unit("kcal", lang)}
              </span>
            </div>
            <span className="ml-auto text-[10px] font-ui font-medium px-2 py-0.5 rounded-full flex-shrink-0 hidden sm:inline-flex text-stone-400 bg-stone-800/60 border border-white/[0.05]">
              {cuisine}
            </span>
            <span
              className={`text-[10px] font-ui font-semibold px-2 py-0.5 rounded-full flex-shrink-0 border ${diffColor(diff)}`}
            >
              {diff}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center flex-shrink-0 h-[84px]">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.03] border border-white/[0.05] group-hover:bg-orange-500/10 group-hover:border-orange-500/20 transition-all duration-300 group-hover:translate-x-0.5">
            <ExternalLink
              size={12}
              className="text-stone-600 group-hover:text-orange-400 transition-colors"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Suggestion chip ── */
function Chip({ suggestion, onClick, compact }) {
  const Icon = suggestion.icon || Search;
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl font-ui font-medium text-stone-400 hover:bg-orange-500/10 hover:border-orange-500/25 hover:text-orange-300 transition-all duration-300 whitespace-nowrap ${
        compact
          ? "px-3.5 py-1.5 text-xs border-white/[0.06] bg-white/[0.02]"
          : "px-5 py-3 text-[13px] border border-white/[0.08] bg-white/[0.03] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5"
      }`}
    >
      <Icon size={compact ? 12 : 15} className="text-orange-500/50" />
      {suggestion.label}
    </button>
  );
}

/* ── Welcome view ── */
function WelcomeView({ message, suggestions, onChip }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 sm:py-16">
      {/* Animated icon with rotating ring */}
      <div className="relative mb-8">
        <div className="absolute -inset-2 rounded-[1.75rem] border border-dashed border-orange-500/15 spin-slow" />
        <div className="absolute -inset-4 rounded-[2rem] bg-orange-500/[0.03] blur-lg" />
        <div className="relative w-[76px] h-[76px] rounded-[1.25rem] bg-gradient-to-br from-orange-500/20 to-orange-600/5 border border-orange-500/20 flex items-center justify-center">
          <Flame className="text-orange-500" size={32} />
        </div>
      </div>

      {/* Title with gradient text */}
      <h2
        className="font-heading text-3xl sm:text-[2.5rem] font-semibold tracking-tight mb-1.5"
        style={{
          background: "linear-gradient(to bottom, #f5f5f4, #a8a29e)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        MealMuse
      </h2>
      <p className="font-ui text-[11px] font-medium text-orange-400/50 uppercase tracking-[0.3em] mb-8">
        AI Recipe Finder
      </p>

      {/* Description */}
      <p className="font-ui text-sm text-stone-400 text-center max-w-md leading-relaxed mb-10">
        {message}
      </p>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-3 justify-center max-w-lg">
        {suggestions.map((s, i) => (
          <Chip
            key={`${s.label}-${i}`}
            suggestion={s}
            onClick={() => onChip(s.label)}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Main export ───────────────────────────────────────── */

export default function ChatMessages({
  messages,
  loading,
  lang,
  reasons,
  suggestions,
  onChip,
}) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* Welcome state */
  const isWelcome =
    messages.length === 1 && messages[0].role === "ai" && !loading;

  if (isWelcome) {
    return (
      <>
        <ThinkingStyles />
        <WelcomeView
          message={messages[0].text}
          suggestions={suggestions}
          onChip={onChip}
        />
      </>
    );
  }

  /* Normal chat view */
  return (
    <>
      <ThinkingStyles />

      {/* Scrollable message list */}
      <div className="flex-1 min-h-0 overflow-y-auto chat-scroll px-4 sm:px-6 py-5 flex flex-col gap-4">
        {messages.map((msg) => {
          if (msg.isRecipeCard && msg.recipe) {
            return (
              <RecipeResultCard key={msg.id} recipe={msg.recipe} lang={lang} />
            );
          }

          if (msg.text == null && msg.role === "ai") return null;

          return <ChatBubble key={msg.id} msg={msg} />;
        })}

        {loading && <TypingIndicator lang={lang} />}

        <div ref={endRef} />
      </div>

      {/* Suggestion chips — pinned at bottom */}
      {!loading && suggestions.length > 0 && (
        <div className="px-4 sm:px-6 pb-2.5 flex flex-wrap gap-1.5">
          {suggestions.map((s, i) => (
            <Chip
              key={`${s.label}-${i}`}
              suggestion={s}
              onClick={() => onChip(s.label)}
              compact
            />
          ))}
        </div>
      )}
    </>
  );
}