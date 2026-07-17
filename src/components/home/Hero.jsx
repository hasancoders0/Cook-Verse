import Link from "next/link";
import { FiArrowRight, FiSearch } from "react-icons/fi";

import homeContent from "@/content/home";
import AppButton from "@/components/ui/AppButton";
import AppContainer from "@/components/ui/AppContainer";

export default function Hero() {
  const { hero } = homeContent;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-white to-white">
      {/* Background Decoration */}
      <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />
      <div className="absolute top-20 -right-32 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />

      <AppContainer>
        <div className="relative flex min-h-[calc(100vh-80px)] items-center py-20">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700">
              <span>🍳</span>
              <span>{hero.badge}</span>
            </div>

            {/* Heading */}
            <h1 className="mt-8 text-5xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-7xl">
              {hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 md:text-xl">
              {hero.description}
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href={hero.primaryButton.href}>
                <AppButton size="lg">
                  <FiSearch className="mr-2 text-lg" />
                  {hero.primaryButton.label}
                </AppButton>
              </Link>

              <Link href={hero.secondaryButton.href}>
                <AppButton variant="outline" size="lg">
                  {hero.secondaryButton.label}
                  <FiArrowRight className="ml-2 text-lg" />
                </AppButton>
              </Link>
            </div>
          </div>
        </div>
      </AppContainer>
    </section>
  );
}