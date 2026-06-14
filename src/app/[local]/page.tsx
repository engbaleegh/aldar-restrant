import About from "@/components/about";
import BestSellers from "./_components/BestSellers";
import Hero from "./_components/Hero";
import Contact from "@/components/contact";
import CategoriesSection from "./_components/CategoriesSection";
import ReviewsSection from "./_components/ReviewsSection";
import FAQSection from "./_components/FAQSection";
import CTASection from "./_components/CTASection";
import FeaturedProducts from "./_components/FeaturedProducts";

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedProducts />
      <CategoriesSection />
      <BestSellers />
      <CTASection />
      <About />
      <ReviewsSection />
      <FAQSection />
      <Contact />
    </main>
  );
}
