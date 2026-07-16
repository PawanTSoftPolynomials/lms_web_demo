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
    <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/60 p-8 shadow-sm transition-all duration-350 hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-xl hover:shadow-slate-950/50 min-h-[240px] flex flex-col justify-between">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">{title}</p>
          <h2 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl leading-none">
            {displayValue}
          </h2>
        </div>

        <div className={`rounded-xl p-4 shrink-0 transition-transform group-hover:scale-105 duration-300 ${iconBg}`}>
          <Icon size={26} className={iconColor} />
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-800/60 bg-slate-950/70 px-3 py-1.5 text-xs font-semibold">
          {positive ? (
            <ArrowUpRight size={15} className="text-emerald-400" />
          ) : (
            <ArrowDownRight size={15} className="text-red-400" />
          )}

          <span
            className={`${positive ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {positive ? '+' : ''}
            {trend}%
          </span>
          <span className="text-slate-500 font-normal">{trendLabel}</span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3.5 text-xs text-slate-400 font-medium">
          <p className="tracking-wide">{status}</p>
          {title === 'Courses Authored' && (
            <span className="font-semibold text-orange-400 animate-pulse">
              Context ready
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
