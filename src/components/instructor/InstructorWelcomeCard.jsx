"use client";

import { BookOpen, Users, BarChart3 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useCourseStatusCounts } from "@/hooks/queries/instructor/useDashboardHome";
import WelcomeBanner from "@/components/common/WelcomeBanner";

/**
 * The greeting banner at the top of Instructor > My Courses.
 *
 * Distinct from `HomeHeader`, which is deliberately prose-only ("the KPI strip
 * below it already covers the scannable numbers"). Here there is no KPI strip —
 * the page is a course grid — so the banner carries the three totals itself.
 *
 * Every number is server-computed by GET /courses/stats/mine. None of them is
 * derived from the course list this page renders: that list is paginated at 12,
 * so summing it would silently under-report for any instructor past one page.
 */
export default function InstructorWelcomeCard() {
  const { user } = useAuth();
  const { data, isLoading } = useCourseStatusCounts();

  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : "Instructor";

  // One word each: the tile is three numbers side by side in a column that can
  // get as narrow as ~100px, and "Total Courses" truncated to "T." there. The
  // figure already reads as a total, so the prefix only cost legibility.
  const stats = [
    { label: "Courses", value: data?.total, icon: BookOpen },
    { label: "Students", value: data?.students, icon: Users },
    { label: "Lessons", value: data?.lessons, icon: BarChart3 },
  ];

  return (
    <WelcomeBanner
      name={firstName}
      subtitle="Keep creating amazing learning experiences. Pick a course to continue building."
      stats={stats}
      isLoading={isLoading}
      imageSrc="/images/instructor_3d.jpg"
    />
  );
}
