"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, CheckCircle2, Users, TrendingUp, ClipboardList, Search } from "lucide-react";

import PageHeader from "@/components/layouts/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import KpiTile from "@/components/instructor/batches/KpiTile";
import BatchCard from "@/components/student/batches/BatchCard";
import { useMyBatches } from "@/hooks/queries/student/useBatches";
import useDashboard from "@/hooks/queries/student/useDashboard";
import useAssignments from "@/hooks/queries/student/useAssignments";
import { BATCHES_PAGE_SIZE } from "@/features/student/constants/batchesConfig";
import { normalizeAssignmentStatus } from "@/features/student/constants/assignmentsConfig";

const isPendingAssignment = (a) => {
  const status = normalizeAssignmentStatus(a);
  return status !== "Submitted" && status !== "Graded";
};

export default function StudentBatchesPage() {
  const router = useRouter();
  const { data: batches = [], isLoading, isError } = useMyBatches();
  const { data: dashboardData } = useDashboard();
  const { data: assignments = [] } = useAssignments();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [instructorFilter, setInstructorFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, instructorFilter]);

  const instructors = useMemo(
    () => Array.from(new Set(batches.map((b) => b.course?.instructor).filter(Boolean))),
    [batches]
  );

  const filteredBatches = useMemo(() => {
    let list = [...batches];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (b) => b.name?.toLowerCase().includes(q) || b.course?.title?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      list = list.filter((b) => (b.status || "ACTIVE") === statusFilter);
    }
    if (instructorFilter) {
      list = list.filter((b) => b.course?.instructor === instructorFilter);
    }
    return list;
  }, [batches, search, statusFilter, instructorFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBatches.length / BATCHES_PAGE_SIZE));
  const pagedBatches = filteredBatches.slice((page - 1) * BATCHES_PAGE_SIZE, page * BATCHES_PAGE_SIZE);

  const enrolledCoursesList = dashboardData?.enrolledCoursesList ?? [];
  const avgProgress = useMemo(() => {
    if (enrolledCoursesList.length === 0) return 0;
    return Math.round(
      enrolledCoursesList.reduce((sum, e) => sum + (e.progress ?? 0), 0) / enrolledCoursesList.length
    );
  }, [enrolledCoursesList]);

  const activeBatchesCount = batches.filter((b) => (b.status || "ACTIVE") === "ACTIVE").length;
  const totalClassmates = batches.reduce((sum, b) => sum + (b.studentsCount ?? 0), 0);
  const pendingAssignmentsCount = assignments.filter(isPendingAssignment).length;

  const kpis = [
    { key: "total", label: "Total Batches", value: batches.length, icon: Layers, iconBg: "bg-purple-500/10", iconColor: "text-purple-400", bottomText: "All cohorts" },
    { key: "active", label: "Active Batches", value: activeBatchesCount, icon: CheckCircle2, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-400", bottomText: "Currently running" },
    { key: "classmates", label: "Classmates", value: totalClassmates, icon: Users, iconBg: "bg-blue-500/10", iconColor: "text-blue-400", bottomText: "Across all batches" },
    { key: "progress", label: "Avg. Progress", value: `${avgProgress}%`, icon: TrendingUp, iconBg: "bg-primary/10", iconColor: "text-primary", bottomText: "Across all courses" },
    { key: "assignments", label: "Assignments Due", value: pendingAssignmentsCount, icon: ClipboardList, iconBg: "bg-amber-500/10", iconColor: "text-amber-400", bottomText: "Pending" },
  ];

  if (isError) {
    return (
      <EmptyState
        icon={Layers}
        title="Unable to load your batches"
        description="Please try again later."
      />
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Batches" subtitle="The cohorts you're enrolled in, across all your courses." />

      {/* Mobile: compact grid */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        {kpis.map((k, idx) => (
          <div
            key={k.key}
            className={`rounded-xl bg-card border border-border p-2 ${
              idx === kpis.length - 1 && kpis.length % 2 === 1 ? "col-span-2" : ""
            }`}
          >
            <div className={`h-6 w-6 rounded-md ${k.iconBg} flex items-center justify-center mb-1`}>
              <k.icon size={11} className={k.iconColor} />
            </div>
            <p className="text-sm font-black text-foreground leading-none">{k.value}</p>
            <p className="text-[8.5px] text-muted-foreground font-semibold leading-tight mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Desktop / tablet: full KpiTile row */}
      <div className="hidden sm:flex flex-wrap md:flex-nowrap items-center gap-3 w-full">
        {kpis.map((k) => (
          <KpiTile
            key={k.key}
            label={k.label}
            value={k.value}
            icon={k.icon}
            iconBg={k.iconBg}
            iconColor={k.iconColor}
            bottomText={k.bottomText}
          />
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by batch name or course..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition"
          />
        </div>

        <div className="flex gap-2.5 overflow-x-auto scrollbar-none">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="shrink-0 bg-card border border-border rounded-xl px-3 py-2.5 text-xs font-semibold text-foreground outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {instructors.length > 0 && (
            <select
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
              className="shrink-0 bg-card border border-border rounded-xl px-3 py-2.5 text-xs font-semibold text-foreground outline-none cursor-pointer"
            >
              <option value="">All Instructors</option>
              {instructors.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse bg-muted/50 rounded-2xl" />
          ))}
        </div>
      ) : filteredBatches.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={batches.length === 0 ? "You haven't joined any batches yet." : "No batches match your filters"}
          description={
            batches.length === 0
              ? "Once an instructor adds you to a batch, it will show up here."
              : "Try adjusting your search or filters."
          }
          actionText={batches.length === 0 ? "Browse Courses" : undefined}
          onAction={batches.length === 0 ? () => router.push("/student/courses") : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {pagedBatches.map((batch) => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-2 rounded-xl border border-border bg-card text-xs font-bold text-foreground disabled:opacity-40 hover:border-transparent transition"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-muted-foreground px-2">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-2 rounded-xl border border-border bg-card text-xs font-bold text-foreground disabled:opacity-40 hover:border-transparent transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
