import { parseRecipePrompt } from "@/lib/recipe-parser";
import {
  getBestRecipe,
  getTopRecipes,
} from "@/lib/recipe-scoring";
import { buildResponse } from "@/lib/recipe-response";

/* -------------------------------------------------------------------------- */
/* Generate Recipe Recommendation                                             */
/* -------------------------------------------------------------------------- */

export function generateRecipe(prompt = "") {
  if (!prompt.trim()) {
    return {
      success: false,
      message: "Please enter what you'd like to cook.",
      parsedPrompt: null,
      recommendation: null,
      recommendations: [],
      missingIngredients: null,
      cooking: null,
    };
  }

  const parsedPrompt = parseRecipePrompt(prompt);

  const bestResult = getBestRecipe(parsedPrompt);

  const topResults = getTopRecipes(parsedPrompt);

  const response = buildResponse(bestResult, topResults);

  return {
    success: true,
    parsedPrompt,
    ...response,
  };
}

/* -------------------------------------------------------------------------- */
/* Debug Helper                                                               */
/* -------------------------------------------------------------------------- */

export function debugRecipePrompt(prompt = "") {
  const parsedPrompt = parseRecipePrompt(prompt);

  const bestResult = getBestRecipe(parsedPrompt);

  const topResults = getTopRecipes(parsedPrompt);

  return {
    prompt,
    parsedPrompt,
    bestResult,
    topResults,
  };
}