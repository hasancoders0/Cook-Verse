// src/components/home/ChatInput.jsx
"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { Search, ArrowUp } from "lucide-react";

const LABELS = {
  placeholder: {
    en: "Type a dish name, ingredient, or cuisine...",
    bn: "খাবারের নাম, উপকরণ বা রান্নার ধরন লিখুন...",
  },
  helper: {
    en: 'Try: "chicken stir fry", "Italian pasta", or "I have rice and eggs"',
    bn: 'চেষ্টা করুন: "চিকেন বিরিয়ানি", "ইতালিয়ান পাস্তা", অথবা "আমার কাছে চাল ও ডিম আছে"',
  },
};

function lbl(key, lang) {
  const field = LABELS[key];
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[lang] ?? field.en ?? "";
}

const ChatInput = forwardRef(function ChatInput(
  { lang, loading, onSend },
  ref,
) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  const submit = () => {
    const val = inputRef.current?.value?.trim();
    if (val && !loading) {
      onSend(val);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="px-4 sm:px-6 pb-4 pt-2">
      {/* Input container */}
      <div
        className="relative flex items-center gap-3 rounded-2xl bg-stone-900/60 border border-white/[0.07] px-4 py-3 transition-all duration-300 focus-within:border-orange-500/30 focus-within:bg-stone-900/80 focus-within:shadow-[0_0_0_1px_rgba(249,115,22,0.08),0_8px_40px_rgba(0,0,0,0.35)]"
        style={{ backdropFilter: "blur(12px)" }}
      >
        <Search
          size={16}
          className="text-stone-600 flex-shrink-0 transition-colors duration-200 group-focus-within:text-stone-400"
        />

        <input
          ref={inputRef}
          type="text"
          placeholder={lbl("placeholder", lang)}
          onKeyDown={onKey}
          disabled={loading}
          className="flex-1 bg-transparent border-none outline-none font-ui text-sm text-stone-100 placeholder:text-stone-600 disabled:opacity-50"
          aria-label="Recipe search input"
        />

        <button
          onClick={submit}
          disabled={loading}
          className="w-9 h-9 rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35"
          aria-label="Send message"
        >
          <ArrowUp size={15} className="text-white" strokeWidth={2.5} />
        </button>
      </div>

      {/* Helper text */}
      <p className="font-ui text-center text-[10px] text-stone-600 mt-2.5 select-none">
        {lbl("helper", lang)}
      </p>
    </div>
  );
});

export default ChatInput;