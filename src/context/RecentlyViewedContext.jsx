"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "recently-viewed-recipes";
const MAX_ITEMS = 8;

const RecentlyViewedContext = createContext(null);

export function RecentlyViewedProvider({ children }) {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load recently viewed recipes:", error);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(recentlyViewed)
    );
  }, [recentlyViewed]);

  const addRecentlyViewed = useCallback((slug) => {
    if (!slug) return;

    setRecentlyViewed((prev) => {
      // Already first item → no state update
      if (prev.length && prev[0] === slug) {
        return prev;
      }

      return [
        slug,
        ...prev.filter((item) => item !== slug),
      ].slice(0, MAX_ITEMS);
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
  }, []);

  const value = useMemo(
    () => ({
      recentlyViewed,
      addRecentlyViewed,
      clearRecentlyViewed,
    }),
    [
      recentlyViewed,
      addRecentlyViewed,
      clearRecentlyViewed,
    ]
  );

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);

  if (!context) {
    throw new Error(
      "useRecentlyViewed must be used within RecentlyViewedProvider"
    );
  }

  return context;
}