import TERMS_AND_CONDITIONS from "@/content/terms-and-conditions";

import AppContainer from "@/components/ui/AppContainer";

export const metadata = {
  title: TERMS_AND_CONDITIONS.title,
  description: TERMS_AND_CONDITIONS.intro,
};

export default function TermsAndConditionsPage() {
  return (
    <main className="py-16 lg:py-24">
      <AppContainer>
        <div className="mx-auto max-w-4xl">
          <div className="mb-14 text-center">
            <span className="inline-flex rounded-full bg-orange-100 px-4 py-1.5 text-sm font-medium text-orange-600">
              Legal
            </span>

            <h1 className="mt-5 text-4xl font-bold text-gray-900 md:text-5xl">
              {TERMS_AND_CONDITIONS.title}
            </h1>

            <p className="mt-5 text-lg leading-8 text-gray-600">
              {TERMS_AND_CONDITIONS.intro}
            </p>

            <p className="mt-4 text-sm text-gray-500">
              Last Updated: {TERMS_AND_CONDITIONS.lastUpdated}
            </p>
          </div>

          <div className="space-y-12">
            {TERMS_AND_CONDITIONS.sections.map((section) => (
              <section key={section.title}>
                <h2 className="mb-5 text-2xl font-bold text-gray-900">
                  {section.title}
                </h2>

                <div className="space-y-4">
                  {section.content.map((paragraph, index) => (
                    <p
                      key={index}
                      className="leading-8 text-gray-600"
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