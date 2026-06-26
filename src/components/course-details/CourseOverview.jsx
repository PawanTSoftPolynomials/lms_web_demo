"use client";

import Card from "@/components/ui/Card";
import StatusBadge from "@/components/courses/StatusBadge";

export default function CourseOverview({
  course,
}) {
  return (
    <div className="space-y-6">

      {/* Basic Information */}

      <Card>

        <h2 className="mb-6 text-2xl font-bold">
          Course Information
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          <div>
            <p className="text-sm text-slate-400">
              Course Title
            </p>

            <p className="mt-2 text-lg font-semibold">
              {course.title}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">
              Category
            </p>

            <p className="mt-2 text-lg font-semibold">
              {course.category || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">
              Level
            </p>

            <p className="mt-2 text-lg font-semibold">
              {course.level || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">
              Status
            </p>

            <div className="mt-2">
              <StatusBadge
                status={course.status}
              />
            </div>
          </div>

        </div>

      </Card>

      {/* Description */}

      <Card>

        <h2 className="mb-6 text-2xl font-bold">
          Description
        </h2>

        <p className="leading-8 text-slate-300 whitespace-pre-wrap">

          {course.description ||
            "No description available."}

        </p>

      </Card>

    </div>
  );
}