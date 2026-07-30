import {
  Award,
  BookOpen,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Skeleton } from "@/components/ui/shadcn/skeleton";
import { EmptyWidgetState } from "@/components/instructor/shared/EmptyWidgetState";
import type { ActivityItem } from "@/types/instructor-dashboard";

const TYPE_META: Record<ActivityItem["type"], { icon: LucideIcon; color: string }> = {
  enrollment: { icon: UserPlus, color: "text-sky-500 bg-sky-500/10" },
  submission: { icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
  quiz_published: { icon: Sparkles, color: "text-violet-500 bg-violet-500/10" },
  course_updated: { icon: BookOpen, color: "text-orange-500 bg-orange-500/10" },
  lesson_completed: { icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
  discussion: { icon: MessageCircle, color: "text-pink-500 bg-pink-500/10" },
  announcement: { icon: Award, color: "text-amber-500 bg-amber-500/10" },
  grade: { icon: Award, color: "text-amber-500 bg-amber-500/10" },
};

interface ActivityTimelineProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
}

export function ActivityTimeline({ activities, isLoading }: ActivityTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-12" />
            ))}
          </div>
        ) : !activities || activities.length === 0 ? (
          <EmptyWidgetState message="No recent activity yet. It'll show up here as students engage with your courses." />
        ) : (
          <ol className="relative space-y-5 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-border">
            {activities.map((activity) => {
              const meta = TYPE_META[activity.type];
              const Icon = meta.icon;
              return (
                <li key={activity.id} className="relative flex items-start gap-3 pl-0">
                  <span
                    className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${meta.color}`}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-xs font-bold text-foreground leading-snug">{activity.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px] text-muted-foreground">
                      <span className="font-semibold text-primary">{activity.courseName}</span>
                      <span aria-hidden>&bull;</span>
                      <span>{activity.timestamp}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
