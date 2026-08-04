"use client";

import { Newspaper } from "lucide-react";
import ComingSoonSection from "@/components/instructor/ComingSoonSection";

export default function InstructorNewsPage() {
  return (
    <ComingSoonSection
      icon={Newspaper}
      title="News"
      description="Platform and course-related news for instructors."
      plannedFeatures={["Platform release notes", "Course policy updates", "Curated teaching resources"]}
    />
  );
}
