"use client";

import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";

/**
 * Small trend sparkline (last 6 weeks) for a single metric. `data` is
 * `[{week, value}]` where `value` may be null for weeks with no signal
 * (e.g. no quiz submissions that week) — recharts renders a gap, not a
 * fabricated zero.
 */
export default function TrendSparkline({ label, data, color = "#ff7a00", suffix = "%", emptyLabel }) {
  const hasAnyValue = data?.some((d) => d.value !== null && d.value !== undefined);
  const gradientId = `trend-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="rounded-xl border border-[#1A1F35] bg-[#141930] p-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[9.5px] font-black uppercase tracking-wider text-slate-500">{label}</p>
        {hasAnyValue && (
          <p className="text-[11px] font-black text-slate-200">
            {data[data.length - 1].value ?? "—"}
            {suffix}
          </p>
        )}
      </div>
      {hasAnyValue ? (
        <div className="h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" hide />
              <Tooltip
                cursor={{ stroke: "#1A1F35", strokeWidth: 1 }}
                contentStyle={{
                  background: "#0D1021",
                  border: "1px solid #1A1F35",
                  borderRadius: 8,
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#e2e2ec",
                  padding: "4px 8px",
                }}
                labelStyle={{ color: "#737399", fontSize: 9 }}
                formatter={(value) => [value === null ? "No data" : `${value}${suffix}`, label]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                connectNulls
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-12 flex items-center justify-center">
          <p className="text-[10px] text-slate-600">{emptyLabel || "Not tracked"}</p>
        </div>
      )}
    </div>
  );
}
