"use client";

import { UserPlus, Award } from "lucide-react";

const TYPE_STYLES = {
  enrollment: { Icon: UserPlus, bg: "bg-purple-500/10", color: "text-purple-400", border: "border-purple-500/20" },
  certificate: { Icon: Award, bg: "bg-emerald-500/10", color: "text-emerald-400", border: "border-emerald-500/20" },
};

export function RecentActivityFeed({ activity = [], isLoading }) {
  if (isLoading) {
    return <div className="h-48 animate-pulse bg-muted/50 rounded-2xl"></div>;
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5 h-full">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
        <h3 className="text-sm font-black text-foreground">Recent Activity</h3>
      </div>

      <div className="space-y-4">
        {activity.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No recent activity</p>
        ) : (
          activity.map((event) => {
            const { Icon, bg, color, border } = TYPE_STYLES[event.type] ?? TYPE_STYLES.enrollment;
            return (
              <div key={event.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg border ${bg} ${border} shrink-0`}>
                  <Icon size={14} className={color} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground leading-snug">{event.title}</p>
                  <p className="text-[9px] text-slate-600 mt-0.5">{event.time}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
