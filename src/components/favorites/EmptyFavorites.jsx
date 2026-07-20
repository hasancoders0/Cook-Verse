"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import AppContainer from "@/components/ui/AppContainer";
import useTranslation from "@/hooks/useTranslation";

export default function EmptyFavorites() {
  const { language } = useTranslation();

  const content =
    language === "bn"
      ? {
          title: "এখনো কোনো পছন্দের রেসিপি নেই",
          description:
            "রেসিপি ব্রাউজ করুন এবং আপনার পছন্দেগুলো সংরক্ষণ করুন, যেকোনো সময় এখানে পাবেন।",
          cta: "রেসিপি ব্রাউজ করুন",
        }
      : {
          title: "No favorite recipes yet",
          description:
            "Browse recipes and save your favorites to find them here anytime.",
          cta: "Browse Recipes",
        };

  return (
    <section className="bg-[#0c0a09] py-16">
      <AppContainer>
        <div className="mx-auto max-w-lg text-center">
          {/* Icon container */}
          <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-red-500/[0.07] border border-red-500/15 flex items-center justify-center">
            <Heart size={28} className="text-red-400/70" />
          </div>

          <h2 className="font-heading text-2xl font-semibold text-stone-200">
            {content.title}
          </h2>

          <p className="mt-2.5 font-ui text-sm text-stone-500 leading-relaxed">
            {content.description}
          </p>

          <Link
            href="/dish"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-6 py-3 font-ui text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-200 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            {content.cta}
          </Link>
        </div>
      </AppContainer>
    </section>
  );
}