"use client";

import Link from "next/link";

export default function MyCourseCard({
  enrollment,
}) {
  const course =
    enrollment.course;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {course.title}
          </h2>

          <p className="text-slate-400 mt-2">
            {course.description}
          </p>
        </div>

        <span className="bg-green-600 px-3 py-1 rounded-full text-sm">
          Enrolled
        </span>
      </div>

      <div className="mt-6">
        <Link
          href={`/student/learn/${course.id}`}
          className="
            inline-flex
            bg-orange-600
            hover:bg-orange-700
            px-5
            py-3
            rounded-lg
            transition
          "
        >
          Continue Learning
        </Link>
      </div>
    </div>
  );
}