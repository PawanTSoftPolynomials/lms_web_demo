import { Flame } from "lucide-react";

export default function ReportStreakCard({ streak = 0 }) {
  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 px-3 py-2 flex items-center gap-2.5">
      <div className="shrink-0 h-8 w-8 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
        <Flame size={15} />
      </div>
      <div className="min-w-0 flex items-baseline gap-1.5">
        <p className="text-sm font-black text-white leading-tight shrink-0">
          {streak} {streak === 1 ? "Day" : "Days"}
        </p>
        <p className="text-[11px] text-slate-500 truncate">
          {streak > 0 ? "Current streak — keep it up!" : "Current streak"}
        </p>
      </div>
    </div>
  );
}
