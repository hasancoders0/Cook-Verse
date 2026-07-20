import { Shield } from "lucide-react";

import PRIVACY_POLICY from "@/content/privacy-policy";
import AppContainer from "@/components/ui/AppContainer";

export const metadata = {
  title: PRIVACY_POLICY.title,
  description: PRIVACY_POLICY.intro,
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-[#0c0a09] py-16 lg:py-24">
      <AppContainer>
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/[0.07] px-4 py-1.5 backdrop-blur-sm">
              <Shield size={12} className="text-orange-500/70" />
              <span className="font-ui text-xs font-medium text-orange-400">
                Legal
              </span>
            </div>

            <h1
              className="mt-6 font-heading text-4xl font-bold tracking-tight md:text-5xl"
              style={{
                background: "linear-gradient(to bottom, #f5f5f4, #a8a29e)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {PRIVACY_POLICY.title}
            </h1>

            <p className="mt-5 font-ui text-base leading-relaxed text-stone-500 sm:text-lg max-w-2xl mx-auto">
              {PRIVACY_POLICY.intro}
            </p>

            <p className="mt-4 font-ui text-[11px] text-stone-700 uppercase tracking-widest">
              Last Updated: {PRIVACY_POLICY.lastUpdated}
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-14">
            {PRIVACY_POLICY.sections.map((section) => (
              <section key={section.title}>
                <h2 className="mb-5 font-heading text-2xl font-semibold text-stone-100 tracking-tight">
                  {section.title}
                </h2>

                <div className="space-y-4">
                  {section.content.map((paragraph, index) => (
                    <p
                      key={index}
                      className="font-ui text-sm leading-7 text-stone-400"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </AppContainer>
    </main>
  );
}