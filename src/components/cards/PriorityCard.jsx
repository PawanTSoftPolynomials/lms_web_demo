'use client';

const colors = {
  red: {
    bg: 'bg-red-500/10',
    icon: 'text-red-400',
    button: 'bg-red-500 hover:bg-red-600',
  },
  amber: {
    bg: 'bg-amber-500/10',
    icon: 'text-amber-400',
    button: 'bg-amber-500 hover:bg-amber-600',
  },
  blue: {
    bg: 'bg-sky-500/10',
    icon: 'text-sky-400',
    button: 'bg-sky-500 hover:bg-sky-600',
  },
  green: {
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-400',
    button: 'bg-emerald-500 hover:bg-emerald-600',
  },
};

export default function PriorityCard({
  icon: Icon,
  color,
  title,
  description,
  action,
}) {
  const theme = colors[color];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 transition hover:border-orange-500">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.bg}`}
      >
        <Icon className={theme.icon} size={24} />
      </div>

      <h3 className="mt-5 text-lg font-semibold">{title}</h3>

      <p className="mt-2 text-sm text-slate-400 leading-relaxed">
        {description}
      </p>

      <button
        className={`mt-6 w-full py-2.5 rounded-xl text-sm font-medium text-white transition ${theme.button}`}
      >
        {action}
      </button>
    </div>
  );
}
