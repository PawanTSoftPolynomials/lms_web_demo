'use client';

export default function ProgressBar({ value, color = 'orange' }) {
  const colors = {
    green: 'bg-emerald-500',
    blue: 'bg-sky-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`${colors[color]} h-full rounded-full transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>

      <span className="w-10 text-right text-sm font-semibold">{value}%</span>
    </div>
  );
}
