"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Users, Code2 } from "lucide-react";
import ActionMenu from "@/components/menus/ActionMenu";
import { DeleteCourseModal } from "@/components/instructor/courses/DeleteCourseModal";
import { useDeleteCourse } from "@/hooks/queries/instructor/useDeleteCourse";
import { useToast } from "@/components/ui/ToastProvider";
import type { CourseProgressOverview } from "@/services/instructor/dashboardHome.service";

export function CourseOverviewTable({ courses, isLoading }: { courses: CourseProgressOverview[], isLoading?: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const deleteCourseMutation = useDeleteCourse();

  const [courseToDelete, setCourseToDelete] = useState<CourseProgressOverview | null>(null);
  const [hasStudentData, setHasStudentData] = useState(false);

  if (isLoading) {
    return <div className="h-48 animate-pulse bg-muted rounded-2xl"></div>;
  }

  const openDeleteModal = (course: CourseProgressOverview) => {
    setHasStudentData(false);
    setCourseToDelete(course);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      await deleteCourseMutation.mutateAsync(courseToDelete.id);
      await queryClient.invalidateQueries({ queryKey: ["instructor-home"] });
      setCourseToDelete(null);
      showToast("Course deleted successfully", "success");
    } catch (err) {
      const errRes = (err as { response?: { data?: { code?: string; hasStudentData?: boolean; message?: string } }; message?: string });
      const data = errRes?.response?.data;
      if (data?.code === "COURSE_HAS_STUDENT_DATA" || data?.hasStudentData) {
        setHasStudentData(true);
      } else {
        showToast(data?.message || errRes?.message || "Failed to delete course", "error");
      }
    }
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-foreground">Course Overview</h3>
        <Link href="/instructor/courses" className="text-[11px] text-primary font-bold flex items-center gap-1 hover:opacity-80">
          View all courses &rarr;
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[560px] w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-[9px] uppercase tracking-widest text-muted-foreground font-black">
              <th className="pb-3 pr-2 font-medium whitespace-nowrap">Course</th>
              <th className="pb-3 px-2 font-medium text-center whitespace-nowrap">Students</th>
              <th className="pb-3 px-2 font-medium whitespace-nowrap">Progress</th>
              <th className="pb-3 pl-2 font-medium text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-xs text-muted-foreground">No courses available</td>
              </tr>
            ) : (
              courses.slice(0, 4).map((course) => (
                <tr
                  key={course.id}
                  className="hover:bg-foreground/5 transition cursor-pointer"
                  onClick={() => router.push(`/instructor/courses/${course.id}`)}
                >
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Code2 size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{course.courseName}</p>
                        <p className="text-[10px] text-muted-foreground">{course.batch} &bull; {course.students} Students</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-foreground text-xs font-bold">
                      <Users size={14} className="text-muted-foreground" />
                      {course.students}
                    </div>
                  </td>
                  <td className="py-4 px-2 w-1/3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-foreground w-8">{course.progress}%</span>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pl-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <ActionMenu
                        items={[
                          {
                            label: "Edit",
                            onClick: () => router.push(`/instructor/courses/${course.id}`),
                          },
                          {
                            label: "Delete",
                            danger: true,
                            onClick: () => openDeleteModal(course),
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DeleteCourseModal
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        onConfirmDelete={handleConfirmDelete}
        onConfirmArchive={() => {}}
        isDeleting={deleteCourseMutation.isPending}
        isArchiving={false}
        courseTitle={courseToDelete?.courseName}
        hasStudentData={hasStudentData}
        isPublished={false}
        userRole="INSTRUCTOR"
      />
    </div>
  );
}
