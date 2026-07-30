import Link from "next/link";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Skeleton } from "@/components/ui/shadcn/skeleton";
import { EmptyWidgetState } from "@/components/instructor/shared/EmptyWidgetState";
import type { InstructorCourseSummary } from "@/types/instructor-dashboard";
import { CourseOverviewCard } from "./CourseOverviewCard";

interface CourseOverviewProps {
  courses?: InstructorCourseSummary[];
  isLoading?: boolean;
}

export function CourseOverview({ courses, isLoading }: CourseOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Overview</CardTitle>
        <CardAction>
          <Link href="/instructor/courses" className="text-[11px] font-bold text-primary hover:underline">
            View all
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : !courses || courses.length === 0 ? (
          <EmptyWidgetState
            message="You haven't created any courses yet."
            actionLabel="Create your first course"
            actionHref="/instructor/courses/create"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <CourseOverviewCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
