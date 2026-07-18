"use client";

import { useRef } from "react";
import { FiArrowUp, FiLoader, FiX } from "react-icons/fi";

import generateRecipeContent from "@/content/generate-recipe";
import useTranslation from "@/hooks/useTranslation";

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  loading = false,
}) {
  const textareaRef = useRef(null);

  const { language } = useTranslation();

  const content = generateRecipeContent[language] ?? generateRecipeContent.en;

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

    if (textareaRef.current) {
      textareaRef.current.style.height = "72px";
      textareaRef.current.focus();
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 focus-within:border-orange-400 focus-within:shadow-xl">
      <div className="p-6 md:p-8">
        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {language === "bn"
              ? "আজ কী রান্না করতে চান?"
              : "What would you like to cook today?"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {content.input.helperText}
          </p>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={2}
          value={value}
          disabled={loading}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={content.input.placeholder}
          className="min-h-[90px] max-h-72 w-full resize-none overflow-y-auto border-none bg-transparent text-base leading-7 text-gray-800 outline-none placeholder:text-gray-400"
        />

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            {value && !loading && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                <FiX size={16} />
                {content.input.clearButton}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!value.trim() || loading}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading ? (
              <>
                <FiLoader size={18} className="animate-spin" />
                {language === "bn" ? "অপেক্ষা করুন..." : "Generating..."}
              </>
            ) : (
              <>
                {content.input.submitButton}
                <FiArrowUp size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
