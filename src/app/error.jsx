"use client";

import { useEffect } from "react";
import { FiRefreshCw } from "react-icons/fi";

import AppContainer from "@/components/ui/AppContainer";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="py-16 lg:py-24">
      <AppContainer>
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 text-7xl">⚠️</div>

          <span className="inline-flex rounded-full bg-red-100 px-4 py-1.5 text-sm font-medium text-red-600">
            Something Went Wrong
          </span>

          <h1 className="mt-6 text-4xl font-bold text-gray-900">
            Oops!
          </h1>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            We encountered an unexpected error while loading this page. Please
            try again.
          </p>

          <button
            onClick={reset}
            className="mt-10 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-medium text-white transition hover:bg-orange-600"
          >
            <FiRefreshCw />
            Try Again
          </button>
        </div>
      </AppContainer>
    </main>
  );
}