// src/components/home/HomeChat.jsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { generateRecipe } from "@/lib/ai/generate-recipe";
import {
  Zap,
  Timer,
  Leaf,
  Globe,
  ChefHat,
  Search,
  MessageSquare,
} from "lucide-react";

import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

/* ── Constants ─────────────────────────────────────────── */

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

/* ── Component ─────────────────────────────────────────── */

export default function HomeChat() {
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("en");
  const [reasons, setReasons] = useState(null);

  const inputRef = useRef(null);
  const inited = useRef(false);

  /* Bootstrap welcome message once */
  useEffect(() => {
    if (inited.current) return;
    inited.current = true;
    setMessages([{ id: "w", role: "ai", text: GREETINGS.en }]);
  }, []);

  /* Core send logic */
  const send = useCallback(
    (text) => {
      const q = (text || "").trim();
      if (!q || loading) return;

      setLoading(true);
      setReasons(null);

      const userMsg = { id: `u${Date.now()}`, role: "user", text: q };
      setMessages((prev) => [...prev, userMsg]);

      /* Longer delay so the thinking animation is visible and feels natural */
      const delay = 1000 + Math.random() * 1200;

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

        const detectedLang = res.language ?? "en";
        setLang(detectedLang);

        /* AI text bubble */
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

        const recipes = res.recipes ?? [];

        /* Append AI message + recipe cards in one update */
        setMessages((prev) => {
          const next = [...prev, aiMsg];

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

          return next;
        });

        /* Match reasons from first result */
        setReasons(recipes.length > 0 ? recipes[0].reasons || null : null);

        /* Update suggestion chips */
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
    [loading],
  );

  /* Handlers */
  const onClear = () => {
    setMessages([
      {
        id: `w${Date.now()}`,
        role: "ai",
        text: GREETINGS[lang] || GREETINGS.en,
      },
    ]);
    setReasons(null);
    setSuggestions(INITIAL_SUGGESTIONS);
  };

  const onChip = (label) => send(label);

  /* Render */
  return (
    <div
      className="relative h-full overflow-hidden"
      style={{ background: "#0c0a09" }}
    >
      {/* Atmospheric background — refined */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 50% 35% at 12% 8%, rgba(249,115,22,0.06) 0%, transparent 70%),
              radial-gradient(ellipse 45% 45% at 88% 92%, rgba(234,88,12,0.04) 0%, transparent 70%),
              radial-gradient(ellipse 70% 25% at 50% 100%, rgba(120,53,15,0.06) 0%, transparent 60%)
            `,
          }}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px",
          }}
        />
      </div>

      {/* Chat shell */}
      <div className="relative z-10 flex flex-col h-full">
        <ChatHeader
          lang={lang}
          messageCount={messages.length}
          onClear={onClear}
        />

        <ChatMessages
          messages={messages}
          loading={loading}
          lang={lang}
          reasons={reasons}
          suggestions={suggestions}
          onChip={onChip}
        />

        <ChatInput ref={inputRef} lang={lang} loading={loading} onSend={send} />
      </div>
    </div>
  );
}
