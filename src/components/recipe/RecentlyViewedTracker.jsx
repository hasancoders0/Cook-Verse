"use client";

import { useEffect } from "react";

import { useRecentlyViewed } from "@/context/RecentlyViewedContext";

export default function RecentlyViewedTracker({ slug }) {
  const { addRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    addRecentlyViewed(slug);
  }, [slug, addRecentlyViewed]);

  return null;
}