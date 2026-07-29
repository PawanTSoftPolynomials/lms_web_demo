"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, ClipboardCheck, Plus } from "lucide-react";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import AssignmentFilters from "@/components/student/assignments/AssignmentFilters";
import AssignmentCard from "@/components/student/assignments/AssignmentCard";
import AssignmentSummaryPanel from "@/components/student/assignments/AssignmentSummaryPanel";
import useAssignments from "@/hooks/queries/student/useAssignments";

const TABS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "upcoming" },
  { label: "Submitted", value: "Submitted" },
  { label: "Graded", value: "Graded" },
];

const normalizeStatus = (assignment) =>
  assignment.status || assignment.submissionStatus || "Not Submitted";

export default function StudentAssignmentsPage() {
  const router = useRouter();
  const { data: assignments = [], isLoading, isError } = useAssignments();

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("due-earliest");
  const [activeTab, setActiveTab] = useState("all");

  // Lifted (not local to AssignmentSummaryPanel) so the empty state's "View
  // Upcoming Deadlines" button can expand + scroll to it directly.
  const [deadlinesExpanded, setDeadlinesExpanded] = useState(false);
  const deadlinesSectionRef = useRef(null);
  const scrollToDeadlines = () => {
    setDeadlinesExpanded(true);
    deadlinesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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
        (assignment) => normalizeStatus(assignment) === statusFilter
      );
    }

    if (activeTab !== "all") {
      if (activeTab === "upcoming") {
        list = list.filter((assignment) => {
          const due = assignment.dueDate ? new Date(assignment.dueDate) : null;
          return due && due >= new Date();
        });
      } else {
        list = list.filter((assignment) => normalizeStatus(assignment) === activeTab);
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
      const status = normalizeStatus(assignment);
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {
      "Not Submitted": 0,
      "In Progress": 0,
      Submitted: 0,
      Graded: 0,
    });
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
    return <Loader />;
  }

  if (isError) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold text-white">
          Unable to load assignments
        </h2>
        <p className="mt-2 text-slate-400">
          Please try again later.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3">
        {/* Back navigation — mobile & tablet only; desktop's Assignments entry
            doesn't currently have one and wasn't asked to gain one. */}
        <button
          type="button"
          onClick={() => router.back()}
          className="xl:hidden shrink-0 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <PageHeader
            title="Assignments"
            subtitle="Review, submit, and track all your course assignments."
          >
            {/* Desktop (xl+): unchanged pill tabs */}
            <div className="hidden xl:flex flex-wrap items-center gap-2">
              {TABS.map((tab) => {
                const active = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      active
                        ? "bg-orange-600 text-white"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Mobile & tablet: underline-style tab strip, same activeTab state */}
            <div className="xl:hidden w-full overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-6 border-b border-slate-800/80">
                {TABS.map((tab) => {
                  const active = activeTab === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setActiveTab(tab.value)}
                      className={`pb-3 min-h-[44px] text-sm font-semibold whitespace-nowrap border-b-2 transition cursor-pointer bg-transparent border-x-0 border-t-0 ${
                        active
                          ? "text-orange-400 border-orange-500"
                          : "text-slate-400 border-transparent hover:text-slate-200"
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

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr] items-start">
        <div className="space-y-6">
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
          />

          {filteredAssignments.length > 0 ? (
            <div className="grid gap-4">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                />
              ))}
            </div>
          ) : (
            <>
              {/* Desktop (xl+): unchanged existing empty state */}
              <Card className="hidden xl:block p-8 text-center">
                <h2 className="text-xl font-semibold text-white">
                  No assignments found
                </h2>
                <p className="mt-2 text-slate-400">
                  Try adjusting your filters or search term.
                </p>
              </Card>

              {/* Mobile & tablet: richer empty state */}
              <div className="xl:hidden rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
                <div className="relative mx-auto mb-4 h-16 w-16">
                  <Plus size={14} className="absolute -top-2 left-1 text-orange-500/50" />
                  <Plus size={10} className="absolute top-7 -right-2 text-orange-500/30" />
                  <Plus size={12} className="absolute -bottom-1 left-0 text-orange-500/40" />
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/80">
                    <ClipboardCheck size={28} className="text-orange-500" />
                  </div>
                </div>
                <h2 className="text-lg font-bold text-white">No Assignments Found</h2>
                <p className="mt-1 text-sm text-slate-400">You&apos;re all caught up! Great going.</p>
                <button
                  type="button"
                  onClick={scrollToDeadlines}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-orange-500/60 px-5 py-2.5 min-h-[44px] text-sm font-bold text-orange-400 hover:bg-orange-500/10 transition cursor-pointer bg-transparent"
                >
                  <CalendarDays size={16} />
                  View Upcoming Deadlines
                </button>
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
            setCourseFilter("");
            setSearch("");
          }}
        />
      </div>
    </div>
  );
}
