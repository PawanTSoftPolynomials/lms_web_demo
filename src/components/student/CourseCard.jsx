"use client";

import Link from "next/link";

export default function CourseCard({
  course,
  href,
  buttonText = "View Course",
}) {
  const courseData =
    course.course || course;

  return (
    <div
      className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-6
        min-h-[220px]
        flex
        flex-col
        justify-between
        hover:border-orange-500
        transition
      "
    >
      <div>
        <h2 className="text-3xl font-bold text-white mb-4">
          {courseData.title}
        </h2>

        <p className="text-slate-400 line-clamp-3">
          {courseData.description}
        </p>
      </div>

      <Link
        href={href}
        className="
          mt-6
          w-fit
          bg-orange-600
          hover:bg-orange-700
          px-5
          py-3
          rounded-lg
          text-white
        "
      >
        {buttonText}
      </Link>
    </div>
  );
}