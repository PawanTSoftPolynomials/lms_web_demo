"use client";

import Link from "next/link";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/courses/StatusBadge";

export default function CourseTable({
  courses,
  onDelete,
}) {
  if (!courses.length) {
    return (
      <Card>
        <div className="py-12 text-center">
          <h3 className="text-xl font-semibold">
            No Courses Found
          </h3>

          <p className="text-slate-400 mt-2">
            Create your first course.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800 text-left text-slate-400">
              <th className="p-4">
                Title
              </th>

              <th className="p-4">
                Category
              </th>

              <th className="p-4">
                Level
              </th>

              <th className="p-4">
                Status
              </th>

              <th className="p-4">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {courses.map(
              (course) => (
                <tr
                  key={course.id}
                  className="
                    border-b
                    border-slate-800
                    hover:bg-slate-900/50
                    transition
                  "
                >
                  <td className="p-4 font-medium">
                    {course.title}
                  </td>

                  <td className="p-4 text-slate-400">
                    {course.category}
                  </td>

                  <td className="p-4 text-slate-400">
                    {course.level}
                  </td>

                  <td className="p-4">
                    <StatusBadge
                      status={course.status}
                    />
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/courses/${course.id}`}
                      >
                        <Button
                          size="sm"
                        >
                          View
                        </Button>
                      </Link>

                      <Link
                        href={`/admin/courses/edit/${course.id}`}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          Edit
                        </Button>
                      </Link>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          onDelete(
                            course.id
                          )
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}