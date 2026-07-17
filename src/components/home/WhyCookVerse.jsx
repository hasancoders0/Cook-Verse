import homeContent from "@/content/home";
import AppCard from "@/components/ui/AppCard";
import AppContainer from "@/components/ui/AppContainer";

export default function WhyCookVerse() {
  const { whyCookVerse } = homeContent;

  return (
    <section className="py-24">
      <AppContainer>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-600">
            {whyCookVerse.badge}
          </span>

          <h2 className="mt-6 text-4xl font-bold text-gray-900 lg:text-5xl">
            {whyCookVerse.title}
          </h2>

          <p className="mt-5 text-lg text-gray-600">
            {whyCookVerse.description}
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {whyCookVerse.items.map((item) => (
            <AppCard
              key={item.id}
              className="rounded-3xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="text-5xl">
                {item.icon}
              </div>

              <h3 className="mt-6 text-2xl font-bold text-gray-900">
                {item.title}
              </h3>

              <p className="mt-4 leading-7 text-gray-600">
                {item.description}
              </p>
            </AppCard>
          ))}
        </div>
      </AppContainer>
    </section>
  );
}