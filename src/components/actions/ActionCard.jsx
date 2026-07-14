'use client';

import { ArrowRight } from 'lucide-react';

const styles = {
  red: {
    border: 'border-red-500/20',
    bg: 'bg-red-500/10',
    icon: 'text-red-400',
    number: 'text-red-400',
  },
  amber: {
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/10',
    icon: 'text-amber-400',
    number: 'text-amber-400',
  },
  blue: {
    border: 'border-sky-500/20',
    bg: 'bg-sky-500/10',
    icon: 'text-sky-400',
    number: 'text-sky-400',
  },
  green: {
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-400',
    number: 'text-emerald-400',
  },
  orange: {
    border: 'border-orange-500/20',
    bg: 'bg-orange-500/10',
    icon: 'text-orange-400',
    number: 'text-orange-400',
  },
};

export default function ActionCard({
  icon: Icon,
  color,
  value,
  title,
  description,
  action,
  severity,
}) {
  const theme = styles[color] ?? styles.orange;

  const severityStyles = {
    Urgent: 'bg-red-500/10 text-red-400 border border-red-500/20',
    Upcoming: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    Completed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  };

  const badgeClass = severityStyles[severity] || severityStyles.Upcoming;

  return (
    <div
      className={`group rounded-2xl border ${theme.border} bg-slate-900/60 p-5 shadow-sm transition-all duration-350 hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-lg hover:shadow-slate-950/40 flex flex-col justify-between min-h-[210px]`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.bg}`}
          >
            <Icon size={18} className={theme.icon} />
          </div>

          <div className="flex items-center gap-2">
            {severity && (
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${badgeClass}`}>
                {severity}
              </span>
            )}
            {value && value !== '0' && value !== 'Active' && value !== 'Published' && (
              <span className={`text-xl font-bold ${theme.number}`}>
                {value}
              </span>
            )}
          </div>
        </div>

        <h3 className="mt-4 text-base font-bold text-white leading-snug">{title}</h3>

        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          {description}
        </p>
      </div>

      <button className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 transition hover:text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-left">
        {action}
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}
