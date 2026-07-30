import Link from "next/link";
import { FileEdit } from "lucide-react";

import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Progress } from "@/components/ui/shadcn/progress";
import { Skeleton } from "@/components/ui/shadcn/skeleton";
import { EmptyWidgetState } from "@/components/instructor/shared/EmptyWidgetState";
import type { DraftCourse } from "@/types/instructor-dashboard";

interface DraftCoursesProps {
  drafts?: DraftCourse[];
  isLoading?: boolean;
}

export function DraftCourses({ drafts, isLoading }: DraftCoursesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Draft Courses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, idx) => <Skeleton key={idx} className="h-20 rounded-xl" />)
        ) : !drafts || drafts.length === 0 ? (
          <EmptyWidgetState
            icon={FileEdit}
            message="No unfinished courses. Everything you've started is published."
          />
        ) : (
          drafts.map((draft) => (
            <div key={draft.id} className="rounded-xl border border-card-border p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-foreground truncate">{draft.title}</p>
                <span className="text-[10.5px] font-bold text-muted-foreground shrink-0">
                  {draft.lastEdited}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2.5">
                <Progress value={draft.progress} className="h-1.5 flex-1" />
                <span className="text-[10.5px] font-bold text-muted-foreground w-8 text-right tabular-nums">
                  {draft.progress}%
                </span>
              </div>
              <Button asChild size="sm" className="mt-3 w-full text-[11px]">
                <Link href={`/instructor/courses/edit/${draft.id}`}>Continue</Link>
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
