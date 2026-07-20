import { Info, Code, Mail, Globe } from "lucide-react";

import ABOUT from "@/content/about";
import AppContainer from "@/components/ui/AppContainer";

/* Custom GitHub Icon SVG since Lucide doesn't provide it */
function GithubIcon({ size = 14, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export const metadata = {
  title: ABOUT.title,
  description: ABOUT.intro,
};

export default function AboutPage() {
  return (
    <main className="bg-[#0c0a09] py-16 lg:py-24">
      <AppContainer>
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/[0.07] px-4 py-1.5 backdrop-blur-sm">
              <Info size={12} className="text-orange-500/70" />
              <span className="font-ui text-xs font-medium text-orange-400">
                About Us
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
              {ABOUT.title}
            </h1>

            <p className="mt-5 font-ui text-base leading-relaxed text-stone-500 sm:text-lg max-w-2xl mx-auto">
              {ABOUT.intro}
            </p>

            <p className="mt-4 font-ui text-[11px] text-stone-700 uppercase tracking-widest">
              Last Updated: {ABOUT.lastUpdated}
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-14">
            {ABOUT.sections.map((section) => (
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

          {/* Developer Card */}
          <section className="mt-20 rounded-2xl border border-white/[0.06] bg-stone-900/30 p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/[0.07] px-3.5 py-1.5 backdrop-blur-sm">
              <Code size={12} className="text-orange-500/70" />
              <span className="font-ui text-[11px] font-medium text-orange-400">
                {ABOUT.developer.title}
              </span>
            </div>

            <h2
              className="mt-5 font-heading text-3xl font-bold tracking-tight"
              style={{
                background: "linear-gradient(to bottom, #f5f5f4, #a8a29e)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {ABOUT.developer.name}
            </h2>

            <p className="mt-2 font-ui text-sm font-medium text-orange-400">
              {ABOUT.developer.role}
            </p>

            <p className="mt-6 font-ui text-sm leading-7 text-stone-400">
              {ABOUT.developer.bio}
            </p>

            {/* Technologies */}
            <div className="mt-8">
              <h3 className="mb-4 font-ui text-sm font-semibold text-stone-200">
                Technologies
              </h3>

              <div className="flex flex-wrap gap-2">
                {ABOUT.developer.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2 font-ui text-[13px] font-medium text-stone-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Links */}
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                  <Mail size={14} className="text-stone-500" />
                </div>
                <div>
                  <p className="font-ui text-[11px] font-medium text-stone-600 uppercase tracking-wider">
                    Email
                  </p>
                  <a
                    href={`mailto:${ABOUT.developer.contact.email}`}
                    className="mt-1 block text-sm text-orange-400 transition-colors hover:text-orange-300"
                  >
                    {ABOUT.developer.contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                  <Globe size={14} className="text-stone-500" />
                </div>
                <div>
                  <p className="font-ui text-[11px] font-medium text-stone-600 uppercase tracking-wider">
                    Website
                  </p>
                  <a
                    href={ABOUT.developer.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-sm text-orange-400 transition-colors hover:text-orange-300"
                  >
                    {ABOUT.developer.contact.website}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                  <GithubIcon size={14} className="text-stone-500" />
                </div>
                <div>
                  <p className="font-ui text-[11px] font-medium text-stone-600 uppercase tracking-wider">
                    GitHub
                  </p>
                  <a
                    href={ABOUT.developer.contact.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-sm text-orange-400 transition-colors hover:text-orange-300"
                  >
                    {ABOUT.developer.contact.github}
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </AppContainer>
    </main>
  );
}