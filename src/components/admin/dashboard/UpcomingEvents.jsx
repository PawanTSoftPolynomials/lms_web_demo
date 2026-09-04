"use client";

import { Video, ClipboardList, BookOpen, CalendarClock } from "lucide-react";

const TYPE_STYLES = {
  class: { Icon: Video, bg: "bg-emerald-500/10", color: "text-emerald-400", border: "border-emerald-500/20" },
  quiz: { Icon: ClipboardList, bg: "bg-violet-500/10", color: "text-violet-400", border: "border-violet-500/20" },
  assignment: { Icon: BookOpen, bg: "bg-primary/10", color: "text-primary", border: "border-primary/20" },
};

function formatDateLabel(dateStr) {
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  if (dateStr === todayStr) return "Today";
  if (dateStr === tomorrowStr) return "Tomorrow";

  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function UpcomingEvents({ events = [], isLoading }) {
  if (isLoading) {
    return <div className="h-48 animate-pulse bg-muted/50 rounded-2xl"></div>;
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5 h-full">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
        <h3 className="text-sm font-black text-foreground">Upcoming Events</h3>
      </div>

      <div className="space-y-4">
        {events.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No upcoming events</p>
        ) : (
          events.map((event) => {
            const { Icon, bg, color, border } = TYPE_STYLES[event.type] ?? {
              Icon: CalendarClock,
              bg: "bg-slate-500/10",
              color: "text-muted-foreground",
              border: "border-slate-500/20",
            };
            return (
              <div key={event.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg border ${bg} ${border} shrink-0`}>
                  <Icon size={14} className={color} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground leading-snug truncate">{event.title}</p>
                  <p className="text-[9px] text-slate-600 mt-0.5">
                    {formatDateLabel(event.date)}{event.startTime ? ` • ${event.startTime}` : ""}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
