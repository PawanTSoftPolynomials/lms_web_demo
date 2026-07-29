"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Lightbulb,
  Send,
} from "lucide-react";

import DoughnutChartCard from "@/components/dashboard/common/DoughnutChartCard";

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
            <li>• Review the assignment instructions carefully.</li>
            <li>• Track due dates and prioritize upcoming work.</li>
            <li>• Submit before the deadline for full credit.</li>
            <li>• Keep your files and answers organized.</li>
          </ul>
        </div>
      </div>

      {/* Mobile & tablet: compact icon-based summary + collapsible sections */}
      <div className="xl:hidden space-y-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-lg shadow-black/20">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Submission Summary</h2>
            <button
              type="button"
              onClick={onViewAll}
              className="flex items-center gap-1 text-sm font-semibold text-orange-400 hover:text-orange-300 transition cursor-pointer bg-transparent border-0 outline-none min-h-[36px]"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
              <FileText size={18} className="mx-auto text-orange-500" />
              <p className="mt-1 text-lg font-bold text-white">{pendingCount}</p>
              <p className="text-xs font-semibold text-orange-400">Pending</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
              <Send size={18} className="mx-auto text-blue-400" />
              <p className="mt-1 text-lg font-bold text-white">{submittedCount}</p>
              <p className="text-xs font-semibold text-blue-400">Submitted</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
              <CheckCircle2 size={18} className="mx-auto text-emerald-400" />
              <p className="mt-1 text-lg font-bold text-white">{gradedCount}</p>
              <p className="text-xs font-semibold text-emerald-400">Graded</p>
            </div>
          </div>
        </div>

        <div
          ref={deadlinesSectionRef}
          className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-lg shadow-black/20"
        >
          <button
            type="button"
            onClick={onToggleDeadlines}
            className="flex w-full items-center gap-3 text-left cursor-pointer bg-transparent border-0 outline-none min-h-[44px]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
              <CalendarDays size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white">Upcoming Deadlines</h3>
              <p className="truncate text-xs text-slate-400">
                {upcomingDeadlines.length > 0
                  ? `${upcomingDeadlines.length} due soon`
                  : "No upcoming deadlines"}
              </p>
            </div>
            <ChevronDown
              size={18}
              className={`shrink-0 text-slate-400 transition-transform ${
                deadlinesExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          {deadlinesExpanded && (
            <div className="mt-3 space-y-2">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.slice(0, 4).map((assignment) => (
                  <div key={assignment.id} className="rounded-2xl bg-slate-950 p-3">
                    <p className="text-sm text-slate-200">{assignment.title}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {assignment.course?.title ?? assignment.courseTitle}
                    </p>
                    <p className="mt-1 text-xs text-orange-400">
                      Due {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No upcoming deadlines.</p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-lg shadow-black/20">
          <button
            type="button"
            onClick={() => setTipsExpanded((prev) => !prev)}
            className="flex w-full items-center gap-3 text-left cursor-pointer bg-transparent border-0 outline-none min-h-[44px]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
              <Lightbulb size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white">Quick Tips</h3>
              <p className="truncate text-xs text-slate-400">
                Check tips to improve your performance
              </p>
            </div>
            <ChevronDown
              size={18}
              className={`shrink-0 text-slate-400 transition-transform ${
                tipsExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          {tipsExpanded && (
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>• Review the assignment instructions carefully.</li>
              <li>• Track due dates and prioritize upcoming work.</li>
              <li>• Submit before the deadline for full credit.</li>
              <li>• Keep your files and answers organized.</li>
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
