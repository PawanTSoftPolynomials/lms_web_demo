import Link from "next/link";
import { BookOpen, Clock, Layers, PenLine } from "lucide-react";

import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Skeleton } from "@/components/ui/shadcn/skeleton";
import { EmptyWidgetState } from "@/components/instructor/shared/EmptyWidgetState";
import type { ContinueEditingItem } from "@/types/instructor-dashboard";

interface ContinueEditingCardProps {
  item?: ContinueEditingItem | null;
  isLoading?: boolean;
}

export function ContinueEditingCard({ item, isLoading }: ContinueEditingCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Continue Editing</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 rounded-xl" />
        ) : !item ? (
          <EmptyWidgetState icon={PenLine} message="Nothing in progress. Start building a lesson to see it here." />
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 rounded-2xl border border-card-border dark:border-white/[0.06] bg-surface-muted/40 dark:bg-white/[0.02] p-4 sm:p-5">
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-base sm:text-lg font-bold text-foreground leading-snug truncate">{item.lessonTitle}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 min-w-0">
                  <BookOpen className="size-3.5 shrink-0" />
                  <span className="truncate">{item.courseTitle}</span>
                </span>
                <span className="flex items-center gap-1.5 min-w-0">
                  <Layers className="size-3.5 shrink-0" />
                  <span className="truncate">{item.moduleTitle}</span>
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <Clock className="size-3.5" />
                  {item.lastEditedLabel}
                </span>
              </div>
            </div>
            <Button asChild size="lg" className="w-full sm:w-auto sm:shrink-0 gap-1.5 font-bold">
              <Link href={item.href}>
                <PenLine className="size-4" /> Resume Editing
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
