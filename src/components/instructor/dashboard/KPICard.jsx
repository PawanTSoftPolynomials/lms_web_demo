'use client';

import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import CountUp from 'react-countup';

export default function KPICard({
  title,
  value,
  icon: Icon,
  trend = 0,
  trendLabel = 'vs last 7 days',
  iconBg = 'bg-orange-500/10',
  iconColor = 'text-orange-400',
  sparklinePath = 'M0,25 Q15,5 30,20 T60,5 T90,22 T120,5',
  sparklineColor = '#f97316',
}) {
  const positive = trend >= 0 || trendLabel.includes('▲');
  
  // Format numbers nicely with commas if possible
  const formattedValue = typeof value === 'number' ? (
    <CountUp end={value} duration={1.5} separator="," />
  ) : value;

  return (
    <div className="group relative rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-sm transition-all duration-350 hover:-translate-y-1 hover:border-slate-700/60 hover:shadow-xl hover:shadow-slate-950/40 min-h-[140px] flex flex-col justify-between overflow-hidden">
      
      {/* Background Sparkline SVG */}
      <div className="absolute right-3 bottom-12 w-28 h-10 opacity-30 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none">
        <svg viewBox="0 0 120 30" className="w-full h-full">
          <path
            d={sparklinePath}
            fill="none"
            stroke={sparklineColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex items-start justify-between gap-4 z-10">
        <div className="min-w-0 space-y-1.5">
          <p className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">{title}</p>
          <h2 className="text-3xl font-black tracking-tight text-white leading-none">
            {formattedValue}
          </h2>
        </div>

        <div className={`rounded-xl p-3 shrink-0 transition-transform group-hover:scale-105 duration-300 ${iconBg} border border-slate-800/50`}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>

      <div className="flex items-center gap-1.5 pt-3 z-10 border-t border-slate-850/50 mt-2">
        <span className={`inline-flex items-center text-[10px] font-bold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
          {positive ? (
            <ArrowUpRight size={12} className="mr-0.5" />
          ) : (
            <ArrowDownRight size={12} className="mr-0.5" />
          )}
          {positive ? '+' : ''}{trend}%
        </span>
        <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">{trendLabel}</span>
      </div>
    </div>
  );
}
