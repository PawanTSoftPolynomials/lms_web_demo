import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Skeleton } from "@/components/ui/shadcn/skeleton";
import { cn } from "@/lib/utils";
import { EmptyWidgetState } from "@/components/instructor/shared/EmptyWidgetState";
import type { PendingAction } from "@/types/instructor-dashboard";

const SEVERITY_STYLES: Record<PendingAction["severity"], string> = {
  high: "border-destructive/25 bg-destructive/5 text-destructive",
  medium: "border-warning/30 bg-warning/10 text-amber-600 dark:text-amber-400",
  low: "border-sky-500/25 bg-sky-500/5 text-sky-600 dark:text-sky-400",
};

interface PendingReviewsProps {
  actions?: PendingAction[];
  isLoading?: boolean;
}

export function PendingReviews({ actions, isLoading }: PendingReviewsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : !actions || actions.length === 0 ? (
          <EmptyWidgetState message="Nothing needs your attention right now. Great job staying on top of things!" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.id}
                  href={action.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3.5 transition hover:brightness-105 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    SEVERITY_STYLES[action.severity]
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/60 dark:bg-black/20">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-lg font-bold tabular-nums leading-none">{action.count}</p>
                    <p className="text-[11px] font-bold mt-1 leading-snug">{action.label}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
