import ABOUT from "@/content/about";

import AppContainer from "@/components/ui/AppContainer";

export const metadata = {
  title: ABOUT.title,
  description: ABOUT.intro,
};

export default function AboutPage() {
  return (
    <main className="py-16 lg:py-24">
      <AppContainer>
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-14 text-center">
            <span className="inline-flex rounded-full bg-orange-100 px-4 py-1.5 text-sm font-medium text-orange-600">
              About Us
            </span>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              {ABOUT.title}
            </h1>

            <p className="mt-5 text-lg leading-8 text-gray-600">
              {ABOUT.intro}
            </p>

            <p className="mt-4 text-sm text-gray-500">
              Last Updated: {ABOUT.lastUpdated}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-12">
            {ABOUT.sections.map((section) => (
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

          {/* Developer */}
          <section className="mt-16 rounded-3xl border border-gray-200 bg-gray-50 p-8">
            <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-600">
              {ABOUT.developer.title}
            </span>

            <h2 className="mt-4 text-3xl font-bold text-gray-900">
              {ABOUT.developer.name}
            </h2>

            <p className="mt-2 font-medium text-orange-600">
              {ABOUT.developer.role}
            </p>

            <p className="mt-6 leading-8 text-gray-600">
              {ABOUT.developer.bio}
            </p>

            <div className="mt-8">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Technologies
              </h3>

              <div className="flex flex-wrap gap-3">
                {ABOUT.developer.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Email
                </p>

                <a
                  href={`mailto:${ABOUT.developer.contact.email}`}
                  className="mt-1 block text-orange-600 hover:underline"
                >
                  {ABOUT.developer.contact.email}
                </a>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Website
                </p>

                <a
                  href={ABOUT.developer.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-orange-600 hover:underline"
                >
                  {ABOUT.developer.contact.website}
                </a>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  GitHub
                </p>

                <a
                  href={ABOUT.developer.contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-orange-600 hover:underline"
                >
                  {ABOUT.developer.contact.github}
                </a>
              </div>
            </div>
          </section>
        </div>
      </AppContainer>
    </main>
  );
}