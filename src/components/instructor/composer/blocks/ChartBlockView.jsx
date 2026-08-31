"use client";

import ProgressBar from "@/components/ui/ProgressBar";

export default function ChartBlockView({ block }) {
  const rows = block.rows || [];

  if (rows.length === 0) {
    return <p className="text-slate-600 text-sm">No chart data yet</p>;
  }

  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={i} className="space-y-1">
          <span className="text-sm text-foreground">{row.label}</span>
          <ProgressBar value={Math.max(0, Math.min(100, Number(row.value) || 0))} />
        </div>
      ))}
    </div>
  );
}
