"use client";

import { QuickActionStrip } from "@/components/dashboard/QuickActionStrip";
import { PRIMARY_NAV_ITEMS } from "./navigationItems";

export function NavigationStrip({ bare }: { bare?: boolean } = {}) {
  return <QuickActionStrip items={PRIMARY_NAV_ITEMS} ariaLabel="Admin navigation" bare={bare} />;
}
