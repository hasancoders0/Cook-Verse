"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHeart } from "react-icons/fi";

import { useFavorites } from "@/context/FavoritesContext";

import NAVIGATION from "@/constants/navigation";
import ROUTES from "@/constants/routes";

export default function MobileNav({ onClose }) {
  const pathname = usePathname();
  const { favoriteCount } = useFavorites();

  return (
    <nav className="space-y-2">
      {NAVIGATION.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`group flex items-center justify-between rounded-2xl px-4 py-4 transition-all duration-200 ${
              isActive
                ? "bg-orange-50 text-orange-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-4">
              <Icon
                size={22}
                className={`transition-colors ${
                  isActive
                    ? "text-orange-600"
                    : "text-gray-500 group-hover:text-orange-600"
                }`}
              />

              <span className="font-medium">{item.label}</span>
            </div>

            {item.href === ROUTES.FAVORITES && favoriteCount > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-semibold text-white">
                {favoriteCount}
              </span>
            )}
          </Link>
        );
      })}

      {/* Favorites */}
      <Link
        href={ROUTES.FAVORITES}
        onClick={onClose}
        className={`group flex items-center justify-between rounded-2xl px-4 py-4 transition-all duration-200 ${
          pathname === ROUTES.FAVORITES
            ? "bg-orange-50 text-orange-600"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <div className="flex items-center gap-4">
          <FiHeart
            size={22}
            className={`transition-colors ${
              pathname === ROUTES.FAVORITES
                ? "text-orange-600"
                : "text-gray-500 group-hover:text-orange-600"
            }`}
          />

          <span className="font-medium">Favorites</span>
        </div>

        {favoriteCount > 0 && (
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-semibold text-white">
            {favoriteCount}
          </span>
        )}
      </Link>
    </nav>
  );
}
