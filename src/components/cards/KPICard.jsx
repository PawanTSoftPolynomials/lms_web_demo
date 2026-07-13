'use client';

import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import CountUp from 'react-countup';

export default function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  status,
  iconBg,
  iconColor,
}) {
  const positive = trend >= 0;
  const displayValue =
    typeof value === 'number' ? <CountUp end={value} duration={1.2} /> : value;

  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-400 hover:shadow-xl hover:shadow-slate-950/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {displayValue}
          </h2>
        </div>

        <div className={`rounded-2xl p-3 ${iconBg}`}>
          <Icon size={22} className={iconColor} />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/60 px-3 py-2">
        {positive ? (
          <ArrowUpRight size={16} className="text-emerald-400" />
        ) : (
          <ArrowDownRight size={16} className="text-red-400" />
        )}

        <span
          className={`font-semibold ${positive ? 'text-emerald-400' : 'text-red-400'}`}
        >
          {positive ? '+' : ''}
          {trend}%
        </span>
        <span className="text-sm text-slate-500">{trendLabel}</span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
        <p className="text-sm text-slate-400">{status}</p>
        {title === 'Courses Authored' && (
          <span className="text-xs font-medium text-orange-400">
            Context ready
          </span>
        )}
      </div>
    </div>
  );
}
