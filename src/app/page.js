import Hero from "@/components/home/Hero";
import RecipeMethod from "@/components/home/RecipeMethod";
import PopularCategories from "@/components/home/PopularCategories";
import PopularRecipes from "@/components/home/PopularRecipes";
import WhyCookVerse from "@/components/home/WhyCookVerse";
import FAQ from "@/components/home/FAQ";
import RecentlyViewedRecipes from "@/components/home/RecentlyViewedRecipes";

export default function Home() {
  return (
    <main>
      <Hero />
      <RecipeMethod />
      <PopularCategories />
      <PopularRecipes />
      <WhyCookVerse />
      <FAQ />
      <RecentlyViewedRecipes />
    </main>
  );
}
