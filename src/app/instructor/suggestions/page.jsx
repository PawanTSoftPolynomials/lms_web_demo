"use client";

import { Lightbulb } from "lucide-react";
import ComingSoonSection from "@/components/instructor/ComingSoonSection";

export default function InstructorSuggestionsPage() {
  return (
    <ComingSoonSection
      icon={Lightbulb}
      title="Suggestions"
      description="Ideas and improvement suggestions for your courses."
      plannedFeatures={["Content-gap suggestions from student activity", "Submit suggestions to the platform team"]}
    />
  );
}
