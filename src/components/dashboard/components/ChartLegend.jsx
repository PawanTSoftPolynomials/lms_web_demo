"use client";

export default function ChartLegend({
  payload = [],
}) {
  if (!payload.length) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
      {payload.map((item) => (
        <div
          key={item.value}
          className="flex items-center gap-2"
        >
          <span
            className="h-3 w-3 rounded-full"
            style={{
              backgroundColor: item.color,
            }}
          />

          <span className="text-sm text-slate-400">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}