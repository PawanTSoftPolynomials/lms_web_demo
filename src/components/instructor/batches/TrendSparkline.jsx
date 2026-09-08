"use client";

import dynamic from "next/dynamic";

// recharts is loaded only when this chart actually mounts, and only once —
// keeping it out of every route's static bundle instead of duplicated per
// route (see PERFORMANCE_AUDIT.md Phase 5 / recommendation #6).
const TrendSparkline = dynamic(() => import("./TrendSparkline.chart"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-border bg-[#141930] p-3">
      <div className="h-12 animate-pulse bg-white/5 rounded" />
    </div>
  ),
});

export default TrendSparkline;
