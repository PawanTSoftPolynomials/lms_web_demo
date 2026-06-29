"use client";

import { HiOutlineBookOpen } from "react-icons/hi";
import { FaArrowRight } from "react-icons/fa6";
import Link from "next/link";

import ListCard from "@/components/dashboard/common/ListCard";
import ProgressBar from "@/components/dashboard/components/ProgressBar";

export default function TopCourses({
  courses = [],
  title = "Top Courses",
  viewAllHref = "/instructor/courses",
}) {
  return (
    <ListCard
      title={title}
      subtitle="Best performing courses"
      items={courses}
      emptyMessage="No courses available."
      action={
        <Link
          href={viewAllHref}
          className="flex items-center gap-2 text-sm font-medium text-orange-500 transition hover:text-orange-400"
        >
          View All
          <FaArrowRight size={12} />
        </Link>
      }
    >
      {courses.slice(0, 5).map((course) => (
        <div
          key={course.id}
          className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 transition-all duration-300 hover:border-orange-500/30 hover:bg-slate-800/70"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                <HiOutlineBookOpen size={22} />
              </div>

              <div className="min-w-0">
                <h3 className="truncate font-semibold text-white">
                  {course.title}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  {course.students ?? 0} Students
                </p>
              </div>
            </div>

            <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
              {course.progress ?? 0}%
            </span>
          </div>

          <ProgressBar
            className="mt-4"
            value={course.progress ?? 0}
            showLabel={false}
          />
        </div>
      ))}
    </ListCard>
  );
}
