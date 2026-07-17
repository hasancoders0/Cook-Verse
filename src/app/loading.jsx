import AppContainer from "@/components/ui/AppContainer";

export default function Loading() {
  return (
    <main className="py-16 lg:py-24">
      <AppContainer>
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />

          <h2 className="mt-8 text-3xl font-bold text-gray-900">
            Loading...
          </h2>

          <p className="mt-3 text-gray-600">
            Preparing delicious recipes for you.
          </p>
        </div>
      </AppContainer>
    </main>
  );
}