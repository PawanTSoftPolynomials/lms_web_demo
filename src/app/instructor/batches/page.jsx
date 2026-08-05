"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  X,
  Loader2,
  Search,
  Layers,
  Users,
  TrendingUp,
  Percent,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";

import { WorkFilterProvider, useWorkFilters } from "@/context/WorkFilterContext";
import WorkFilterBar from "@/components/instructor/work/WorkFilterBar";
import EmptyState from "@/components/ui/EmptyState";
import KpiTile from "@/components/instructor/batches/KpiTile";
import BatchCard from "@/components/instructor/batches/BatchCard";
import CourseMultiSelect from "@/components/instructor/batches/CourseMultiSelect";
import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import { useCreateBatch } from "@/hooks/queries/instructor/useBatches";
import { useBatchPerformanceOverview } from "@/hooks/queries/instructor/useBatchPerformanceOverview";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ARCHIVED", label: "Archived" },
];

const COMPLETION_OPTIONS = [
  { value: "", label: "Any Completion" },
  { value: "75", label: "75%+" },
  { value: "50", label: "50%+" },
  { value: "25", label: "25%+" },
];
const STUDENT_COUNT_OPTIONS = [
  { value: "", label: "Any Size" },
  { value: "30", label: "30+ students" },
  { value: "15", label: "15+ students" },
  { value: "1", label: "1+ students" },
];

const selectClass =
  "bg-[#0D1021] border border-[#1A1F35] text-xs px-3 py-2.5 rounded-xl outline-none text-slate-200 focus:border-orange-500/60 transition [&>option]:bg-[#0D1021] [&>option]:text-slate-200";

function CreateBatchForm({ courses, onClose }) {
  const [courseIds, setCourseIds] = useState([]);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const createBatch = useCreateBatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (courseIds.length === 0) return;
    createBatch.mutate(
      { name, startDate, dueDate: dueDate || undefined, courseIds },
      { onSuccess: onClose }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-[#1A1F35] bg-white/[0.02] grid gap-3 sm:grid-cols-2">
      <div>
        <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
          Courses ({courseIds.length} selected)
        </label>
        <CourseMultiSelect courses={courses} selectedIds={courseIds} onChange={setCourseIds} />
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Batch name (e.g. Morning Cohort A)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white placeholder-slate-500 outline-none focus:border-orange-500"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white outline-none focus:border-orange-500"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            placeholder="End date"
            className="bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white outline-none focus:border-orange-500"
          />
        </div>
        {courseIds.length === 0 && (
          <p className="text-[10.5px] text-amber-400">Select at least one course.</p>
        )}
      </div>

      <div className="sm:col-span-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="px-3.5 py-2 rounded-xl text-[10.5px] font-bold text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-800 transition">
          Cancel
        </button>
        <button
          type="submit"
          disabled={createBatch.isPending || courseIds.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10.5px] font-black text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 transition"
        >
          {createBatch.isPending ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
          Create Batch
        </button>
      </div>
    </form>
  );
}

function BatchStatsRow({ stats }) {
  return (
    <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full">
      <KpiTile
        label="Total Batches"
        value={stats.totalBatches}
        icon={Layers}
        iconBg="bg-purple-500/10"
        iconColor="text-purple-400"
        bottomText={`+${stats.newBatchesThisMonth} this month`}
      />
      <KpiTile
        label="Active Students"
        value={stats.totalStudents}
        icon={Users}
        iconBg="bg-emerald-500/10"
        iconColor="text-emerald-400"
        bottomText="Across all batches"
      />
      <KpiTile
        label="Avg Completion"
        value={`${stats.avgCompletion}%`}
        icon={TrendingUp}
        iconBg="bg-orange-500/10"
        iconColor="text-orange-400"
        bottomText="Overall progress"
      />
      <KpiTile
        label="Avg Attendance"
        value="N/A"
        icon={Percent}
        iconBg="bg-slate-500/10"
        iconColor="text-slate-400"
        bottomText="Not tracked"
      />
      <KpiTile
        label="Assignments Due"
        value={stats.pendingAssignmentReviews}
        icon={ClipboardList}
        iconBg="bg-blue-500/10"
        iconColor="text-blue-400"
        bottomText="Needs review"
      />
      <KpiTile
        label="At-Risk Students"
        value={stats.atRiskStudentsCount}
        icon={AlertTriangle}
        iconBg="bg-rose-500/10"
        iconColor="text-rose-400"
        bottomText="Low progress"
      />
    </div>
  );
}

function BatchesContent() {
  const { appliedFilters } = useWorkFilters();
  const { data: courses = [] } = useInstructorCourses();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [minCompletion, setMinCompletion] = useState("");
  const [minStudents, setMinStudents] = useState("");

  // Debounced so each keystroke doesn't fire its own (fairly expensive,
  // per-batch-aggregated) overview query while the user is still typing.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data: overview, isLoading } = useBatchPerformanceOverview({
    courseId: appliedFilters.courseId,
    startDate: appliedFilters.startDate,
    endDate: appliedFilters.endDate,
    search: debouncedSearch,
  });

  const batches = useMemo(() => overview?.batches || [], [overview]);
  const stats = overview?.stats || {
    totalBatches: 0,
    totalStudents: 0,
    avgCompletion: 0,
    newBatchesThisMonth: 0,
    pendingAssignmentReviews: 0,
    atRiskStudentsCount: 0,
  };

  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      if (appliedFilters.status && b.status !== appliedFilters.status) return false;
      if (minCompletion && b.completion < Number(minCompletion)) return false;
      if (minStudents && b.studentsCount < Number(minStudents)) return false;
      return true;
    });
  }, [batches, appliedFilters.status, minCompletion, minStudents]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Batches</h1>
          <p className="text-xs text-slate-400 mt-1">Manage student cohorts across one or more courses.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-white bg-orange-500 hover:bg-orange-600 shadow-sm transition"
        >
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? "Cancel" : "Create Batch"}
        </button>
      </div>

      <BatchStatsRow stats={stats} />

      {showForm && <CreateBatchForm courses={courses} onClose={() => setShowForm(false)} />}

      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by batch name, student, or course..."
          className="w-full bg-[#0D1021] border border-[#1A1F35] text-xs pl-10 pr-4 py-3 rounded-xl outline-none text-slate-200 placeholder-slate-500 focus:border-orange-500/60 transition"
        />
      </div>

      <WorkFilterBar fields={["course", "status", "dateRange"]} statusOptions={STATUS_OPTIONS} />

      <div className="flex flex-wrap items-center gap-2">
        <select value={minCompletion} onChange={(e) => setMinCompletion(e.target.value)} className={selectClass}>
          {COMPLETION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select value={minStudents} onChange={(e) => setMinStudents(e.target.value)} className={selectClass}>
          {STUDENT_COUNT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse bg-slate-800/50 rounded-2xl" />
          ))}
        </div>
      ) : filteredBatches.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={batches.length === 0 ? "No batches yet" : "No batches match your filters"}
          description={
            batches.length === 0
              ? "Create your first batch to start organizing students into cohorts."
              : "Try adjusting your search or filters."
          }
          actionText={batches.length === 0 ? "Create Batch" : undefined}
          onAction={batches.length === 0 ? () => setShowForm(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredBatches.map((batch) => (
            <BatchCard key={batch.id} batch={batch} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BatchesPage() {
  return (
    <WorkFilterProvider>
      <BatchesContent />
    </WorkFilterProvider>
  );
}
