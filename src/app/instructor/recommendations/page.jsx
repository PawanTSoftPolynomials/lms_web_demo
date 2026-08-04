"use client";

import { Sparkles } from "lucide-react";
import ComingSoonSection from "@/components/instructor/ComingSoonSection";

export default function InstructorRecommendationsPage() {
  return (
    <ComingSoonSection
      icon={Sparkles}
      title="Recommendations"
      description="Personalized recommendations to improve your courses and teaching."
      plannedFeatures={["Course improvement recommendations", "Student-outcome-driven suggestions"]}
    />
  );
}
