"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { BookOpen } from "lucide-react";

import DataTable from "@/components/ui/DataTable";
import CourseStatusBadge from "@/components/courses/CourseStatusBadge";
import CourseActionsMenu from "@/components/courses/CourseActionsMenu";

/** The My Courses data table — Course/Creator/Status/Students/Modules/Lessons/Updated/Actions. */
export default function CourseTable({ courses, isLoading }) {
  const router = useRouter();

  const columns = [
    {
      key: "title",
      header: "Course",
      render: (course) => (
        <div className="flex items-center gap-3 min-w-[220px]">
          <div className="h-9 w-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
            {course.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={course.thumbnailUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <BookOpen size={15} className="text-slate-500" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">{course.title}</p>
            <p className="text-[10px] text-slate-500 truncate">
              {course.category || "Uncategorized"} • {course.level || "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "creator",
      header: "Creator",
      render: (course) => <span className="text-slate-300">{course.creator?.name || "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (course) => <CourseStatusBadge status={course.status} />,
    },
    {
      key: "students",
      header: "Students",
      align: "center",
      render: (course) => course._count?.enrollments ?? 0,
    },
    {
      key: "modules",
      header: "Modules",
      align: "center",
      render: (course) => course._count?.modules ?? 0,
    },
    {
      key: "lessons",
      header: "Lessons",
      align: "center",
      render: (course) => course.stats?.lessonsCount ?? 0,
    },
    {
      key: "updatedAt",
      header: "Last Updated",
      render: (course) => (course.updatedAt ? formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true }) : "—"),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (course) => <CourseActionsMenu course={course} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={courses}
      rowKey="id"
      isLoading={isLoading}
      skeletonRows={6}
      stickyHeader
      onRowClick={(course) => router.push(`/instructor/courses/${course.id}`)}
      emptyLabel="No courses match the current filters."
    />
  );
}
