"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiX,
  FiGlobe,
  FiHeart,
  FiClock,
} from "react-icons/fi";

import ROUTES from "@/constants/routes";

import { useFavorites } from "@/context/FavoritesContext";
import { useLanguage } from "@/context/LanguageContext";

import useTranslation from "@/hooks/useTranslation";

export default function MobileSidebar({
  open,
  onClose,
  navigation,
  footer,
  recentlyViewed,
}) {
  const pathname = usePathname();

  const { language, changeLanguage } = useLanguage();

  const { favoriteCount } = useFavorites();

  const { t } = useTranslation();

  const isActive = (href) => {
    if (!href) return false;
    if (href === ROUTES.HOME) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ==========================
          Overlay (Dark Frosted Glass)
      ========================== */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 transition-all duration-300 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{ backdropFilter: "blur(4px)" }}
      />

      {/* ==========================
          Drawer
      ========================== */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-80 max-w-[88%] flex-col bg-[#0c0a09] border-r border-white/[0.06] shadow-2xl shadow-black/50 transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ---- Header ---- */}
        <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
          <div>
            <h2 className="font-heading text-xl font-bold text-stone-100">
              CookVerse
            </h2>
            <p className="font-ui text-[11px] text-stone-600 mt-0.5">
              AI Recipe Assistant
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-stone-500 transition hover:bg-white/[0.06] hover:text-stone-200"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* ---- Language Switcher ---- */}
        <div className="border-b border-white/[0.06] p-4">
          <div className="flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03] p-1">
            <FiGlobe
              className="ml-2 mr-2 text-stone-600"
              size={14}
            />

            <button
              onClick={() => changeLanguage("en")}
              className={`flex-1 rounded-md py-2 text-sm font-ui font-medium transition-all ${
                language === "en"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-stone-500 hover:text-stone-300"
              }`}
            >
              EN
            </button>

            <button
              onClick={() => changeLanguage("bn")}
              className={`flex-1 rounded-md py-2 text-sm font-ui font-medium transition-all ${
                language === "bn"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-stone-500 hover:text-stone-300"
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>

        {/* ---- Navigation ---- */}
        <nav className="space-y-0.5 p-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between rounded-lg px-3 py-3 transition-all duration-200 ${
                  active
                    ? "bg-orange-500/10 text-orange-400 border-l-2 border-orange-500"
                    : "text-stone-400 hover:bg-white/[0.04] hover:text-stone-200 border-l-2 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={17} className={active ? "text-orange-400" : ""} />
                  <span className="font-ui text-sm font-medium">
                    {item.label[language]}
                  </span>
                </div>

                {item.key === "favorites" && favoriteCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500/20 px-1.5 text-[10px] font-ui font-bold text-orange-400">
                    {favoriteCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ---- Recently Viewed ---- */}
        <div className="flex min-h-0 flex-1 flex-col border-t border-white/[0.06]">
          <div className="flex items-center gap-2 px-5 py-4">
            <FiClock
              size={14}
              className="text-stone-600"
            />

            <h3 className="font-ui text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-600">
              Recently Viewed
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto chat-scroll px-3 pb-4">
            {recentlyViewed.length ? (
              <div className="space-y-1.5">
                {recentlyViewed.map((recipe) => (
                  <Link
                    key={recipe.slug}
                    href={`${ROUTES.RECIPE}/${recipe.slug}`}
                    onClick={onClose}
                    className="block rounded-lg border border-white/[0.04] p-3 transition-all hover:bg-white/[0.03] hover:border-white/[0.08] group"
                  >
                    <p className="font-ui text-sm font-medium text-stone-300 line-clamp-2 group-hover:text-stone-100 transition-colors">
                      {t(recipe.name)}
                    </p>

                    {recipe.category && (
                      <p className="mt-1 font-ui text-[11px] text-stone-600">
                        {t(recipe.category)}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-white/[0.08] p-5 text-center m-2">
                <p className="font-ui text-xs text-stone-600">
                  No recently viewed recipes.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ---- Footer ---- */}
        <div className="border-t border-white/[0.06] p-3 space-y-0.5">
          {footer.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-ui text-sm transition-all ${
                  active
                    ? "bg-white/[0.04] text-orange-400"
                    : "text-stone-600 hover:bg-white/[0.03] hover:text-stone-400"
                }`}
              >
                <Icon size={15} />
                <span>{item.label[language]}</span>
              </Link>
            );
          })}

          <div className="mt-3 pt-3 border-t border-white/[0.04] text-center">
            <p className="font-ui text-[10px] text-stone-700">
              © {new Date().getFullYear()} CookVerse
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}