import LandingNavbar from "@/components/layouts/LandingNavbar";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import Footer from "@/components/layouts/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6">
        <LandingNavbar />

        <Hero />

        <FeaturedCourses />

        <Features />
      </div>

      <Footer />
    </main>
  );
}