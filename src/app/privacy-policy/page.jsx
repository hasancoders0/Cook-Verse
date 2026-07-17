import PRIVACY_POLICY from "@/content/privacy-policy";

import AppContainer from "@/components/ui/AppContainer";

export const metadata = {
  title: PRIVACY_POLICY.title,
  description: PRIVACY_POLICY.intro,
};

export default function PrivacyPolicyPage() {
  return (
    <main className="py-16 lg:py-24">
      <AppContainer>
        <div className="mx-auto max-w-4xl">
          <div className="mb-14 text-center">
            <span className="inline-flex rounded-full bg-orange-100 px-4 py-1.5 text-sm font-medium text-orange-600">
              Legal
            </span>

            <h1 className="mt-5 text-4xl font-bold text-gray-900 md:text-5xl">
              {PRIVACY_POLICY.title}
            </h1>

            <p className="mt-5 text-lg leading-8 text-gray-600">
              {PRIVACY_POLICY.intro}
            </p>

            <p className="mt-4 text-sm text-gray-500">
              Last Updated: {PRIVACY_POLICY.lastUpdated}
            </p>
          </div>

          <div className="space-y-12">
            {PRIVACY_POLICY.sections.map((section) => (
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