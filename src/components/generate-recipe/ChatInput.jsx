"use client";

import { useRef } from "react";
import { FiArrowUp, FiLoader, FiX } from "react-icons/fi";

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  loading = false,
}) {
  const textareaRef = useRef(null);

  function resizeTextarea() {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  function handleInput(event) {
    onChange(event.target.value);
    resizeTextarea();
  }

  function handleSubmit() {
    if (!value.trim() || loading) return;

    onSubmit(value.trim());
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  function handleClear() {
    onChange("");

    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = "60px";
      textarea.focus();
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg transition-all duration-300 focus-within:border-orange-400 focus-within:shadow-xl">
      <div className="p-6">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={loading}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Example: I have chicken, rice, onion, garlic and yogurt. Recommend something spicy for dinner under 30 minutes..."
          className="min-h-[60px] max-h-72 w-full resize-none overflow-y-auto border-none bg-transparent text-base leading-7 text-gray-800 outline-none placeholder:text-gray-400"
        />

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">
              Press <span className="font-medium">Enter</span> to generate •{" "}
              <span className="font-medium">Shift + Enter</span> for a new line
            </p>

            <p className="text-xs text-gray-400">
              Ask about ingredients, cuisine, diet, cooking time, or servings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              {value.length} characters
            </span>

            {value && !loading && (
              <button
                type="button"
                onClick={handleClear}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Clear"
              >
                <FiX size={18} />
              </button>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!value.trim() || loading}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-orange-600 disabled:cursor-not-allowed disabled:scale-100 disabled:bg-gray-300"
              aria-label="Generate Recipe"
            >
              {loading ? (
                <FiLoader size={22} className="animate-spin" />
              ) : (
                <FiArrowUp size={22} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
