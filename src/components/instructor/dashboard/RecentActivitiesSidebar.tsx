"use client";

import { CheckSquare, MonitorPlay, HelpCircle } from "lucide-react";
import type { ActivityItem } from "@/types/instructor-dashboard";

export function RecentActivitiesSidebar({ activities, isLoading }: { activities: ActivityItem[], isLoading?: boolean }) {
  if (isLoading) {
    return <div className="h-64 animate-pulse bg-muted/50 rounded-2xl"></div>;
  }

  const getIconAndColor = (type: string) => {
    switch (type) {
      case "submission":
      case "assignment":
        return { Icon: CheckSquare, bg: "bg-success/10", color: "text-success", border: "border-success/20" };
      case "lesson_completed":
      case "live":
        return { Icon: MonitorPlay, bg: "bg-purple-500/10", color: "text-purple-400", border: "border-purple-500/20" };
      case "quiz_published":
      case "quiz":
        return { Icon: HelpCircle, bg: "bg-primary/10", color: "text-primary", border: "border-primary/20" };
      default:
        return { Icon: CheckSquare, bg: "bg-info/10", color: "text-info", border: "border-info/20" };
    }
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-luxury-sm">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
        <h3 className="text-sm font-extrabold text-foreground">Recent Activities</h3>
        <button className="text-xs text-primary font-bold hover:underline transition cursor-pointer">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No recent activities</p>
        ) : (
          activities.slice(0, 4).map((activity) => {
            const { Icon, bg, color, border } = getIconAndColor(activity.type);
            return (
              <div key={activity.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-surface-muted/40 transition-colors">
                <div className={`p-2 rounded-xl border ${bg} ${border} shrink-0`}>
                  <Icon size={16} className={color} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground leading-snug">{activity.title}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{activity.courseName}</p>
                  <p className="text-[9px] text-muted-foreground/80 font-semibold mt-0.5">{activity.timestamp}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
