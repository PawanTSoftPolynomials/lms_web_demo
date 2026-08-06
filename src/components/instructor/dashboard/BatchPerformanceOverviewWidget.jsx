"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, RefreshCw, BarChart2, Layers, TrendingUp, TrendingDown } from "lucide-react";

import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import { useCourseBatches } from "@/hooks/queries/instructor/useBatches";
import { useBatchPerformanceOverview } from "@/hooks/queries/instructor/useBatchPerformanceOverview";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

const selectClass =
  "bg-[#141930] border border-[#1A1F35] text-[10.5px] px-2.5 py-1.5 rounded-lg outline-none text-slate-300 focus:border-orange-500/60 transition disabled:opacity-40 disabled:cursor-not-allowed [&>option]:bg-[#141930] [&>option]:text-slate-200";

const ENGAGEMENT_STYLES = {
  High: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Moderate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Low: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "No Data": "bg-slate-800 text-slate-500 border-slate-700",
};

function MetricPill({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-[8.5px] text-slate-500 font-black uppercase tracking-wider">{label}</p>
      <p className="text-[11px] font-black text-slate-200 mt-0.5">{value}</p>
    </div>
  );
}

function BatchCard({ batch }) {
  const primaryCourseId = batch.courseIds?.[0];
  return (
    <Link
      href={primaryCourseId ? `/instructor/analytics?courseId=${primaryCourseId}` : "/instructor/analytics"}
      className="block p-4 rounded-xl border border-[#1A1F35] bg-[#141930] hover:border-orange-500/40 transition"
    >
      <div className="min-w-0 mb-3">
        <h4 className="text-xs font-black text-white truncate">{batch.name}</h4>
        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{batch.courseTitles?.join(", ")}</p>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mb-3">
        <Users size={11} className="text-orange-400" />
        {batch.studentsCount} Students
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          <span>Course Completion</span>
          <span className="text-slate-300">{batch.completion}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500"
            style={{ width: `${batch.completion}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 py-2.5 border-t border-[#1A1F35]">
        <MetricPill label="Avg Quiz" value={batch.avgQuizScore != null ? `${batch.avgQuizScore}%` : "N/A"} />
        <MetricPill label="Assignments" value={batch.assignmentSubmissionRate != null ? `${batch.assignmentSubmissionRate}%` : "N/A"} />
        <MetricPill label="Attendance" value={batch.attendanceRate != null ? `${batch.attendanceRate}%` : "N/A"} />
      </div>

      <div className="flex justify-center pt-2 border-t border-[#1A1F35]">
        <span
          className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${ENGAGEMENT_STYLES[batch.engagementStatus] || ENGAGEMENT_STYLES["No Data"]}`}
        >
          {batch.engagementStatus}
        </span>
      </div>
    </Link>
  );
}

export function BatchPerformanceOverviewWidget() {
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: courses = [] } = useInstructorCourses();
  const { data: courseBatches = [], isLoading: loadingBatches } = useCourseBatches(courseId);

  const filters = { courseId, batchId, startDate, endDate };
  const { data: overview, isLoading, refetch, isFetching } = useBatchPerformanceOverview(filters);

  const batches = overview?.batches || [];
  const comparison = overview?.comparison || { bestBatch: null, needsAttentionBatch: null };
  const stats = overview?.stats || { totalBatches: 0, totalStudents: 0, avgCompletion: 0, avgAttendance: null };

  const handleCourseChange = (value) => {
    setCourseId(value);
    setBatchId("");
  };

  return (
    <div className="rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-5">
      <div className="flex items-center justify-between mb-4 border-b border-[#1A1F35] pb-3">
        <h3 className="text-sm font-black text-slate-200 flex items-center gap-2">
          <Layers size={14} className="text-orange-400" />
          Batch Performance Overview
        </h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-slate-500 hover:text-slate-300 transition disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
          </button>
          <Link
            href={`/instructor/analytics${courseId ? `?courseId=${courseId}` : ""}`}
            className="text-[11px] text-orange-400 font-bold flex items-center gap-1 hover:text-orange-300"
          >
            View Analytics &rarr;
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select value={courseId} onChange={(e) => handleCourseChange(e.target.value)} className={selectClass}>
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <select
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          disabled={!courseId || loadingBatches}
          className={selectClass}
        >
          <option value="">All Batches</option>
          {courseBatches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={(nextStart, nextEnd) => {
            setStartDate(nextStart);
            setEndDate(nextEnd);
          }}
        />
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse bg-slate-800/50 rounded-xl" />
      ) : batches.length === 0 ? (
        <div className="py-10 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-3">
            <BarChart2 size={16} className="text-slate-500" />
          </div>
          <p className="text-xs text-slate-400 font-bold">No batches available.</p>
          <p className="text-[11px] text-slate-500 mt-1">Create your first batch to view analytics.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {batches.map((batch) => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>

          {(comparison.bestBatch || comparison.needsAttentionBatch) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#1A1F35]">
              {comparison.bestBatch && (
                <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp size={12} className="text-emerald-400" />
                    <p className="text-[9.5px] font-black uppercase tracking-widest text-emerald-400">Best Performing Batch</p>
                  </div>
                  <p className="text-xs font-black text-white">{comparison.bestBatch.name}</p>
                  <div className="flex gap-4 mt-2">
                    <div>
                      <p className="text-[8.5px] text-slate-500 font-bold uppercase">Completion</p>
                      <p className="text-[11px] font-black text-slate-200">{comparison.bestBatch.completion}%</p>
                    </div>
                    <div>
                      <p className="text-[8.5px] text-slate-500 font-bold uppercase">Highest Quiz Score</p>
                      <p className="text-[11px] font-black text-slate-200">
                        {comparison.bestBatch.avgQuizScore != null ? `${comparison.bestBatch.avgQuizScore}%` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8.5px] text-slate-500 font-bold uppercase">Attendance</p>
                      <p className="text-[11px] font-black text-slate-200">
                        {comparison.bestBatch.attendanceRate != null ? `${comparison.bestBatch.attendanceRate}%` : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {comparison.needsAttentionBatch && (
                <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingDown size={12} className="text-rose-400" />
                    <p className="text-[9.5px] font-black uppercase tracking-widest text-rose-400">Needs Attention</p>
                  </div>
                  <p className="text-xs font-black text-white">{comparison.needsAttentionBatch.name}</p>
                  <div className="flex gap-4 mt-2">
                    <div>
                      <p className="text-[8.5px] text-slate-500 font-bold uppercase">Completion</p>
                      <p className="text-[11px] font-black text-slate-200">{comparison.needsAttentionBatch.completion}%</p>
                    </div>
                    <div>
                      <p className="text-[8.5px] text-slate-500 font-bold uppercase">Attendance</p>
                      <p className="text-[11px] font-black text-slate-200">
                        {comparison.needsAttentionBatch.attendanceRate != null ? `${comparison.needsAttentionBatch.attendanceRate}%` : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#1A1F35]">
            <MetricPill label="Total Batches" value={stats.totalBatches} />
            <MetricPill label="Total Students" value={stats.totalStudents} />
            <MetricPill label="Avg Completion" value={`${stats.avgCompletion}%`} />
            <MetricPill label="Avg Attendance" value={stats.avgAttendance != null ? `${stats.avgAttendance}%` : "N/A"} />
          </div>
        </>
      )}
    </div>
  );
}
