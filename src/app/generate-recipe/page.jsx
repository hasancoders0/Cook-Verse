"use client";

import { useState } from "react";

import AppContainer from "@/components/ui/AppContainer";

import ChatHero from "@/components/generate-recipe/ChatHero";
import ChatInput from "@/components/generate-recipe/ChatInput";
import SuggestionChips from "@/components/generate-recipe/SuggestionChips";
import ThinkingAnimation from "@/components/generate-recipe/ThinkingAnimation";
import ChefResponse from "@/components/generate-recipe/ChefResponse";
import MissingIngredients from "@/components/generate-recipe/MissingIngredients";
import RecipeRecommendations from "@/components/generate-recipe/RecipeRecommendations";
import EmptyState from "@/components/generate-recipe/EmptyState";

import generateRecipeContent from "@/content/generate-recipe";
import useTranslation from "@/hooks/useTranslation";
import { generateRecipe } from "@/lib/recipe-generator";

export default function GenerateRecipePage() {
  const { language } = useTranslation();

  const content = generateRecipeContent[language] ?? generateRecipeContent.en;

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleGenerate() {
    if (!prompt.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = generateRecipe(prompt, language);

      setResult(response);
    } catch (error) {
      console.error(error);

      setResult({
        success: false,
        message:
          language === "bn"
            ? "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।"
            : "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestion(value) {
    setPrompt(value);
  }

  return (
    <>
      <ChatHero />

      <AppContainer className="py-12 lg:py-16">
        <div className="mx-auto max-w-4xl">
          <ChatInput
            value={prompt}
            onChange={setPrompt}
            onSubmit={handleGenerate}
            loading={loading}
          />

          {!loading && !result && (
            <>
              <SuggestionChips onSelect={handleSuggestion} />

              <EmptyState />
            </>
          )}

          {loading && <ThinkingAnimation />}

          {!loading && result?.success && (
            <div className="space-y-10 pt-10">
              <ChefResponse prompt={prompt} result={result} />

              <MissingIngredients
                ingredients={result.missingIngredientsList || []}
                message={result.missingIngredients}
              />

              {result.recommendations?.length > 0 && (
                <RecipeRecommendations recipes={result.recommendations} />
              )}
            </div>
          )}

          {!loading && result && !result.success && (
            <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
              <h2 className="text-2xl font-bold text-red-700">
                {content.messages.noResults}
              </h2>

              <p className="mt-3 text-red-600">{result.message}</p>
            </div>
          )}
        </div>
      </AppContainer>
    </>
  );
}
