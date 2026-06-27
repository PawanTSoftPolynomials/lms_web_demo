"use client";

import { HiOutlineChartBar } from "react-icons/hi";

export default function ChartEmptyState({
  title = "No data available",
  description = "Data will appear here once activity starts.",
  icon,
  className = "",
}) {
  const Icon = icon || HiOutlineChartBar;

  return (
    <div
      className={`flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center ${className}`}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
        <Icon size={32} />
      </div>

      <h3 className="text-lg font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}