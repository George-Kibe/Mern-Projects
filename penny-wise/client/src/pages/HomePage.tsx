import CTASection from "@/components/Home/CTASection";
import FeaturesSection from "@/components/Home/FeaturesSection";
import Footer from "@/components/Home/Footer";
import HeroSection from "@/components/Home/HeroSection";

export default function HomePage() {
  return (
    <>
      <main className="bg-slate-950 px-4 py-8 sm:px-8 sm:py-12">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
