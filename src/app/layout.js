import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata = {
  title: "CookVerse",
  description: "Modern Recipe Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <div className="flex min-h-screen flex-col">
          <LanguageProvider>
            <FavoritesProvider>
              <RecentlyViewedProvider>
                <Header />

                <main className="flex-1">{children}</main>

                <Footer />
              </RecentlyViewedProvider>
            </FavoritesProvider>
          </LanguageProvider>
        </div>
      </body>
    </html>
  );
}
