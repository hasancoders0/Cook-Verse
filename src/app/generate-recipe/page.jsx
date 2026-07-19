"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

import { generateRecipe } from "@/lib/ai/generate-recipe";

import {
  Flame,
  Search,
  ArrowUp,
  Clock,
  Star,
  Users,
  BarChart3,
  ChevronRight,
  UtensilsCrossed,
  Zap,
  Globe,
  ChefHat,
  Timer,
  Leaf,
  MessageSquare,
  RotateCcw,
  ExternalLink,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const INITIAL_SUGGESTIONS = [
  { label: "Chicken Biryani", icon: Zap },
  { label: "Quick breakfast", icon: Timer },
  { label: "Something healthy", icon: Leaf },
  { label: "Not spicy dinner", icon: Globe },
];

const FALLBACK_SUGGESTIONS = [
  { label: "Beef burger recipe", icon: ChefHat },
  { label: "Vegetable salad", icon: Leaf },
  { label: "I have rice and eggs", icon: Search },
  { label: "American fast food", icon: Globe },
];

const GREETINGS = {
  en: "Welcome to RecipeMind! I can find the perfect recipe for you. Try searching by dish name, ingredient, cuisine, or just tell me what you're in the mood for.",
  bn: "রেসিপিমাইন্ডে স্বাগতম! আমি আপনার জন্য নিখুঁত রেসিপি খুঁজে বের করতে পারি। খাবারের নাম, উপকরণ, রান্নার ধরন দিয়ে অনুসন্ধান করুন, অথবা শুধু বলুন আপনি কী খেতে চান।",
};

const UI = {
  min: { en: "min", bn: "মিনিট" },
  kcal: { en: "kcal", bn: "ক্যালোরি" },
  matchReasons: { en: "Match reasons", bn: "মিলের কারণ" },
  online: { en: "Online", bn: "অনলাইন" },
  finder: { en: "AI Recipe Finder", bn: "এআই রেসিপি ফাইন্ডার" },
  viewRecipe: { en: "View full recipe", bn: "পুরো রেসিপি দেখুন" },
  placeholder: {
    en: "Type a dish name, ingredient, or cuisine...",
    bn: "খাবারের নাম, উপকরণ বা রান্নার ধরন লিখুন...",
  },
  helper: {
    en: 'Try: "chicken stir fry", "Italian pasta", or "I have rice and eggs"',
    bn: 'চেষ্টা করুন: "চিকেন বিরিয়ানি", "ইতালিয়ান পাস্তা", অথবা "আমার কাছে চাল ও ডিম আছে"',
  },
  clear: { en: "Clear", bn: "মুছুন" },
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function t(field, lang = "en") {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object")
    return field[lang] ?? field.en ?? Object.values(field).find(Boolean) ?? "";
  return "";
}

function lbl(key, lang) {
  return t(UI[key], lang);
}

function diffColor(d) {
  const s = (typeof d === "string" ? d : d?.en ?? "").toLowerCase();
  if (s === "easy" || s === "সহজ") return "text-emerald-400 bg-emerald-400/10";
  if (s === "medium" || s === "মাঝারি") return "text-amber-400 bg-amber-400/10";
  if (s === "hard" || s === "কঠিন") return "text-red-400 bg-red-400/10";
  return "text-stone-400 bg-stone-400/10";
}

/* -------------------------------------------------------------------------- */
/* Chat Message                                                               */
/* -------------------------------------------------------------------------- */

function ChatMessage({ msg, lang }) {
  if (msg.role === "user") {
    return (
      <div className="msg-appear flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-stone-700/60 border border-stone-600/30 px-4 py-3 text-sm leading-relaxed text-stone-100">
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className="msg-appear flex gap-3 items-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center mt-0.5">
        <Flame className="text-white" size={14} />
      </div>
      <div className="max-w-[88%] space-y-2">
        {msg.text && (
          <div className="rounded-2xl rounded-bl-sm bg-stone-800/70 border border-stone-700/40 px-4 py-3 text-sm leading-relaxed text-stone-200">
            {msg.text}
          </div>
        )}
        {msg.explanation && (
          <p className="text-xs text-stone-500 pl-1">{msg.explanation}</p>
        )}
        {msg.recommendation && (
          <p className="text-xs text-orange-400/80 pl-1 italic">{msg.recommendation}</p>
        )}
        {msg.followUp && (
          <p className="text-xs text-stone-500 pl-1 mt-1">{msg.followUp}</p>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Recipe Card — Linkable                                                     */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Wraps each AI result in a Link to /recipe/[slug] so users               */
/* navigate to the full recipe detail page instead of an inline panel.      */
/*                                                                            */

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
  const thumbnail = recipe.image || recipe.thumbnail || "/images/placeholder-recipe.jpg";
  const slug = recipe.slug;

  return (
    <Link
      href={`/recipe/${slug}`}
      className="msg-appear group block rounded-2xl overflow-hidden border border-stone-700/40 bg-stone-800/50 hover:bg-stone-800/70 hover:border-orange-500/30 transition-all duration-200"
    >
      <div className="flex gap-3.5 p-3.5">
        {/* Thumbnail */}
        <div className="relative w-[88px] h-[88px] rounded-xl overflow-hidden flex-shrink-0 bg-stone-800">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {/* Category badge */}
          <div className="absolute top-1.5 left-1.5">
            <span className="rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-semibold text-orange-300 backdrop-blur-sm">
              {category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            {/* Rating row */}
            <div className="flex items-center gap-1.5 text-xs mb-1.5">
              <Star className="fill-yellow-400 text-yellow-400" size={11} />
              <span className="font-semibold text-stone-200">{rating ?? "N/A"}</span>
              <span className="text-stone-600">({ratingCount})</span>
            </div>

            {/* Title */}
            <h4 className="text-sm font-semibold text-stone-100 truncate group-hover:text-orange-400 transition-colors leading-snug">
              {title}
            </h4>

            {/* Description */}
            {description && (
              <p className="mt-1 text-xs text-stone-500 line-clamp-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Meta footer */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-[11px] text-stone-500">
              <Clock size={11} />
              <span>{time} {lbl("min", lang)}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-stone-500">
              <BarChart3 size={11} />
              <span>{calories} {lbl("kcal", lang)}</span>
            </div>
            <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 hidden sm:inline-block">
              {cuisine}
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${diffColor(diff)}`}>
              {diff}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center flex-shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-stone-700/30 group-hover:bg-orange-500/20 transition-colors">
            <ExternalLink size={13} className="text-stone-600 group-hover:text-orange-400 transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Typing Indicator                                                           */
/* -------------------------------------------------------------------------- */

function TypingIndicator() {
  return (
    <div className="msg-appear flex gap-3 items-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center mt-0.5">
        <Flame className="text-white" size={14} />
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-stone-800/70 border border-stone-700/40 px-5 py-4 flex gap-1.5 items-center">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Suggestion Chip                                                            */
/* -------------------------------------------------------------------------- */

function Chip({ suggestion, onClick }) {
  const Icon = suggestion.icon || Search;
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-stone-800/60 border border-stone-700/40 text-stone-400 text-xs font-medium hover:bg-orange-500/10 hover:border-orange-500/30 hover:text-orange-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-200 whitespace-nowrap"
    >
      <Icon size={11} className="text-orange-500/70" />
      {suggestion.label}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Match Reasons                                                              */
/* -------------------------------------------------------------------------- */

function MatchReasons({ reasons, lang }) {
  if (!reasons?.length) return null;

  const map = {
    title: lang === "bn" ? "শিরোনাম" : "Title",
    searchTerm: lang === "bn" ? "সার্চ টার্ম" : "Search term",
    ingredient: lang === "bn" ? "উপকরণ" : "Ingredient",
    category: lang === "bn" ? "ক্যাটাগরি" : "Category",
    cuisine: lang === "bn" ? "রান্নার ধরন" : "Cuisine",
    diet: lang === "bn" ? "ডায়েট" : "Diet",
    tag: lang === "bn" ? "ট্যাগ" : "Tag",
    difficulty: lang === "bn" ? "কঠিনাই" : "Difficulty",
    cookTime: lang === "bn" ? "রান্নার সময়" : "Cook time",
    servings: lang === "bn" ? "সার্ভিং" : "Servings",
  };

  return (
    <div className="px-5 pb-2">
      <div className="p-2.5 rounded-lg bg-stone-800/30 border border-stone-700/20">
        <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
          {lbl("matchReasons", lang)}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {reasons.map((r, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-[10px] text-stone-400 bg-stone-700/30 rounded-full px-2 py-0.5">
              <span className="w-1 h-1 rounded-full bg-orange-500" />
              {map[r.type] || r.type}: {r.value}
              {r.filter != null && ` (${r.filter})`}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page Component                                                             */
/* -------------------------------------------------------------------------- */

export default function GenerateRecipePage() {
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("en");
  const [reasons, setReasons] = useState(null);

  const inputRef = useRef(null);
  const endRef = useRef(null);
  const inited = useRef(false);

  /* ---- Init ---- */
  useEffect(() => {
    if (inited.current) return;
    inited.current = true;
    setMessages([{ id: "w", role: "ai", text: GREETINGS.en }]);
    inputRef.current?.focus();
  }, []);

  /* ---- Auto-scroll ---- */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* ---- Send ---- */
  const send = useCallback(
    (text) => {
      const q = (text || "").trim();
      if (!q || loading) return;

      setLoading(true);
      setReasons(null);

      const userMsg = { id: `u${Date.now()}`, role: "user", text: q };
      setMessages((p) => [...p, userMsg]);

      const delay = 400 + Math.random() * 600;

      setTimeout(() => {
        let res;
        try {
          res = generateRecipe(q, { debug: false });
        } catch {
          res = {
            success: false,
            language: "en",
            assistant: {
              message: "Something went wrong. Please try again.",
            },
            recipes: [],
            suggestions: FALLBACK_SUGGESTIONS.map((s) => s.label),
          };
        }

        const l = res.language ?? "en";
        setLang(l);

        /* AI message */
        const parts = [];
        if (res.assistant?.message) parts.push(res.assistant.message);
        if (res.assistant?.recommendation)
          parts.push(res.assistant.recommendation);

        const aiMsg = {
          id: `a${Date.now()}`,
          role: "ai",
          text: parts.join(" "),
          explanation: res.assistant?.explanation || null,
          recommendation: null,
          followUp: res.assistant?.followUp || null,
        };

        const next = [...messages, userMsg, aiMsg];
        const recipes = res.recipes ?? [];

        /* Recipe result cards as linked messages */
        if (recipes.length > 0) {
          recipes.forEach((r, i) => {
            next.push({
              id: `r${Date.now()}-${i}`,
              role: "ai",
              isRecipeCard: true,
              recipe: r,
            });
          });
        }

        setMessages(next);

        /* Show match reasons for first result */
        if (recipes.length > 0) {
          setReasons(recipes[0].reasons || null);
        } else {
          setReasons(null);
        }

        /* Update suggestions */
        const sugs = res.suggestions ?? [];
        setSuggestions(
          sugs.length > 0
            ? sugs.map((s) => ({ label: s, icon: MessageSquare }))
            : FALLBACK_SUGGESTIONS,
        );

        setLoading(false);
        inputRef.current?.focus();
      }, delay);
    },
    [messages, loading],
  );

  /* ---- Handlers ---- */
  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(inputRef.current?.value);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onClickSend = () => {
    send(inputRef.current?.value);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onChip = (label) => send(label);

  const onClear = () => {
    setMessages([
      { id: `w${Date.now()}`, role: "ai", text: GREETINGS[lang] || GREETINGS.en },
    ]);
    setReasons(null);
    setSuggestions(INITIAL_SUGGESTIONS);
  };

  /* ---- Render ---- */
  return (
    <div className="relative h-screen" style={{ background: "#13100e" }}>
      {/* Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 50% 40% at 10% 15%, rgba(234,88,12,0.06) 0%, transparent 70%),
              radial-gradient(ellipse 40% 50% at 90% 85%, rgba(217,119,6,0.04) 0%, transparent 70%),
              radial-gradient(ellipse 70% 30% at 50% 100%, rgba(120,53,15,0.06) 0%, transparent 60%)
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px",
          }}
        />
      </div>

      {/* ===== Full-Width Chat ===== */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <header
          className="flex items-center gap-3 px-5 py-3.5 border-b border-stone-800/60"
          style={{
            background: "rgba(19,16,14,0.85)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Flame size={24} className="text-orange-500 flame-pulse" />
          <div className="min-w-0">
            <h1
              className="text-base font-bold text-stone-100 leading-tight"
              style={{ fontFamily: "serif" }}
            >
              RecipeMind
            </h1>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-medium">
              {lbl("finder", lang)}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                style={{ boxShadow: "0 0 6px rgba(52,211,153,0.5)" }}
              />
              <span className="text-[11px] text-stone-500">
                {lbl("online", lang)}
              </span>
            </div>
            {messages.length > 1 && (
              <button
                onClick={onClear}
                className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-300 transition-colors"
                title={lbl("clear", lang)}
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">{lbl("clear", lang)}</span>
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto chat-scroll px-5 py-4 flex flex-col gap-3.5">
          {messages.map((msg) => {
            /* Recipe result card — linked to /recipe/[slug] */
            if (msg.isRecipeCard && msg.recipe) {
              return (
                <RecipeResultCard
                  key={msg.id}
                  recipe={msg.recipe}
                  lang={lang}
                />
              );
            }

            /* Empty AI text placeholder — skip */
            if (msg.text == null && msg.role === "ai") return null;

            return <ChatMessage key={msg.id} msg={msg} lang={lang} />;
          })}

          {loading && <TypingIndicator />}

          <div ref={endRef} />
        </div>

        {/* Match Reasons */}
        {reasons && reasons.length > 0 && !loading && (
          <MatchReasons reasons={reasons} lang={lang} />
        )}

        {/* Suggestions */}
        {!loading && (
          <div className="px-5 pb-2.5 flex flex-wrap gap-1.5">
            {suggestions.map((s, i) => (
              <Chip
                key={`${s.label}-${i}`}
                suggestion={s}
                onClick={() => onChip(s.label)}
              />
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-5 pb-4 pt-1">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-stone-800/50 border border-stone-700/40 focus-within:border-orange-500/50 focus-within:shadow-lg focus-within:shadow-orange-500/5 transition-all duration-300">
            <Search size={15} className="text-stone-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder={lbl("placeholder", lang)}
              onKeyDown={onKey}
              disabled={loading}
              className="flex-1 bg-transparent border-none outline-none text-sm text-stone-100 placeholder:text-stone-600"
              aria-label="Recipe search input"
            />
            <button
              onClick={onClickSend}
              disabled={loading}
              className="w-9 h-9 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
              aria-label="Send message"
            >
              <ArrowUp size={14} className="text-white" />
            </button>
          </div>
          <p className="text-center text-[10px] text-stone-600 mt-2 opacity-60">
            {lbl("helper", lang)}
          </p>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #44403c; border-radius: 10px; }
        .chat-scroll::-webkit-scrollbar-thumb:hover { background: #57534e; }

        .msg-appear {
          animation: msgIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards;
          opacity: 0;
        }
        @keyframes msgIn {
          from { opacity:0; transform:translateY(12px) scale(0.98); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }

        .typing-dot {
          display:block; width:6px; height:6px; border-radius:50%; background:#f97316;
          animation:bounce 1.4s ease-in-out infinite;
        }
        .typing-dot:nth-child(2) { animation-delay:0.2s; }
        .typing-dot:nth-child(3) { animation-delay:0.4s; }
        @keyframes bounce {
          0%,60%,100% { transform:translateY(0); opacity:0.35; }
          30% { transform:translateY(-7px); opacity:1; }
        }

        .flame-pulse {
          animation:fp 2.5s ease-in-out infinite;
          filter:drop-shadow(0 0 5px rgba(249,115,22,0.4));
        }
        @keyframes fp {
          0%,100% { transform:scale(1); }
          50% { transform:scale(1.08) rotate(2deg); filter:drop-shadow(0 0 10px rgba(249,115,22,0.7)); }
        }

        @media (prefers-reduced-motion:reduce) {
          .msg-appear { animation-duration:0.01ms!important; }
          .typing-dot,.flame-pulse { animation:none!important; }
        }
      `}</style>
    </div>
  );
}