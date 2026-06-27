"use client";

import Link from "next/link";
import {
  HiOutlineClipboardDocumentList,
  HiOutlineClock,
} from "react-icons/hi2";
import { FaArrowRight } from "react-icons/fa6";

import ListCard from "@/components/dashboard/common/ListCard";

export default function RecentQuizzes({
  quizzes = [],
  title = "Recent Quizzes",
  viewAllHref = "/instructor/quizzes",
}) {
  return (
    <ListCard
      title={title}
      subtitle="Latest published quizzes"
      items={quizzes}
      emptyMessage="No quizzes available."
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
      {quizzes.slice(0, 5).map((quiz) => (
        <div
          key={quiz.id}
          className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 transition-all duration-300 hover:border-orange-500/40 hover:bg-slate-800/70"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <HiOutlineClipboardDocumentList size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-white">
                {quiz.title}
              </h3>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span>
                  {quiz.questions ?? 0} Questions
                </span>

                <span>
                  {quiz.attempts ?? 0} Attempts
                </span>
              </div>

              {quiz.createdAt && (
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <HiOutlineClock size={14} />
                  <span>{quiz.createdAt}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </ListCard>
  );
}