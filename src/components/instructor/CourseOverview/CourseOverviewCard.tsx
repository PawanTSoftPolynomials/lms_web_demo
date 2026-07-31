import Link from "next/link";
import { BookOpen, Star, Users } from "lucide-react";

import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import { Progress } from "@/components/ui/shadcn/progress";
import type { InstructorCourseSummary } from "@/types/instructor-dashboard";

export function CourseOverviewCard({ course }: { course: InstructorCourseSummary }) {
  return (
    <div className="flex flex-col rounded-xl border border-card-border bg-surface-muted/40 overflow-hidden hover:border-primary/30 transition-colors">
      <div
        className={`h-20 w-full bg-gradient-to-br ${course.coverColor} flex items-center justify-between px-4`}
      >
        <BookOpen className="size-6 text-foreground/70" />
        <Badge variant={course.isPublished ? "success" : "warning"}>
          {course.isPublished ? "Published" : "Draft"}
        </Badge>
      </div>

      <div className="flex flex-col gap-3 p-4 flex-1">
        <h3 className="text-sm font-bold text-foreground leading-snug truncate">{course.title}</h3>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-semibold">
          <span className="flex items-center gap-1">
            <Users className="size-3" /> {course.studentsCount}
          </span>
          <span className="flex items-center gap-1">
            <Star className="size-3" /> {course.averageScore}%
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between text-[10.5px] font-bold text-muted-foreground mb-1">
            <span>Completion</span>
            <span>{course.completionRate}%</span>
          </div>
          <Progress value={course.completionRate} className="h-1.5" />
        </div>

        <div className="flex items-center justify-between text-[10.5px] font-semibold text-muted-foreground">
          <span>{course.publishedLessons} published</span>
          <span>{course.pendingLessons} pending</span>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
          <Button asChild size="sm" variant="secondary" className="text-[11px]">
            <Link href={`/instructor/courses/${course.id}`}>Open Course</Link>
          </Button>
          <Button asChild size="sm" className="text-[11px]">
            <Link href={`/instructor/courses/edit/${course.id}`}>Continue Editing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
