"use client";

import Link from "next/link";
import { ChevronRight, PartyPopper } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Skeleton } from "@/components/ui/shadcn/skeleton";
import { EmptyWidgetState } from "@/components/instructor/shared/EmptyWidgetState";
import { cn } from "@/lib/utils";
import type { PendingAction } from "@/types/instructor-dashboard";

const SEVERITY_STYLES: Record<PendingAction["severity"], string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  low: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
};

interface NeedsAttentionListProps {
  items?: PendingAction[];
  isLoading?: boolean;
}

/**
 * The Home page's single priority list — every item here is something the
 * instructor can act on right now, sorted most-urgent first. Course
 * performance numbers never appear here; they belong on the Course Card
 * or Analytics instead.
 */
export function NeedsAttentionList({ items, isLoading }: NeedsAttentionListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Needs Your Attention</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : !items || items.length === 0 ? (
          <EmptyWidgetState icon={PartyPopper} message="Nothing urgent — you're all caught up." />
        ) : (
          <ul className="space-y-2.5">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-3 rounded-xl border border-card-border p-3 hover:border-primary/30 hover:bg-surface-muted/40 transition-colors duration-200"
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                        SEVERITY_STYLES[item.severity]
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground leading-snug truncate">{item.label}</p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
