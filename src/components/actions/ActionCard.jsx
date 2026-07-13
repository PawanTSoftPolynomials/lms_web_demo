'use client';

import { ArrowRight } from 'lucide-react';

const styles = {
  red: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    icon: 'text-red-400',
    number: 'text-red-400',
  },
  amber: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    icon: 'text-amber-400',
    number: 'text-amber-400',
  },
  blue: {
    border: 'border-sky-500/30',
    bg: 'bg-sky-500/10',
    icon: 'text-sky-400',
    number: 'text-sky-400',
  },
  green: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-400',
    number: 'text-emerald-400',
  },
  orange: {
    border: 'border-orange-500/30',
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
}) {
  const theme = styles[color] ?? styles.orange;

  return (
    <div
      className={`group rounded-2xl border ${theme.border} bg-slate-900/80 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-400 hover:shadow-lg hover:shadow-slate-950/40`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.bg}`}
        >
          <Icon size={18} className={theme.icon} />
        </div>

        {value && (
          <span className={`text-2xl font-semibold ${theme.number}`}>
            {value}
          </span>
        )}
      </div>

      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>

      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        {description}
      </p>

      <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-orange-400 transition hover:text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/40">
        {action}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
