"use client";

import { useAuth } from "@/context/AuthContext";
import WelcomeBanner from "@/components/common/WelcomeBanner";

/**
 * The greeting banner at the top of Student > My Courses — same shell as
 * Instructor > My Courses' InstructorWelcomeCard, greeting-only (no stat
 * tiles or illustration for this role; see @/components/common/WelcomeBanner).
 */
export default function StudentWelcomeCard() {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : "Student";

  return (
    <WelcomeBanner
      name={firstName}
      subtitle="Keep up the great work. Pick a course to continue learning."
    />
  );
}
