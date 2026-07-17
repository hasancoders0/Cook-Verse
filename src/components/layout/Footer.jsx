import Link from "next/link";
import { FiHeart } from "react-icons/fi";

import AppContainer from "@/components/ui/AppContainer";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <AppContainer>
        <div className="flex flex-col items-center justify-between gap-6 py-8 md:flex-row">
          {/* Logo & Copyright */}
          <div className="text-center md:text-left">
            <Link
              href="/"
              className="text-2xl font-bold text-orange-600"
            >
              CookVerse
            </Link>

            <p className="mt-2 text-sm text-gray-500">
              © {year} CookVerse. All rights reserved.
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-gray-600">
            <Link
              href="/about"
              className="transition hover:text-orange-600"
            >
              About
            </Link>

            <Link
              href="/privacy-policy"
              className="transition hover:text-orange-600"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-orange-600"
            >
              Terms
            </Link>
          </nav>
        </div>

        <div className="border-t border-gray-200 py-6">
          <p className="flex items-center justify-center gap-2 text-center text-sm text-gray-500">
            Made with <FiHeart className="text-red-500" /> for home cooks.
          </p>
        </div>
      </AppContainer>
    </footer>
  );
}