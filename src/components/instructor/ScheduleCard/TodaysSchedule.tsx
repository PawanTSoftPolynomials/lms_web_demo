import { CalendarClock, ExternalLink, Radio } from "lucide-react";

import { Badge } from "@/components/ui/shadcn/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Skeleton } from "@/components/ui/shadcn/skeleton";
import { EmptyWidgetState } from "@/components/instructor/shared/EmptyWidgetState";
import Link from "next/link";
import type { ScheduleEvent } from "@/types/instructor-dashboard";

interface TodaysScheduleProps {
  events?: ScheduleEvent[];
  isLoading?: boolean;
}

const TYPE_LABEL: Record<ScheduleEvent["type"], string> = {
  live: "Live Class",
  meeting: "Meeting",
  class: "Class",
  deadline: "Deadline",
};

const STATUS_STYLES: Record<ScheduleEvent["status"], string> = {
  live: "bg-destructive/10 text-destructive border-destructive/20",
  upcoming: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  ended: "bg-muted text-muted-foreground border-transparent",
};

const STATUS_LABEL: Record<ScheduleEvent["status"], string> = {
  live: "Live now",
  upcoming: "Upcoming",
  ended: "Ended",
};

export function TodaysSchedule({ events, isLoading }: TodaysScheduleProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Schedule</CardTitle>
        <CardAction>
          <Link href="/instructor/calendar" className="text-[11px] font-bold text-primary hover:underline">
            View Calendar
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : !events || events.length === 0 ? (
          <EmptyWidgetState icon={CalendarClock} message="Nothing scheduled today. Enjoy the breather." />
        ) : (
          <ol className="space-y-2.5">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-center gap-3 rounded-xl border border-card-border p-3"
              >
                <span className="w-[52px] shrink-0 text-[11px] font-bold text-foreground tabular-nums">
                  {event.time}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate">{event.title}</p>
                  <p className="text-[10.5px] text-muted-foreground mt-0.5 truncate">
                    {event.courseName}
                    {event.batch ? ` • ${event.batch}` : ""}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[9.5px]">
                  {TYPE_LABEL[event.type]}
                </Badge>
                <span
                  className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9.5px] font-bold ${STATUS_STYLES[event.status]}`}
                >
                  {event.status === "live" && <Radio className="size-2.5" />}
                  {STATUS_LABEL[event.status]}
                </span>
                {event.joinLink && event.status !== "ended" && (
                  <a
                    href={event.joinLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-primary text-primary-foreground text-[10.5px] font-bold px-2.5 py-1.5 hover:opacity-90 transition-opacity"
                  >
                    Join <ExternalLink className="size-3" />
                  </a>
                )}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
