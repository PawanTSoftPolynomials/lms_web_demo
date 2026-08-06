"use client";

/**
 * Honest "not available yet" shell for nav sections that have no backend
 * concept behind them yet (News, Suggestions, Recommendations). Real nav
 * entry + real page structure, zero fabricated content — a clean surface
 * to wire a backend into later.
 */
export default function ComingSoonSection({ icon: Icon, title, description, plannedFeatures = [] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">{title}</h1>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      </div>

      <div className="rounded-2xl border border-dashed border-[#1A1F35] bg-[#0D1021] py-16 px-6 text-center space-y-3">
        {Icon && <Icon size={28} className="mx-auto text-slate-600" />}
        <p className="text-sm font-bold text-slate-300">Not available yet</p>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          This section doesn't have a backend behind it yet — it's reserved space in the navigation, not a
          feature with data to show.
        </p>
        {plannedFeatures.length > 0 && (
          <ul className="text-[11px] text-slate-500 pt-2 space-y-1">
            {plannedFeatures.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
