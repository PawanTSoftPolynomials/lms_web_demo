"use client";

import Link from "next/link";
import { CheckSquare, MonitorPlay, HelpCircle } from "lucide-react";
import type { ActivityItem } from "@/types/instructor-dashboard";

export function RecentActivitiesSidebar({ activities, isLoading }: { activities: ActivityItem[], isLoading?: boolean }) {
  if (isLoading) {
    return <div className="h-64 animate-pulse bg-slate-800/50 rounded-2xl"></div>;
  }

  const getIconAndColor = (type: string) => {
    switch (type) {
      case "submission":
      case "assignment":
        return { Icon: CheckSquare, bg: "bg-emerald-500/10", color: "text-emerald-400", border: "border-emerald-500/20" };
      case "lesson_completed":
      case "live":
        return { Icon: MonitorPlay, bg: "bg-purple-500/10", color: "text-purple-400", border: "border-purple-500/20" };
      case "quiz_published":
      case "quiz":
        return { Icon: HelpCircle, bg: "bg-orange-500/10", color: "text-orange-400", border: "border-orange-500/20" };
      default:
        return { Icon: CheckSquare, bg: "bg-blue-500/10", color: "text-blue-400", border: "border-blue-500/20" };
    }
  };

  return (
    <div className="rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-5">
      <div className="flex items-center justify-between mb-4 border-b border-[#1A1F35] pb-3">
        <h3 className="text-sm font-black text-slate-200">Recent Activities</h3>
        <button className="text-[11px] text-orange-400 font-bold hover:text-orange-300">
          View all
        </button>
      </div>

      <div className="space-y-5">
        {activities.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No recent activities</p>
        ) : (
          activities.slice(0, 4).map((activity) => {
            const { Icon, bg, color, border } = getIconAndColor(activity.type);
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg border ${bg} ${border} shrink-0`}>
                  <Icon size={16} className={color} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">{activity.title}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{activity.courseName}</p>
                  <p className="text-[9px] text-slate-600 mt-0.5">{activity.timestamp}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
