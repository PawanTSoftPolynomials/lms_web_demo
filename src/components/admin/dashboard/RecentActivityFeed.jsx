"use client";

import { UserPlus, Award } from "lucide-react";

/**
 * Platform-wide enrollments and certificate issuances, newest first.
 *
 * Read-only: the icons are borderless indicators and there is no call to
 * action, because there is no all-activity screen to send anyone to.
 */
const TYPE_ICON = { enrollment: UserPlus, certificate: Award };

export function RecentActivityFeed({ activity = [], isLoading }) {
  if (isLoading) {
    return <div className="h-full min-h-[13rem] animate-pulse rounded-2xl bg-muted" />;
  }

  return (
    <section className="flex h-full flex-col rounded-2xl border border-card-border bg-card p-5">
      <h2 className="text-sm font-semibold tracking-tight text-foreground">Recent activity</h2>

      {activity.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No activity in the last few days.</p>
      ) : (
        <ul className="mt-4 space-y-3.5">
          {activity.slice(0, 5).map((event) => {
            const Icon = TYPE_ICON[event.type] ?? UserPlus;
            return (
              <li key={event.id} className="flex items-start gap-3">
                <Icon size={16} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm leading-snug text-foreground">{event.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{event.time}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
