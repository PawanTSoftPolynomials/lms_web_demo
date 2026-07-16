'use client';

import { ArrowRight } from 'lucide-react';

const colors = {
  red: {
    border: 'border-red-500/30',
    bg: 'bg-red-500',
  },
  amber: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500',
  },
  blue: {
    border: 'border-sky-500/30',
    bg: 'bg-sky-500',
  },
  green: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500',
  },
};

export default function ActionItem({ color, title, description, action }) {
  const theme = colors[color];

  return (
    <div
      className={`flex items-center justify-between rounded-xl border ${theme.border} bg-slate-900 px-5 py-4 transition hover:border-orange-500`}
    >
      <div className="flex items-start gap-4">
        <span className={`mt-2 h-3 w-3 rounded-full ${theme.bg}`} />

        <div>
          <h3 className="font-semibold">{title}</h3>

          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
      </div>

      <button className="flex items-center gap-2 text-sm font-medium text-orange-400 hover:text-orange-300">
        {action}

        <ArrowRight size={16} />
      </button>
    </div>
  );
}
