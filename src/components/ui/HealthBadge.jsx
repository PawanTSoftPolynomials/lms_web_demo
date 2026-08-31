'use client';

const variants = {
  Excellent: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  Good: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    dot: 'bg-blue-400',
  },
  'Needs Review': {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  Critical: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
    dot: 'bg-red-400',
  },
};

export default function HealthBadge({ status }) {
  const style = variants[status] || variants.Good;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm ${style.bg} ${style.border} ${style.text}`}
    >
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}
