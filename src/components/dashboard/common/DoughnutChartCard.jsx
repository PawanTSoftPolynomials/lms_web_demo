"use client";

import dynamic from "next/dynamic";

// recharts is loaded only when this chart actually mounts, and only once —
// keeping it out of every route's static bundle instead of duplicated per
// route (see PERFORMANCE_AUDIT.md Phase 5 / recommendation #6).
//
// Note: next/dynamic's `loading` component only ever receives
// {isLoading, error, pastDelay} — never the wrapped component's own props —
// so this can't show the real title/subtitle while loading (same
// generic-skeleton constraint the other chart wrappers in this codebase have).
const DoughnutChartCard = dynamic(() => import("./DoughnutChartCard.chart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[340px] animate-pulse bg-muted/50 rounded-2xl" />
  ),
});

export default DoughnutChartCard;
