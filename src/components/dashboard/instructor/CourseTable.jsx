"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";

export default function CourseTable({ courses = [] }) {
  return (
    <Card>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            My Courses
          </h2>

          <p className="mt-1 text-slate-400">
            Manage your courses and modules.
          </p>
        </div>

        <Link
          href="/instructor/courses"
          className="text-sm font-medium text-orange-400 hover:text-orange-300"
        >
          View All →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-slate-700">
            <tr className="text-left text-sm text-slate-400">
              <th className="pb-4">Course</th>
              <th className="pb-4">Status</th>
              <th className="pb-4">Modules</th>
              <th className="pb-4">Students</th>
              <th className="pb-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr
                key={course.id}
                className="border-b border-slate-800 last:border-none"
              >
                <td className="py-5">
                  <div>
                    <p className="font-semibold text-white">
                      {course.title}
                    </p>

                    <p className="text-sm text-slate-400">
                      {course.category}
                    </p>
                  </div>
                </td>

                <td>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      course.status === "Published"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {course.status}
                  </span>
                </td>

                <td>{course.modules?.length || 0}</td>

                <td>{Array.isArray(course.students) ? course.students.length : (course.students || 0)}</td>

                <td className="text-right">
                  <Link
                    href={`/instructor/courses/${course.id}`}
                    className="font-medium text-orange-400 hover:text-orange-300"
                  >
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}