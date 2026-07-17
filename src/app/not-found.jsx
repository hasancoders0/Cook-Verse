"use client";

import Link from "next/link";
import { FiArrowLeft, FiHome, FiSearch } from "react-icons/fi";

import AppContainer from "@/components/ui/AppContainer";

import ROUTES from "@/constants/routes";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center py-16">
      <AppContainer>
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 text-7xl">🍳</div>

          <span className="inline-flex rounded-full bg-orange-100 px-4 py-1.5 text-sm font-medium text-orange-600">
            404 Error
          </span>

          <h1 className="mt-6 text-4xl font-bold text-gray-900 md:text-5xl">
            Recipe Not Found
          </h1>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            Sorry, we couldn't find the page or recipe you're looking for. It
            may have been moved, deleted, or the URL might be incorrect.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href={ROUTES.HOME}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-medium text-white transition hover:bg-orange-600"
            >
              <FiHome />
              Back to Home
            </Link>

            <Link
              href={ROUTES.DISH}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <FiSearch />
              Browse Recipes
            </Link>
          </div>

          <button
            onClick={() => history.back()}
            className="mt-6 inline-flex items-center gap-2 text-gray-500 transition hover:text-orange-600"
          >
            <FiArrowLeft />
            Go Back
          </button>
        </div>
      </AppContainer>
    </main>
  );
}