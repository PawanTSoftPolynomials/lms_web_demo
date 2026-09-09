"use client";

import dynamic from "next/dynamic";

// recharts is loaded only when this chart actually mounts, and only once —
// keeping it out of every route's static bundle instead of duplicated per
// route (see PERFORMANCE_AUDIT.md Phase 5 / recommendation #6).
export const CourseStatusPieChart = dynamic(
  () => import("./CourseStatusPieChart.chart").then((m) => m.CourseStatusPieChart),
  {
    ssr: false,
    loading: () => <div className="h-48 animate-pulse bg-muted/50 rounded-2xl"></div>,
  }
);
