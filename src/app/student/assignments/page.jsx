"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CalendarDays, ClipboardCheck, Plus } from "lucide-react";

import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import AssignmentFilters from "@/components/student/assignments/AssignmentFilters";
import AssignmentCard from "@/components/student/assignments/AssignmentCard";
import AssignmentSummaryPanel from "@/components/student/assignments/AssignmentSummaryPanel";
import useAssignments from "@/hooks/queries/student/useAssignments";
import {
  ASSIGNMENT_TABS,
  ASSIGNMENT_STATUSES,
  normalizeAssignmentStatus,
} from "@/features/student/constants/assignmentsConfig";

// Loading state — mirrors the real layout (header, filter bar, a few
// assignment cards, summary panel) so nothing jumps around once data arrives.
function AssignmentCardSkeleton() {
  return (
    <div className="rounded-2xl xl:rounded-3xl border border-transparent bg-background p-4 xl:p-6 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
        <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
      </div>
      <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
      <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
      <div className="h-10 w-full rounded-xl bg-muted animate-pulse xl:hidden" />
    </div>
  );
}

function AssignmentsPageSkeleton() {
  return (
    <div className="space-y-5 xl:space-y-8">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 shrink-0 rounded-xl bg-muted animate-pulse xl:hidden" />
        <div className="flex-1 space-y-3">
          <div className="h-8 w-40 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-64 max-w-full rounded bg-muted animate-pulse" />
          <div className="flex gap-4 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 w-14 rounded bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:gap-6 xl:grid-cols-[2fr_1fr] items-start">
        <div className="space-y-4 xl:space-y-6">
          <div className="h-14 rounded-2xl border border-transparent bg-background animate-pulse" />
          {[1, 2, 3].map((i) => (
            <AssignmentCardSkeleton key={i} />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-24 rounded-3xl border border-transparent bg-background animate-pulse" />
          <div className="h-16 rounded-3xl border border-transparent bg-background animate-pulse" />
          <div className="h-16 rounded-3xl border border-transparent bg-background animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function AssignmentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: assignments = [], isLoading, isError } = useAssignments();

  const courseContext = searchParams.get("course") || "";
  const isCourseScoped = Boolean(courseContext);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState(courseContext);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("due-earliest");
  const [activeTab, setActiveTab] = useState("all");

  const [deadlinesExpanded, setDeadlinesExpanded] = useState(false);
  const deadlinesSectionRef = useRef(null);
  const scrollToDeadlines = () => {
    setDeadlinesExpanded(true);
    deadlinesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const hasActiveFilters = Boolean(
    search.trim() || (!isCourseScoped && courseFilter) || statusFilter || activeTab !== "all"
  );
  const clearFilters = () => {
    setSearch("");
    if (!isCourseScoped) setCourseFilter("");
    setStatusFilter("");
    setActiveTab("all");
  };

  const courseOptions = useMemo(
    () =>
      [...new Set(
        assignments
          .map((assignment) => assignment.course?.title || assignment.courseTitle)
          .filter(Boolean)
      )],
    [assignments]
  );

  const filteredAssignments = useMemo(() => {
    let list = [...assignments];

    if (search.trim()) {
      const keyword = search.toLowerCase();
      list = list.filter(
        (assignment) =>
          assignment.title?.toLowerCase().includes(keyword) ||
          assignment.description?.toLowerCase().includes(keyword) ||
          (assignment.course?.title || assignment.courseTitle || "")
            .toLowerCase()
            .includes(keyword)
      );
    }

    if (courseFilter) {
      list = list.filter(
        (assignment) =>
          (assignment.course?.title || assignment.courseTitle) ===
          courseFilter
      );
    }

    if (statusFilter) {
      list = list.filter(
        (assignment) => normalizeAssignmentStatus(assignment) === statusFilter
      );
    }

    if (activeTab !== "all") {
      if (activeTab === "upcoming") {
        list = list.filter((assignment) => {
          const due = assignment.dueDate ? new Date(assignment.dueDate) : null;
          return due && due >= new Date();
        });
      } else {
        list = list.filter((assignment) => normalizeAssignmentStatus(assignment) === activeTab);
      }
    }

    if (sortBy === "due-latest") {
      list.sort(
        (a, b) =>
          new Date(b.dueDate || 0) - new Date(a.dueDate || 0)
      );
    } else if (sortBy === "course") {
      list.sort((a, b) =>
        (a.course?.title || a.courseTitle || "").localeCompare(
          b.course?.title || b.courseTitle || ""
        )
      );
    } else {
      list.sort(
        (a, b) =>
          new Date(a.dueDate || 0) - new Date(b.dueDate || 0)
      );
    }

    return list;
  }, [assignments, search, courseFilter, statusFilter, sortBy, activeTab]);

  const statusCounts = useMemo(() => {
    return assignments.reduce((counts, assignment) => {
      const status = normalizeAssignmentStatus(assignment);
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, Object.fromEntries(ASSIGNMENT_STATUSES.map((status) => [status, 0])));
  }, [assignments]);

  const upcomingDeadlines = useMemo(() => {
    return assignments
      .filter((assignment) => {
        const due = assignment.dueDate ? new Date(assignment.dueDate) : null;
        return due && due >= new Date();
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [assignments]);

  if (isLoading) {
    return <AssignmentsPageSkeleton />;
  }

  if (isError) {
    return (
      <Card tone="flat" className="p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Unable to load assignments
        </h2>
        <p className="mt-2 text-muted-foreground">
          Please try again later.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-5 xl:space-y-8">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="xl:hidden shrink-0 flex h-11 w-11 items-center justify-center rounded-xl text-foreground hover:text-foreground hover:bg-muted/60 transition-colors duration-200 cursor-pointer bg-transparent border-0"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <PageHeader
            title="Assignments"
            subtitle={
              isCourseScoped
                ? `Assignments for ${courseContext}.`
                : "Review, submit, and track all your course assignments."
            }
          >
            {/* Desktop (xl+): tab pills */}
            <div className="hidden xl:flex flex-wrap items-center gap-2">
              {ASSIGNMENT_TABS.map((tab) => {
                const active = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-muted"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Mobile & tablet: tab strip */}
            <div className="xl:hidden w-full overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-4 border-b border-transparent/80">
                {ASSIGNMENT_TABS.map((tab) => {
                  const active = activeTab === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setActiveTab(tab.value)}
                      className={`relative flex min-h-[44px] items-center pb-1.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors duration-200 cursor-pointer bg-transparent border-x-0 border-t-0 ${
                        active
                          ? "text-primary border-primary"
                          : "text-muted-foreground border-transparent hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </PageHeader>
        </div>
      </div>

      <div className="grid gap-4 xl:gap-6 xl:grid-cols-[2fr_1fr] items-start">
        <div className="space-y-4 xl:space-y-6">
          <AssignmentFilters
            search={search}
            setSearch={setSearch}
            courseFilter={courseFilter}
            setCourseFilter={setCourseFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            courseOptions={courseOptions}
            hideCourseFilter={isCourseScoped}
          />

          {filteredAssignments.length > 0 ? (
            <div className="grid gap-3 xl:gap-4">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                />
              ))}
            </div>
          ) : (
            <>
              {/* Desktop (xl+): empty state */}
              <Card tone="flat" className="hidden xl:block p-8 text-center">
                <h2 className="text-xl font-semibold text-foreground">
                  No assignments found
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your filters or search term.
                </p>
              </Card>

              {/* Mobile & tablet: context-aware empty state */}
              <div className="xl:hidden rounded-3xl border border-transparent bg-background p-8 text-center">
                <div className="relative mx-auto mb-4 h-16 w-16">
                  <Plus size={14} className="absolute -top-2 left-1 text-primary/50" />
                  <Plus size={10} className="absolute top-7 -right-2 text-primary/30" />
                  <Plus size={12} className="absolute -bottom-1 left-0 text-primary/40" />
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-transparent bg-muted/80">
                    <ClipboardCheck size={28} className="text-primary" />
                  </div>
                </div>

                {hasActiveFilters ? (
                  <>
                    <h2 className="text-lg font-semibold text-foreground">No matches found</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      No assignments match your current filters.
                    </p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-orange-600 px-5 py-2.5 min-h-[44px] text-sm font-bold text-slate-950 transition-colors duration-200 cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold text-foreground">🎉 You&apos;re all caught up!</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      No assignments are available right now.
                    </p>
                    <button
                      type="button"
                      onClick={scrollToDeadlines}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl border border-primary/60 px-5 py-2.5 min-h-[44px] text-sm font-bold text-primary hover:bg-primary/10 transition-colors duration-200 cursor-pointer bg-transparent"
                    >
                      <CalendarDays size={16} />
                      View Upcoming Deadlines
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <AssignmentSummaryPanel
          statusCounts={statusCounts}
          upcomingDeadlines={upcomingDeadlines}
          deadlinesExpanded={deadlinesExpanded}
          onToggleDeadlines={() => setDeadlinesExpanded((prev) => !prev)}
          deadlinesSectionRef={deadlinesSectionRef}
          onViewAll={() => {
            setActiveTab("all");
            setStatusFilter("");
            if (!isCourseScoped) setCourseFilter("");
            setSearch("");
          }}
        />
      </div>
    </div>
  );
}

export default function StudentAssignmentsPage() {
  return (
    <Suspense fallback={<AssignmentsPageSkeleton />}>
      <AssignmentsPageContent />
    </Suspense>
  );
}
