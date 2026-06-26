"use client";

import Link from "next/link";

import Card from "@/components/ui/Card";
import StatusBadge from "@/components/courses/StatusBadge";

export default function LatestCourses({
  courses,
}) {
  return (
    <Card>

      <div className="mb-6 flex items-center justify-between">

        <h2 className="text-xl font-semibold">
          Latest Courses
        </h2>

        <Link
          href="/admin/courses"
          className="text-orange-500 hover:underline"
        >
          View All
        </Link>

      </div>

      {courses.length === 0 ? (

        <p className="text-slate-400">
          No courses available.
        </p>

      ) : (

        <div className="divide-y divide-slate-800">

          {courses
            .slice(0, 5)
            .map((course) => (

              <div
                key={course.id}
                className="flex items-center justify-between py-4"
              >

                <div>

                  <h3 className="font-semibold">
                    {course.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {course.category}
                  </p>

                </div>

                <StatusBadge
                  status={course.status}
                />

              </div>

            ))}

        </div>

      )}

    </Card>
  );
}