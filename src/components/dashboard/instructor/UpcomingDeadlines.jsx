"use client";

import Link from "next/link";
import {
  HiOutlineCalendarDays,
  HiOutlineClock,
} from "react-icons/hi2";
import { FaArrowRight } from "react-icons/fa6";

import ListCard from "@/components/dashboard/common/ListCard";

export default function UpcomingDeadlines({
  deadlines = [],
  title = "Upcoming Deadlines",
  viewAllHref = "/instructor/assignments",
}) {
  return (
    <ListCard
      title={title}
      subtitle="Stay on top of upcoming tasks"
      items={deadlines}
      emptyMessage="No upcoming deadlines."
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
      {deadlines.slice(0, 5).map((deadline) => (
        <div
          key={deadline.id}
          className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 transition-all duration-300 hover:border-orange-500/40 hover:bg-slate-800/70"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
              <HiOutlineCalendarDays size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="truncate font-semibold text-white">
                    {deadline.title}
                  </h3>

                  {deadline.course && (
                    <p className="mt-1 text-sm text-slate-400">
                      {deadline.course}
                    </p>
                  )}
                </div>

                {deadline.daysLeft !== undefined && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      deadline.daysLeft <= 1
                        ? "bg-red-500/10 text-red-400"
                        : deadline.daysLeft <= 3
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {deadline.daysLeft === 0
                      ? "Today"
                      : `${deadline.daysLeft} Day${
                          deadline.daysLeft > 1 ? "s" : ""
                        }`}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                {deadline.dueDate && (
                  <div className="flex items-center gap-1">
                    <HiOutlineClock size={14} />
                    <span>{deadline.dueDate}</span>
                  </div>
                )}

                {deadline.pendingStudents !== undefined && (
                  <span>
                    {deadline.pendingStudents} Students Pending
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </ListCard>
  );
}