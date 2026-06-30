"use client";

import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import StatusBadge from "@/components/courses/StatusBadge";
import ActionMenu from "@/components/menus/ActionMenu";

export default function CourseTable({ courses, onDelete }) {
  const router = useRouter();

  if (!courses.length) {
    return (
      <Card>
        <div className="py-12 text-center">
          <h3 className="text-xl font-semibold">No Courses Found</h3>

          <p className="mt-2 text-slate-400">Create your first course.</p>
        </div>
      </Card>
    );
  }

  const getMenuItems = (course) => [
    {
      label: "View",
      onClick: () => router.push(`/admin/courses/${course.id}`),
    },
    {
      label: "Edit",
      onClick: () => router.push(`/admin/courses/edit/${course.id}`),
    },
    {
      label: "Delete",
      onClick: () => onDelete(course.id),
    },
  ];

  return (
    <Card className="overflow-visible p-0">
      {/* Mobile Cards */}
      <div className="space-y-4 p-4 lg:hidden">
        {courses.map((course) => (
          <div
            key={course.id}
            className="rounded-xl border border-white/10 bg-slate-900/50 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold text-white">
                  {course.title}
                </h3>

                <p className="mt-1 text-sm text-slate-400">{course.category}</p>
              </div>

              <ActionMenu items={getMenuItems(course)} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Level
                </p>

                <p className="mt-1 text-sm text-slate-200">{course.level}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Status
                </p>

                <div className="mt-1">
                  <StatusBadge status={course.status} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-[900px] w-full">
          <thead>
            <tr className="border-b border-slate-800 text-left text-slate-400">
              <th className="p-4">Title</th>

              <th className="p-4">Category</th>

              <th className="p-4">Level</th>

              <th className="p-4">Status</th>

              <th className="w-20 p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr
                key={course.id}
                className="border-b border-slate-800 transition hover:bg-slate-900/50"
              >
                <td className="p-4 font-medium">{course.title}</td>

                <td className="p-4 text-slate-400">{course.category}</td>

                <td className="p-4 text-slate-400">{course.level}</td>

                <td className="p-4">
                  <StatusBadge status={course.status} />
                </td>

                <td className="relative overflow-visible p-4">
                  <ActionMenu items={getMenuItems(course)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
