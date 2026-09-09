"use client";

import { CheckSquare, MonitorPlay, HelpCircle, Bell } from "lucide-react";
import type { ActivityItem } from "@/types/instructor-dashboard";

/**
 * A read-only feed of what happened recently across the instructor's courses.
 *
 * Nothing in here is a control: the icons are borderless indicators and there
 * is no "View all" affordance, because there is no all-activity screen to send
 * anyone to. The header previously carried a <button> with no handler — it
 * looked pressable, was pressable, and did nothing.
 */
function iconFor(type: string) {
  switch (type) {
    case "submission":
    case "assignment":
    case "grade":
      return CheckSquare;
    case "lesson_completed":
    case "course_updated":
      return MonitorPlay;
    case "quiz_published":
      return HelpCircle;
    default:
      return Bell;
  }
}

export function RecentActivitiesSidebar({
  activities,
  isLoading,
}: {
  activities: ActivityItem[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <div className="h-full min-h-[13rem] animate-pulse rounded-2xl bg-muted" />;
  }

  return (
    <section className="flex h-full flex-col rounded-2xl border border-card-border bg-card p-5">
      <h2 className="text-sm font-semibold tracking-tight text-foreground">Recent activity</h2>

      {activities.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No activity in the last few days.</p>
      ) : (
        <ul className="mt-4 space-y-3.5">
          {activities.slice(0, 4).map((activity) => {
            const Icon = iconFor(activity.type);
            return (
              <li key={activity.id} className="flex items-start gap-3">
                <Icon
                  size={16}
                  className="mt-0.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm leading-snug text-foreground">
                    {activity.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {activity.courseName} &middot; {activity.timestamp}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
