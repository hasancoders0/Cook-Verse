"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Globe, Heart, Sparkles } from "lucide-react";

import { sidebarContent } from "@/content/sidebar";
import ROUTES from "@/constants/routes";

import { useFavorites } from "@/context/FavoritesContext";
import { useLanguage } from "@/context/LanguageContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";

import useTranslation from "@/hooks/useTranslation";
import { getAllRecipes } from "@/lib/recipes";

import MobileSidebar from "./MobileSidebar";

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const { favoriteCount } = useFavorites();
  const { recentlyViewed } = useRecentlyViewed();

  const recipes = getAllRecipes()
    .filter((recipe) => recentlyViewed.includes(recipe.slug))
    .slice(0, 10);

  const isActive = (href) => {
    if (!href) return false;
    if (href === ROUTES.HOME) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ==========================
          Mobile Top Bar
      ========================== */}
      <header
        className="sticky top-0 z-50 lg:hidden"
        style={{
          background: "rgba(12, 10, 9, 0.88)",
          backdropFilter: "blur(24px) saturate(1.4)",
        }}
      >
        {/* Gradient accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />

        <div className="flex h-14 items-center justify-between px-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-stone-400 transition-all duration-200 hover:bg-white/[0.06] hover:text-stone-200 hover:border-white/[0.12]"
          >
            <Menu size={17} />
          </button>

          <Link href={ROUTES.HOME} className="flex items-center gap-2">
            <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20">
              <span className="text-white text-[10px] font-bold">R</span>
              <div className="absolute -inset-1 rounded-xl bg-orange-500/10 -z-10 blur-sm" />
            </div>
            <h1 className="font-heading text-lg font-semibold text-stone-100">
              {sidebarContent.brand.title}
            </h1>
          </Link>

          <Link
            href={ROUTES.FAVORITES}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-stone-400 transition-all duration-200 hover:bg-white/[0.06] hover:text-stone-200 hover:border-white/[0.12]"
          >
            <Heart size={16} />
            {favoriteCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-b from-orange-500 to-orange-600 px-1 text-[9px] font-bold text-white shadow-lg shadow-orange-500/30">
                {favoriteCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* ==========================
          Desktop Sidebar
      ========================== */}
      <aside className="sticky top-0 hidden lg:flex h-screen w-[17rem] shrink-0 flex-col border-r border-white/[0.06] bg-[#0c0a09]">
        {/* ---- Logo & Language ---- */}
        <div className="p-5 pb-4 border-b border-white/[0.06]">
          <div className="flex items-start justify-between gap-3">
            <Link href={ROUTES.HOME} className="group">
              <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <span className="text-white text-xs font-bold">R</span>
                  <div className="absolute -inset-1.5 rounded-2xl bg-orange-500/10 -z-10 blur-sm" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="font-heading text-xl font-bold text-stone-100 group-hover:text-orange-400 transition-colors duration-200">
                      {sidebarContent.brand.title}
                    </h1>
                    <Sparkles size={11} className="text-orange-500/40" />
                  </div>
                  <p className="mt-0.5 font-ui text-[11px] text-stone-600">
                    {sidebarContent.brand.subtitle[language]}
                  </p>
                </div>
              </div>
            </Link>

            {/* Language Switcher */}
            <div className="flex items-center rounded-xl border border-white/[0.08] bg-white/[0.02] p-0.5 flex-shrink-0">
              <Globe
                size={11}
                className="ml-1.5 mr-1 text-stone-600"
              />
              <button
                type="button"
                onClick={() => changeLanguage("en")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-ui font-medium transition-all duration-200 ${
                  language === "en"
                    ? "bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-sm shadow-orange-500/20"
                    : "text-stone-500 hover:text-stone-300"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => changeLanguage("bn")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-ui font-medium transition-all duration-200 ${
                  language === "bn"
                    ? "bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-sm shadow-orange-500/20"
                    : "text-stone-500 hover:text-stone-300"
                }`}
              >
                বাং
              </button>
            </div>
          </div>
        </div>

        {/* ---- Navigation ---- */}
        <nav className="p-3 space-y-0.5 mt-1">
          {sidebarContent.navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`relative flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-200 ${
                  active
                    ? "bg-orange-500/10 text-orange-400"
                    : "text-stone-400 hover:bg-white/[0.04] hover:text-stone-200"
                }`}
              >
                {/* Active left indicator */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-orange-500 to-amber-500" />
                )}

                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      active
                        ? "bg-orange-500/15"
                        : "bg-transparent"
                    }`}
                  >
                    <Icon
                      size={15}
                      className={active ? "text-orange-400" : ""}
                    />
                  </div>
                  <span className="font-ui text-[13px] font-medium">
                    {item.label[language]}
                  </span>
                </div>

                {item.key === "favorites" && favoriteCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-b from-orange-500/20 to-orange-600/10 border border-orange-500/20 px-1.5 text-[10px] font-ui font-bold text-orange-400">
                    {favoriteCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ---- Separator ---- */}
        <div className="mx-5 mt-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* ---- Content Area (Recently Viewed) ---- */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="px-5 pt-4 pb-2.5 flex items-center justify-between">
            <h2 className="font-ui text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-600">
              {sidebarContent.recentlyViewed.title[language]}
            </h2>
            {recipes.length > 0 && (
              <span className="font-ui text-[10px] text-stone-700">
                {recipes.length}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto chat-scroll px-3 pb-4">
            {recipes.length > 0 ? (
              <div className="space-y-1">
                {recipes.map((recipe) => (
                  <Link
                    key={recipe.slug}
                    href={`${ROUTES.RECIPE}/${recipe.slug}`}
                    className="group block rounded-xl border border-white/[0.04] p-2.5 transition-all duration-200 hover:bg-white/[0.03] hover:border-white/[0.1] hover:shadow-sm hover:shadow-black/10"
                  >
                    <p className="font-ui text-[13px] font-medium text-stone-300 line-clamp-2 group-hover:text-stone-100 transition-colors duration-200 leading-snug">
                      {t(recipe.name)}
                    </p>
                    {recipe.category && (
                      <p className="mt-1.5 font-ui text-[11px] text-stone-600 group-hover:text-stone-500 transition-colors duration-200">
                        {t(recipe.category)}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/[0.08] p-6 text-center m-2">
                <p className="font-ui text-xs text-stone-600 leading-relaxed">
                  {sidebarContent.recentlyViewed.empty[language]}
                </p>
              </div>
            )}
          </div>

          {/* ---- Footer ---- */}
          <div className="border-t border-white/[0.06] p-3 space-y-0.5">
            {sidebarContent.footer.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 font-ui text-[13px] transition-all duration-200 ${
                    active
                      ? "bg-white/[0.04] text-orange-400"
                      : "text-stone-600 hover:bg-white/[0.03] hover:text-stone-400"
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label[language]}</span>
                </Link>
              );
            })}

            <div className="mt-3 pt-3 border-t border-white/[0.04] text-center">
              <p className="font-ui text-[10px] text-stone-700">
                © {new Date().getFullYear()} {sidebarContent.brand.title}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ==========================
          Mobile Sidebar Drawer
      ========================== */}
      <MobileSidebar
        open={open}
        onClose={() => setOpen(false)}
        navigation={sidebarContent.navigation}
        footer={sidebarContent.footer}
        recentlyViewed={recipes}
      />
    </>
  );
}