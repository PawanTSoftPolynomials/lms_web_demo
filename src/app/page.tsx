import LandingNavbar from "@/components/layouts/LandingNavbar";
import Hero from "@/components/home/Hero";
import GoalCategoryDiscovery from "@/components/home/GoalCategoryDiscovery";
import CourseDiscovery from "@/components/home/CourseDiscovery";
import LearningExperience from "@/components/home/LearningExperience";
import FinalCta from "@/components/home/FinalCta";
import Footer from "@/components/layouts/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2 sm:space-y-4">
        <LandingNavbar />

        {/* Region 1: HERO & PRODUCT STORY Visual */}
        <Hero />

        {/* Region 2: COMPACT DISCOVERY & TRUST (Goals + Categories + Stats) */}
        <GoalCategoryDiscovery />

        {/* Region 3: UNIFIED COURSE DISCOVERY */}
        <CourseDiscovery />

        {/* Region 4: LEARNING EXPERIENCE & PROGRESSION (Learn → Practice → Assess → Track → Achieve) */}
        <LearningExperience />

        {/* Region 5: FINAL CALL-TO-ACTION */}
        <FinalCta />
      </div>

      <Footer />
    </main>
  );
}
