'use client';

import { ChevronDown } from 'lucide-react';

export default function ChartCard({
  title,
  subtitle,
  action,
  filter,
  children,
}) {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-slate-700/60">
      {/* Header */}

      <div className="flex items-start justify-between border-b border-slate-800 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>

          {subtitle && (
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {filter && (
            <button className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:border-orange-500">
              <span>{filter}</span>

              <ChevronDown size={16} />
            </button>
          )}

          {action && (
            <button className="text-sm font-medium text-orange-400 transition hover:text-orange-300">
              {action}
            </button>
          )}
        </div>
      </div>

      {/* Content */}

      <div className="p-6">{children}</div>
    </div>
  );
}
