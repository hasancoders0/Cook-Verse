"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const FavoritesContext = createContext();

const STORAGE_KEY = "cookverse-favorites";

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(favorites)
    );
  }, [favorites]);

  const isFavorite = (slug) =>
    favorites.includes(slug);

  const addFavorite = (slug) => {
    setFavorites((prev) =>
      prev.includes(slug)
        ? prev
        : [...prev, slug]
    );
  };

  const removeFavorite = (slug) => {
    setFavorites((prev) =>
      prev.filter((item) => item !== slug)
    );
  };

  const toggleFavorite = (slug) => {
    setFavorites((prev) =>
      prev.includes(slug)
        ? prev.filter((item) => item !== slug)
        : [...prev, slug]
    );
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteCount: favorites.length,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error(
      "useFavorites must be used inside FavoritesProvider"
    );
  }

  return context;
}