"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHeart, FiMenu } from "react-icons/fi";

import { useFavorites } from "@/context/FavoritesContext";

import AppContainer from "@/components/ui/AppContainer";
import MobileMenu from "@/components/layout/MobileMenu";

import CONFIG from "@/constants/config";
import NAVIGATION from "@/constants/navigation";
import ROUTES from "@/constants/routes";

export default function Header() {
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { favoriteCount } = useFavorites();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <AppContainer>
          <div className="flex h-18 items-center justify-between">
            {/* Logo */}
            <Link href={ROUTES.HOME} className="flex items-center gap-2">
              <span className="text-3xl">🍳</span>

              <div>
                <h1 className="text-xl font-bold text-orange-600">
                  {CONFIG.appName}
                </h1>

                <p className="-mt-1 text-xs text-gray-500">
                  Discover. Cook. Enjoy.
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-2 lg:flex">
              {NAVIGATION.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-orange-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    <Icon size={18} />

                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Favorites */}
              <Link
                href={ROUTES.FAVORITES}
                className={`relative hidden h-11 w-11 items-center justify-center rounded-xl border transition-all md:flex ${
                  pathname === ROUTES.FAVORITES
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-gray-200 hover:border-red-200 hover:bg-red-50"
                }`}
              >
                <FiHeart size={20} />

                {favoriteCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {favoriteCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu */}
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open menu"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 transition hover:bg-gray-100 lg:hidden"
              >
                <FiMenu size={20} />
              </button>
            </div>
          </div>
        </AppContainer>
      </header>

      <MobileMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
