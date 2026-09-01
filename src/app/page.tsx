import LandingNavbar from "@/components/layouts/LandingNavbar";
import Hero from "@/components/home/Hero";
import PlatformStats from "@/components/home/PlatformStats";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import WhyOrangeTree from "@/components/home/WhyOrangeTree";
import HowItWorks from "@/components/home/HowItWorks";
import ProductShowcase from "@/components/home/ProductShowcase";
import FinalCta from "@/components/home/FinalCta";
import Footer from "@/components/layouts/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6">
        <LandingNavbar />

        <Hero />

        <PlatformStats />

        <FeaturedCourses />

        <WhyOrangeTree />

        <HowItWorks />

        <ProductShowcase />

        <FinalCta />
      </div>

      <Footer />
    </main>
  );
}
