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
  AlertTriangle,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
} from "lucide-react";

import { WorkFilterProvider, useWorkFilters } from "@/context/WorkFilterContext";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/shadcn/popover";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import EmptyState from "@/components/ui/EmptyState";
import KpiTile from "@/components/instructor/batches/KpiTile";
import BatchCard from "@/components/instructor/batches/BatchCard";
import CourseMultiSelect from "@/components/instructor/batches/CourseMultiSelect";
import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import { useCreateBatch } from "@/hooks/queries/instructor/useBatches";
import { useBatchPerformanceOverview } from "@/hooks/queries/instructor/useBatchPerformanceOverview";
import { useToast } from "@/components/ui/ToastProvider";

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

const toolbarControlClass =
  "h-9 bg-card border border-border text-xs px-3 rounded-xl outline-none text-foreground focus:border-primary/60 transition [&>option]:bg-card [&>option]:text-foreground";

function CreateBatchForm({ courses, onClose }) {
  const [courseIds, setCourseIds] = useState([]);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const createBatch = useCreateBatch();
  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (courseIds.length === 0) return;
    createBatch.mutate(
      { name, startDate, dueDate: dueDate || undefined, courseIds },
      {
        onSuccess: onClose,
        onError: (err) => {
          showToast(err?.response?.data?.message || "Failed to create batch.", "error");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-border bg-white/[0.02] grid gap-3 sm:grid-cols-2">
      <div>
        <label className="block text-[9.5px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">
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
          className="w-full bg-background border border-transparent text-xs px-3 py-2.5 rounded-xl text-foreground placeholder-slate-500 outline-none focus:border-primary"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="bg-background border border-transparent text-xs px-3 py-2.5 rounded-xl text-foreground outline-none focus:border-primary"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            placeholder="End date"
            min={startDate || undefined}
            className="bg-background border border-transparent text-xs px-3 py-2.5 rounded-xl text-foreground outline-none focus:border-primary"
          />
        </div>
        {courseIds.length === 0 && (
          <p className="text-[10.5px] text-amber-400">Select at least one course.</p>
        )}
      </div>

      <div className="sm:col-span-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="px-3.5 py-2 rounded-xl text-[10.5px] font-bold text-muted-foreground border border-transparent hover:text-foreground hover:bg-muted transition">
          Cancel
        </button>
        <button
          type="submit"
          disabled={createBatch.isPending || courseIds.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10.5px] font-black text-foreground bg-primary hover:bg-orange-600 disabled:opacity-50 transition"
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
        label="Avg. Progress"
        value={`${stats.avgCompletion}%`}
        icon={TrendingUp}
        iconBg="bg-primary/10"
        iconColor="text-primary"
        bottomText="Overall progress"
      />
      <KpiTile
        label="At-Risk Students"
        value={stats.atRiskStudentsCount}
        icon={AlertTriangle}
        iconBg="bg-rose-500/10"
        iconColor="text-rose-400"
        bottomText="Needs attention"
      />
    </div>
  );
}

/** Compact inline replacement for the old bordered WorkFilterBar panel — same
 * useWorkFilters() context/logic, just laid out as a single toolbar row. */
function FilterToolbar({ minCompletion, setMinCompletion, minStudents, setMinStudents }) {
  const { filters, updateFilter, resetFilters } = useWorkFilters();
  const { data: courses = [] } = useInstructorCourses();

  const hasAdvancedFilters = Boolean(minCompletion || minStudents);
  const hasAnyFilter = hasAdvancedFilters || filters.courseId || filters.status || filters.startDate || filters.endDate;

  const handleReset = () => {
    resetFilters();
    setMinCompletion("");
    setMinStudents("");
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={filters.courseId}
        onChange={(e) => updateFilter("courseId", e.target.value)}
        className={toolbarControlClass}
      >
        <option value="">All Courses</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => updateFilter("status", e.target.value)}
        className={toolbarControlClass}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <DateRangePicker
        startDate={filters.startDate}
        endDate={filters.endDate}
        onChange={(nextStart, nextEnd) => {
          updateFilter("startDate", nextStart);
          updateFilter("endDate", nextEnd);
        }}
        triggerClassName="h-9 py-0"
      />

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`${toolbarControlClass} relative inline-flex items-center gap-1.5 pr-2.5`}
          >
            <SlidersHorizontal size={12} className="text-muted-foreground" />
            More Filters
            <ChevronDown size={12} className="text-muted-foreground" />
            {hasAdvancedFilters && (
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" aria-hidden />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-3.5">
          <div className="space-y-3">
            <div>
              <label className="block text-[9.5px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">
                Completion
              </label>
              <select
                value={minCompletion}
                onChange={(e) => setMinCompletion(e.target.value)}
                className={`${toolbarControlClass} w-full`}
              >
                {COMPLETION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9.5px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">
                Batch Size
              </label>
              <select
                value={minStudents}
                onChange={(e) => setMinStudents(e.target.value)}
                className={`${toolbarControlClass} w-full`}
              >
                {STUDENT_COUNT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {hasAnyFilter && (
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-muted-foreground transition hover:text-foreground"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      )}
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
    <div className="space-y-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Batches</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Manage and monitor your student cohorts across courses.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex shrink-0 items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-foreground bg-primary hover:bg-orange-600 shadow-sm transition"
        >
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? "Cancel" : "Create Batch"}
        </button>
      </div>

      <BatchStatsRow stats={stats} />

      {showForm && <CreateBatchForm courses={courses} onClose={() => setShowForm(false)} />}

      <div className="space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search batches, students or courses..."
            className="w-full h-11 bg-card border border-border text-sm pl-10 pr-4 rounded-xl outline-none text-foreground placeholder-slate-500 focus:border-primary/60 transition"
          />
        </div>

        <FilterToolbar
          minCompletion={minCompletion}
          setMinCompletion={setMinCompletion}
          minStudents={minStudents}
          setMinStudents={setMinStudents}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-black text-foreground tracking-tight">Your Batches</h2>
          <span className="text-xs font-bold text-muted-foreground">
            {filteredBatches.length} batch{filteredBatches.length === 1 ? "" : "es"}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse bg-muted/50 rounded-2xl" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredBatches.map((batch) => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        )}
      </div>
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
