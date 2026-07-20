import "./globals.css";

import {
  Inter,
  Cormorant_Garamond,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from "next/font/google";

import Sidebar from "@/components/layout/Sidebar";

import { FavoritesProvider } from "@/context/FavoritesContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import VisualPanel from "@/components/layout/VisualPanel";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "CookVerse",
  description: "AI Powered Recipe Assistant",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`
        ${inter.variable}
        ${cormorant.variable}
        ${jakarta.variable}
        ${mono.variable}
      `}
    >
<body className="min-h-screen bg-gray-50 font-sans text-gray-900 antialiased">
  <LanguageProvider>
    <FavoritesProvider>
      <RecentlyViewedProvider>
        <div className="flex min-h-screen flex-col lg:flex-row">
          {/* Sidebar */}
          <Sidebar />

          {/* Content */}
          <main className="min-w-0 flex-1 overflow-x-hidden">
            <div className="w-full h-full">
              {children}
            </div>
          </main>

          {/* Right Visual Panel */}
          
          <VisualPanel />
          <div></div>

        </div>
      </RecentlyViewedProvider>
    </FavoritesProvider>
  </LanguageProvider>
</body>
    </html>
  );
}
