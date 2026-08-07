"use client";

import { QuickActionStrip } from "@/components/dashboard/QuickActionStrip";
import { PRIMARY_NAV_ITEMS } from "./navigationItems";

// Thin role-specific wrapper around the shared floating quick-action strip
// (layout, styling, responsiveness, and animations all live in
// QuickActionStrip so Instructor and Student render byte-identical UI).
export function NavigationStrip() {
  return <QuickActionStrip items={PRIMARY_NAV_ITEMS} ariaLabel="Instructor navigation" />;
}
