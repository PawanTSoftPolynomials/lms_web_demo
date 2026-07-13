'use client';

export default function CustomTooltip({
  active,
  payload,
  label,
  titleKey = 'Concept',
  valueKey = 'Mastery',
  valueSuffix = '%',
}) {
  if (!active || !payload?.length) return null;

  const value = payload[0]?.value;
  const status =
    payload[0]?.payload?.status ?? payload[0]?.payload?.health ?? 'Healthy';

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl shadow-slate-950/50">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {titleKey}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{label}</p>
      <div className="mt-3 flex items-center justify-between gap-4">
        <span className="text-sm text-slate-400">{valueKey}</span>
        <span className="text-sm font-semibold text-orange-400">
          {value}
          {valueSuffix}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-4">
        <span className="text-sm text-slate-400">Status</span>
        <span className="text-sm font-semibold text-emerald-400">{status}</span>
      </div>
    </div>
  );
}
