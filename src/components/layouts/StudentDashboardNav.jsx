"use client";

import { QuickActionStrip } from "@/components/dashboard/QuickActionStrip";
import { PRIMARY_NAV_ITEMS } from "@/components/student/NavigationStrip/navigationItems";

// Desktop / tablet only — the exact same floating quick-action strip as
// Instructor. On mobile, navigation is handled by the header's hamburger
// (opens StudentNavDrawer) and the bottom tab bar instead, so this strip no
// longer renders its own mobile bar/drawer.
//
// `bare` mirrors Instructor's NavigationStrip({ bare }) — renders the items
// as plain flex children with no pill-strip chrome of their own, for
// embedding directly inside the top navbar instead of as its own row.
export default function StudentDashboardNav({ bare } = {}) {
  if (bare) {
    return <QuickActionStrip items={PRIMARY_NAV_ITEMS} ariaLabel="Student dashboard sections" bare />;
  }

  return (
    <div className="hidden sm:block">
      <QuickActionStrip items={PRIMARY_NAV_ITEMS} ariaLabel="Student dashboard sections" />
    </div>
  );
}
