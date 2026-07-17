"use client";

import { FaHeart, FaRegHeart } from "react-icons/fa";

import { useFavorites } from "@/context/FavoritesContext";

export default function FavoriteButton({
  slug,
  size = "md",
  className = "",
}) {
  const { isFavorite, toggleFavorite } = useFavorites();

  const favorite = isFavorite(slug);

  const sizes = {
    sm: "h-9 w-9 text-sm",
    md: "h-11 w-11 text-base",
    lg: "h-12 w-12 text-lg",
  };

  return (
    <button
      type="button"
      aria-label={
        favorite ? "Remove from favorites" : "Add to favorites"
      }
      title={
        favorite ? "Remove from favorites" : "Add to favorites"
      }
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(slug);
      }}
      className={`
        ${sizes[size]}
        inline-flex items-center justify-center
        rounded-full
        border
        border-gray-200
        bg-white/90
        backdrop-blur
        shadow-sm
        transition-all
        duration-200
        hover:scale-105
        hover:border-red-200
        hover:bg-red-50
        active:scale-95
        ${className}
      `}
    >
      {favorite ? (
        <FaHeart className="text-red-500" />
      ) : (
        <FaRegHeart className="text-gray-500 transition-colors group-hover:text-red-500" />
      )}
    </button>
  );
}