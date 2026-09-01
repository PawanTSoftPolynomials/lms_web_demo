import LandingNavbar from "@/components/layouts/LandingNavbar";
import Hero from "@/components/home/Hero";
import PlatformStats from "@/components/home/PlatformStats";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import LearningJourney from "@/components/home/LearningJourney";
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

        <LearningJourney />

        <FinalCta />
      </div>

      <Footer />
    </main>
  );
}
