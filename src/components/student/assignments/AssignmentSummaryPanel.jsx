"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Lightbulb,
  Send,
} from "lucide-react";

import { ASSIGNMENT_QUICK_TIPS } from "@/features/student/constants/assignmentsConfig";

// Dynamically imported so recharts is bundled once via this shared
// dynamic() boundary instead of duplicated into this route's own chunk.
const DoughnutChartCard = dynamic(() => import("@/components/dashboard/common/DoughnutChartCard"), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse bg-slate-800/50 rounded-2xl" />,
});

const statusColors = {
  "Not Submitted": "#ef4444",
  "In Progress": "#f59e0b",
  Submitted: "#3b82f6",
  Graded: "#22c55e",
};

export default function AssignmentSummaryPanel({
  statusCounts = {},
  upcomingDeadlines = [],
  deadlinesExpanded = false,
  onToggleDeadlines,
  deadlinesSectionRef,
  onViewAll,
}) {
  const [tipsExpanded, setTipsExpanded] = useState(false);

  const chartData = Object.entries(statusCounts).map(
    ([status, value]) => ({
      name: status,
      value,
    })
  );

  const total = Object.values(statusCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  // Mobile consolidates "Not Submitted" + "In Progress" into one "Pending"
  // figure — matches the reference design's 3-tile summary.
  const pendingCount =
    (statusCounts["Not Submitted"] || 0) + (statusCounts["In Progress"] || 0);
  const submittedCount = statusCounts.Submitted || 0;
  const gradedCount = statusCounts.Graded || 0;

  return (
    <>
      {/* Desktop (xl+): unchanged — 4-category breakdown + doughnut chart */}
      <div className="hidden xl:block space-y-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-lg shadow-black/20">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Submission Summary
              </p>
              <h2 className="text-2xl font-semibold text-white">{total}</h2>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div
                key={status}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-3"
              >
                <p className="text-sm text-slate-400">{status}</p>
                <p className="mt-1 text-xl font-semibold text-white">{count}</p>
              </div>
            ))}
          </div>
        </div>

        <DoughnutChartCard
          title="Assignment Status"
          subtitle="Submission breakdown"
          data={chartData}
          colors={Object.keys(statusCounts).map(
            (status) => statusColors[status] ?? "#64748b"
          )}
          height={130}
          innerRadius={34}
          outerRadius={50}
          contentClassName="h-[150px]"
        />

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-lg shadow-black/20">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Upcoming Deadlines
              </h2>
              <p className="text-sm text-slate-400">
                Due dates for your next assignments.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.slice(0, 4).map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-2xl bg-slate-950 p-3"
                >
                  <p className="text-sm text-slate-200">
                    {assignment.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {assignment.course?.title ?? assignment.courseTitle}
                  </p>
                  <p className="mt-1 text-sm text-orange-400">
                    Due {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">
                No upcoming deadlines.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-lg shadow-black/20">
          <h2 className="text-xl font-semibold text-white">Quick Tips</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {ASSIGNMENT_QUICK_TIPS.map((tip) => (
              <li key={tip}>• {tip}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mobile & tablet: compact single-row summary + collapsible sections */}
      <div className="xl:hidden space-y-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Submission Summary</h2>
            <button
              type="button"
              onClick={onViewAll}
              className="flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors duration-200 cursor-pointer bg-transparent border-0 outline-none min-h-[32px]"
            >
              View All <ChevronRight size={13} />
            </button>
          </div>

          {/* Single slim row instead of 3 separate stat cards — same numbers,
              a fraction of the height. */}
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <FileText size={14} className="text-orange-500" />
              <span className="text-sm font-bold text-white">{pendingCount}</span>
              <span className="text-xs text-slate-400">Pending</span>
            </div>
            <span className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <Send size={14} className="text-blue-400" />
              <span className="text-sm font-bold text-white">{submittedCount}</span>
              <span className="text-xs text-slate-400">Submitted</span>
            </div>
            <span className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="text-sm font-bold text-white">{gradedCount}</span>
              <span className="text-xs text-slate-400">Graded</span>
            </div>
          </div>
        </div>

        <div
          ref={deadlinesSectionRef}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-3"
        >
          {upcomingDeadlines.length > 0 ? (
            <>
              <button
                type="button"
                onClick={onToggleDeadlines}
                className="flex w-full items-center gap-3 text-left cursor-pointer bg-transparent border-0 outline-none min-h-[44px]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
                  <CalendarDays size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white">Upcoming Deadlines</h3>
                  <p className="truncate text-xs text-slate-400">
                    {upcomingDeadlines.length} due soon
                  </p>
                </div>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                    deadlinesExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {deadlinesExpanded && (
                <div className="mt-3 space-y-2">
                  {upcomingDeadlines.slice(0, 4).map((assignment) => (
                    <div key={assignment.id} className="rounded-xl bg-slate-950 p-3">
                      <p className="text-sm text-slate-200">{assignment.title}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {assignment.course?.title ?? assignment.courseTitle}
                      </p>
                      <p className="mt-1 text-xs text-orange-400">
                        Due {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Nothing to expand into, so this is a flat info row, not a button —
            // no chevron pretending there's more content behind it.
            <div className="flex items-center gap-3 min-h-[36px]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800/60 text-slate-500">
                <CalendarDays size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-white">Upcoming Deadlines</h3>
                <p className="truncate text-xs text-slate-400">No upcoming deadlines</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Tips — secondary info, collapsed by default, last section on
            the page (after assignments, summary, and deadlines). */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
          <button
            type="button"
            onClick={() => setTipsExpanded((prev) => !prev)}
            className="flex w-full items-center gap-3 text-left cursor-pointer bg-transparent border-0 outline-none min-h-[44px]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
              <Lightbulb size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white">Quick Tips</h3>
              <p className="truncate text-xs text-slate-400">
                Check tips to improve your performance
              </p>
            </div>
            <ChevronDown
              size={18}
              className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                tipsExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          {tipsExpanded && (
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              {ASSIGNMENT_QUICK_TIPS.map((tip) => (
                <li key={tip}>• {tip}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
