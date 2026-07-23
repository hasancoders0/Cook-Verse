// src/components/home/HomeChat.jsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  generateRecipe,
  resetSession,
  rehydrateSession,
} from "@/lib/ai/generate-recipe";
import {
  Zap,
  Timer,
  Leaf,
  Globe,
  ChefHat,
  Search,
  MessageSquare,
  Flame,
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
  en: "Hi! I'm MealMuse, your recipe assistant. What would you like to cook today?",
  bn: "হ্যালো! আমি MealMuse, আপনার রেসিপি সহকারী। আজ কী রান্না করতে চান?",
};

const STORAGE_KEY = "mealMuse_chat_history";

/* ── Component ─────────────────────────────────────────── */

export default function HomeChat() {
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("en");
  const [reasons, setReasons] = useState(null);

  const inputRef = useRef(null);
  const inited = useRef(false);

  /* ── Load History from Local Storage ─────────────────── */
  useEffect(() => {
    // Ensure we are in the browser
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed) && parsed.length > 0) {
          // Map back to ensure every message has an `id` for React rendering
          const formatted = parsed.map((m, i) => ({
            id: m.id || `h${Date.now()}-${i}`,
            ...m,
          }));

          setMessages(formatted);
          const lastSuggestions = [...formatted]
            .reverse()
            .find((m) => Array.isArray(m.suggestions) && m.suggestions.length);

          if (lastSuggestions) {
            setSuggestions(
              lastSuggestions.suggestions.map((label) => ({
                label,
                icon: MessageSquare,
              })),
            );
          }
          inited.current = true;

          /* Rebuild the AI session's follow-up context (last ingredients,
             last recipe, previous intent, etc.) from the restored message
             history, so a page refresh doesn't silently forget context
             mid-conversation (e.g. "Something spicy" right after reload
             would otherwise lose the "I have chicken" context). */
          rehydrateSession(formatted);
          return; // Skip default greeting
        }
      }
    } catch (e) {
      /* Ignore storage errors (incognito, disabled, corrupted data) */
    }

    // Fallback: First time user, show greeting
    inited.current = true;
    // Use MealMuse greeting from config
    setMessages([{ id: "w", role: "ai", text: GREETINGS.en }]);
  }, []);

  /* ── Save History to Local Storage ─────────────────── */
  useEffect(() => {
    // Ensure we are in the browser
    if (typeof window === "undefined") return;
    if (messages.length === 0) return;

    try {
      // Save lightweight format for the AI memory backend to read
      const toSave = messages.map(({ id, ...rest }) => rest);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      /* Ignore quota exceeded or storage disabled */
    }
  }, [messages]);

  /* ── Core send logic ─────────────────────────────────── */
  const send = useCallback(
    (text) => {
      const q = (text || "").trim();
      if (!q || loading) return;

      setLoading(true);
      setReasons(null);

      const userMsg = { id: `u${Date.now()}`, role: "user", text: q };
      setMessages((prev) => [...prev, userMsg]);

      /* Longer delay so the thinking animation is visible and feels natural */
      const delay = 800 + Math.random() * 1000;

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

          suggestions: res.suggestions ?? [],
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

                suggestions: res.suggestions ?? [],
              });
            });
          }

          return next;
        });

        /* Match reasons from first result */
        setReasons(recipes.length > 0 ? recipes[0].reasons || null : null);

        /* Update suggestion chips - use actual recipe titles if available */
        const sugs = res.suggestions ?? [];
        if (sugs.length > 0) {
          // Map to chip format with icon
          const chipSuggestions = sugs.map((s) => {
            // Try to find a matching icon based on the label
            let icon = MessageSquare;
            const lower = s.toLowerCase();
            if (lower.includes("biryani") || lower.includes("চিকেন"))
              icon = Zap;
            else if (lower.includes("breakfast") || lower.includes("নাস্তা"))
              icon = Timer;
            else if (lower.includes("healthy") || lower.includes("স্বাস্থ্যকর"))
              icon = Leaf;
            else if (lower.includes("salad") || lower.includes("সালাদ"))
              icon = Leaf;
            else if (lower.includes("quick") || lower.includes("দ্রুত"))
              icon = Timer;
            return { label: s, icon };
          });
          setSuggestions(chipSuggestions);
        } else {
          setSuggestions(FALLBACK_SUGGESTIONS);
        }

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

    // Clear local storage on explicit user action
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    }

    // Wipe AI session context (last ingredients, last recipe, intent
    // history) alongside the visible chat, so "Clear chat" is a true
    // fresh start rather than just resetting what's displayed.
    resetSession();
  };

  const onChip = (label) => send(label);

  /* Render */
  return (
    <div
      className="relative h-full overflow-hidden"
      style={{ background: "#0c0a09" }}
    >
      {/* Atmospheric background */}
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
        <div
          className="absolute inset-0 opacity-[0.015]"
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
