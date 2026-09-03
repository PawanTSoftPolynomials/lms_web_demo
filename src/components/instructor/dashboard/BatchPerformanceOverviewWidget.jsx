"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, RefreshCw, BarChart2, Layers, TrendingUp, TrendingDown } from "lucide-react";

import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import { useCourseBatches } from "@/hooks/queries/instructor/useBatches";
import { useBatchPerformanceOverview } from "@/hooks/queries/instructor/useBatchPerformanceOverview";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

const selectClass =
  "bg-[#141930] border border-border text-[10.5px] px-2.5 py-1.5 rounded-lg outline-none text-foreground focus:border-primary/60 transition disabled:opacity-40 disabled:cursor-not-allowed [&>option]:bg-[#141930] [&>option]:text-foreground";

const ENGAGEMENT_STYLES = {
  High: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Moderate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Low: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "No Data": "bg-muted text-muted-foreground border-transparent",
};

function MetricPill({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-[8.5px] text-muted-foreground font-black uppercase tracking-wider">{label}</p>
      <p className="text-[11px] font-black text-foreground mt-0.5">{value}</p>
    </div>
  );
}

function BatchCard({ batch }) {
  const primaryCourseId = batch.courseIds?.[0];
  return (
    <Link
      href={primaryCourseId ? `/instructor/analytics?courseId=${primaryCourseId}` : "/instructor/analytics"}
      className="block p-4 rounded-xl border border-border bg-[#141930] hover:border-primary/40 transition"
    >
      <div className="min-w-0 mb-3">
        <h4 className="text-xs font-black text-foreground truncate">{batch.name}</h4>
        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{batch.courseTitles?.join(", ")}</p>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold mb-3">
        <Users size={11} className="text-primary" />
        {batch.studentsCount} Students
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
          <span>Course Completion</span>
          <span className="text-foreground">{batch.completion}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500"
            style={{ width: `${batch.completion}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 py-2.5 border-t border-border">
        <MetricPill label="Avg Quiz" value={batch.avgQuizScore != null ? `${batch.avgQuizScore}%` : "N/A"} />
        <MetricPill label="Assignments" value={batch.assignmentSubmissionRate != null ? `${batch.assignmentSubmissionRate}%` : "N/A"} />
        <MetricPill label="Attendance" value={batch.attendanceRate != null ? `${batch.attendanceRate}%` : "N/A"} />
      </div>

      <div className="flex justify-center pt-2 border-t border-border">
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
    <div className="rounded-2xl bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
        <h3 className="text-sm font-black text-foreground flex items-center gap-2">
          <Layers size={14} className="text-primary" />
          Batch Performance Overview
        </h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-muted-foreground hover:text-foreground transition disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
          </button>
          <Link
            href={`/instructor/analytics${courseId ? `?courseId=${courseId}` : ""}`}
            className="text-[11px] text-primary font-bold flex items-center gap-1 hover:text-orange-300"
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-border bg-[#141930]">
                <div className="min-w-0 mb-3 space-y-1.5">
                  <div className="h-3 w-24 rounded bg-muted/50 animate-pulse" />
                  <div className="h-2.5 w-32 rounded bg-muted/50 animate-pulse" />
                </div>

                <div className="h-2.5 w-20 rounded bg-muted/50 animate-pulse mb-3" />

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="h-2 w-16 rounded bg-muted/50 animate-pulse" />
                    <div className="h-2 w-6 rounded bg-muted/50 animate-pulse" />
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted/50 animate-pulse" />
                </div>

                <div className="grid grid-cols-3 gap-2 py-2.5 border-t border-border">
                  {Array.from({ length: 3 }).map((__, j) => (
                    <div key={j} className="h-6 rounded bg-muted/50 animate-pulse" />
                  ))}
                </div>

                <div className="flex justify-center pt-2 border-t border-border">
                  <div className="h-3.5 w-20 rounded-full bg-muted/50 animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="h-2 w-14 rounded bg-muted/50 animate-pulse" />
                <div className="h-3 w-8 rounded bg-muted/50 animate-pulse" />
              </div>
            ))}
          </div>
        </>
      ) : batches.length === 0 ? (
        <div className="py-10 text-center">
          <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
            <BarChart2 size={16} className="text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground font-bold">No batches available.</p>
          <p className="text-[11px] text-muted-foreground mt-1">Create your first batch to view analytics.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {batches.map((batch) => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>

          {(comparison.bestBatch || comparison.needsAttentionBatch) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
              {comparison.bestBatch && (
                <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp size={12} className="text-emerald-400" />
                    <p className="text-[9.5px] font-black uppercase tracking-widest text-emerald-400">Best Performing Batch</p>
                  </div>
                  <p className="text-xs font-black text-foreground">{comparison.bestBatch.name}</p>
                  <div className="flex gap-4 mt-2">
                    <div>
                      <p className="text-[8.5px] text-muted-foreground font-bold uppercase">Completion</p>
                      <p className="text-[11px] font-black text-foreground">{comparison.bestBatch.completion}%</p>
                    </div>
                    <div>
                      <p className="text-[8.5px] text-muted-foreground font-bold uppercase">Highest Quiz Score</p>
                      <p className="text-[11px] font-black text-foreground">
                        {comparison.bestBatch.avgQuizScore != null ? `${comparison.bestBatch.avgQuizScore}%` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8.5px] text-muted-foreground font-bold uppercase">Attendance</p>
                      <p className="text-[11px] font-black text-foreground">
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
                  <p className="text-xs font-black text-foreground">{comparison.needsAttentionBatch.name}</p>
                  <div className="flex gap-4 mt-2">
                    <div>
                      <p className="text-[8.5px] text-muted-foreground font-bold uppercase">Completion</p>
                      <p className="text-[11px] font-black text-foreground">{comparison.needsAttentionBatch.completion}%</p>
                    </div>
                    <div>
                      <p className="text-[8.5px] text-muted-foreground font-bold uppercase">Attendance</p>
                      <p className="text-[11px] font-black text-foreground">
                        {comparison.needsAttentionBatch.attendanceRate != null ? `${comparison.needsAttentionBatch.attendanceRate}%` : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
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
