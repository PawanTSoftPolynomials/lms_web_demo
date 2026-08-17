"use client";

import { QuickActionStrip } from "@/components/dashboard/QuickActionStrip";
import { PRIMARY_NAV_ITEMS } from "@/components/student/NavigationStrip/navigationItems";

// Desktop / tablet only — the exact same floating quick-action strip as
// Instructor. On mobile, navigation is handled by the header's hamburger
// (opens StudentNavDrawer) and the bottom tab bar instead, so this strip no
// longer renders its own mobile bar/drawer.
export default function StudentDashboardNav() {
  return (
    <div className="hidden sm:block">
      <QuickActionStrip items={PRIMARY_NAV_ITEMS} ariaLabel="Student dashboard sections" />
    </div>
  );
}
