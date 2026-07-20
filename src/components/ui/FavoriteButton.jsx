"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

export default function FavoriteButton({
  slug,
  size = "md",
  className = "",
}) {
  const { isFavorite, toggleFavorite } = useFavorites();

  const favorite = isFavorite(slug);

  const sizes = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  };

  const iconSizes = {
    sm: 13,
    md: 14,
    lg: 16,
  };

  return (
    <button
      type="button"
      aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      title={favorite ? "Remove from favorites" : "Add to favorites"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(slug);
      }}
      className={`
        ${sizes[size]}
        inline-flex items-center justify-center
        rounded-xl
        border
        transition-all
        duration-200
        hover:scale-105
        active:scale-95
        ${
          favorite
            ? "border-red-500/25 bg-red-500/15 text-red-400 hover:bg-red-500/25 hover:border-red-500/40"
            : "border-white/[0.1] bg-black/50 text-stone-400 hover:bg-white/[0.08] hover:border-white/[0.18] hover:text-stone-200"
        }
        backdrop-blur-md
        ${className}
      `}
    >
      <Heart
        size={iconSizes[size]}
        className={favorite ? "fill-red-400" : "fill-transparent"}
      />
    </button>
  );
}