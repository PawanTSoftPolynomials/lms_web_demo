import { Flame } from "lucide-react";

export default function ReportStreakCard({ streak = 0 }) {
  return (
    <div className="rounded-xl border border-card-border bg-card px-3 py-2 flex items-center gap-2.5">
      <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
        <Flame size={15} />
      </div>
      <div className="min-w-0 flex items-baseline gap-1.5">
        <p className="text-sm font-black text-foreground leading-tight shrink-0">
          {streak} {streak === 1 ? "Day" : "Days"}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {streak > 0 ? "Current streak — keep it up!" : "Current streak"}
        </p>
      </div>
    </div>
  );
}
