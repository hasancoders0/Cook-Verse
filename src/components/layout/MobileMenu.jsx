"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FiX } from "react-icons/fi";

import MobileNav from "./MobileNav";

import CONFIG from "@/constants/config";
import ROUTES from "@/constants/routes";

export default function MobileMenu({ open, onClose }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-screen w-[320px] max-w-[85%] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-5">
          <Link
            href={ROUTES.HOME}
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <span className="text-3xl">🍳</span>

            <div>
              <h2 className="text-lg font-bold text-orange-600">
                {CONFIG.appName}
              </h2>

              <p className="text-xs text-gray-500">
                Discover. Cook. Enjoy.
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 transition hover:bg-gray-100"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <MobileNav onClose={onClose} />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-5 py-5">
          <p className="text-sm text-gray-500">
            Made with ❤️ for food lovers.
          </p>
        </div>
      </aside>
    </>
  );
}