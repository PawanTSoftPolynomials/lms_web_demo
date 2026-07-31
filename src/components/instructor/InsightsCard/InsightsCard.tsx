"use client";

import { useState } from "react";
import { Sparkles, TrendingDown, TrendingUp, X } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Skeleton } from "@/components/ui/shadcn/skeleton";
import { cn } from "@/lib/utils";
import { EmptyWidgetState } from "@/components/instructor/shared/EmptyWidgetState";
import type { InsightItem } from "@/types/instructor-dashboard";

interface InsightsCardProps {
  insights?: InsightItem[];
  isLoading?: boolean;
}

const TONE_STYLES: Record<InsightItem["tone"], string> = {
  positive: "text-success",
  negative: "text-destructive",
  neutral: "text-sky-600 dark:text-sky-400",
};

const TONE_ICON = {
  positive: TrendingUp,
  negative: TrendingDown,
  neutral: Sparkles,
} as const;

export function InsightsCard({ insights, isLoading }: InsightsCardProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const visible = (insights ?? []).filter((i) => !dismissed.includes(i.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-violet-500" /> Quick Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} className="h-14 rounded-xl" />)
        ) : visible.length === 0 ? (
          <EmptyWidgetState icon={Sparkles} message="No new insights right now — check back soon." />
        ) : (
          visible.map((insight) => {
            const Icon = TONE_ICON[insight.tone];
            return (
              <div
                key={insight.id}
                className="group relative flex items-start gap-2.5 rounded-xl border border-card-border bg-surface-muted/40 p-3"
              >
                <span className={cn("mt-0.5 shrink-0", TONE_STYLES[insight.tone])}>
                  <Icon className="size-3.5" />
                </span>
                <p className="text-[11.5px] font-semibold text-foreground leading-snug pr-4">{insight.text}</p>
                <button
                  type="button"
                  aria-label="Dismiss insight"
                  onClick={() => setDismissed((d) => [...d, insight.id])}
                  className="absolute right-2 top-2 text-muted-foreground/50 hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-3" />
                </button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
