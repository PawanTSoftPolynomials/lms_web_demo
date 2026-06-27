"use client";

export default function ChartTooltip({
  active,
  payload,
  label,
}) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="min-w-[180px] rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-xl backdrop-blur-md">
      {label && (
        <p className="mb-3 border-b border-slate-700 pb-2 text-sm font-semibold text-white">
          {label}
        </p>
      )}

      <div className="space-y-2">
        {payload.map((entry, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-6"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: entry.color,
                }}
              />

              <span className="text-sm text-slate-300">
                {entry.name}
              </span>
            </div>

            <span className="text-sm font-semibold text-white">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}